import parser from "@typescript-eslint/parser";
import plugin from "@typescript-eslint/eslint-plugin";

export default [
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts"] },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: { "@typescript-eslint": plugin },
    rules: {
      "constructor-super": "error",
      "no-unreachable": "error",
      "no-constant-condition": "error",
      "no-dupe-else-if": "error",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
];
