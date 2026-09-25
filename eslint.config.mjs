import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    // Vendored vanilla ports of React Bits components (LiquidEther, StrokeText).
    // Their internals are third-party code we deliberately do not own or edit —
    // only the exported mount() boundary is ours. @ts-nocheck and the `any`
    // annotations are deliberate; see docs/superpowers/plans for the rationale.
    files: ["lib/liquid-ether.ts", "lib/stroke-text.ts"],
    rules: {
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];

export default eslintConfig;
