require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
  extends: ['snazzah'],
  overrides: [
    {
      files: ['./**/*'],
      env: {
        browser: true
      }
    }
  ],
  parserOptions: { tsconfigRootDir: __dirname }
};
