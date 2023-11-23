module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  plugins: ["prettier"],
  extends: ["eslint:recommended", ], //airbnb-base // "plugin:prettier/recommended"
  overrides: [
    {
      files: ["**/*.test.js"],
      plugins: ["jest"],
      extends: ["plugin:jest/recommended"],
      rules: { "jest/prefer-expect-assertions": "off" },
    },
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {},
};
