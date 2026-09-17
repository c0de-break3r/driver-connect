// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");
const path = require("path");

module.exports = defineConfig([
  {
    ignores: ["dist/*", "convex/_generated/*", "src/components/ui/*"],
  },
  expoConfig,
  {
    languageOptions: {
      globals: {
        __dirname: "readonly",
      },
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
          moduleDirectory: ['node_modules', path.resolve(__dirname, '')],
        },
        typescript: {
          project: './tsconfig.json',
        },
      },
    },
    rules: {
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
      'react-hooks/immutability': 'off',
    },
  }
]);
