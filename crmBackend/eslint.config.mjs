import globals from "globals";
import pluginJs from "@eslint/js";
import pluginJest from "eslint-plugin-jest";

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        ...globals.node,   // Node.js globals
        ...globals.jest,   // Jest globals
      },
    },
    plugins: {
      js: pluginJs,        // ESLint JS plugin
      jest: pluginJest,    // Jest plugin
    },
    rules: {
      ...pluginJs.configs.recommended.rules,     // Recommended ESLint rules
      ...pluginJest.configs.recommended.rules,  // Recommended Jest rules
    },
  },
];
