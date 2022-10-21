module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    ecmaFeatures: {
      // Allows for the parsing of JSX
      jsx: true,
    },
  },
  env: {
    browser: true,
  },
  extends: ['eslint:recommended', 'plugin:react/recommended', 'plugin:prettier/recommended', 'plugin:react-hooks/recommended'],
  ignorePatterns: ['node_modules/**/*'],
  rules: {
    'react/prop-types': 0,
    'no-empty': ['error', { allowEmptyCatch: true }],
    'no-case-declarations': 0,
    'no-unused-vars': 0,
    'no-extra-boolean-cast': 0,
    'no-inner-declarations': 0,
    'no-constant-condition': 0,
  },
  overrides: [
    // typescript
    {
      files: ['*.ts', '*.tsx'],
      excludedFiles: ['*.js'],
      plugins: ['@typescript-eslint'],
      extends: [
        'prettier/@typescript-eslint',

        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
      ],
      rules: {
        '@typescript-eslint/no-explicit-any': 0,
        '@typescript-eslint/member-delimiter-style': 0,
        '@typescript-eslint/interface-name-prefix': 0,
        '@typescript-eslint/no-use-before-define': 0,
        'react/prop-types': 0,
      },
    },

    {
      files: ['.eslintrc.js'],
      env: {
        node: true,
      },
    },

    {
      files: ['*.js'],
      env: {
        es6: true,
        node: true,
      },
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
      rules: {},
    },
  ],
  settings: {
    react: {
      version: 'detect',
    },
  },
}
