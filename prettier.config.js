/** @type {import("prettier").Config & import("prettier-plugin-tailwindcss").PluginOptions} */
const prettierConfig = {
  plugins: [
    "@ianvs/prettier-plugin-sort-imports",
    "prettier-plugin-unused-imports-configurable",
    "prettier-plugin-tailwindcss",
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
