module.exports = {
  parserOptions: {
    ecmaVersion: 2018,
  },
  env: {
    browser: true,
    webextensions: true,
    es6: true,
    node: true,
    commonjs: true,
  },

  extends: ['eslint:recommended', 'plugin:jest/recommended', 'plugin:jest/style'],
  plugins: ['prettier', 'jest'],

  // 0: off, 1: warn, 2: error
  rules: {
    'prettier/prettier': 2,
    'no-console': 0,
    'prefer-template': 2,
  },
};
