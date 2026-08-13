/** ESLint config for the NEXORA backend (Express + TypeScript). */
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
    project: "./tsconfig.json",
  },
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
  ],
  env: {
    node: true,
    es2022: true,
  },
  ignorePatterns: ["dist", "node_modules", "prisma/seed.ts"],
  rules: {
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-misused-promises": [
      "error",
      { checksVoidReturn: { arguments: false } },
    ],
    "no-console": ["warn", { allow: ["warn", "error"] }],
  },
};
