import "server-only";

// Re-export retention from automated module for existing imports.
export { applyAutomatedBackupRetention } from "@/lib/backups/automated";
