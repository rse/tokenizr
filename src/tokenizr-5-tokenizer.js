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

import excerpt           from "./tokenizr-1-excerpt"
import TokenizationError from "./tokenizr-3-error"
import ActionContext     from "./tokenizr-4-context"

/*  external API class  */
export default class Tokenizr {
    /*  construct and initialize the object  */
    constructor () {
        this._rules = []
        this._debug = false
        this.reset()
    }

    /*  reset the internal state  */
    reset () {
        this._input   = ""
        this._len     = 0
        this._pos     = 0
        this._line    = 0
        this._column  = 0
        this._state   = [ "default" ]
        this._tokens  = []
        this._ctx     = new ActionContext(this)
        return this
    }

    /*  configure debug operation  */
    debug (debug) {
        this._debug = debug
    }

    /*  output a debug message  */
    _log (msg) {
        if (this._debug)
            console.log(`tokenizr: ${msg}`)
    }

    /*  provide (new) input string to tokenize  */
    input (input) {
        /*  sanity check arguments  */
        if (typeof input !== "string")
            throw new Error("parameter \"input\" not a String")

        /*  reset state and store new input  */
        this.reset()
        this._input = input
        this._len   = input.length
        return this
    }

    /*  configure a tokenization rule  */
    rule (state, pattern, action) {
        /*  support optional states  */
        if (arguments.length === 2) {
            [ pattern, action ] = [ state, pattern ]
            state = "*"
        }

        /*  sanity check arguments  */
        if (typeof state !== "string")
            throw new Error("parameter \"state\" not a String")
        if (!(typeof pattern === "object" && pattern instanceof RegExp))
            throw new Error("parameter \"pattern\" not a RegExp")
        if (typeof action !== "function")
            throw new Error("parameter \"action\" not a Function")

        /*  post-process state  */
        state = state.split(/\s*,\s*/g)

        /*  post-process pattern  */
        var flags = "g"
        if (pattern.multiline)
            flags += "m"
        if (pattern.ignoreCase)
            flags += "i"
        pattern = new RegExp(pattern.source, flags)

        /*  store rule  */
        this._log(`rule: configure rule (state: ${state}, pattern: ${pattern})`)
        this._rules.push({ state, pattern, action })

        return this
    }

    /*  progress the line/column counter  */
    _progress (from, until) {
        let line   = this._line
        let column = this._column
        let s = this._input
        for (let i = from; i < until; i++) {
            let c = s.charAt(i)
            if (c === "\r")
                this._column = 0
            else if (c === "\n") {
                this._line++
                this._column = 0
            }
            else if (c === "\t")
                this._column += 8 - (this._column % 8)
            else
                this._column++
        }
        this._log(`    PROGRESS: characters: ${until - from}, from: <line ${line}, column ${column}>, to: <line ${this._line}, column ${this._column}>`)
    }

    /*  determine and return the next token  */
    _tokenize () {
        /*  tokenize only as long as there is input left  */
        if (this._pos >= this._len)
            return

        /*  loop...  */
        let continued = true
        while (continued) {
            continued = false

            /*  some optional debugging context  */
            if (this._debug) {
                let e = excerpt(this._input, this._pos)
                this._log(`INPUT: state: ${this._state[this._state.length - 1]}, text: ` +
                    (e.prologTrunc ? "..." : "\"") + `${e.prologText}<${e.tokenText}>${e.epilogText}` +
                    (e.epilogTrunc ? "..." : "\"") + `, at: <line ${this._line}, column ${this._column}>`)
            }

            /*  iterate over all rules...  */
            for (let i = 0; i < this._rules.length; i++) {
                if (this._debug)
                    this._log(`  RULE: state(s): ${this._rules[i].state.join(",")}, pattern: ${this._rules[i].pattern.source}`)

                /*  one of rule's states has to match  */
                if (!(   (   this._rules[i].state.length === 1
                          && this._rules[i].state[0] === "*"  )
                      || this._rules[i].state.indexOf(this._state[this._state.length - 1]) >= 0))
                    continue

                /*  match pattern at the last position  */
                this._rules[i].pattern.lastIndex = this._pos
                let found = this._rules[i].pattern.exec(this._input)
                this._rules[i].pattern.lastIndex = this._pos
                if (   (found = this._rules[i].pattern.exec(this._input)) !== null
                    && found.index === this._pos                                  ) {
                    if (this._debug)
                       this._log("    MATCHED: " + JSON.stringify(found))

                    /*  pattern found, so give action a chance to operate
                        on it and act according to its results  */
                    this._ctx._match = found
                    this._ctx._repeat = false
                    this._ctx._reject = false
                    this._ctx._ignore = false
                    this._rules[i].action.call(this._ctx, found)
                    if (this._ctx._reject)
                        /*  reject current action, continue matching  */
                        continue
                    else if (this._ctx._repeat) {
                        /*  repeat matching from scratch  */
                        continued = true
                        break
                    }
                    else if (this._ctx._ignore) {
                        /*  ignore token  */
                        this._progress(this._pos, this._rules[i].pattern.lastIndex)
                        this._pos = this._rules[i].pattern.lastIndex
                        if (this._pos >= this._len)
                            return
                        continued = true
                        break
                    }
                    else if (this._tokens.length > 0) {
                        /*  accept token(s)  */
                        this._progress(this._pos, this._rules[i].pattern.lastIndex)
                        this._pos = this._rules[i].pattern.lastIndex
                        return
                    }
                    else
                        throw new Error("action of pattern \"" +
                            this._rules[i].pattern.source + "\" neither rejected nor accepted any token(s)")
                }
            }
        }

        /*  no pattern matched at all  */
        throw new TokenizationError("token not recognized", this)
    }

    /*  determine and return next token  */
    token () {
        /*  if no more tokens are pending, try to determine a new one  */
        if (this._tokens.length === 0)
            this._tokenize()

        /*  return now potentially pending token  */
        if (this._tokens.length > 0)
            return this._tokens.shift()

        /*  no more tokens  */
        return null
    }

    /*  determine and return all tokens  */
    tokens () {
        let tokens = []
        let token
        while ((token = this.token()) !== null)
            tokens.push(token)
        return tokens
    }

    /*  peek at the next token or token at particular offset  */
    peek (offset) {
        if (typeof offset === "undefined")
            offset = 0
        for (let i = 0; i < this._tokens.length + offset; i++)
             this._tokenize()
        if (offset >= this._tokens.length)
            throw new Error("not enough tokens available for peek operation")
        return this._tokens[offset]
    }

    /*  skip one or more tokens  */
    skip (len) {
        if (typeof len === "undefined")
            len = 1
        for (let i = 0; i < this._tokens.length + len; i++)
             this._tokenize()
        if (len > this._tokens.length)
            throw new Error("not enough tokens available for skip operation")
        while (len-- > 0)
            this.token()
        return this
    }

    /*  consume the current token (by expecting it to be a particular symbol)  */
    consume (value) {
        for (let i = 0; i < this._tokens.length + 1; i++)
             this._tokenize()
        if (this._tokens.length === 0)
            throw new Error("not enough tokens available for consume operation")
        let token = this.token()
        if (token.value !== value)
            throw new Error("expected token value \"" + value + "\" (" + typeof value + "): " +
                "found token value \"" + token.value + "\" (" + typeof token.value + ")")
        return this
    }
}

