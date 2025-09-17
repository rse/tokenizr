/*
**  Tokenizr -- String Tokenization Library
**  Copyright (c) 2015-2025 Dr. Ralf S. Engelschall <rse@engelschall.com>
**  Licensed under MIT license <https://spdx.org/licenses/MIT>
*/

/*  utility function: create a source excerpt  */
interface ExcerptResult {
    prologTrunc: boolean
    prologText:  string
    tokenText:   string
    epilogText:  string
    epilogTrunc: boolean
}
const hex = (ch: string) =>
    ch.charCodeAt(0).toString(16).toUpperCase()
const excerpt = (txt: string, o: number): ExcerptResult => {
    const l = txt.length
    let b = o - 20; if (b < 0) b = 0
    let e = o + 20; if (e > l) e = l
    const extract = (txt: string, pos: number, len: number) =>
        txt.substring(pos, pos + len)
            .replaceAll(/\\/g,   "\\\\")
            .replaceAll(/\x08/g, "\\b")
            .replaceAll(/\t/g,   "\\t")
            .replaceAll(/\n/g,   "\\n")
            .replaceAll(/\f/g,   "\\f")
            .replaceAll(/\r/g,   "\\r")
            .replaceAll(/[\x00-\x07\x0B\x0E\x0F]/g, (ch) => "\\x0" + hex(ch))
            .replaceAll(/[\x10-\x1F\x80-\xFF]/g,    (ch) => "\\x"  + hex(ch))
            .replaceAll(/[\u0100-\u0FFF]/g,         (ch) => "\\u0" + hex(ch))
            .replaceAll(/[\u1000-\uFFFF]/g,         (ch) => "\\u"  + hex(ch))
    return {
        prologTrunc: b > 0,
        prologText:  extract(txt, b, o - b),
        tokenText:   extract(txt, o, 1),
        epilogText:  extract(txt, o + 1, e - (o + 1)),
        epilogTrunc: e < l
    }
}

/*  helper class for token representation  */
class Token {
    public type:   string
    public value:  unknown
    public text:   string
    public pos:    number
    public line:   number
    public column: number

    /*  construct and initialize object  */
    constructor (type: string, value: unknown, text: string, pos = 0, line = 0, column = 0) {
        this.type   = type
        this.value  = value
        this.text   = text
        this.pos    = pos
        this.line   = line
        this.column = column
    }

    /*  render a useful string representation  */
    toString (colorize = (type: string, text: string) => text) {
        return `${colorize("type", this.type)} ` +
            `(value: ${colorize("value", JSON.stringify(this.value))}, ` +
            `text: ${colorize("text", JSON.stringify(this.text))}, ` +
            `pos: ${colorize("pos", this.pos.toString())}, ` +
            `line: ${colorize("line", this.line.toString())}, ` +
            `column: ${colorize("column", this.column.toString())})`
    }

    /*  check whether value is a Token  */
    isA (type: string, value?: unknown) {
        if (type !== this.type)
            return false
        if (value !== undefined && value !== this.value)
            return false
        return true
    }
}

/*  helper class for tokenization error reporting  */
class ParsingError extends Error {
    public name:    string
    public message: string
    public pos:     number
    public line:    number
    public column:  number
    public input:   string

    /*  construct and initialize object  */
    constructor (message: string, pos: number, line: number, column: number, input: string) {
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
        const l = excerpt(this.input, this.pos)
        const prefix1 = `line ${this.line} (column ${this.column}): `
        const prefix2 = " ".repeat(prefix1.length + l.prologText.length)
        const msg = "Parsing Error: " + this.message + "\n" +
            prefix1 + l.prologText + l.tokenText + l.epilogText + "\n" +
            prefix2 + "^"
        return msg
    }
}

/*  helper class for action context  */
export interface TokenInfo {
    line:        number
    column:      number
    pos:         number
    len:         number
}
class ActionContext {
    private _tokenizr: Tokenizr
    private _data:     { [ key: string ]: unknown }
    public  _repeat:   boolean
    public  _reject:   boolean
    public  _ignore:   boolean
    public  _match:    RegExpExecArray | null

