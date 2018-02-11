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

/*  internal helper class for token representation  */
export default class Token {
    constructor (type, value, text, pos = 0, line = 0, column = 0) {
        this.type   = type
        this.value  = value
        this.text   = text
        this.pos    = pos
        this.line   = line
        this.column = column
    }
    toString () {
        return `<type: ${this.type}, ` +
            `value: ${JSON.stringify(this.value)}, ` +
            `text: ${JSON.stringify(this.text)}, ` +
            `pos: ${this.pos}, ` +
            `line: ${this.line}, ` +
            `column: ${this.column}>`
    }
    isA (type, value) {
        if (type !== this.type)
            return false
        if (arguments.length === 2 && value !== this.value)
            return false
        return true
    }
}

