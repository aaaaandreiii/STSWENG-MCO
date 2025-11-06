// import js from "@eslint/js";
// import globals from "globals";
// import pluginReact from "eslint-plugin-react";
// import { defineConfig } from "eslint/config";

// export default defineConfig([
//   { files: ["**/*.{js,mjs,cjs,jsx}"], plugins: { js }, extends: ["js/recommended"], languageOptions: { globals: globals.browser } },
//   pluginReact.configs.flat.recommended,
// ]);
// .eslintrc.js
// eslint.config.cjs
module.exports = [
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "script", //CommonJS
    },
    env: {
      node: true,
      browser: true,
      es2021: true,
    },
    rules: {
      semi: ["error", "always"],
      quotes: ["error", "single"],
    },
  },
];