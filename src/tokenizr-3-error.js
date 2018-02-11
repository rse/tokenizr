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

import excerpt from "./tokenizr-1-excerpt"

/*  internal helper class for tokenization error reporting  */
export default class ParsingError extends Error {
    /*  construct and initialize object  */
    constructor (message, pos, line, column, input) {
        super(message)
        this.name     = "ParsingError"
        this.message  = message
        this.pos      = pos
        this.line     = line
        this.column   = column
        this.input    = input
    }

    /*  render a useful string representation  */
    toString () {
        let l = excerpt(this.input, this.pos)
        let prefix1 = `line ${this.line} (column ${this.column}): `
        let prefix2 = ""
        for (let i = 0; i < prefix1.length + l.prologText.length; i++)
            prefix2 += " "
        let msg = "Parsing Error: " + this.message + "\n" +
            prefix1 + l.prologText + l.tokenText + l.epilogText + "\n" +
            prefix2 + "^"
        return msg
    }
}