    /*  construct and initialize the object  */
    constructor (tokenizr: Tokenizr) {
        this._tokenizr = tokenizr
        this._data     = {}
        this._repeat   = false
        this._reject   = false
        this._ignore   = false
        this._match    = null
    }

    /*  store and retrieve user data attached to context  */
    data (key: string, value?: unknown) {
        const valueOld = this._data[key]
        if (arguments.length === 2)
            this._data[key] = value
        return valueOld
    }

    /*  retrieve information of current matching  */
    info (): TokenInfo {
        return {
            line:   this._tokenizr._line,
            column: this._tokenizr._column,
            pos:    this._tokenizr._pos,
            len:    this._match?.[0]?.length ?? 0
        } satisfies TokenInfo
    }

    /*  pass-through functions to attached tokenizer  */
    push (state: string) {
        this._tokenizr.push(state)
        return this
    }
    pop () {
        return this._tokenizr.pop()
    }
    state (): string
    state (state: string): this
    state (state?: string): this | string {
        if (state !== undefined) {
            this._tokenizr.state(state!)
            return this
        }
        return this._tokenizr.state()
    }
    tag (tag: string) {
        this._tokenizr.tag(tag)
        return this
    }
    tagged (tag: string) {
        return this._tokenizr.tagged(tag)
    }
    untag (tag: string) {
        this._tokenizr.untag(tag)
        return this
    }

    /*  mark current matching to be repeated from scratch  */
    repeat () {
        this._tokenizr._log("    REPEAT")
        this._repeat = true
        return this
    }

    /*  mark current matching to be rejected  */
    reject () {
        this._tokenizr._log("    REJECT")
        this._reject = true
        return this
    }

    /*  mark current matching to be ignored  */
    ignore () {
        this._tokenizr._log("    IGNORE")
        this._ignore = true
        return this
    }

    /*  accept current matching as a new token  */
    accept (type: string, value?: unknown) {
        value = value ?? this._match?.[0]
        this._tokenizr._log(`    ACCEPT: type: ${type}, value: ` +
            `${JSON.stringify(value)} (${typeof value}), text: "${this._match?.[0] ?? ""}"`)
        this._tokenizr._pending.push(new Token(
            type, value, this._match?.[0] ?? "",
            this._tokenizr._pos, this._tokenizr._line, this._tokenizr._column
        ))
        return this
    }

    /*  immediately stop tokenization  */
    stop (): this {
        this._tokenizr._stopped = true
        return this
    }
}

/*  external API class  */
export interface RuleState {
    state:       string
    tags:        string[]
}
export type RuleAction = (
    this:        ActionContext,
    ctx:         ActionContext,
    found:       RegExpExecArray
) => void
export interface Rule {
    state:       RuleState[]
    pattern:     RegExp
    action:      RuleAction
    name:        string
}
export type BeforeAfterAction = (
    this:        ActionContext,
    ctx:         ActionContext,
    match:       RegExpExecArray,
    rule:        Rule
) => void
export type FinishAction = (
    this:        ActionContext,
    ctx:         ActionContext
) => void
export default class Tokenizr {
    private _before:      BeforeAfterAction | null
    private _after:       BeforeAfterAction | null
    private _finish:      FinishAction | null
    private _rules:       Rule[]
    private _debug:       boolean
    private _input:       string
    private _len:         number
    private _eof:         boolean
    public  _pos:         number
    public  _line:        number
    public  _column:      number
    private _state:       string[]
    private _tag:         { [key: string]: boolean }
    private _transaction: Token[][]
    public  _pending:     Token[]
    public  _stopped:     boolean
    private _ctx:         ActionContext

    /*  construct and initialize the object  */
    constructor () {
        this._before      = null
        this._after       = null
        this._finish      = null
        this._rules       = []
        this._debug       = false

        /*  inlined reset  */
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
        this._stopped     = false
        this._ctx         = new ActionContext(this)
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
        this._stopped     = false
        this._ctx         = new ActionContext(this)
        return this
    }

    /*  create an error message for the current position  */
    error (message: string) {
        return new ParsingError(message, this._pos, this._line, this._column, this._input)
    }

