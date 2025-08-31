import tseslint from 'typescript-eslint'
import vue from 'eslint-plugin-vue'
import n from 'eslint-plugin-n'

export default [
        // TypeScript
    ...tseslint.configs.recommended,

        // Node.js
    n.configs['flat/recommended'], {
        files: ['packages/server/**/*.{ts,js}'],
        rules: {
            'n/no-missing-import': 'off'
        }
    },

        // Vue
    vue.configs['flat/recommended'], {
        files: ['packages/client/**/*.{ts,js,vue}'],
        rules: {
            'object-curly-spacing': ['error', 'always'],
            'comma-dangle': ['error', 'never'],
            'semi': ['error', 'never'],
            'no-extra-semi': 'error',
            'no-console': 'warn'
        },
        languageOptions: {
            sourceType: 'module',
            extraFileExtensions: ['.vue'],
            parserOptions: {
                parser: tseslint.parser,
                ecmaVersion: 'latest'
            }
        }
    }
]