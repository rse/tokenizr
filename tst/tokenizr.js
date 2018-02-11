/*
**  Tokenizr -- String Tokenization Library
**  Copyright (c) 2015-2018 Ralf S. Engelschall <rse@engelschall.com>
**
**  Permission is hereby granted, free of charge, to any person obtaining
**  a copy of this software and associated documentation files (the
**  "Software"), to deal in the Software without restriction, including
**  without limitation the rights to use, copy, modify, merge, publish,
**  distribute, sublicense, and/or sell copies of the Software, and to
**  permit persons to whom the Software is furnished to do so, subject to
**  the following conditions:
**
**  The above copyright notice and this permission notice shall be included
**  in all copies or substantial portions of the Software.
**
**  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
**  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
**  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
**  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
**  CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
**  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
**  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/* global describe: false */
/* global it: false */
/* global expect: false */
/* global require: false */
/* jshint -W030: false */

var Tokenizr = require("../lib/tokenizr.js")

describe("Tokenizr Library", function () {
    it("should expose its official API", function () {
        var tokenizr = new Tokenizr()
        expect(tokenizr).to.be.a("object")
        expect(tokenizr).to.respondTo("input")
        expect(tokenizr).to.respondTo("rule")
        expect(tokenizr).to.respondTo("token")
    })
    it("should have the expected functionality", function () {
        var tokenizr = new Tokenizr()
        tokenizr.rule("default", /[a-zA-Z]+/, function (ctx /*, m */) {
            ctx.accept("symbol")
        })
        tokenizr.rule("default", /[0-9]+/, function (ctx, m) {
            ctx.accept("number", parseInt(m[0]))
        })
        tokenizr.rule("default", /"((?:\\\"|[^\r\n]+)+)"/, function (ctx, m) {
            ctx.accept("string", m[1].replace(/\\"/g, "\""))
        })
        tokenizr.rule("default", /\/\*/, function (ctx /*, m */) {
            ctx.push("comment")
            ctx.tag("bar")
            ctx.ignore()
        })
        tokenizr.rule("comment #foo #bar", /\*\//, function (/* ctx, m */) {
            throw new Error("should never enter")
        })
        tokenizr.rule("comment #bar", /\*\//, function (ctx /*, m */) {
            ctx.untag("bar")
            ctx.pop()
            ctx.ignore()
        })
        tokenizr.rule("comment #bar", /./, function (ctx /*, m */) {
            ctx.ignore()
        })
        tokenizr.rule("default", /\s*,\s*/, function (ctx /*, m */) {
            ctx.ignore()
        })

        tokenizr.input("foo42,\n \"bar baz\",\n quux/* */")

        tokenizr.debug(true)
        var tokens
        try {
            tokens = tokenizr.tokens()
        }
        catch (ex) {
            console.log(ex.toString())
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

