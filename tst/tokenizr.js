/*
**  Tokenizr -- String Tokenization Library
**  Copyright (c) 2015 Ralf S. Engelschall <rse@engelschall.com>
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
        tokenizr.rule("default", /[a-zA-Z]+/,              function (/* m */) { this.accept("symbol") })
        tokenizr.rule("default", /[0-9]+/,                 function (m)       { this.accept("number", parseInt(m[0])) })
        tokenizr.rule("default", /"((?:\\\"|[^\r\n]+)+)"/, function (m)       { this.accept("string", m[1].replace(/\\"/g, "\"")) })
        tokenizr.rule("default", /\/\*/,                   function (/* m */) { this.state("comment"); this.ignore() })
        tokenizr.rule("comment", /\*\//,                   function (/* m */) { this.state(); this.ignore() })
        tokenizr.rule("comment", /./,                      function (/* m */) { this.ignore() })
        tokenizr.rule("default", /\s*,\s*/,                function (/* m */) { this.ignore() })

        tokenizr.input("foo42,\n \"bar baz\",\n quux/* */")
        tokenizr.debug(true)
        var tokens = tokenizr.tokens()

        expect(tokens).to.be.a("array")
        expect(tokens).to.have.length(4)
        expect(tokens[0]).to.be.a("object").and.to.be.deep
            .equal({ type: "symbol", value: "foo", text: "foo", pos: 0, line: 0, column: 0 })
        expect(tokens[1]).to.be.a("object").and.to.be.deep
            .equal({ type: "number", value: 42, text: "42", pos: 3, line: 0, column: 3 })
        expect(tokens[2]).to.be.a("object").and.to.be.deep
            .equal({ type: "string", value: "bar baz", text: "\"bar baz\"", pos: 8, line: 1, column: 1 })
        expect(tokens[3]).to.be.a("object").and.to.be.deep
            .equal({ type: "symbol", value: "quux", text: "quux", pos: 20, line: 2, column: 1 })
    })
})

