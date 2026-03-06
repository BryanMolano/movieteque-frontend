import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      // '@stylistic/brace-style': ['error', 'allman'],
      // '@stylistic/indent': ['error', 2],
    }, // <-- ¡IMPORTANTE! Cerramos languageOptions aquí

    // Las reglas van al mismo nivel que languageOptions y files 👇
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "no-unused-vars": "warn",
      // '@stylistic/brace-style': ['error', 'allman'],
      // '@stylistic/indent': ['error', 2],
    }
  },
])
