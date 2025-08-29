/** @type {import('prettier').Config} */
const prettierConfig = {
  plugins: [
    "@ianvs/prettier-plugin-sort-imports",
    "prettier-plugin-unused-imports-configurable",
  ],
  semi: true,
  singleQuote: false,
  trailingComma: "all",
  bracketSpacing: true,
  tabWidth: 2,
  useTabs: false,
  printWidth: 80,
  endOfLine: "auto",
};

export default prettierConfig;
