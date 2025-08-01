import globals from "globals";
import js from "@eslint/js";
import prettier from "eslint-config-prettier";

export default [
  js.configs.recommended,
  prettier,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      "no-unused-vars": "off",
      "no-console": "off",
      "no-undef": "warn",
      "no-unreachable": "warn",
      "no-constant-condition": "warn",
      "no-empty": "warn",
      "no-extra-semi": "warn",
      "no-irregular-whitespace": "warn",
      "no-unexpected-multiline": "warn",
      "prefer-const": "warn",
      "no-var": "warn",
    },
  },
]; 