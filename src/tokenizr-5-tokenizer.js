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

import excerpt from "./tokenizr-1-excerpt";
import Token from "./tokenizr-2-token";
import ParsingError from "./tokenizr-3-error";
import ActionContext from "./tokenizr-4-context";

import BasicTokenizr from "./tokenizrBasic";

/*  external API class  */
export default class Tokenizr extends BasicTokenizr {
  /*  construct and initialize the object  */
  constructor() {
    super();
  }

  /*  configure debug operation  */
  debug(debug) {
    this._debug = debug;
    return this;
  }

  /*  provide (new) input string to tokenize  */

  /*  push state  */
  push(state) {
    /*  sanity check arguments  */
    if (arguments.length !== 1) throw new Error("invalid number of arguments");
    if (typeof state !== "string") throw new Error('parameter "state" not a String');

    /*  push new state  */
    this._log(`    STATE (PUSH): ` + `old: <${this._state[this._state.length - 1]}>, ` + `new: <${state}>`);
    this._state.push(state);
    return this;
  }

  /*  pop state  */
  pop() {
    /*  sanity check arguments  */
    if (arguments.length !== 0) throw new Error("invalid number of arguments");
    if (this._state.length < 2) throw new Error("no more custom states to pop");

    /*  pop old state  */
    this._log(`    STATE (POP): ` + `old: <${this._state[this._state.length - 1]}>, ` + `new: <${this._state[this._state.length - 2]}>`);
    return this._state.pop();
  }

  /*  get/set state  */
  state(state) {
    if (arguments.length === 1) {
      /*  sanity check arguments  */
      if (typeof state !== "string") throw new Error('parameter "state" not a String');

      /*  change current state  */
      this._log(`    STATE (SET): ` + `old: <${this._state[this._state.length - 1]}>, ` + `new: <${state}>`);
      this._state[this._state.length - 1] = state;
      return this;
    } else if (arguments.length === 0) return this._state[this._state.length - 1];
    else throw new Error("invalid number of arguments");
  }

  /*  set a tag  */
  tag(tag) {
    /*  sanity check arguments  */
    if (arguments.length !== 1) throw new Error("invalid number of arguments");
    if (typeof tag !== "string") throw new Error('parameter "tag" not a String');

    /*  set tag  */
    this._log(`    TAG (ADD): ${tag}`);
    this._tag[tag] = true;
    return this;
  }

  /*  check whether tag is set  */
  tagged(tag) {
    /*  sanity check arguments  */
    if (arguments.length !== 1) throw new Error("invalid number of arguments");
    if (typeof tag !== "string") throw new Error('parameter "tag" not a String');

    /*  set tag  */
    return this._tag[tag] === true;
  }

  /*  unset a tag  */
  untag(tag) {
    /*  sanity check arguments  */
    if (arguments.length !== 1) throw new Error("invalid number of arguments");
    if (typeof tag !== "string") throw new Error('parameter "tag" not a String');

    /*  delete tag  */
    this._log(`    TAG (DEL): ${tag}`);
    delete this._tag[tag];
    return this;
  }

  /*  configure a tokenization before-rule callback  */
  before(action) {
    this._before = action;
    return this;
  }

  /*  configure a tokenization after-rule callback  */
  after(action) {
    this._after = action;
    return this;
  }

  /*  configure a tokenization finish callback  */
  finish(action) {
    this._finish = action;
    return this;
  }

  /*  peek at the next token or token at particular offset  */
  peek(offset) {
    if (typeof offset === "undefined") offset = 0;
    for (let i = 0; i < this._pending.length + offset; i++) this._tokenize();
    if (offset >= this._pending.length) throw new Error("not enough tokens available for peek operation");
    this._log(`PEEK: ${this._pending[offset].toString()}`);
    return this._pending[offset];
  }

  /*  skip one or more tokens  */
  skip(len) {
    if (typeof len === "undefined") len = 1;
    for (let i = 0; i < this._pending.length + len; i++) this._tokenize();
    if (len > this._pending.length) throw new Error("not enough tokens available for skip operation");
    while (len-- > 0) this.token();
    return this;
  }

  /*  consume the current token (by expecting it to be a particular symbol)  */
  consume(type, value) {
    for (let i = 0; i < this._pending.length + 1; i++) this._tokenize();
    if (this._pending.length === 0) throw new Error("not enough tokens available for consume operation");
    let token = this.token();
    this._log(`CONSUME: ${token.toString()}`);
    if (arguments.length === 2) {
      if (!token.isA(type, value))
        throw new ParsingError(
          `expected: <type: ${type}, value: ${JSON.stringify(value)} (${typeof value})>, ` +
            `found: <type: ${token.type}, value: ${JSON.stringify(token.value)} (${typeof token.value})>`,
          token.pos,
          token.line,
          token.column,
          this._input
        );
    } else {
      if (!token.isA(type))
        throw new ParsingError(
          `expected: <type: ${type}, value: * (any)>, ` +
            `found: <type: ${token.type}, value: ${JSON.stringify(token.value)} (${typeof token.value})>`,
          token.pos,
          token.line,
          token.column,
          this._input
        );
    }
    return token;
  }

  /*  open tokenization transaction  */
  begin() {
    this._log(`BEGIN: level ${this._transaction.length}`);
    this._transaction.unshift([]);
    return this;
  }

  /*  determine depth of still open tokenization transaction  */
  depth() {
    if (this._transaction.length === 0) throw new Error("cannot determine depth -- no active transaction");
    return this._transaction[0].length;
  }

  /*  close (successfully) tokenization transaction  */
  commit() {
    if (this._transaction.length === 0) throw new Error("cannot commit transaction -- no active transaction");
    this._transaction.shift();
    this._log(`COMMIT: level ${this._transaction.length}`);
    return this;
  }

  /*  close (unsuccessfully) tokenization transaction  */
  rollback() {
    if (this._transaction.length === 0) throw new Error("cannot rollback transaction -- no active transaction");
    this._pending = this._transaction[0].concat(this._pending);
    this._transaction.shift();
    this._log(`ROLLBACK: level ${this._transaction.length}`);
    return this;
  }

  /*  execute multiple alternative callbacks  */
  alternatives(...alternatives) {
    let result = null;
    let depths = [];
    for (let i = 0; i < alternatives.length; i++) {
      try {
        this.begin();
        result = alternatives[i].call(this);
        this.commit();
        break;
      } catch (ex) {
        this._log(`EXCEPTION: ${ex.toString()}`);
        depths.push({ ex: ex, depth: this.depth() });
        this.rollback();
        continue;
      }
    }
    if (result === null && depths.length > 0) {
      depths = depths.sort((a, b) => a.depth - b.depth);
      throw depths[0].ex;
    }
    return result;
  }
}

/*  expose the utility classes, too  */
Tokenizr.Token = Token;
Tokenizr.ParsingError = ParsingError;
Tokenizr.ActionContext = ActionContext;
