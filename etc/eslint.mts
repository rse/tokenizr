/*
**  Tokenizr -- String Tokenization Library
**  Copyright (c) 2015-2025 Dr. Ralf S. Engelschall <rse@engelschall.com>
**  Licensed under MIT license <https://spdx.org/licenses/MIT>
*/

import pluginJs      from "@eslint/js"
import pluginStd     from "neostandard"
import pluginN       from "eslint-plugin-n"
import pluginImport  from "eslint-plugin-import"
import pluginPromise from "eslint-plugin-promise"
import pluginMocha   from "eslint-plugin-mocha"
import pluginChai    from "eslint-plugin-chai-expect"
import pluginTS      from "typescript-eslint"
import globals       from "globals"
import parserTS      from "@typescript-eslint/parser"
import oxlint        from "eslint-plugin-oxlint"
import biome         from "eslint-config-biome"

export default [
    pluginJs.configs.recommended,
    pluginMocha.configs.recommended,
    pluginChai.configs["recommended-flat"],
    ...pluginTS.configs.strict,
    ...pluginTS.configs.stylistic,
    ...pluginStd({
        ignores: pluginStd.resolveIgnoresFromGitignore()
    }),
    {
        plugins: {
            "n":       pluginN,
            "import":  pluginImport,
            "promise": pluginPromise
        },
        files: [ "src/**/*.ts" ],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType:  "module",
            parser: parserTS,
            parserOptions: {
                ecmaFeatures: {
                    jsx: false
                }
            },
            globals: {
                ...globals.node,
                ...globals.browser,
                ...globals.commonjs
            }
        },
        rules: {
            "curly":                                              "off",
            "require-atomic-updates":                             "off",
            "dot-notation":                                       "off",
            "no-labels":                                          "off",
            "no-useless-constructor":                             "off",
            "no-unused-vars":                                     "off",

            "@stylistic/indent":                                  "off",
            "@stylistic/linebreak-style":                         [ "error", "unix" ],
            "@stylistic/semi":                                    [ "error", "never" ],
            "@stylistic/operator-linebreak":                      [ "error", "after", { overrides: { "&&": "before", "||": "before", ":": "after" } } ],
            "@stylistic/brace-style":                             [ "error", "stroustrup", { allowSingleLine: true } ],
            "@stylistic/quotes":                                  [ "error", "double" ],

            "@stylistic/no-multi-spaces":                         "off",
            "@stylistic/no-multiple-empty-lines":                 "off",
            "@stylistic/key-spacing":                             "off",
            "@stylistic/object-property-newline":                 "off",
            "@stylistic/space-in-parens":                         "off",
            "@stylistic/array-bracket-spacing":                   "off",
            "@stylistic/lines-between-class-members":             "off",
            "@stylistic/multiline-ternary":                       "off",
            "@stylistic/quote-props":                             "off",

            "@typescript-eslint/no-empty-function":               "off",
            "@typescript-eslint/no-explicit-any":                 "off",
            "@typescript-eslint/no-unused-vars":                  "off",
            "@typescript-eslint/ban-ts-comment":                  "off",
            "@typescript-eslint/no-this-alias":                   "off",
            "@typescript-eslint/no-non-null-assertion":           "off",
            "@typescript-eslint/consistent-type-definitions":     "off",
            "@typescript-eslint/array-type":                      "off",
            "@typescript-eslint/no-extraneous-class":             "off",
            "@typescript-eslint/consistent-indexed-object-style": "off",
            "@typescript-eslint/prefer-function-type":            "off",
            "@typescript-eslint/no-unnecessary-type-constraint":  "off",
            "@typescript-eslint/no-empty-object-type":            "off",

            "mocha/no-mocha-arrows":                              "off"
        }
    },
    ...oxlint.buildFromOxlintConfigFile("etc/oxlint.jsonc"),
    biome
]

