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

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Tokenizr = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
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

/*  internal helper class for token representation  */
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x7, _x8, _x9) { var _again = true; _function: while (_again) { var object = _x7, property = _x8, receiver = _x9; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x7 = parent; _x8 = property; _x9 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Token = function Token(type, value, text) {
    var pos = arguments[3] === undefined ? 0 : arguments[3];
    var line = arguments[4] === undefined ? 0 : arguments[4];
    var column = arguments[5] === undefined ? 0 : arguments[5];

    _classCallCheck(this, Token);

    this.type = type;
    this.value = value;
    this.text = text;
    this.pos = pos;
    this.line = line;
    this.column = column;
};

/*  utility function: create a source excerpt  */
var excerpt = function excerpt(txt, o) {
    var l = txt.length;
    var b = o - 20;if (b < 0) b = 0;
    var e = o + 20;if (e > l) e = l;
    var hex = function hex(ch) {
        return ch.charCodeAt(0).toString(16).toUpperCase();
    };
    var extract = function extract(txt, pos, len) {
        return txt.substr(pos, len).replace(/\\/g, "\\\\").replace(/\x08/g, "\\b").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\f/g, "\\f").replace(/\r/g, "\\r").replace(/[\x00-\x07\x0B\x0E\x0F]/g, function (ch) {
            return "\\x0" + hex(ch);
        }).replace(/[\x10-\x1F\x80-\xFF]/g, function (ch) {
            return "\\x" + hex(ch);
        }).replace(/[\u0100-\u0FFF]/g, function (ch) {
            return "\\u0" + hex(ch);
        }).replace(/[\u1000-\uFFFF]/g, function (ch) {
            return "\\u" + hex(ch);
        });
    };
    return {
        prologTrunc: b > 0,
        prologText: extract(txt, b, o - b),
        tokenText: extract(txt, o, 1),
        epilogText: extract(txt, o + 1, e - (o + 1)),
        epilogTrunc: e < l
    };
};

/*  internal helper class for tokenization error reporting  */

var TokenizationError = (function (_Error) {
    /*  construct and initialize object  */

    function TokenizationError() {
        var message = arguments[0] === undefined ? "Tokenization Error" : arguments[0];
        var tokenizr = arguments[1] === undefined ? null : arguments[1];

        _classCallCheck(this, TokenizationError);

        _get(Object.getPrototypeOf(TokenizationError.prototype), "constructor", this).call(this, message);
        this.name = "TokenizationError";
        this.message = message;
        this.tokenizr = tokenizr;
    }

    _inherits(TokenizationError, _Error);

    _createClass(TokenizationError, [{
        key: "toString",

        /*  render a useful string representation  */
        value: function toString(noFinalNewLine) {
            var l = excerpt(this.tokenizr._input, this.tokenizr._pos);
            var prefix1 = "line " + this.tokenizr._line + " (column " + this.tokenizr._column + "): ";
            var prefix2 = "";
            for (var i = 0; i < prefix1.length + l.prologText.length; i++) {
                prefix2 += " ";
            }var msg = "Tokenization Error: " + this.message + "\n" + prefix1 + l.prologText + l.tokenText + l.epilogText + "\n" + prefix2 + "^" + (noFinalNewLine ? "" : "\n");
            return msg;
        }
    }]);

    return TokenizationError;
})(Error);

/*  internal helper class for action context  */

var ActionContext = (function () {
    /*  construct and initialize the object  */

    function ActionContext(tokenizr) {
        _classCallCheck(this, ActionContext);

        this._tokenizr = tokenizr;
        this._data = {};
        this._repeat = false;
        this._reject = false;
        this._ignore = false;
        this._match = null;
    }

    _createClass(ActionContext, [{
        key: "data",

        /*  store and retrieve user data attached to context  */
        value: function data(key, value) {
            var valueOld = this._data[key];
            if (arguments.length === 2) this._data[key] = value;
            return valueOld;
        }
    }, {
        key: "state",

        /*  set a new state in the attached tokenizer  */
        value: function state(_state) {
            if (typeof _state === "string") {
                this._tokenizr._log("    STATE (PUSH): " + ("old: " + this._tokenizr._state[this._tokenizr._state.length - 1] + ", ") + ("new: " + _state));
                this._tokenizr._state.push(_state);
            } else if (this._tokenizr._state.length >= 2) {
                this._tokenizr._log("    STATE (POP): " + ("old: " + this._tokenizr._state[this._tokenizr._state.length - 1] + ", ") + ("new: " + this._tokenizr._state[this._tokenizr._state.length - 2]));
                this._tokenizr._state.pop(_state);
            } else throw new Error("internal error: no more states to pop");
            return this;
        }
    }, {
        key: "repeat",

        /*  mark current matching to be repeated from scratch  */
        value: function repeat() {
            this._tokenizr._log("    REPEAT");
            this._repeat = true;
            return this;
        }
    }, {
        key: "reject",

        /*  mark current action to be rejected  */
        value: function reject() {
            this._tokenizr._log("    REJECT");
            this._reject = true;
            return this;
        }
    }, {
        key: "ignore",

        /*  mark current action to be ignored  */
        value: function ignore() {
            this._tokenizr._log("    IGNORE");
            this._ignore = true;
            return this;
        }
    }, {
        key: "accept",

        /*  accept a new token  */
        value: function accept(type) {
            var value = arguments[1] === undefined ? this._match[0] : arguments[1];

            this._tokenizr._log("    ACCEPT: type: " + type + ", value: " + JSON.stringify(value) + " (" + typeof value + "), text: \"" + this._match[0] + "\"");
            this._tokenizr._tokens.push(new Token(type, value, this._match[0], this._tokenizr._pos, this._tokenizr._line, this._tokenizr._column));
            return this;
        }
    }]);

    return ActionContext;
})();

/*  external API class  */

var Tokenizr = (function () {
    /*  construct and initialize the object  */

    function Tokenizr() {
        _classCallCheck(this, Tokenizr);

        this._rules = [];
        this._debug = false;
        this.reset();
    }

    _createClass(Tokenizr, [{
        key: "reset",

        /*  reset the internal state  */
        value: function reset() {
            this._input = "";
            this._len = 0;
            this._pos = 0;
            this._line = 0;
            this._column = 0;
            this._state = ["default"];
            this._tokens = [];
            this._ctx = new ActionContext(this);
            return this;
        }
    }, {
        key: "debug",

        /*  configure debug operation  */
        value: function debug(_debug) {
            this._debug = _debug;
        }
    }, {
        key: "_log",

        /*  output a debug message  */
        value: function _log(msg) {
            if (this._debug) console.log("tokenizr: " + msg);
        }
    }, {
        key: "input",

        /*  provide (new) input string to tokenize  */
        value: function input(_input) {
            /*  sanity check arguments  */
            if (typeof _input !== "string") throw new Error("parameter \"input\" not a String");

            /*  reset state and store new input  */
            this.reset();
            this._input = _input;
            this._len = _input.length;
            return this;
        }
    }, {
        key: "rule",

        /*  configure a tokenization rule  */
        value: function rule(state, pattern, action) {
            /*  support optional states  */
            if (arguments.length === 2) {
                var _ref = [state, pattern];
                pattern = _ref[0];
                action = _ref[1];

                state = "*";
            }

            /*  sanity check arguments  */
            if (typeof state !== "string") throw new Error("parameter \"state\" not a String");
            if (!(typeof pattern === "object" && pattern instanceof RegExp)) throw new Error("parameter \"pattern\" not a RegExp");
            if (typeof action !== "function") throw new Error("parameter \"action\" not a Function");

            /*  post-process state  */
            state = state.split(/\s*,\s*/g);

            /*  post-process pattern  */
            var flags = "g";
            if (pattern.multiline) flags += "m";
            if (pattern.ignoreCase) flags += "i";
            pattern = new RegExp(pattern.source, flags);

            /*  store rule  */
            this._log("rule: configure rule (state: " + state + ", pattern: " + pattern + ")");
            this._rules.push({ state: state, pattern: pattern, action: action });

            return this;
        }
    }, {
        key: "_progress",

        /*  progress the line/column counter  */
        value: function _progress(from, until) {
            var line = this._line;
            var column = this._column;
            var s = this._input;
            for (var i = from; i < until; i++) {
                var c = s.charAt(i);
                if (c === "\r") this._column = 0;else if (c === "\n") {
                    this._line++;
                    this._column = 0;
                } else if (c === "\t") this._column += 8 - this._column % 8;else this._column++;
            }
            this._log("    PROGRESS: characters: " + (until - from) + ", from: <line " + line + ", column " + column + ">, to: <line " + this._line + ", column " + this._column + ">");
        }
    }, {
        key: "_tokenize",

        /*  determine and return the next token  */
        value: function _tokenize() {
            /*  tokenize only as long as there is input left  */
            if (this._pos >= this._len) return;

            /*  loop...  */
            var continued = true;
            while (continued) {
                continued = false;

                /*  some optional debugging context  */
                if (this._debug) {
                    var e = excerpt(this._input, this._pos);
                    this._log("INPUT: state: " + this._state[this._state.length - 1] + ", text: " + (e.prologTrunc ? "..." : "\"") + ("" + e.prologText + "<" + e.tokenText + ">" + e.epilogText) + (e.epilogTrunc ? "..." : "\"") + (", at: <line " + this._line + ", column " + this._column + ">"));
                }

                /*  iterate over all rules...  */
                for (var i = 0; i < this._rules.length; i++) {
                    if (this._debug) this._log("  RULE: state(s): " + this._rules[i].state.join(",") + ", pattern: " + this._rules[i].pattern.source);

                    /*  one of rule's states has to match  */
                    if (!(this._rules[i].state.length === 1 && this._rules[i].state[0] === "*" || this._rules[i].state.indexOf(this._state[this._state.length - 1]) >= 0)) continue;

                    /*  match pattern at the last position  */
                    this._rules[i].pattern.lastIndex = this._pos;
                    var found = this._rules[i].pattern.exec(this._input);
                    this._rules[i].pattern.lastIndex = this._pos;
                    if ((found = this._rules[i].pattern.exec(this._input)) !== null && found.index === this._pos) {
                        if (this._debug) this._log("    MATCHED: " + JSON.stringify(found));

                        /*  pattern found, so give action a chance to operate
                            on it and act according to its results  */
                        this._ctx._match = found;
                        this._ctx._repeat = false;
                        this._ctx._reject = false;
                        this._ctx._ignore = false;
                        this._rules[i].action.call(this._ctx, found);
                        if (this._ctx._reject)
                            /*  reject current action, continue matching  */
                            continue;else if (this._ctx._repeat) {
                            /*  repeat matching from scratch  */
                            continued = true;
                            break;
                        } else if (this._ctx._ignore) {
                            /*  ignore token  */
                            this._progress(this._pos, this._rules[i].pattern.lastIndex);
                            this._pos = this._rules[i].pattern.lastIndex;
                            if (this._pos >= this._len) return;
                            continued = true;
                            break;
                        } else if (this._tokens.length > 0) {
                            /*  accept token(s)  */
                            this._progress(this._pos, this._rules[i].pattern.lastIndex);
                            this._pos = this._rules[i].pattern.lastIndex;
                            return;
                        } else throw new Error("action of pattern \"" + this._rules[i].pattern.source + "\" neither rejected nor accepted any token(s)");
                    }
                }
            }

            /*  no pattern matched at all  */
            throw new TokenizationError("token not recognized", this);
        }
    }, {
        key: "token",

        /*  determine and return next token  */
        value: function token() {
            /*  if no more tokens are pending, try to determine a new one  */
            if (this._tokens.length === 0) this._tokenize();

            /*  return now potentially pending token  */
            if (this._tokens.length > 0) return this._tokens.shift();

            /*  no more tokens  */
            return null;
        }
    }, {
        key: "tokens",

        /*  determine and return all tokens  */
        value: function tokens() {
            var tokens = [];
            var token = undefined;
            while ((token = this.token()) !== null) tokens.push(token);
            return tokens;
        }
    }, {
        key: "peek",

        /*  peek at the next token or token at particular offset  */
        value: function peek(offset) {
            if (typeof offset === "undefined") offset = 0;
            for (var i = 0; i < this._tokens.length + offset; i++) {
                this._tokenize();
            }if (offset >= this._tokens.length) throw new Error("not enough tokens available for peek operation");
            return this._tokens[offset];
        }
    }, {
        key: "skip",

        /*  skip one or more tokens  */
        value: function skip(len) {
            if (typeof len === "undefined") len = 1;
            for (var i = 0; i < this._tokens.length + len; i++) {
                this._tokenize();
            }if (len > this._tokens.length) throw new Error("not enough tokens available for skip operation");
            while (len-- > 0) this.token();
            return this;
        }
    }, {
        key: "consume",

        /*  consume the current token (by expecting it to be a particular symbol)  */
        value: function consume(value) {
            for (var i = 0; i < this._tokens.length + 1; i++) {
                this._tokenize();
            }if (this._tokens.length === 0) throw new Error("not enough tokens available for consume operation");
            var token = this.token();
            if (token.value !== value) throw new Error("expected token value \"" + value + "\" (" + typeof value + "): " + "found token value \"" + token.value + "\" (" + typeof token.value + ")");
            return this;
        }
    }]);

    return Tokenizr;
})();

exports["default"] = Tokenizr;
module.exports = exports["default"];

},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvdS9yc2UvcHJqL25vZGUvdG9rZW5penIvc3JjL3Rva2VuaXpyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lDeUJNLEtBQUssR0FDSyxTQURWLEtBQUssQ0FDTSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBaUM7UUFBL0IsR0FBRyxnQ0FBRyxDQUFDO1FBQUUsSUFBSSxnQ0FBRyxDQUFDO1FBQUUsTUFBTSxnQ0FBRyxDQUFDOzswQkFEM0QsS0FBSzs7QUFFSCxRQUFJLENBQUMsSUFBSSxHQUFLLElBQUksQ0FBQTtBQUNsQixRQUFJLENBQUMsS0FBSyxHQUFJLEtBQUssQ0FBQTtBQUNuQixRQUFJLENBQUMsSUFBSSxHQUFLLElBQUksQ0FBQTtBQUNsQixRQUFJLENBQUMsR0FBRyxHQUFNLEdBQUcsQ0FBQTtBQUNqQixRQUFJLENBQUMsSUFBSSxHQUFLLElBQUksQ0FBQTtBQUNsQixRQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQTtDQUN2Qjs7O0FBSUwsSUFBTSxPQUFPLEdBQUcsU0FBVixPQUFPLENBQUksR0FBRyxFQUFFLENBQUMsRUFBSztBQUN4QixRQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDO0FBQ25CLFFBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsQUFBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNqQyxRQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLEFBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDakMsUUFBSSxHQUFHLEdBQUcsU0FBTixHQUFH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QUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRTtBQUMzQyxvQkFBSSxDQUFDLFNBQVMsRUFBRSxDQUFBO2FBQUEsQUFDckIsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQ3pCLE1BQU0sSUFBSSxLQUFLLENBQUMsbURBQW1ELENBQUMsQ0FBQTtBQUN4RSxnQkFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFBO0FBQ3hCLGdCQUFJLEtBQUssQ0FBQyxLQUFLLEtBQUssS0FBSyxFQUNyQixNQUFNLElBQUksS0FBSyxDQUFDLHlCQUF5QixHQUFHLEtBQUssR0FBRyxNQUFNLEdBQUcsT0FBTyxLQUFLLEdBQUcsS0FBSyxHQUM3RSxzQkFBc0IsR0FBRyxLQUFLLENBQUMsS0FBSyxHQUFHLE1BQU0sR0FBRyxPQUFPLEtBQUssQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDLENBQUE7QUFDakYsbUJBQU8sSUFBSSxDQUFBO1NBQ2Q7OztXQTlPZ0IsUUFBUTs7O3FCQUFSLFFBQVEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLypcbioqICBUb2tlbml6ciAtLSBTdHJpbmcgVG9rZW5pemF0aW9uIExpYnJhcnlcbioqICBDb3B5cmlnaHQgKGMpIDIwMTUgUmFsZiBTLiBFbmdlbHNjaGFsbCA8cnNlQGVuZ2Vsc2NoYWxsLmNvbT5cbioqXG4qKiAgUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nXG4qKiAgYSBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4qKiAgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4qKiAgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuKiogIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0b1xuKiogIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0b1xuKiogIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbioqXG4qKiAgVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbioqICBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbioqXG4qKiAgVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCxcbioqICBFWFBSRVNTIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0ZcbioqICBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuXG4qKiAgSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTllcbioqICBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULFxuKiogIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFXG4qKiAgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG4qL1xuXG4vKiAgaW50ZXJuYWwgaGVscGVyIGNsYXNzIGZvciB0b2tlbiByZXByZXNlbnRhdGlvbiAgKi9cbmNsYXNzIFRva2VuIHtcbiAgICBjb25zdHJ1Y3RvciAodHlwZSwgdmFsdWUsIHRleHQsIHBvcyA9IDAsIGxpbmUgPSAwLCBjb2x1bW4gPSAwKSB7XG4gICAgICAgIHRoaXMudHlwZSAgID0gdHlwZVxuICAgICAgICB0aGlzLnZhbHVlICA9IHZhbHVlXG4gICAgICAgIHRoaXMudGV4dCAgID0gdGV4dFxuICAgICAgICB0aGlzLnBvcyAgICA9IHBvc1xuICAgICAgICB0aGlzLmxpbmUgICA9IGxpbmVcbiAgICAgICAgdGhpcy5jb2x1bW4gPSBjb2x1bW5cbiAgICB9XG59XG5cbi8qICB1dGlsaXR5IGZ1bmN0aW9uOiBjcmVhdGUgYSBzb3VyY2UgZXhjZXJwdCAgKi9cbmNvbnN0IGV4Y2VycHQgPSAodHh0LCBvKSA9PiB7XG4gICAgdmFyIGwgPSB0eHQubGVuZ3RoO1xuICAgIHZhciBiID0gbyAtIDIwOyBpZiAoYiA8IDApIGIgPSAwO1xuICAgIHZhciBlID0gbyArIDIwOyBpZiAoZSA+IGwpIGUgPSBsO1xuICAgIHZhciBoZXggPSBmdW5jdGlvbiAoY2gpIHtcbiAgICAgICAgcmV0dXJuIGNoLmNoYXJDb2RlQXQoMCkudG9TdHJpbmcoMTYpLnRvVXBwZXJDYXNlKCk7XG4gICAgfTtcbiAgICB2YXIgZXh0cmFjdCA9IGZ1bmN0aW9uICh0eHQsIHBvcywgbGVuKSB7XG4gICAgICAgIHJldHVybiB0eHQuc3Vic3RyKHBvcywgbGVuKVxuICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFwvZywgICBcIlxcXFxcXFxcXCIpXG4gICAgICAgICAgICAucmVwbGFjZSgvXFx4MDgvZywgXCJcXFxcYlwiKVxuICAgICAgICAgICAgLnJlcGxhY2UoL1xcdC9nLCAgIFwiXFxcXHRcIilcbiAgICAgICAgICAgIC5yZXBsYWNlKC9cXG4vZywgICBcIlxcXFxuXCIpXG4gICAgICAgICAgICAucmVwbGFjZSgvXFxmL2csICAgXCJcXFxcZlwiKVxuICAgICAgICAgICAgLnJlcGxhY2UoL1xcci9nLCAgIFwiXFxcXHJcIilcbiAgICAgICAgICAgIC5yZXBsYWNlKC9bXFx4MDAtXFx4MDdcXHgwQlxceDBFXFx4MEZdL2csIGZ1bmN0aW9uKGNoKSB7IHJldHVybiBcIlxcXFx4MFwiICsgaGV4KGNoKTsgfSlcbiAgICAgICAgICAgIC5yZXBsYWNlKC9bXFx4MTAtXFx4MUZcXHg4MC1cXHhGRl0vZywgICAgZnVuY3Rpb24oY2gpIHsgcmV0dXJuIFwiXFxcXHhcIiAgKyBoZXgoY2gpOyB9KVxuICAgICAgICAgICAgLnJlcGxhY2UoL1tcXHUwMTAwLVxcdTBGRkZdL2csICAgICAgICAgZnVuY3Rpb24oY2gpIHsgcmV0dXJuIFwiXFxcXHUwXCIgKyBoZXgoY2gpOyB9KVxuICAgICAgICAgICAgLnJlcGxhY2UoL1tcXHUxMDAwLVxcdUZGRkZdL2csICAgICAgICAgZnVuY3Rpb24oY2gpIHsgcmV0dXJuIFwiXFxcXHVcIiAgKyBoZXgoY2gpOyB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcHJvbG9nVHJ1bmM6IGIgPiAwLFxuICAgICAgICBwcm9sb2dUZXh0OiAgZXh0cmFjdCh0eHQsIGIsIG8gLSBiKSxcbiAgICAgICAgdG9rZW5UZXh0OiAgIGV4dHJhY3QodHh0LCBvLCAxKSxcbiAgICAgICAgZXBpbG9nVGV4dDogIGV4dHJhY3QodHh0LCBvICsgMSwgZSAtIChvICsgMSkpLFxuICAgICAgICBlcGlsb2dUcnVuYzogZSA8IGxcbiAgICB9XG59XG5cbi8qICBpbnRlcm5hbCBoZWxwZXIgY2xhc3MgZm9yIHRva2VuaXphdGlvbiBlcnJvciByZXBvcnRpbmcgICovXG5jbGFzcyBUb2tlbml6YXRpb25FcnJvciBleHRlbmRzIEVycm9yIHtcbiAgICAvKiAgY29uc3RydWN0IGFuZCBpbml0aWFsaXplIG9iamVjdCAgKi9cbiAgICBjb25zdHJ1Y3RvciAobWVzc2FnZSA9IFwiVG9rZW5pemF0aW9uIEVycm9yXCIsIHRva2VuaXpyID0gbnVsbCkge1xuICAgICAgICBzdXBlcihtZXNzYWdlKVxuICAgICAgICB0aGlzLm5hbWUgICAgID0gXCJUb2tlbml6YXRpb25FcnJvclwiXG4gICAgICAgIHRoaXMubWVzc2FnZSAgPSBtZXNzYWdlXG4gICAgICAgIHRoaXMudG9rZW5penIgPSB0b2tlbml6clxuICAgIH1cblxuICAgIC8qICByZW5kZXIgYSB1c2VmdWwgc3RyaW5nIHJlcHJlc2VudGF0aW9uICAqL1xuICAgIHRvU3RyaW5nIChub0ZpbmFsTmV3TGluZSkge1xuICAgICAgICBsZXQgbCA9IGV4Y2VycHQodGhpcy50b2tlbml6ci5faW5wdXQsIHRoaXMudG9rZW5penIuX3BvcylcbiAgICAgICAgbGV0IHByZWZpeDEgPSBgbGluZSAke3RoaXMudG9rZW5penIuX2xpbmV9IChjb2x1bW4gJHt0aGlzLnRva2VuaXpyLl9jb2x1bW59KTogYFxuICAgICAgICBsZXQgcHJlZml4MiA9IFwiXCJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwcmVmaXgxLmxlbmd0aCArIGwucHJvbG9nVGV4dC5sZW5ndGg7IGkrKylcbiAgICAgICAgICAgIHByZWZpeDIgKz0gXCIgXCJcbiAgICAgICAgbGV0IG1zZyA9IFwiVG9rZW5pemF0aW9uIEVycm9yOiBcIiArIHRoaXMubWVzc2FnZSArIFwiXFxuXCIgK1xuICAgICAgICAgICAgcHJlZml4MSArIGwucHJvbG9nVGV4dCArIGwudG9rZW5UZXh0ICsgbC5lcGlsb2dUZXh0ICsgXCJcXG5cIiArXG4gICAgICAgICAgICBwcmVmaXgyICsgXCJeXCIgKyAobm9GaW5hbE5ld0xpbmUgPyBcIlwiIDogXCJcXG5cIilcbiAgICAgICAgcmV0dXJuIG1zZ1xuICAgIH1cbn1cblxuLyogIGludGVybmFsIGhlbHBlciBjbGFzcyBmb3IgYWN0aW9uIGNvbnRleHQgICovXG5jbGFzcyBBY3Rpb25Db250ZXh0IHtcbiAgICAvKiAgY29uc3RydWN0IGFuZCBpbml0aWFsaXplIHRoZSBvYmplY3QgICovXG4gICAgY29uc3RydWN0b3IgKHRva2VuaXpyKSB7XG4gICAgICAgIHRoaXMuX3Rva2VuaXpyID0gdG9rZW5penJcbiAgICAgICAgdGhpcy5fZGF0YSAgICAgPSB7fVxuICAgICAgICB0aGlzLl9yZXBlYXQgICA9IGZhbHNlXG4gICAgICAgIHRoaXMuX3JlamVjdCAgID0gZmFsc2VcbiAgICAgICAgdGhpcy5faWdub3JlICAgPSBmYWxzZVxuICAgICAgICB0aGlzLl9tYXRjaCAgICA9IG51bGxcbiAgICB9XG5cbiAgICAvKiAgc3RvcmUgYW5kIHJldHJpZXZlIHVzZXIgZGF0YSBhdHRhY2hlZCB0byBjb250ZXh0ICAqL1xuICAgIGRhdGEgKGtleSwgdmFsdWUpIHtcbiAgICAgICAgbGV0IHZhbHVlT2xkID0gdGhpcy5fZGF0YVtrZXldXG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAyKVxuICAgICAgICAgICAgdGhpcy5fZGF0YVtrZXldID0gdmFsdWVcbiAgICAgICAgcmV0dXJuIHZhbHVlT2xkXG4gICAgfVxuXG4gICAgLyogIHNldCBhIG5ldyBzdGF0ZSBpbiB0aGUgYXR0YWNoZWQgdG9rZW5pemVyICAqL1xuICAgIHN0YXRlIChzdGF0ZSkge1xuICAgICAgICBpZiAodHlwZW9mIHN0YXRlID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICB0aGlzLl90b2tlbml6ci5fbG9nKGAgICAgU1RBVEUgKFBVU0gpOiBgICtcbiAgICAgICAgICAgICAgICBgb2xkOiAke3RoaXMuX3Rva2VuaXpyLl9zdGF0ZVt0aGlzLl90b2tlbml6ci5fc3RhdGUubGVuZ3RoLSAxXX0sIGAgK1xuICAgICAgICAgICAgICAgIGBuZXc6ICR7c3RhdGV9YClcbiAgICAgICAgICAgIHRoaXMuX3Rva2VuaXpyLl9zdGF0ZS5wdXNoKHN0YXRlKVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHRoaXMuX3Rva2VuaXpyLl9zdGF0ZS5sZW5ndGggPj0gMikge1xuICAgICAgICAgICAgdGhpcy5fdG9rZW5penIuX2xvZyhgICAgIFNUQVRFIChQT1ApOiBgICtcbiAgICAgICAgICAgICAgICBgb2xkOiAke3RoaXMuX3Rva2VuaXpyLl9zdGF0ZVt0aGlzLl90b2tlbml6ci5fc3RhdGUubGVuZ3RoIC0gMV19LCBgICtcbiAgICAgICAgICAgICAgICBgbmV3OiAke3RoaXMuX3Rva2VuaXpyLl9zdGF0ZVt0aGlzLl90b2tlbml6ci5fc3RhdGUubGVuZ3RoIC0gMl19YClcbiAgICAgICAgICAgIHRoaXMuX3Rva2VuaXpyLl9zdGF0ZS5wb3Aoc3RhdGUpXG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiaW50ZXJuYWwgZXJyb3I6IG5vIG1vcmUgc3RhdGVzIHRvIHBvcFwiKVxuICAgICAgICByZXR1cm4gdGhpc1xuICAgIH1cblxuICAgIC8qICBtYXJrIGN1cnJlbnQgbWF0Y2hpbmcgdG8gYmUgcmVwZWF0ZWQgZnJvbSBzY3JhdGNoICAqL1xuICAgIHJlcGVhdCAoKSB7XG4gICAgICAgIHRoaXMuX3Rva2VuaXpyLl9sb2coYCAgICBSRVBFQVRgKVxuICAgICAgICB0aGlzLl9yZXBlYXQgPSB0cnVlXG4gICAgICAgIHJldHVybiB0aGlzXG4gICAgfVxuXG4gICAgLyogIG1hcmsgY3VycmVudCBhY3Rpb24gdG8gYmUgcmVqZWN0ZWQgICovXG4gICAgcmVqZWN0ICgpIHtcbiAgICAgICAgdGhpcy5fdG9rZW5penIuX2xvZyhgICAgIFJFSkVDVGApXG4gICAgICAgIHRoaXMuX3JlamVjdCA9IHRydWVcbiAgICAgICAgcmV0dXJuIHRoaXNcbiAgICB9XG5cbiAgICAvKiAgbWFyayBjdXJyZW50IGFjdGlvbiB0byBiZSBpZ25vcmVkICAqL1xuICAgIGlnbm9yZSAoKSB7XG4gICAgICAgIHRoaXMuX3Rva2VuaXpyLl9sb2coYCAgICBJR05PUkVgKVxuICAgICAgICB0aGlzLl9pZ25vcmUgPSB0cnVlXG4gICAgICAgIHJldHVybiB0aGlzXG4gICAgfVxuXG4gICAgLyogIGFjY2VwdCBhIG5ldyB0b2tlbiAgKi9cbiAgICBhY2NlcHQgKHR5cGUsIHZhbHVlID0gdGhpcy5fbWF0Y2hbMF0pIHtcbiAgICAgICAgdGhpcy5fdG9rZW5penIuX2xvZyhgICAgIEFDQ0VQVDogdHlwZTogJHt0eXBlfSwgdmFsdWU6ICR7SlNPTi5zdHJpbmdpZnkodmFsdWUpfSAoJHt0eXBlb2YgdmFsdWV9KSwgdGV4dDogXCIke3RoaXMuX21hdGNoWzBdfVwiYClcbiAgICAgICAgdGhpcy5fdG9rZW5penIuX3Rva2Vucy5wdXNoKG5ldyBUb2tlbihcbiAgICAgICAgICAgIHR5cGUsIHZhbHVlLCB0aGlzLl9tYXRjaFswXSxcbiAgICAgICAgICAgIHRoaXMuX3Rva2VuaXpyLl9wb3MsIHRoaXMuX3Rva2VuaXpyLl9saW5lLCB0aGlzLl90b2tlbml6ci5fY29sdW1uXG4gICAgICAgICkpXG4gICAgICAgIHJldHVybiB0aGlzXG4gICAgfVxufVxuXG4vKiAgZXh0ZXJuYWwgQVBJIGNsYXNzICAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVG9rZW5penIge1xuICAgIC8qICBjb25zdHJ1Y3QgYW5kIGluaXRpYWxpemUgdGhlIG9iamVjdCAgKi9cbiAgICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgICAgIHRoaXMuX3J1bGVzID0gW11cbiAgICAgICAgdGhpcy5fZGVidWcgPSBmYWxzZVxuICAgICAgICB0aGlzLnJlc2V0KClcbiAgICB9XG5cbiAgICAvKiAgcmVzZXQgdGhlIGludGVybmFsIHN0YXRlICAqL1xuICAgIHJlc2V0ICgpIHtcbiAgICAgICAgdGhpcy5faW5wdXQgICA9IFwiXCJcbiAgICAgICAgdGhpcy5fbGVuICAgICA9IDBcbiAgICAgICAgdGhpcy5fcG9zICAgICA9IDBcbiAgICAgICAgdGhpcy5fbGluZSAgICA9IDBcbiAgICAgICAgdGhpcy5fY29sdW1uICA9IDBcbiAgICAgICAgdGhpcy5fc3RhdGUgICA9IFsgXCJkZWZhdWx0XCIgXVxuICAgICAgICB0aGlzLl90b2tlbnMgID0gW11cbiAgICAgICAgdGhpcy5fY3R4ICAgICA9IG5ldyBBY3Rpb25Db250ZXh0KHRoaXMpXG4gICAgICAgIHJldHVybiB0aGlzXG4gICAgfVxuXG4gICAgLyogIGNvbmZpZ3VyZSBkZWJ1ZyBvcGVyYXRpb24gICovXG4gICAgZGVidWcgKGRlYnVnKSB7XG4gICAgICAgIHRoaXMuX2RlYnVnID0gZGVidWdcbiAgICB9XG5cbiAgICAvKiAgb3V0cHV0IGEgZGVidWcgbWVzc2FnZSAgKi9cbiAgICBfbG9nIChtc2cpIHtcbiAgICAgICAgaWYgKHRoaXMuX2RlYnVnKVxuICAgICAgICAgICAgY29uc29sZS5sb2coYHRva2VuaXpyOiAke21zZ31gKVxuICAgIH1cblxuICAgIC8qICBwcm92aWRlIChuZXcpIGlucHV0IHN0cmluZyB0byB0b2tlbml6ZSAgKi9cbiAgICBpbnB1dCAoaW5wdXQpIHtcbiAgICAgICAgLyogIHNhbml0eSBjaGVjayBhcmd1bWVudHMgICovXG4gICAgICAgIGlmICh0eXBlb2YgaW5wdXQgIT09IFwic3RyaW5nXCIpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJwYXJhbWV0ZXIgXFxcImlucHV0XFxcIiBub3QgYSBTdHJpbmdcIilcblxuICAgICAgICAvKiAgcmVzZXQgc3RhdGUgYW5kIHN0b3JlIG5ldyBpbnB1dCAgKi9cbiAgICAgICAgdGhpcy5yZXNldCgpXG4gICAgICAgIHRoaXMuX2lucHV0ID0gaW5wdXRcbiAgICAgICAgdGhpcy5fbGVuICAgPSBpbnB1dC5sZW5ndGhcbiAgICAgICAgcmV0dXJuIHRoaXNcbiAgICB9XG5cbiAgICAvKiAgY29uZmlndXJlIGEgdG9rZW5pemF0aW9uIHJ1bGUgICovXG4gICAgcnVsZSAoc3RhdGUsIHBhdHRlcm4sIGFjdGlvbikge1xuICAgICAgICAvKiAgc3VwcG9ydCBvcHRpb25hbCBzdGF0ZXMgICovXG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAyKSB7XG4gICAgICAgICAgICBbIHBhdHRlcm4sIGFjdGlvbiBdID0gWyBzdGF0ZSwgcGF0dGVybiBdXG4gICAgICAgICAgICBzdGF0ZSA9IFwiKlwiXG4gICAgICAgIH1cblxuICAgICAgICAvKiAgc2FuaXR5IGNoZWNrIGFyZ3VtZW50cyAgKi9cbiAgICAgICAgaWYgKHR5cGVvZiBzdGF0ZSAhPT0gXCJzdHJpbmdcIilcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInBhcmFtZXRlciBcXFwic3RhdGVcXFwiIG5vdCBhIFN0cmluZ1wiKVxuICAgICAgICBpZiAoISh0eXBlb2YgcGF0dGVybiA9PT0gXCJvYmplY3RcIiAmJiBwYXR0ZXJuIGluc3RhbmNlb2YgUmVnRXhwKSlcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInBhcmFtZXRlciBcXFwicGF0dGVyblxcXCIgbm90IGEgUmVnRXhwXCIpXG4gICAgICAgIGlmICh0eXBlb2YgYWN0aW9uICE9PSBcImZ1bmN0aW9uXCIpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJwYXJhbWV0ZXIgXFxcImFjdGlvblxcXCIgbm90IGEgRnVuY3Rpb25cIilcblxuICAgICAgICAvKiAgcG9zdC1wcm9jZXNzIHN0YXRlICAqL1xuICAgICAgICBzdGF0ZSA9IHN0YXRlLnNwbGl0KC9cXHMqLFxccyovZylcblxuICAgICAgICAvKiAgcG9zdC1wcm9jZXNzIHBhdHRlcm4gICovXG4gICAgICAgIHZhciBmbGFncyA9IFwiZ1wiXG4gICAgICAgIGlmIChwYXR0ZXJuLm11bHRpbGluZSlcbiAgICAgICAgICAgIGZsYWdzICs9IFwibVwiXG4gICAgICAgIGlmIChwYXR0ZXJuLmlnbm9yZUNhc2UpXG4gICAgICAgICAgICBmbGFncyArPSBcImlcIlxuICAgICAgICBwYXR0ZXJuID0gbmV3IFJlZ0V4cChwYXR0ZXJuLnNvdXJjZSwgZmxhZ3MpXG5cbiAgICAgICAgLyogIHN0b3JlIHJ1bGUgICovXG4gICAgICAgIHRoaXMuX2xvZyhgcnVsZTogY29uZmlndXJlIHJ1bGUgKHN0YXRlOiAke3N0YXRlfSwgcGF0dGVybjogJHtwYXR0ZXJufSlgKVxuICAgICAgICB0aGlzLl9ydWxlcy5wdXNoKHsgc3RhdGUsIHBhdHRlcm4sIGFjdGlvbiB9KVxuXG4gICAgICAgIHJldHVybiB0aGlzXG4gICAgfVxuXG4gICAgLyogIHByb2dyZXNzIHRoZSBsaW5lL2NvbHVtbiBjb3VudGVyICAqL1xuICAgIF9wcm9ncmVzcyAoZnJvbSwgdW50aWwpIHtcbiAgICAgICAgbGV0IGxpbmUgICA9IHRoaXMuX2xpbmVcbiAgICAgICAgbGV0IGNvbHVtbiA9IHRoaXMuX2NvbHVtblxuICAgICAgICBsZXQgcyA9IHRoaXMuX2lucHV0XG4gICAgICAgIGZvciAobGV0IGkgPSBmcm9tOyBpIDwgdW50aWw7IGkrKykge1xuICAgICAgICAgICAgbGV0IGMgPSBzLmNoYXJBdChpKVxuICAgICAgICAgICAgaWYgKGMgPT09IFwiXFxyXCIpXG4gICAgICAgICAgICAgICAgdGhpcy5fY29sdW1uID0gMFxuICAgICAgICAgICAgZWxzZSBpZiAoYyA9PT0gXCJcXG5cIikge1xuICAgICAgICAgICAgICAgIHRoaXMuX2xpbmUrK1xuICAgICAgICAgICAgICAgIHRoaXMuX2NvbHVtbiA9IDBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGMgPT09IFwiXFx0XCIpXG4gICAgICAgICAgICAgICAgdGhpcy5fY29sdW1uICs9IDggLSAodGhpcy5fY29sdW1uICUgOClcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB0aGlzLl9jb2x1bW4rK1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2xvZyhgICAgIFBST0dSRVNTOiBjaGFyYWN0ZXJzOiAke3VudGlsIC0gZnJvbX0sIGZyb206IDxsaW5lICR7bGluZX0sIGNvbHVtbiAke2NvbHVtbn0+LCB0bzogPGxpbmUgJHt0aGlzLl9saW5lfSwgY29sdW1uICR7dGhpcy5fY29sdW1ufT5gKVxuICAgIH1cblxuICAgIC8qICBkZXRlcm1pbmUgYW5kIHJldHVybiB0aGUgbmV4dCB0b2tlbiAgKi9cbiAgICBfdG9rZW5pemUgKCkge1xuICAgICAgICAvKiAgdG9rZW5pemUgb25seSBhcyBsb25nIGFzIHRoZXJlIGlzIGlucHV0IGxlZnQgICovXG4gICAgICAgIGlmICh0aGlzLl9wb3MgPj0gdGhpcy5fbGVuKVxuICAgICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgLyogIGxvb3AuLi4gICovXG4gICAgICAgIGxldCBjb250aW51ZWQgPSB0cnVlXG4gICAgICAgIHdoaWxlIChjb250aW51ZWQpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlZCA9IGZhbHNlXG5cbiAgICAgICAgICAgIC8qICBzb21lIG9wdGlvbmFsIGRlYnVnZ2luZyBjb250ZXh0ICAqL1xuICAgICAgICAgICAgaWYgKHRoaXMuX2RlYnVnKSB7XG4gICAgICAgICAgICAgICAgbGV0IGUgPSBleGNlcnB0KHRoaXMuX2lucHV0LCB0aGlzLl9wb3MpXG4gICAgICAgICAgICAgICAgdGhpcy5fbG9nKGBJTlBVVDogc3RhdGU6ICR7dGhpcy5fc3RhdGVbdGhpcy5fc3RhdGUubGVuZ3RoIC0gMV19LCB0ZXh0OiBgICtcbiAgICAgICAgICAgICAgICAgICAgKGUucHJvbG9nVHJ1bmMgPyBcIi4uLlwiIDogXCJcXFwiXCIpICsgYCR7ZS5wcm9sb2dUZXh0fTwke2UudG9rZW5UZXh0fT4ke2UuZXBpbG9nVGV4dH1gICtcbiAgICAgICAgICAgICAgICAgICAgKGUuZXBpbG9nVHJ1bmMgPyBcIi4uLlwiIDogXCJcXFwiXCIpICsgYCwgYXQ6IDxsaW5lICR7dGhpcy5fbGluZX0sIGNvbHVtbiAke3RoaXMuX2NvbHVtbn0+YClcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyogIGl0ZXJhdGUgb3ZlciBhbGwgcnVsZXMuLi4gICovXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuX3J1bGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX2RlYnVnKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9sb2coYCAgUlVMRTogc3RhdGUocyk6ICR7dGhpcy5fcnVsZXNbaV0uc3RhdGUuam9pbihcIixcIil9LCBwYXR0ZXJuOiAke3RoaXMuX3J1bGVzW2ldLnBhdHRlcm4uc291cmNlfWApXG5cbiAgICAgICAgICAgICAgICAvKiAgb25lIG9mIHJ1bGUncyBzdGF0ZXMgaGFzIHRvIG1hdGNoICAqL1xuICAgICAgICAgICAgICAgIGlmICghKCAgICggICB0aGlzLl9ydWxlc1tpXS5zdGF0ZS5sZW5ndGggPT09IDFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgJiYgdGhpcy5fcnVsZXNbaV0uc3RhdGVbMF0gPT09IFwiKlwiICApXG4gICAgICAgICAgICAgICAgICAgICAgfHwgdGhpcy5fcnVsZXNbaV0uc3RhdGUuaW5kZXhPZih0aGlzLl9zdGF0ZVt0aGlzLl9zdGF0ZS5sZW5ndGggLSAxXSkgPj0gMCkpXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlXG5cbiAgICAgICAgICAgICAgICAvKiAgbWF0Y2ggcGF0dGVybiBhdCB0aGUgbGFzdCBwb3NpdGlvbiAgKi9cbiAgICAgICAgICAgICAgICB0aGlzLl9ydWxlc1tpXS5wYXR0ZXJuLmxhc3RJbmRleCA9IHRoaXMuX3Bvc1xuICAgICAgICAgICAgICAgIGxldCBmb3VuZCA9IHRoaXMuX3J1bGVzW2ldLnBhdHRlcm4uZXhlYyh0aGlzLl9pbnB1dClcbiAgICAgICAgICAgICAgICB0aGlzLl9ydWxlc1tpXS5wYXR0ZXJuLmxhc3RJbmRleCA9IHRoaXMuX3Bvc1xuICAgICAgICAgICAgICAgIGlmICggICAoZm91bmQgPSB0aGlzLl9ydWxlc1tpXS5wYXR0ZXJuLmV4ZWModGhpcy5faW5wdXQpKSAhPT0gbnVsbFxuICAgICAgICAgICAgICAgICAgICAmJiBmb3VuZC5pbmRleCA9PT0gdGhpcy5fcG9zICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5fZGVidWcpXG4gICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2xvZyhcIiAgICBNQVRDSEVEOiBcIiArIEpTT04uc3RyaW5naWZ5KGZvdW5kKSlcblxuICAgICAgICAgICAgICAgICAgICAvKiAgcGF0dGVybiBmb3VuZCwgc28gZ2l2ZSBhY3Rpb24gYSBjaGFuY2UgdG8gb3BlcmF0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgb24gaXQgYW5kIGFjdCBhY2NvcmRpbmcgdG8gaXRzIHJlc3VsdHMgICovXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2N0eC5fbWF0Y2ggPSBmb3VuZFxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9jdHguX3JlcGVhdCA9IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2N0eC5fcmVqZWN0ID0gZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fY3R4Ll9pZ25vcmUgPSBmYWxzZVxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9ydWxlc1tpXS5hY3Rpb24uY2FsbCh0aGlzLl9jdHgsIGZvdW5kKVxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5fY3R4Ll9yZWplY3QpXG4gICAgICAgICAgICAgICAgICAgICAgICAvKiAgcmVqZWN0IGN1cnJlbnQgYWN0aW9uLCBjb250aW51ZSBtYXRjaGluZyAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMuX2N0eC5fcmVwZWF0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvKiAgcmVwZWF0IG1hdGNoaW5nIGZyb20gc2NyYXRjaCAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlZCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5fY3R4Ll9pZ25vcmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qICBpZ25vcmUgdG9rZW4gICovXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9wcm9ncmVzcyh0aGlzLl9wb3MsIHRoaXMuX3J1bGVzW2ldLnBhdHRlcm4ubGFzdEluZGV4KVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fcG9zID0gdGhpcy5fcnVsZXNbaV0ucGF0dGVybi5sYXN0SW5kZXhcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9wb3MgPj0gdGhpcy5fbGVuKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWVkID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICh0aGlzLl90b2tlbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLyogIGFjY2VwdCB0b2tlbihzKSAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3Byb2dyZXNzKHRoaXMuX3BvcywgdGhpcy5fcnVsZXNbaV0ucGF0dGVybi5sYXN0SW5kZXgpXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9wb3MgPSB0aGlzLl9ydWxlc1tpXS5wYXR0ZXJuLmxhc3RJbmRleFxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiYWN0aW9uIG9mIHBhdHRlcm4gXFxcIlwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9ydWxlc1tpXS5wYXR0ZXJuLnNvdXJjZSArIFwiXFxcIiBuZWl0aGVyIHJlamVjdGVkIG5vciBhY2NlcHRlZCBhbnkgdG9rZW4ocylcIilcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKiAgbm8gcGF0dGVybiBtYXRjaGVkIGF0IGFsbCAgKi9cbiAgICAgICAgdGhyb3cgbmV3IFRva2VuaXphdGlvbkVycm9yKFwidG9rZW4gbm90IHJlY29nbml6ZWRcIiwgdGhpcylcbiAgICB9XG5cbiAgICAvKiAgZGV0ZXJtaW5lIGFuZCByZXR1cm4gbmV4dCB0b2tlbiAgKi9cbiAgICB0b2tlbiAoKSB7XG4gICAgICAgIC8qICBpZiBubyBtb3JlIHRva2VucyBhcmUgcGVuZGluZywgdHJ5IHRvIGRldGVybWluZSBhIG5ldyBvbmUgICovXG4gICAgICAgIGlmICh0aGlzLl90b2tlbnMubGVuZ3RoID09PSAwKVxuICAgICAgICAgICAgdGhpcy5fdG9rZW5pemUoKVxuXG4gICAgICAgIC8qICByZXR1cm4gbm93IHBvdGVudGlhbGx5IHBlbmRpbmcgdG9rZW4gICovXG4gICAgICAgIGlmICh0aGlzLl90b2tlbnMubGVuZ3RoID4gMClcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl90b2tlbnMuc2hpZnQoKVxuXG4gICAgICAgIC8qICBubyBtb3JlIHRva2VucyAgKi9cbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG5cbiAgICAvKiAgZGV0ZXJtaW5lIGFuZCByZXR1cm4gYWxsIHRva2VucyAgKi9cbiAgICB0b2tlbnMgKCkge1xuICAgICAgICBsZXQgdG9rZW5zID0gW11cbiAgICAgICAgbGV0IHRva2VuXG4gICAgICAgIHdoaWxlICgodG9rZW4gPSB0aGlzLnRva2VuKCkpICE9PSBudWxsKVxuICAgICAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pXG4gICAgICAgIHJldHVybiB0b2tlbnNcbiAgICB9XG5cbiAgICAvKiAgcGVlayBhdCB0aGUgbmV4dCB0b2tlbiBvciB0b2tlbiBhdCBwYXJ0aWN1bGFyIG9mZnNldCAgKi9cbiAgICBwZWVrIChvZmZzZXQpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBvZmZzZXQgPT09IFwidW5kZWZpbmVkXCIpXG4gICAgICAgICAgICBvZmZzZXQgPSAwXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5fdG9rZW5zLmxlbmd0aCArIG9mZnNldDsgaSsrKVxuICAgICAgICAgICAgIHRoaXMuX3Rva2VuaXplKClcbiAgICAgICAgaWYgKG9mZnNldCA+PSB0aGlzLl90b2tlbnMubGVuZ3RoKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwibm90IGVub3VnaCB0b2tlbnMgYXZhaWxhYmxlIGZvciBwZWVrIG9wZXJhdGlvblwiKVxuICAgICAgICByZXR1cm4gdGhpcy5fdG9rZW5zW29mZnNldF1cbiAgICB9XG5cbiAgICAvKiAgc2tpcCBvbmUgb3IgbW9yZSB0b2tlbnMgICovXG4gICAgc2tpcCAobGVuKSB7XG4gICAgICAgIGlmICh0eXBlb2YgbGVuID09PSBcInVuZGVmaW5lZFwiKVxuICAgICAgICAgICAgbGVuID0gMVxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuX3Rva2Vucy5sZW5ndGggKyBsZW47IGkrKylcbiAgICAgICAgICAgICB0aGlzLl90b2tlbml6ZSgpXG4gICAgICAgIGlmIChsZW4gPiB0aGlzLl90b2tlbnMubGVuZ3RoKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwibm90IGVub3VnaCB0b2tlbnMgYXZhaWxhYmxlIGZvciBza2lwIG9wZXJhdGlvblwiKVxuICAgICAgICB3aGlsZSAobGVuLS0gPiAwKVxuICAgICAgICAgICAgdGhpcy50b2tlbigpXG4gICAgICAgIHJldHVybiB0aGlzXG4gICAgfVxuXG4gICAgLyogIGNvbnN1bWUgdGhlIGN1cnJlbnQgdG9rZW4gKGJ5IGV4cGVjdGluZyBpdCB0byBiZSBhIHBhcnRpY3VsYXIgc3ltYm9sKSAgKi9cbiAgICBjb25zdW1lICh2YWx1ZSkge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuX3Rva2Vucy5sZW5ndGggKyAxOyBpKyspXG4gICAgICAgICAgICAgdGhpcy5fdG9rZW5pemUoKVxuICAgICAgICBpZiAodGhpcy5fdG9rZW5zLmxlbmd0aCA9PT0gMClcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIm5vdCBlbm91Z2ggdG9rZW5zIGF2YWlsYWJsZSBmb3IgY29uc3VtZSBvcGVyYXRpb25cIilcbiAgICAgICAgbGV0IHRva2VuID0gdGhpcy50b2tlbigpXG4gICAgICAgIGlmICh0b2tlbi52YWx1ZSAhPT0gdmFsdWUpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJleHBlY3RlZCB0b2tlbiB2YWx1ZSBcXFwiXCIgKyB2YWx1ZSArIFwiXFxcIiAoXCIgKyB0eXBlb2YgdmFsdWUgKyBcIik6IFwiICtcbiAgICAgICAgICAgICAgICBcImZvdW5kIHRva2VuIHZhbHVlIFxcXCJcIiArIHRva2VuLnZhbHVlICsgXCJcXFwiIChcIiArIHR5cGVvZiB0b2tlbi52YWx1ZSArIFwiKVwiKVxuICAgICAgICByZXR1cm4gdGhpc1xuICAgIH1cbn1cblxuIl19
