/**
 * Apply pending Supabase migrations.
 *
 * Usage:
 *   node scripts/db-migrate.mjs local
 *   node scripts/db-migrate.mjs remote
 *
 * Remote builds a Postgres URL from NEXT_PUBLIC_SUPABASE_URL + SUPABASE_DB_PASSWORD
 * in `.env` / `.env.local` (file password wins over a stale shell var).
 */
import { spawnSync } from "node:child_process"
import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"

const target = process.argv[2]

if (target !== "local" && target !== "remote") {
  console.error("Usage: node scripts/db-migrate.mjs <local|remote>")
  process.exit(1)
}

/**
 * @param {string} filePath
 * @returns {Record<string, string>}
 */
function parseEnvFile(filePath) {
  /** @type {Record<string, string>} */
  const out = {}
  if (!existsSync(filePath)) return out

  for (const rawLine of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith("#")) continue

    const eq = line.indexOf("=")
    if (eq === -1) continue

    const key = line.slice(0, eq).trim()
    let value = line.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    out[key] = value
  }
  return out
}

/**
 * @param {string} filePath
 */
function loadEnvFile(filePath) {
  const parsed = parseEnvFile(filePath)
  for (const [key, value] of Object.entries(parsed)) {
    if (process.env[key] === undefined) {
      process.env[key] = value
    }
  }
}

/**
 * @param {string} filePath
 * @param {string} key
 * @returns {string | undefined}
 */
function readEnvValue(filePath, key) {
  const value = parseEnvFile(filePath)[key]
  return value?.trim() ? value : undefined
}

/**
 * @returns {string | undefined}
 */
function resolveProjectRef() {
  const tempPath = resolve(process.cwd(), "supabase/.temp/project-ref")
  if (existsSync(tempPath)) {
    const ref = readFileSync(tempPath, "utf8").trim()
    if (ref) return ref
  }

  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    readEnvValue(resolve(process.cwd(), ".env.local"), "NEXT_PUBLIC_SUPABASE_URL") ||
    readEnvValue(resolve(process.cwd(), ".env"), "NEXT_PUBLIC_SUPABASE_URL")

  if (!url) return undefined

  try {
    const host = new URL(url).hostname
    const match = /^([a-z0-9]+)\.supabase\.co$/i.exec(host)
    return match?.[1]
  } catch {
    return undefined
  }
}

/**
 * @param {string} projectRef
 * @param {string} password
 */
function buildRemoteDbUrl(projectRef, password) {
  const encoded = encodeURIComponent(password)
  const poolerPath = resolve(process.cwd(), "supabase/.temp/pooler-url")

  // Prefer the CLI-cached pooler URL (IPv4-friendly). Direct db.*.supabase.co
  // often fails with ENOTFOUND on IPv4-only networks.
  if (existsSync(poolerPath)) {
    const pooler = readFileSync(poolerPath, "utf8").trim()
    if (pooler) {
      try {
        const url = new URL(pooler)
        url.password = password
        if (!url.username) {
          url.username = `postgres.${projectRef}`
        }
        return url.toString()
      } catch {
        // fall through
      }
    }
  }

  return `postgresql://postgres.${projectRef}:${encoded}@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres`
}

const root = process.cwd()
loadEnvFile(resolve(root, ".env"))
loadEnvFile(resolve(root, ".env.local"))

const filePassword =
  readEnvValue(resolve(root, ".env.local"), "SUPABASE_DB_PASSWORD") ??
  readEnvValue(resolve(root, ".env"), "SUPABASE_DB_PASSWORD")
if (filePassword !== undefined) {
  process.env.SUPABASE_DB_PASSWORD = filePassword
}

/** @type {string[]} */
let args

if (target === "local") {
  args = ["db", "push", "--local"]
} else {
  const password = process.env.SUPABASE_DB_PASSWORD?.trim()
  if (!password) {
    console.error(
      "Missing SUPABASE_DB_PASSWORD. Add it to `.env` (Project Settings → Database).",
    )
    process.exit(1)
  }

  const projectRef = resolveProjectRef()
  if (!projectRef) {
    console.error(
      "Could not resolve project ref. Link the project (`npx supabase link`) or set NEXT_PUBLIC_SUPABASE_URL.",
    )
    process.exit(1)
  }

  const dbUrl = buildRemoteDbUrl(projectRef, password)
  // --db-url skips login-role API; still set env for any CLI fallbacks.
  args = ["db", "push", "--db-url", dbUrl, "--yes"]
}

console.log(
  target === "remote"
    ? "Pushing migrations to remote Supabase…"
    : "Pushing migrations to local Supabase…",
)

const result = spawnSync("supabase", args, {
  stdio: "inherit",
  env: process.env,
  shell: true,
})

process.exit(result.status ?? 1)
