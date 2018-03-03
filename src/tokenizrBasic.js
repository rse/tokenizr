import excerpt from "./tokenizr-1-excerpt";
import Token from "./tokenizr-2-token";
import ParsingError from "./tokenizr-3-error";
import ActionContext from "./tokenizr-4-context";

export default class BasicTokenizr {
  constructor() {
    this._before = null;
    this._after = null;
    this._finish = null;
    this._rules = [];
    this._debug = false;
    this.reset();
  }

  /*  configure a tokenization rule  */
  rule(state, pattern, action, name = "unknown") {
    /*  support optional states  */
    if (arguments.length === 2 && typeof pattern === "function") {
      [pattern, action] = [state, pattern];
      state = "*";
    } else if (arguments.length === 3 && typeof pattern === "function") {
      [pattern, action, name] = [state, pattern, action];
      state = "*";
    }

    /*  sanity check arguments  */
    if (typeof state !== "string") throw new Error('parameter "state" not a String');
    if (!(typeof pattern === "object" && pattern instanceof RegExp)) throw new Error('parameter "pattern" not a RegExp');
    if (typeof action !== "function") throw new Error('parameter "action" not a Function');
    if (typeof name !== "string") throw new Error('parameter "name" not a String');

    /*  post-process state  */
    state = state.split(/\s*,\s*/g).map(entry => {
      let items = entry.split(/\s+/g);
      let states = items.filter(item => item.match(/^#/) === null);
      let tags = items.filter(item => item.match(/^#/) !== null).map(tag => tag.replace(/^#/, ""));
      if (states.length !== 1) throw new Error("exactly one state required");
      return { state: states[0], tags: tags };
    });

    /*  post-process pattern  */
    var flags = "g";
    if (pattern.multiline) flags += "m";
    if (pattern.ignoreCase) flags += "i";
    pattern = new RegExp(pattern.source, flags);

    /*  store rule  */
    this._log(`rule: configure rule (state: ${state}, pattern: ${pattern.source})`);
    this._rules.push({ state, pattern, action, name });

    return this;
  }

  /*  output a debug message  */
  _log(msg) {
    if (this._debug) console.log(`tokenizr: ${msg}`);
  }

  input(input) {
    /*  sanity check arguments  */
    if (typeof input !== "string") throw new Error('parameter "input" not a String');

    /*  reset state and store new input  */
    this.reset();
    this._input = input;
    this._len = input.length;
    return this;
  }

  /*  reset the internal state  */
  reset() {
    this._input = "";
    this._len = 0;
    this._eof = false;
    this._pos = 0;
    this._line = 1;
    this._column = 1;
    this._state = ["default"];
    this._tag = {};
    this._transaction = [];
    this._pending = [];
    this._stopped = false;
    this._ctx = new ActionContext(this);
    return this;
  }

  /*  determine and return all tokens  */
  tokens() {
    let result = [];
    let token;
    while ((token = this.token()) !== null) result.push(token);
    return result;
  }

  /*  determine and return next token  */
  token() {
    /*  if no more tokens are pending, try to determine a new one  */
    if (this._pending.length === 0) this._tokenize();

    /*  return now potentially pending token  */
    if (this._pending.length > 0) {
      let token = this._pending.shift();
      if (this._transaction.length > 0) this._transaction[0].push(token);
      this._log(`TOKEN: ${token.toString()}`);
      return token;
    }

    /*  no more tokens  */
    return null;
  }

  /*  determine and return the next token  */
  _tokenize() {
    /*  helper function for finishing parsing  */
    const finish = () => {
      if (!this._eof) {
        if (this._finish !== null) this._finish.call(this._ctx, this._ctx);
        this._eof = true;
        this._pending.push(new Token("EOF", "", "", this._pos, this._line, this._column));
      }
    };

    /*  tokenize only as long as we were not stopped and there is input left  */
    if (this._stopped || this._pos >= this._len) {
      finish();
      return;
    }

    /*  loop...  */
    let continued = true;
    while (continued) {
      continued = false;

      /*  some optional debugging context  */
      if (this._debug) {
        let e = excerpt(this._input, this._pos);
        let tags = Object.keys(this._tag)
          .map(tag => `#${tag}`)
          .join(" ");
        this._log(
          `INPUT: state: <${this._state[this._state.length - 1]}>, tags: <${tags}>, text: ` +
            (e.prologTrunc ? "..." : '"') +
            `${e.prologText}<${e.tokenText}>${e.epilogText}` +
            (e.epilogTrunc ? "..." : '"') +
            `, at: <line ${this._line}, column ${this._column}>`
        );
      }

      /*  iterate over all rules...  */
      for (let i = 0; i < this._rules.length; i++) {
        if (this._debug) {
          let state = this._rules[i].state
            .map(item => {
              let output = item.state;
              if (item.tags.length > 0) output += " " + item.tags.map(tag => `#${tag}`).join(" ");
              return output;
            })
            .join(", ");
          this._log(`  RULE: state(s): <${state}>, ` + `pattern: ${this._rules[i].pattern.source}`);
        }

        /*  one of rule's states (and all of its tags) has to match  */
        let matches = false;
        let states = this._rules[i].state.map(item => item.state);
        let idx = states.indexOf("*");
        if (idx < 0) idx = states.indexOf(this._state[this._state.length - 1]);
        if (idx >= 0) {
          matches = true;
          let tags = this._rules[i].state[idx].tags;
          tags = tags.filter(tag => !this._tag[tag]);
          if (tags.length > 0) matches = false;
        }
        if (!matches) continue;

        /*  match pattern at the last position  */
        this._rules[i].pattern.lastIndex = this._pos;
        let found = this._rules[i].pattern.exec(this._input);
        this._rules[i].pattern.lastIndex = this._pos;
        if ((found = this._rules[i].pattern.exec(this._input)) !== null && found.index === this._pos) {
          if (this._debug) this._log("    MATCHED: " + JSON.stringify(found));

          /*  pattern found, so give action a chance to operate
                            on it and act according to its results  */
          this._ctx._match = found;
          this._ctx._repeat = false;
          this._ctx._reject = false;
          this._ctx._ignore = false;
          if (this._before !== null) this._before.call(this._ctx, this._ctx, found, this._rules[i]);
          this._rules[i].action.call(this._ctx, this._ctx, found);
          if (this._after !== null) this._after.call(this._ctx, this._ctx, found, this._rules[i]);
          if (this._ctx._reject)
            /*  reject current action, continue matching  */
            continue;
          else if (this._ctx._repeat) {
            /*  repeat matching from scratch  */
            continued = true;
            break;
          } else if (this._ctx._ignore) {
            /*  ignore token  */
            this._progress(this._pos, this._rules[i].pattern.lastIndex);
            this._pos = this._rules[i].pattern.lastIndex;
            if (this._pos >= this._len) {
              finish();
              return;
            }
            continued = true;
            break;
          } else if (this._pending.length > 0) {
            /*  accept token(s)  */
            this._progress(this._pos, this._rules[i].pattern.lastIndex);
            this._pos = this._rules[i].pattern.lastIndex;
            if (this._pos >= this._len) finish();
            return;
          } else throw new Error('action of pattern "' + this._rules[i].pattern.source + '" neither rejected nor accepted any token(s)');
        }
      }
    }

    /*  no pattern matched at all  */
    throw this.error("token not recognized");
  }

  /*  progress the line/column counter  */
  _progress(from, until) {
    let line = this._line;
    let column = this._column;
    let s = this._input;
    for (let i = from; i < until; i++) {
      let c = s.charAt(i);
      if (c === "\r") this._column = 1;
      else if (c === "\n") {
        this._line++;
        this._column = 1;
      } else if (c === "\t") this._column += 8 - this._column % 8;
      else this._column++;
    }
    this._log(
      `    PROGRESS: characters: ${until - from}, ` + `from: <line ${line}, column ${column}>, ` + `to: <line ${this._line}, column ${this._column}>`
    );
  }

  /*  create an error message for the current position  */
  error(message) {
    return new ParsingError(message, this._pos, this._line, this._column, this._input);
  }
}
