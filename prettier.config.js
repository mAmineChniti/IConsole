/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
const prettierConfig = {
  plugins: ["prettier-plugin-tailwindcss", "prettier-plugin-organize-imports"],
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
