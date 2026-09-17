module.exports = {
  extends: ['airbnb-base', 'airbnb-typescript/base', 'prettier'],
  plugins: ['prettier'],
  overrides: [
    {
      // Kinobi-generated code is not written by hand and does not follow every
      // airbnb stylistic rule.
      files: ['src/generated/**/*.ts'],
      rules: {
        '@typescript-eslint/no-shadow': 'off',
        'prefer-destructuring': 'off',
      },
    },
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  rules: {
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'class-methods-use-this': 'off',
    'import/no-cycle': 'off',
    'import/prefer-default-export': 'off',
    'no-underscore-dangle': 'off',
    'max-classes-per-file': 'off',
    'no-param-reassign': 'off',
    'func-names': 'off',
  },
  ignorePatterns: ['dist/**', '.eslintrc.js', 'typedoc-plugin.js'],
};
