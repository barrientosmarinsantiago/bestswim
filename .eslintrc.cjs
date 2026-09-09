const nextPlugin = require("@next/eslint-plugin-next");

module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true
    }
  },
  env: {
    browser: true,
    node: true,
    es2022: true
  },
  plugins: ["@typescript-eslint", "react", "react-hooks", "@next/next"],
  extends: ["eslint:recommended", "plugin:react/recommended", "plugin:react-hooks/recommended"],
  settings: {
    react: {
      version: "detect"
    },
    next: {
      rootDir: ["./"]
    }
  },
  ignorePatterns: [".next/", "node_modules/", "next-env.d.ts"],
  rules: {
    ...nextPlugin.configs.recommended.rules,
    "@next/next/no-img-element": "off",
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off"
  }
};
