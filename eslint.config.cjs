// import js from "@eslint/js";
// import globals from "globals";
// import pluginReact from "eslint-plugin-react";
// import { defineConfig } from "eslint/config";

const { plugin } = require("mongoose");

// export default defineConfig([
//   { files: ["**/*.{js,mjs,cjs,jsx}"], plugins: { js }, extends: ["js/recommended"], languageOptions: { globals: globals.browser } },
//   pluginReact.configs.flat.recommended,
// ]);
// .eslintrc.js
// eslint.config.cjs
module.exports = [
  {
    files: ["**/*.js"],
    ignores: [
      "public/js/bootstrap.bundle.js", // ignore vendor library
      "node_modules/**",
    ],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "script", // CommonJS
      globals: {
        require: "readonly",
        module: "readonly",
        __dirname: "readonly",
        process: "readonly",
        console: "readonly",
      },
    },
    rules: {
      semi: ["error", "always"],
      quotes: ["error", "single"],
    },
  },
];