    /*  configure debug operation  */
    debug (debug: boolean) {
        this._debug = debug
        return this
    }

    /*  output a debug message  */
    _log (msg: string) {
        /* eslint no-console: off */
        /* oxlint-disable no-console */
        if (this._debug)
            console.log(`tokenizr: ${msg}`)
    }

    /*  provide (new) input string to tokenize  */
    input (input: string) {
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
    push (state: string) {
        /*  sanity check arguments  */
        if (arguments.length !== 1)
            throw new Error("invalid number of arguments")
        if (typeof state !== "string")
            throw new Error("parameter \"state\" not a String")

        /*  push new state  */
        this._log("    STATE (PUSH): " +
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
        this._log("    STATE (POP): " +
            `old: <${this._state[this._state.length - 1]}>, ` +
            `new: <${this._state[this._state.length - 2]}>`)
        return this._state.pop()!
    }

    /*  get/set state  */
    state (): string
    state (state: string): this
    state (state?: string): this | string {
        if (arguments.length === 1) {
            /*  sanity check arguments  */
            if (typeof state !== "string")
                throw new Error("parameter \"state\" not a String")

            /*  change current state  */
            this._log("    STATE (SET): " +
                `old: <${this._state[this._state.length - 1]}>, ` +
                `new: <${state}>`)
            this._state[this._state.length - 1] = state
            return this
        }
        else if (arguments.length === 0)
            return this._state[this._state.length - 1]
        throw new Error("invalid number of arguments")
    }

    /*  set a tag  */
    tag (tag: string) {
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
    tagged (tag: string) {
        /*  sanity check arguments  */
        if (arguments.length !== 1)
            throw new Error("invalid number of arguments")
        if (typeof tag !== "string")
            throw new Error("parameter \"tag\" not a String")

        /*  set tag  */
        return (this._tag[tag] === true)
    }

    /*  unset a tag  */
    untag (tag: string) {
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

    /*  configure a tokenization before-rule callback  */
    before (action: BeforeAfterAction) {
        this._before = action
        return this
    }

    /*  configure a tokenization after-rule callback  */
    after (action: BeforeAfterAction) {
        this._after = action
        return this
    }

    /*  configure a tokenization finish callback  */
    finish (action: FinishAction) {
        this._finish = action
        return this
    }

    /*  configure a tokenization rule  */
    rule (state: string, pattern: RegExp, action: RuleAction, name?: string): this
    rule (pattern: RegExp, action: RuleAction, name?: string): this
    rule (state: string | RegExp, pattern?: RegExp | RuleAction, action?: RuleAction | string, name = "unknown"): this {
        /*  support optional states  */
        if (arguments.length === 2 && typeof pattern === "function") {
            [ pattern, action ] = [ state as RegExp, pattern as RuleAction ]
            state = "*"
        }
        else if (arguments.length === 3 && typeof pattern === "function") {
            [ pattern, action, name ] = [ state as RegExp, pattern as RuleAction, action as string ]
            state = "*"
        }

        /*  sanity check arguments  */
        if (typeof state !== "string")
            throw new Error("parameter \"state\" not a String")
        if (!(typeof pattern === "object" && pattern instanceof RegExp))
            throw new Error("parameter \"pattern\" not a RegExp")
        if (typeof action !== "function")
            throw new Error("parameter \"action\" not a Function")
        if (typeof name !== "string")
            throw new Error("parameter \"name\" not a String")

        /*  post-process state  */
        const parsedState = state.split(/\s*,\s*/g).map((entry: string) => {
            const items  = entry.split(/\s+/g)
            const states = items.filter((item: string) => item.match(/^#/) === null)
            const tags   = items.filter((item: string) => item.match(/^#/) !== null)
                .map((tag: string) => tag.replace(/^#/, ""))
            if (states.length !== 1)
                throw new Error("exactly one state required")
            return { state: states[0], tags }
        })

        /*  post-process pattern  */
        let flags = "g"     /* ECMAScript <= 5 */
        try {
            const regexp = new RegExp("", "y")
            if (typeof regexp.sticky === "boolean")
                flags = "y" /* ECMAScript >= 2015 */
        }
        catch (ex) {
            /*  no-op  */
        }
        if (typeof pattern.multiline  === "boolean" && pattern.multiline)  flags += "m"
        if (typeof pattern.dotAll     === "boolean" && pattern.dotAll)     flags += "s"
        if (typeof pattern.ignoreCase === "boolean" && pattern.ignoreCase) flags += "i"
        if (typeof pattern.unicode    === "boolean" && pattern.unicode)    flags += "u"
        const processedPattern = new RegExp(pattern.source, flags)

        /*  store rule  */
        this._log(`rule: configure rule (state: ${state}, pattern: ${processedPattern.source})`)
        this._rules.push({ state: parsedState, pattern: processedPattern, action, name })

        return this
    }

    /*  progress the line/column counter  */
    _progress (from: number, until: number) {
        const line   = this._line
        const column = this._column
        const s = this._input
        for (let i = from; i < until; i++) {
            const c = s.charAt(i)
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

    /*  determine and provide the next token  */
    _tokenize () {
        /*  helper function for finishing parsing  */
        const finish = () => {
            if (!this._eof) {
                if (this._finish !== null)
                    this._finish.call(this._ctx, this._ctx)
                this._eof = true
                this._pending.push(new Token("EOF", "", "", this._pos, this._line, this._column))
            }
        }

        /*  tokenize only as long as we were not stopped and there is input left  */
        if (this._stopped || this._pos >= this._len) {
            finish()
            return
        }

        /*  loop...  */
        let continued = true
        while (continued) {
            continued = false

            /*  some optional debugging context  */
            if (this._debug) {
                const e = excerpt(this._input, this._pos)
                const tags = Object.keys(this._tag).map((tag: string) => `#${tag}`).join(" ")
                this._log(`INPUT: state: <${this._state[this._state.length - 1]}>, tags: <${tags}>, text: ` +
                    (e.prologTrunc ? "..." : "\"") + `${e.prologText}<${e.tokenText}>${e.epilogText}` +
                    (e.epilogTrunc ? "..." : "\"") + `, at: <line ${this._line}, column ${this._column}>`)
            }

            /*  iterate over all rules...  */
            for (let i = 0; i < this._rules.length; i++) {
                if (this._debug) {
                    const state = this._rules[i].state.map((item: RuleState) => {
                        let output = item.state
                        if (item.tags.length > 0)
                            output += " " + item.tags.map((tag: string) => `#${tag}`).join(" ")
                        return output
                    }).join(", ")
                    this._log(`  RULE: state(s): <${state}>, ` +
                        `pattern: ${this._rules[i].pattern.source}`)
                }

                /*  one of rule's states (and all of its tags) has to match  */
                let matches = false
                const states = this._rules[i].state.map((item: RuleState) => item.state)
                let idx = states.indexOf("*")
                if (idx < 0)
                    idx = states.indexOf(this._state[this._state.length - 1])
                if (idx >= 0) {
                    const requiredTags = this._rules[i].state[idx].tags
                    matches = requiredTags.every((tag: string) => this._tag[tag])
                }
                if (!matches)
                    continue

                /*  match pattern at the last position  */
                this._rules[i].pattern.lastIndex = this._pos
                const found = this._rules[i].pattern.exec(this._input)
                if (found !== null && found.index === this._pos) {
                    if (this._debug)
                        this._log("    MATCHED: " + JSON.stringify(found))

                    /*  pattern found, so give action a chance to operate
                        on it and act according to its results  */
                    this._ctx._match = found
                    this._ctx._repeat = false
                    this._ctx._reject = false
                    this._ctx._ignore = false
                    if (this._before !== null)
                        this._before.call(this._ctx, this._ctx, found, this._rules[i])
                    this._rules[i].action.call(this._ctx, this._ctx, found)
                    if (this._after !== null)
                        this._after.call(this._ctx, this._ctx, found, this._rules[i])
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
                        if (this._pos >= this._len) {
                            finish()
                            return
                        }
                        continued = true
                        break
                    }
                    else if (this._pending.length > 0) {
                        /*  accept token(s)  */
                        this._progress(this._pos, this._rules[i].pattern.lastIndex)
                        this._pos = this._rules[i].pattern.lastIndex
                        if (this._pos >= this._len)
                            finish()
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
    token (): Token | null {
        /*  if no more tokens are pending, try to determine a new one  */
        if (this._pending.length === 0)
            this._tokenize()

        /*  return now potentially pending token  */
        if (this._pending.length > 0) {
            const token = this._pending.shift()!
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
        const result: Token[] = []
        let token: Token | null
        while ((token = this.token()) !== null)
            result.push(token)
        return result
    }

    /*  peek at the next token or token at particular offset  */
    peek (offset?: number) {
        if (offset === undefined)
            offset = 0
        if (typeof offset !== "number" || offset < 0)
            throw new Error("parameter \"offset\" not a positive Number")

        /*  if no more tokens are pending, try to determine new ones  */
        while (offset >= this._pending.length) {
            this._tokenize()
            if (this._pending.length === 0)
                break
        }
        if (offset >= this._pending.length)
            throw new Error("not enough tokens available for peek operation")
        this._log(`PEEK: ${this._pending[offset].toString()}`)
        return this._pending[offset]
    }

    /*  skip one or more tokens  */
    skip (len?: number) {
        if (len === undefined)
            len = 1
        for (let i = 0; i < len; i++)
            this._tokenize()
        if (len > this._pending.length)
            throw new Error("not enough tokens available for skip operation")
        while (len-- > 0)
            this.token()
        return this
    }

    /*  consume the current token (by expecting it to be a particular symbol)  */
    consume (type: string, value?: unknown) {
        for (let i = 0; i < this._pending.length + 1; i++)
            this._tokenize()
        if (this._pending.length === 0)
            throw new Error("not enough tokens available for consume operation")
        const token = this.token()!
        this._log(`CONSUME: ${token.toString()}`)
        const raiseError = () => {
            throw new ParsingError(
                `expected: <type: ${type}, value: ${JSON.stringify(value)} (${typeof value})>, ` +
                `found: <type: ${token.type}, value: ${JSON.stringify(token.value)} (${typeof token.value})>`,
                token.pos, token.line, token.column, this._input
            )
        }
        if (arguments.length === 2 && !token.isA(type, value))
            raiseError()
        else if (!token.isA(type))
            raiseError()
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

        /*  remove current transaction  */
        const committed = this._transaction.shift()!

        /*  in case we were a nested transaction, still remember the tokens  */
        if (this._transaction.length > 0)
            this._transaction[0] = this._transaction[0].concat(committed)

        this._log(`COMMIT: level ${this._transaction.length}`)
        return this
    }

    /*  close (unsuccessfully) tokenization transaction  */
    rollback () {
        if (this._transaction.length === 0)
            throw new Error("cannot rollback transaction -- no active transaction")

        /*  remove current transaction  */
        const rolledback = this._transaction.shift()!

        /*  make the tokens available again, as new pending tokens  */
        this._pending = rolledback.concat(this._pending)

        this._log(`ROLLBACK: level ${this._transaction.length}`)
        return this
    }

    /*  execute multiple alternative callbacks  */
    alternatives (...alternatives: ((this: Tokenizr) => unknown)[]) {
        let result: unknown = null
        let depths: { ex: Error, depth: number }[] = []
        for (let i = 0; i < alternatives.length; i++) {
            try {
                this.begin()
                result = alternatives[i].call(this)
                this.commit()
                break
            }
            catch (ex) {
                if (ex instanceof Error) {
                    this._log(`EXCEPTION: ${ex.message}`)
                    depths.push({ ex, depth: this.depth() })
                }
                else {
                    this._log("EXCEPTION: alternative failed")
                    depths.push({ ex: new Error("alternative failed"), depth: this.depth() })
                }
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

    /*  expose the utility classes, too  */
    static readonly Token         = Token
    static readonly ParsingError  = ParsingError
    static readonly ActionContext = ActionContext
}
