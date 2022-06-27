/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");

module.exports = {
  plugins: ["import", "prettier", "@typescript-eslint"],
  extends: ["airbnb-base", "plugin:@typescript-eslint/recommended", "prettier"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: [path.join(__dirname, "./tsconfig.json")],
  },
  rules: {
    "prettier/prettier": ["error"],
  },
};
