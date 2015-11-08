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

import excerpt       from "./tokenizr-1-excerpt"
import Token         from "./tokenizr-2-token"
import ParsingError  from "./tokenizr-3-error"
import ActionContext from "./tokenizr-4-context"

/*  external API class  */
let Tokenizr = class Tokenizr {
    /*  construct and initialize the object  */
    constructor () {
        this._rules = []
        this._debug = false
        this.reset()
    }

    /*  reset the internal state  */
    reset () {
        this._input       = ""
        this._len         = 0
        this._eof         = false
        this._pos         = 0
        this._line        = 1
        this._column      = 1
        this._state       = [ "default" ]
        this._tag         = {}
        this._transaction = []
        this._pending     = []
        this._ctx         = new ActionContext(this)
        return this
    }

    /*  configure debug operation  */
    debug (debug) {
        this._debug = debug
        return this
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

    /*  push state  */
    push (state) {
        /*  sanity check arguments  */
        if (arguments.length !== 1)
            throw new Error("invalid number of arguments")
        if (typeof state !== "string")
            throw new Error("parameter \"state\" not a String")

        /*  push new state  */
        this._log(`    STATE (PUSH): ` +
            `old: <${this._state[this._state.length - 1]}>, ` +
            `new: <${state}>`)
        this._state.push(state)
        return this
    }

    /*  pop state  */
    pop () {
        /*  sanity check arguments  */
        if (arguments.length !== 0)
            throw new Error("invalid number of arguments")
        if (this._state.length < 2)
            throw new Error("no more custom states to pop")

        /*  pop old state  */
        this._log(`    STATE (POP): ` +
            `old: <${this._state[this._state.length - 1]}>, ` +
            `new: <${this._state[this._state.length - 2]}>`)
        return this._state.pop()
    }

    /*  get/set state  */
    state (state) {
        if (arguments.length === 1) {
            /*  sanity check arguments  */
            if (typeof state !== "string")
                throw new Error("parameter \"state\" not a String")

            /*  change current state  */
            this._log(`    STATE (SET): ` +
                `old: <${this._state[this._state.length - 1]}>, ` +
                `new: <${state}>`)
            this._state[this._state.length - 1] = state
            return this
        }
        else if (arguments.length === 0)
            return this._state[this._state.length - 1]
        else
            throw new Error("invalid number of arguments")
    }

    /*  set a tag  */
    tag (tag) {
        /*  sanity check arguments  */
        if (arguments.length !== 1)
            throw new Error("invalid number of arguments")
        if (typeof tag !== "string")
            throw new Error("parameter \"tag\" not a String")

        /*  set tag  */
        this._log(`    TAG (ADD): ${tag}`)
        this._tag[tag] = true
        return this
    }

    /*  check whether tag is set  */
    tagged (tag) {
        /*  sanity check arguments  */
        if (arguments.length !== 1)
            throw new Error("invalid number of arguments")
        if (typeof tag !== "string")
            throw new Error("parameter \"tag\" not a String")

        /*  set tag  */
        return (this._tag[tag] === true)
    }

    /*  unset a tag  */
    untag (tag) {
        /*  sanity check arguments  */
        if (arguments.length !== 1)
            throw new Error("invalid number of arguments")
        if (typeof tag !== "string")
            throw new Error("parameter \"tag\" not a String")

        /*  delete tag  */
        this._log(`    TAG (DEL): ${tag}`)
        delete this._tag[tag]
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
        state = state.split(/\s*,\s*/g).map((entry) => {
            let items  = entry.split(/\s+/g)
            let states = items.filter((item) => item.match(/^#/) === null)
            let tags   = items.filter((item) => item.match(/^#/) !== null)
                .map((tag) => tag.replace(/^#/, ""))
            if (states.length !== 1)
                throw new Error("exactly one state required")
            return { state: states[0], tags: tags }
        })

        /*  post-process pattern  */
        var flags = "g"
        if (pattern.multiline)  flags += "m"
        if (pattern.ignoreCase) flags += "i"
        pattern = new RegExp(pattern.source, flags)

        /*  store rule  */
        this._log(`rule: configure rule (state: ${state}, pattern: ${pattern.source})`)
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
                this._column = 1
            else if (c === "\n") {
                this._line++
                this._column = 1
            }
            else if (c === "\t")
                this._column += 8 - (this._column % 8)
            else
                this._column++
        }
        this._log(`    PROGRESS: characters: ${until - from}, ` +
            `from: <line ${line}, column ${column}>, ` +
            `to: <line ${this._line}, column ${this._column}>`)
    }

    /*  determine and return the next token  */
    _tokenize () {
        /*  tokenize only as long as there is input left  */
        if (this._pos >= this._len) {
            if (!this._eof) {
                this._eof = true
                this._pending.push(new Token("EOF", "", "", this._pos, this._line, this._column))
            }
            return
        }

        /*  loop...  */
        let continued = true
        while (continued) {
            continued = false

            /*  some optional debugging context  */
            if (this._debug) {
                let e = excerpt(this._input, this._pos)
                let tags = Object.keys(this._tag).map((tag) => `#${tag}`).join(" ")
                this._log(`INPUT: state: <${this._state[this._state.length - 1]}>, tags: <${tags}>, text: ` +
                    (e.prologTrunc ? "..." : "\"") + `${e.prologText}<${e.tokenText}>${e.epilogText}` +
                    (e.epilogTrunc ? "..." : "\"") + `, at: <line ${this._line}, column ${this._column}>`)
            }

            /*  iterate over all rules...  */
            for (let i = 0; i < this._rules.length; i++) {
                if (this._debug) {
                    let state = this._rules[i].state.map((item) => {
                        let output = item.state
                        if (item.tags.length > 0)
                            output += " " + item.tags.map((tag) => `#${tag}`).join(" ")
                        return output
                    }).join(", ")
                    this._log(`  RULE: state(s): <${state}>, ` +
                        `pattern: ${this._rules[i].pattern.source}`)
                }

                /*  one of rule's states (and all of its tags) has to match  */
                let matches = false
                let states = this._rules[i].state.map((item) => item.state)
                let idx = states.indexOf("*")
                if (idx < 0)
                    idx = states.indexOf(this._state[this._state.length - 1])
                if (idx >= 0) {
                    matches = true
                    let tags = this._rules[i].state[idx].tags
                    tags = tags.filter((tag) => !this._tag[tag])
                    if (tags.length > 0)
                        matches = false
                }
                if (!matches)
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
                    this._rules[i].action.call(this._ctx, this._ctx, found)
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
                    else if (this._pending.length > 0) {
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
        throw this.error("token not recognized")
    }

    /*  determine and return next token  */
    token () {
        /*  if no more tokens are pending, try to determine a new one  */
        if (this._pending.length === 0)
            this._tokenize()

        /*  return now potentially pending token  */
        if (this._pending.length > 0) {
            let token = this._pending.shift()
            if (this._transaction.length > 0)
                this._transaction[0].push(token)
            this._log(`TOKEN: ${token.toString()}`)
            return token
        }

        /*  no more tokens  */
        return null
    }

    /*  determine and return all tokens  */
    tokens () {
        let result = []
        let token
        while ((token = this.token()) !== null)
            result.push(token)
        return result
    }

    /*  peek at the next token or token at particular offset  */
    peek (offset) {
        if (typeof offset === "undefined")
            offset = 0
        for (let i = 0; i < this._pending.length + offset; i++)
             this._tokenize()
        if (offset >= this._pending.length)
            throw new Error("not enough tokens available for peek operation")
        this._log(`PEEK: ${this._pending[offset].toString()}`)
        return this._pending[offset]
    }

    /*  skip one or more tokens  */
    skip (len) {
        if (typeof len === "undefined")
            len = 1
        for (let i = 0; i < this._pending.length + len; i++)
             this._tokenize()
        if (len > this._pending.length)
            throw new Error("not enough tokens available for skip operation")
        while (len-- > 0)
            this.token()
        return this
    }

    /*  consume the current token (by expecting it to be a particular symbol)  */
    consume (type, value) {
        for (let i = 0; i < this._pending.length + 1; i++)
             this._tokenize()
        if (this._pending.length === 0)
            throw new Error("not enough tokens available for consume operation")
        let token = this.token()
        this._log(`CONSUME: ${token.toString()}`)
        if (arguments.length === 2) {
            if (!token.isA(type, value))
                throw new ParsingError(`expected: <type: ${type}, value: ${JSON.stringify(value)} (${typeof value})>, ` +
                    `found: <type: ${token.type}, value: ${JSON.stringify(token.value)} (${typeof token.value})>`,
                    token.pos, token.line, token.column, this._input)
        }
        else {
            if (!token.isA(type))
                throw new ParsingError(`expected: <type: ${type}, value: * (any)>, ` +
                    `found: <type: ${token.type}, value: ${JSON.stringify(token.value)} (${typeof token.value})>`,
                    token.pos, token.line, token.column, this._input)
        }
        return token
    }

    /*  open tokenization transaction  */
    begin () {
        this._log(`BEGIN: level ${this._transaction.length}`)
        this._transaction.unshift([])
        return this
    }

    /*  determine depth of still open tokenization transaction  */
    depth () {
        if (this._transaction.length === 0)
            throw new Error("cannot determine depth -- no active transaction")
        return this._transaction[0].length
    }

    /*  close (successfully) tokenization transaction  */
    commit () {
        if (this._transaction.length === 0)
            throw new Error("cannot commit transaction -- no active transaction")
        this._transaction.shift()
        this._log(`COMMIT: level ${this._transaction.length}`)
        return this
    }

    /*  close (unsuccessfully) tokenization transaction  */
    rollback () {
        if (this._transaction.length === 0)
            throw new Error("cannot rollback transaction -- no active transaction")
        this._pending = this._transaction[0].concat(this._pending)
        this._transaction.shift()
        this._log(`ROLLBACK: level ${this._transaction.length}`)
        return this
    }

    /*  execute multiple alternative callbacks  */
    alternatives (...alternatives) {
        let result = null
        let depths = []
        for (let i = 0; i < alternatives.length; i++) {
            try {
                this.begin()
                result = alternatives[i]()
                this.commit()
                break
            } catch (ex) {
                this._log(`EXCEPTION: ${ex.toString()}`)
                depths.push({ ex: ex, depth: this.depth() })
                this.rollback()
                continue
            }
        }
        if (result === null && depths.length > 0) {
            depths = depths.sort((a, b) => a.depth - b.depth)
            throw depths[0].ex
        }
        return result
    }

    /*  create an error message for the current position  */
    error (message) {
        return new ParsingError(message, this._pos, this._line, this._column, this._input)
    }
}

/*  expose the utility classes, too  */
Tokenizr.Token         = Token
Tokenizr.ParsingError  = ParsingError
Tokenizr.ActionContext = ActionContext

/*  export the API class  */
export default Tokenizr

