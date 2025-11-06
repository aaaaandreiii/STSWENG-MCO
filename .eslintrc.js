// import js from "@eslint/js";
// import globals from "globals";
// import pluginReact from "eslint-plugin-react";
// import { defineConfig } from "eslint/config";

// export default defineConfig([
//   { files: ["**/*.{js,mjs,cjs,jsx}"], plugins: { js }, extends: ["js/recommended"], languageOptions: { globals: globals.browser } },
//   pluginReact.configs.flat.recommended,
// ]);
// .eslintrc.js
module.exports = {
  env: {
    node: true,
    es2021: true,
    browser: true,
  },
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "script",
  },
  extends: ["eslint:recommended", "prettier"],
  rules: {
    semi: ["error", "always"],
    quotes: ["error", "single"],
  },
};