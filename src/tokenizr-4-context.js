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

import Token   from "./tokenizr-2-token"

/*  internal helper class for action context  */
export default class ActionContext {
    /*  construct and initialize the object  */
    constructor (tokenizr) {
        this._tokenizr = tokenizr
        this._data     = {}
        this._repeat   = false
        this._reject   = false
        this._ignore   = false
        this._match    = null
    }

    /*  store and retrieve user data attached to context  */
    data (key, value) {
        let valueOld = this._data[key]
        if (arguments.length === 2)
            this._data[key] = value
        return valueOld
    }

    /*  set a new state in the attached tokenizer  */
    state (state) {
        if (typeof state === "string") {
            this._tokenizr._log(`    STATE (PUSH): ` +
                `old: ${this._tokenizr._state[this._tokenizr._state.length- 1]}, ` +
                `new: ${state}`)
            this._tokenizr._state.push(state)
        }
        else if (this._tokenizr._state.length >= 2) {
            this._tokenizr._log(`    STATE (POP): ` +
                `old: ${this._tokenizr._state[this._tokenizr._state.length - 1]}, ` +
                `new: ${this._tokenizr._state[this._tokenizr._state.length - 2]}`)
            this._tokenizr._state.pop()
        }
        else
            throw new Error("internal error: no more states to pop")
        return this
    }

    /*  mark current matching to be repeated from scratch  */
    repeat () {
        this._tokenizr._log(`    REPEAT`)
        this._repeat = true
        return this
    }

    /*  mark current action to be rejected  */
    reject () {
        this._tokenizr._log(`    REJECT`)
        this._reject = true
        return this
    }

    /*  mark current action to be ignored  */
    ignore () {
        this._tokenizr._log(`    IGNORE`)
        this._ignore = true
        return this
    }

    /*  accept a new token  */
    accept (type, value) {
        if (arguments.length < 2)
            value = this._match[0]
        this._tokenizr._log(`    ACCEPT: type: ${type}, value: ${JSON.stringify(value)} (${typeof value}), text: "${this._match[0]}"`)
        this._tokenizr._pending.push(new Token(
            type, value, this._match[0],
            this._tokenizr._pos, this._tokenizr._line, this._tokenizr._column
        ))
        return this
    }
}

