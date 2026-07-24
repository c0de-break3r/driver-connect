// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");
const path = require("path");

module.exports = defineConfig([
  expoConfig,
  {
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
          moduleDirectory: ['node_modules', path.resolve(__dirname, '')],
        },
      },
    },
    ignores: ["dist/*", "convex/_generated/*"],
  }
]);
