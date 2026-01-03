import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  // Project-level ignores (so eslint won't parse vendored deps)
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",

    // Repo-specific ignores:
    "_repo-audits/**",
    "public/projects/**",
    "**/venv/**",
    "**/.venv/**",
    "**/node_modules/**",
  ]),
  ...nextVitals,
  ...nextTs,
]);

export default eslintConfig;
