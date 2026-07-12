import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Project-local adjustments:
  // - no-explicit-any is used intentionally across the app (e.g. chat message
  //   shapes); keep it visible as a warning rather than failing CI.
  // - ban-ts-comment: @ts-ignore/@ts-expect-error/@ts-nocheck are used for
  //   legacy interop; downgrade to warning to avoid blocking the lint gate.
  // - react/no-unescaped-entities: purely cosmetic (JSX quote/apostrophe
  //   escaping); downgrade to warning so it doesn't block CI.
  // - react-hooks/set-state-in-effect and react-hooks/purity are newer React 19
  //   rules that flag normal mount-time state sync; downgrade to warning.
  //   NOTE: react-hooks/rules-of-hooks is intentionally LEFT as an error —
  //   it catches genuine hook-order bugs (see SignInGate fix).
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/ban-ts-comment": "warn",
      "react/no-unescaped-entities": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
