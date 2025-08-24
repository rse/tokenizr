/*
**  Tokenizr -- String Tokenization Library
**  Copyright (c) 2015-2025 Dr. Ralf S. Engelschall <rse@engelschall.com>
**  Licensed under MIT license <https://spdx.org/licenses/MIT>
*/

import fs                    from "node:fs"
import * as Vite             from "vite"
import { tscPlugin }         from "@wroud/vite-plugin-tsc"
import { viteSingleFile }    from "vite-plugin-singlefile"
import { nodePolyfills }     from "vite-plugin-node-polyfills"

const formats = process.env.VITE_BUILD_FORMATS ?? "esm"

export default Vite.defineConfig(({ command, mode }) => ({
    logLevel: "info",
    appType:  "custom",
    base:     "",
    root:     "",
    plugins: [
        tscPlugin({
            tscArgs:        [ "--project", "etc/tsc.json" ],
            packageManager: "npx",
            prebuild:       true
        }),
        ...(formats === "umd" ? [ nodePolyfills() ] : []),
        viteSingleFile()
    ],
    build: {
        lib: {
            entry:    "dst/tokenizr.js",
            formats:  formats.split(","),
            name:     "Tokenizr",
            fileName: (format) => `tokenizr.${format === "es" ? "esm" : format}.js`
        },
        target:                 "es2022",
        outDir:                 "dst",
        assetsDir:              "",
        emptyOutDir:            (mode === "production") && formats !== "umd",
        chunkSizeWarningLimit:  5000,
        assetsInlineLimit:      0,
        sourcemap:              (mode === "development"),
        minify:                 (mode === "production") && formats === "umd",
        reportCompressedSize:   (mode === "production")
    }
}))

