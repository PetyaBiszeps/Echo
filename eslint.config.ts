import vueParser from 'vue-eslint-parser'
import tseslint from 'typescript-eslint'
import vue from 'eslint-plugin-vue'
// import n from 'eslint-plugin-n'

export default [
        // TypeScript
    ...tseslint.configs.recommended,

        // Node.js
    // n.configs['flat/recommended'], {
    //     files: ['packages/server/**/*.{ts,js}'],
    //     rules: {},
    // },

        // Vue
    ...vue.configs['flat/recommended'], {
        files: ['packages/client/**/*.{ts,js,vue}'],
        rules: {
            'object-curly-spacing': ['error', 'always'],
            'comma-dangle': ['error', 'never'],
            'semi': ['error', 'never'],
            'no-extra-semi': 'error',
            'no-console': 'warn'
        }
    }, {
        files: ['packages/client/**/*.vue'],
        rules: {
            'vue/attributes-order': ['error', {
                order: [
                    'TWO_WAY_BINDING',
                    'DEFINITION',
                    'LIST_RENDERING',
                    'CONDITIONALS',
                    'RENDER_MODIFIERS',
                    'GLOBAL',
                    'UNIQUE',
                    'OTHER_DIRECTIVES',
                    'OTHER_ATTR',
                    'EVENTS',
                    'CONTENT'
                ]
            }]
        },
        languageOptions: {
            parser: vueParser,
            parserOptions: {
                parser: tseslint.parser,
                ecmaVersion: 'latest',
                sourceType: 'module'
            }
        }
    }
]