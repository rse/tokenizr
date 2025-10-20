/*
**  Tokenizr -- String Tokenization Library
**  Copyright (c) 2015-2025 Dr. Ralf S. Engelschall <rse@engelschall.com>
**  Licensed under MIT license <https://spdx.org/licenses/MIT>
*/

import { describe, it } from "mocha"
import { expect }       from "chai"

import { Tokenizr } from ".."

describe("Tokenizr Library", () => {
    it("should expose its official API", () => {
        const tokenizr = new Tokenizr()
        expect(tokenizr).to.be.a("object")
        expect(tokenizr).to.respondTo("input")
        expect(tokenizr).to.respondTo("rule")
        expect(tokenizr).to.respondTo("token")
    })
    it("should have the expected functionality", () => {
        const tokenizr = new Tokenizr()
        tokenizr.rule("default", /[a-zA-Z]+/, (ctx /*, m */) => {
            ctx.accept("symbol")
        })
        tokenizr.rule("default", /[0-9]+/, (ctx, m) => {
            ctx.accept("number", parseInt(m[0]))
        })
        tokenizr.rule("default", /"((?:\\\"|[^\r\n]+)*)"/, (ctx, m) => {
            ctx.accept("string", m[1].replace(/\\"/g, "\""))
        })
        tokenizr.rule("default", /\/\*/, (ctx /*, m */) => {
            ctx.push("comment")
            ctx.tag("bar")
            ctx.ignore()
        })
        tokenizr.rule("comment #foo #bar", /\*\//, (/* ctx, m */) => {
            throw new Error("should never enter")
        })
        tokenizr.rule("comment #bar", /\*\//, (ctx /*, m */) => {
            ctx.untag("bar")
            ctx.pop()
            ctx.ignore()
        })
        tokenizr.rule("comment #bar", /./, (ctx /*, m */) => {
            ctx.ignore()
        })
        tokenizr.rule("default", /\s*,\s*/, (ctx /*, m */) => {
            ctx.ignore()
        })

        tokenizr.input("foo42,\n \"bar baz\",\n quux/* */")

        tokenizr.debug(true)
        let tokens: any[]
        try {
            tokens = tokenizr.tokens()
        }
        catch (ex) {
            console.log(ex)
            throw ex
        }

        expect(tokens).to.be.a("array")
        expect(tokens).to.have.length(5)
        expect(tokens[0]).to.be.a("object").and.to.be.deep
            .equal({ type: "symbol", value: "foo", text: "foo", pos: 0, line: 1, column: 1 })
        expect(tokens[1]).to.be.a("object").and.to.be.deep
            .equal({ type: "number", value: 42, text: "42", pos: 3, line: 1, column: 4 })
        expect(tokens[2]).to.be.a("object").and.to.be.deep
            .equal({ type: "string", value: "bar baz", text: "\"bar baz\"", pos: 8, line: 2, column: 2 })
        expect(tokens[3]).to.be.a("object").and.to.be.deep
            .equal({ type: "symbol", value: "quux", text: "quux", pos: 20, line: 3, column: 2 })
    })
})
