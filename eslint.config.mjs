import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// ESLint v9 uses flat config. Keep repo-level ignores here so lint only targets
// the Next.js app code and doesn't try to parse vendored/archived folders.
export default defineConfig([
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",

    "_repo-audits/**",
    "public/projects/**",
    "**/venv/**",
    "**/.venv/**",
    "**/node_modules/**",

    // Infra code may include Node/CommonJS files (lambda handlers, scripts)
    // that are not part of the Next.js runtime bundle.
    "infra/**",
  ]),
  ...nextVitals,
  ...nextTs,
]);
