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
"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var excerpt=function(e,r){var t=e.length,n=r-20;0>n&&(n=0);var u=r+20;u>t&&(u=t);var c=function(e){return e.charCodeAt(0).toString(16).toUpperCase()},o=function(e,r,t){return e.substr(r,t).replace(/\\/g,"\\\\").replace(/\x08/g,"\\b").replace(/\t/g,"\\t").replace(/\n/g,"\\n").replace(/\f/g,"\\f").replace(/\r/g,"\\r").replace(/[\x00-\x07\x0B\x0E\x0F]/g,function(e){return"\\x0"+c(e)}).replace(/[\x10-\x1F\x80-\xFF]/g,function(e){return"\\x"+c(e)}).replace(/[\u0100-\u0FFF]/g,function(e){return"\\u0"+c(e)}).replace(/[\u1000-\uFFFF]/g,function(e){return"\\u"+c(e)})};return{prologTrunc:n>0,prologText:o(e,n,r-n),tokenText:o(e,r,1),epilogText:o(e,r+1,u-(r+1)),epilogTrunc:t>u}};exports["default"]=excerpt,module.exports=exports["default"];
},{}],2:[function(_dereq_,module,exports){
"use strict";function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(exports,"__esModule",{value:!0});var _createClass=function(){function e(e,t){for(var n=0;n<t.length;n++){var s=t[n];s.enumerable=s.enumerable||!1,s.configurable=!0,"value"in s&&(s.writable=!0),Object.defineProperty(e,s.key,s)}}return function(t,n,s){return n&&e(t.prototype,n),s&&e(t,s),t}}(),Token=function(){function e(t,n,s){var r=void 0===arguments[3]?0:arguments[3],a=void 0===arguments[4]?0:arguments[4],i=void 0===arguments[5]?0:arguments[5];_classCallCheck(this,e),this.type=t,this.value=n,this.text=s,this.pos=r,this.line=a,this.column=i}return _createClass(e,[{key:"toString",value:function(){return"<type: "+this.type+", "+("value: "+this.value+", ")+("text: "+this.text+", ")+("pos: "+this.pos+", ")+("line: "+this.line+", ")+("column: "+this.column+">")}}]),e}();exports["default"]=Token,module.exports=exports["default"];
},{}],3:[function(_dereq_,module,exports){
"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{"default":e}}function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function _inherits(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(e.__proto__=t)}Object.defineProperty(exports,"__esModule",{value:!0});var _createClass=function(){function e(e,t){for(var r=0;r<t.length;r++){var o=t[r];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}return function(t,r,o){return r&&e(t.prototype,r),o&&e(t,o),t}}(),_get=function(e,t,r){for(var o=!0;o;){var n=e,i=t,a=r;u=s=l=void 0,o=!1;var u=Object.getOwnPropertyDescriptor(n,i);if(void 0!==u){if("value"in u)return u.value;var l=u.get;return void 0===l?void 0:l.call(a)}var s=Object.getPrototypeOf(n);if(null===s)return void 0;e=s,t=i,r=a,o=!0}},_tokenizr1Excerpt=_dereq_("./tokenizr-1-excerpt"),_tokenizr1Excerpt2=_interopRequireDefault(_tokenizr1Excerpt),TokenizationError=function(e){function t(){var e=void 0===arguments[0]?"Tokenization Error":arguments[0],r=void 0===arguments[1]?null:arguments[1];_classCallCheck(this,t),_get(Object.getPrototypeOf(t.prototype),"constructor",this).call(this,e),this.name="TokenizationError",this.message=e,this.tokenizr=r}return _inherits(t,e),_createClass(t,[{key:"toString",value:function(e){for(var t=_tokenizr1Excerpt2["default"](this.tokenizr._input,this.tokenizr._pos),r="line "+this.tokenizr._line+" (column "+this.tokenizr._column+"): ",o="",n=0;n<r.length+t.prologText.length;n++)o+=" ";var i="Tokenization Error: "+this.message+"\n"+r+t.prologText+t.tokenText+t.epilogText+"\n"+o+"^"+(e?"":"\n");return i}}]),t}(Error);exports["default"]=TokenizationError,module.exports=exports["default"];
},{"./tokenizr-1-excerpt":1}],4:[function(_dereq_,module,exports){
"use strict";function _interopRequireDefault(t){return t&&t.__esModule?t:{"default":t}}function _classCallCheck(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(exports,"__esModule",{value:!0});var _createClass=function(){function t(t,e){for(var n=0;n<e.length;n++){var i=e[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(t,i.key,i)}}return function(e,n,i){return n&&t(e.prototype,n),i&&t(e,i),e}}(),_tokenizr2Token=_dereq_("./tokenizr-2-token"),_tokenizr2Token2=_interopRequireDefault(_tokenizr2Token),ActionContext=function(){function t(e){_classCallCheck(this,t),this._tokenizr=e,this._data={},this._repeat=!1,this._reject=!1,this._ignore=!1,this._match=null}return _createClass(t,[{key:"data",value:function(t,e){var n=this._data[t];return 2===arguments.length&&(this._data[t]=e),n}},{key:"state",value:function(t){if("string"==typeof t)this._tokenizr._log("    STATE (PUSH): "+("old: "+this._tokenizr._state[this._tokenizr._state.length-1]+", ")+("new: "+t)),this._tokenizr._state.push(t);else{if(!(this._tokenizr._state.length>=2))throw new Error("internal error: no more states to pop");this._tokenizr._log("    STATE (POP): "+("old: "+this._tokenizr._state[this._tokenizr._state.length-1]+", ")+("new: "+this._tokenizr._state[this._tokenizr._state.length-2])),this._tokenizr._state.pop(t)}return this}},{key:"repeat",value:function(){return this._tokenizr._log("    REPEAT"),this._repeat=!0,this}},{key:"reject",value:function(){return this._tokenizr._log("    REJECT"),this._reject=!0,this}},{key:"ignore",value:function(){return this._tokenizr._log("    IGNORE"),this._ignore=!0,this}},{key:"accept",value:function(t){var e=void 0===arguments[1]?this._match[0]:arguments[1];return this._tokenizr._log("    ACCEPT: type: "+t+", value: "+JSON.stringify(e)+" ("+typeof e+'), text: "'+this._match[0]+'"'),this._tokenizr._tokens.push(new _tokenizr2Token2["default"](t,e,this._match[0],this._tokenizr._pos,this._tokenizr._line,this._tokenizr._column)),this}}]),t}();exports["default"]=ActionContext,module.exports=exports["default"];
},{"./tokenizr-2-token":2}],5:[function(_dereq_,module,exports){
"use strict";function _interopRequireDefault(t){return t&&t.__esModule?t:{"default":t}}function _classCallCheck(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(exports,"__esModule",{value:!0});var _createClass=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),_tokenizr1Excerpt=_dereq_("./tokenizr-1-excerpt"),_tokenizr1Excerpt2=_interopRequireDefault(_tokenizr1Excerpt),_tokenizr3Error=_dereq_("./tokenizr-3-error"),_tokenizr3Error2=_interopRequireDefault(_tokenizr3Error),_tokenizr4Context=_dereq_("./tokenizr-4-context"),_tokenizr4Context2=_interopRequireDefault(_tokenizr4Context),Tokenizr=function(){function t(){_classCallCheck(this,t),this._rules=[],this._debug=!1,this.reset()}return _createClass(t,[{key:"reset",value:function(){return this._input="",this._len=0,this._pos=0,this._line=0,this._column=0,this._state=["default"],this._tokens=[],this._ctx=new _tokenizr4Context2["default"](this),this}},{key:"debug",value:function(t){this._debug=t}},{key:"_log",value:function(t){this._debug&&console.log("tokenizr: "+t)}},{key:"input",value:function(t){if("string"!=typeof t)throw new Error('parameter "input" not a String');return this.reset(),this._input=t,this._len=t.length,this}},{key:"rule",value:function(t,e,n){if(2===arguments.length){var r=[t,e];e=r[0],n=r[1],t="*"}if("string"!=typeof t)throw new Error('parameter "state" not a String');if(!("object"==typeof e&&e instanceof RegExp))throw new Error('parameter "pattern" not a RegExp');if("function"!=typeof n)throw new Error('parameter "action" not a Function');t=t.split(/\s*,\s*/g);var i="g";return e.multiline&&(i+="m"),e.ignoreCase&&(i+="i"),e=new RegExp(e.source,i),this._log("rule: configure rule (state: "+t+", pattern: "+e+")"),this._rules.push({state:t,pattern:e,action:n}),this}},{key:"_progress",value:function(t,e){for(var n=this._line,r=this._column,i=this._input,s=t;e>s;s++){var o=i.charAt(s);"\r"===o?this._column=0:"\n"===o?(this._line++,this._column=0):"	"===o?this._column+=8-this._column%8:this._column++}this._log("    PROGRESS: characters: "+(e-t)+", from: <line "+n+", column "+r+">, to: <line "+this._line+", column "+this._column+">")}},{key:"_tokenize",value:function(){if(!(this._pos>=this._len)){for(var t=!0;t;){if(t=!1,this._debug){var e=_tokenizr1Excerpt2["default"](this._input,this._pos);this._log("INPUT: state: "+this._state[this._state.length-1]+", text: "+(e.prologTrunc?"...":'"')+(""+e.prologText+"<"+e.tokenText+">"+e.epilogText)+(e.epilogTrunc?"...":'"')+(", at: <line "+this._line+", column "+this._column+">"))}for(var n=0;n<this._rules.length;n++)if(this._debug&&this._log("  RULE: state(s): "+this._rules[n].state.join(",")+", pattern: "+this._rules[n].pattern.source),1===this._rules[n].state.length&&"*"===this._rules[n].state[0]||this._rules[n].state.indexOf(this._state[this._state.length-1])>=0){this._rules[n].pattern.lastIndex=this._pos;var r=this._rules[n].pattern.exec(this._input);if(this._rules[n].pattern.lastIndex=this._pos,null!==(r=this._rules[n].pattern.exec(this._input))&&r.index===this._pos){if(this._debug&&this._log("    MATCHED: "+JSON.stringify(r)),this._ctx._match=r,this._ctx._repeat=!1,this._ctx._reject=!1,this._ctx._ignore=!1,this._rules[n].action.call(this._ctx,r),this._ctx._reject)continue;if(this._ctx._repeat){t=!0;break}if(this._ctx._ignore){if(this._progress(this._pos,this._rules[n].pattern.lastIndex),this._pos=this._rules[n].pattern.lastIndex,this._pos>=this._len)return;t=!0;break}if(this._tokens.length>0)return this._progress(this._pos,this._rules[n].pattern.lastIndex),void(this._pos=this._rules[n].pattern.lastIndex);throw new Error('action of pattern "'+this._rules[n].pattern.source+'" neither rejected nor accepted any token(s)')}}}throw new _tokenizr3Error2["default"]("token not recognized",this)}}},{key:"token",value:function(){return 0===this._tokens.length&&this._tokenize(),this._tokens.length>0?this._tokens.shift():null}},{key:"tokens",value:function e(){for(var e=[],t=void 0;null!==(t=this.token());)e.push(t);return e}},{key:"peek",value:function(t){"undefined"==typeof t&&(t=0);for(var e=0;e<this._tokens.length+t;e++)this._tokenize();if(t>=this._tokens.length)throw new Error("not enough tokens available for peek operation");return this._tokens[t]}},{key:"skip",value:function(t){"undefined"==typeof t&&(t=1);for(var e=0;e<this._tokens.length+t;e++)this._tokenize();if(t>this._tokens.length)throw new Error("not enough tokens available for skip operation");for(;t-->0;)this.token();return this}},{key:"consume",value:function(t){for(var e=0;e<this._tokens.length+1;e++)this._tokenize();if(0===this._tokens.length)throw new Error("not enough tokens available for consume operation");var n=this.token();if(n.value!==t)throw new Error('expected token value "'+t+'" ('+typeof t+'): found token value "'+n.value+'" ('+typeof n.value+")");return this}}]),t}();exports["default"]=Tokenizr,module.exports=exports["default"];
},{"./tokenizr-1-excerpt":1,"./tokenizr-3-error":3,"./tokenizr-4-context":4}],6:[function(_dereq_,module,exports){
"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{"default":e}}Object.defineProperty(exports,"__esModule",{value:!0});var _tokenizr5Tokenizer=_dereq_("./tokenizr-5-tokenizer"),_tokenizr5Tokenizer2=_interopRequireDefault(_tokenizr5Tokenizer);exports["default"]=_tokenizr5Tokenizer2["default"],module.exports=exports["default"];
},{"./tokenizr-5-tokenizer":5}]},{},[6])(6)
});


//# sourceMappingURL=bundle.map