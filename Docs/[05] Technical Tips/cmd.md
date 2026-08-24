Run Vitest, build the project, and check TypeScript and ESLint for errors. If any issues arise, fix them carefully, ensuring your changes do not introduce new problems or break existing functionality.

## Boneyard skeletons

One-time browser install (Playwright ships with boneyard-js):

```bash
npx playwright install chromium
```

Capture bones (dev server must be running on :3000):

```bash
npm run dev
npm run bones:build
# or watch mode while developing:
npm run bones:watch
```

Docs: https://github.com/0xGF/boneyard
