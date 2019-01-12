
Tokenizr
========

Flexible String Tokenization Library for JavaScript

<p/>
<img src="https://nodei.co/npm/tokenizr.png?downloads=true&stars=true" alt=""/>

<p/>
<img src="https://david-dm.org/rse/tokenizr.png" alt=""/>

About
-----

Tokenizr is a small JavaScript library, providing powerful and flexible
string tokenization functionality. It is intended to be be used as
the underlying "lexical scanner" in a Recursive Descent based "syntax
parser", but can be used for other parsing purposes, too. Its distinct
features are:

- **Efficient Iteration**:<br/>
  It iterates over the input character string in a read-only and copy-less fashion.

- **Stacked States**:<br/>
  Its tokenization is based on stacked states for determining rules which can be applied.
  Each rule can be enabled for one or more particular states only.

- **Regular Expression Matching**:<br/>
  Its tokenization is based on powerful Regular Expressions for matching the input string.

- **Match Repeating**:<br/>
  Rule actions can change the state and then force the repeating of
  the matching process from scratch at the current input position.

- **Match Rejecting**:<br/>
  Rule actions can reject their matching at the current input position
  and let subsequent rules to still match.

- **Match Ignoring**:<br/>
  Rule actions can force the matched input to be ignored (without
  generating a token at all).

- **Match Accepting**:<br/>
  Rule actions can accept the matched input and provide one *or even more* resulting tokens.

- **Shared Context Data**:<br/>
  Rule actions (during tokenization) can optionally store and retrieve arbitrary
  values to/from their tokenization context to share data between rules.

- **Token Text and Value**:<br/>
  Tokens provide information about their matched input text and can provide
  a different corresponding (pre-parsed) value, too.

- **Debug Mode**:<br/>
  The tokenization process can be debugged through optional detailed
  logging of the internal processing.

- **Nestable Transactions**:<br/>
  The tokenization can be split into distinct (and nestable)
  transactions which can be committed or rolled back. This way the
  tokenization can be incrementally stepped back and this way support
  the attempt of parsing alternatives.

- **Token Look-Ahead**:<br/>
  The forthcoming tokens can be inspected, to support alternative decisions
  from within the parser, based on look-ahead tokens.

Installation
------------

#### Node environments (with NPM package manager):

```shell
$ npm install tokenizr
```

#### Browser environments (with Bower package manager):

```shell
$ bower install tokenizr
```

Usage
-----

Suppose we have a configuration file `sample.cfg`:

```
foo {
    baz = 1 // sample comment
    bar {
        quux = 42
        hello = "hello \"world\"!"
    }
    quux = 7
}
```

Then we can write a lexical scanner in ECMAScript 6 (under Node.js) for the tokens like this:

```js
import fs       from "fs"
import Tokenizr from "tokenizr"

let lexer = new Tokenizr()

lexer.rule(/[a-zA-Z_][a-zA-Z0-9_]*/, (ctx, match) => {
    ctx.accept("id")
})
lexer.rule(/[+-]?[0-9]+/, (ctx, match) => {
    ctx.accept("number", parseInt(match[0]))
})
lexer.rule(/"((?:\\"|[^\r\n])*)"/, (ctx, match) => {
    ctx.accept("string", match[1].replace(/\\"/g, "\""))
})
lexer.rule(/\/\/[^\r\n]*\r?\n/, (ctx, match) => {
    ctx.ignore()
})
lexer.rule(/[ \t\r\n]+/, (ctx, match) => {
    ctx.ignore()
})
lexer.rule(/./, (ctx, match) => {
    ctx.accept("char")
})

let cfg = fs.readFileSync("sample.cfg", "utf8")

lexer.input(cfg)
lexer.debug(true)
lexer.tokens().forEach((token) => {
    console.log(token.toString())
})
```

The output of running this sample program is:

```
<type: id, value: "foo", text: "foo", pos: 0, line: 1, column: 1>
<type: char, value: "{", text: "{", pos: 4, line: 1, column: 5>
<type: id, value: "baz", text: "baz", pos: 10, line: 2, column: 5>
<type: char, value: "=", text: "=", pos: 14, line: 2, column: 9>
<type: number, value: 1, text: "1", pos: 16, line: 2, column: 11>
<type: id, value: "bar", text: "bar", pos: 40, line: 3, column: 5>
<type: char, value: "{", text: "{", pos: 44, line: 3, column: 9>
<type: id, value: "quux", text: "quux", pos: 54, line: 4, column: 9>
<type: char, value: "=", text: "=", pos: 59, line: 4, column: 14>
<type: number, value: 42, text: "42", pos: 61, line: 4, column: 16>
<type: id, value: "hello", text: "hello", pos: 72, line: 5, column: 9>
<type: char, value: "=", text: "=", pos: 78, line: 5, column: 15>
<type: string, value: "hello \"world\"!", text: "\"hello \\\"world\\\"!\"", pos: 80, line: 5, column: 17>
<type: char, value: "}", text: "}", pos: 103, line: 6, column: 5>
<type: id, value: "quux", text: "quux", pos: 109, line: 7, column: 5>
<type: char, value: "=", text: "=", pos: 114, line: 7, column: 10>
<type: number, value: 7, text: "7", pos: 116, line: 7, column: 12>
<type: char, value: "}", text: "}", pos: 118, line: 8, column: 1>
<type: EOF, value: "", text: "", pos: 122, line: 9, column: 1>
```

If you want to combine multiple single-char plaintext tokens into
a multi-char plaintext token, you can use the following code fragment:

```
let plaintext = ""
lexer.before((ctx, match, rule) => {
    if (rule.name !== "plaintext" && plaintext !== "") {
        ctx.accept("plaintext", plaintext)
        plaintext = ""
    }
})
lexer.rule(/./, (ctx, match) => {
    plaintext += match[0]
    ctx.ignore()
}, "plaintext")
lexer.finish((ctx) => {
    if (plaintext !== "")
        ctx.accept("plaintext", plaintext)
})
```

With the additional help of an Abstract Syntax Tree (AST) library like
[ASTy](https://github.com/rse/asty) and a query library like [ASTq](https://github.com/rse/astq)
you can [write powerful Recursive Descent based parsers](https://github.com/rse/parsing-techniques/blob/master/cfg2kv-3-ls-rdp-ast/cfg2kv.js)
which parse such a token stream into an AST and then query and process the AST.

Application Programming Interface (API)
---------------------------------------

### Class `Tokenizr`

This is the main API class for establishing a lexical scanner.

- Constructor: `Tokenizr(): Tokenizr`<br/>
  Create a new tokenization instance.

- Method: `Tokenizr#reset(): Tokenizr`<br/>
  Reset the tokenization instance to a fresh one by
  discarding all internal state information.

- Method: `Tokenizr#debug(enable: Boolean): Tokenizr`<br/>
  Enable (or disable) verbose logging for debugging purposes.

- Method: `Tokenizr#input(input: String): Tokenizr`<br/>
  Set the input string to tokenize.
  This implicitly performs a `reset()` operation beforehand.

- Method: `Tokenizr#push(state: String): Tokenizr`<br/>
  Push a state onto the state stack.

- Method: `Tokenizr#pop(): String`<br/>
  Pop a state from the state stack.
  The initial (aka first or lowest) stack value (`default`) cannot be popped.

- Method: `Tokenizr#state(state: String): Tokenizr`<br/>
  Method: `Tokenizr#state(): String`<br/>
  Set or get the state on the top of the state stack. Use this to
  initialy start tokenizing with a custom state. The initial state is
  named `default`.

- Method: `Tokenizr#tag(tag: String): Tokenizr`<br/>
  Set a tag. The tag has to be matched by rules.

- Method: `Tokenizr#tagged(tag: String): Boolean`<br/>
  Check whether a particular tag is set.

- Method: `Tokenizr#untag(tag: String): Tokenizr`<br/>
  Unset a particular tag. The tag no longer will be matched by rules.

- Method: `Tokenizr#before(action: (ctx: ActionContext, match: Array[String], rule: { state: String, pattern: RegExp, action: Function, name: String }) => Void): Tokenizr`<br/>
  Configure a single action which is called directly before any rule
  action (configured with `Tokenizr#rule()`) is called. This can be used
  to execute a common action just before all rule actions. The `rule`
  argument is the `Tokenizr#rule()` information of the particular rule
  which is executed.

- Method: `Tokenizr#after(action: (ctx: ActionContext, match: Array[String], rule: { state: String, pattern: RegExp, action: Function, name: String }) => Void): Tokenizr`<br/>
  Configure a single action which is called directly after any rule
  action (configured with `Tokenizr#rule()`) is called. This can be used
  to execute a common action just after all rule actions. The `rule`
  argument is the `Tokenizr#rule()` information of the particular rule
  which is executed.

- Method: `Tokenizr#finish(action: (ctx: ActionContext) => Void): Tokenizr`<br/>
  Configure a single action which is called directly before an `EOF`
  token is emitted. This can be used to execute a common action just
  after the last rule action was called.

- Method: `Tokenizr#rule(state?: String, pattern: RegExp, action: (ctx: ActionContext, match: Array[String]) => Void): Tokenizr`<br/>
  Configure a token matching rule which executes its `action` in case
  the current tokenization state is one of the states (and all of the
  currently set tags) in `state` (by default the rule matches all states
  if `state` is not specified) and the next input characters match
  against the `pattern`. The exact syntax of `state` is
  `<state>[ #<tag> #<tag> ...][, <state>[ #<tag> #<tag> ...], ...]`, i.e.,
  it is one or more comma-separated state matches (OR-combined) and each state
  match has exactly one state and zero or more space-separated tags
  (AND-combined). The `ctx` argument provides a context object for token
  repeating/rejecting/ignoring/accepting, the `match` argument is the
  result of the underlying `RegExp#exec` call.

- Method: `Tokenizr#token(): Tokenizr.Token`<br/>
  Get the next token from the input. Internally, the
  current position of the input is matched against the
  patterns of all rules (in rule configuration order). The first rule
  action which accepts the matching leads to the token.

- Method: `Tokenizr#tokens(): Array[Tokenizr.Token]`<br/>
  Tokenizes the entire input and returns all the corresponding tokens.
  This is a convenience method only. Usually one takes just single
  tokens at a time with `Tokenizr#token()`.

- Method: `Tokenizr#skip(next?: Number): Tokenizr`<br/>
  Get and discard the `next` number of following tokens with `Tokenizr#token()`.

- Method: `Tokenizr#consume(type: String, value?: String): Tokenizr`<br/>
  Match (with `Tokenizr.Token#isA`) the next token. If it matches
  `type` and optionally also `value`, consume it. If it does not match,
  throw a `Tokenizr.ParsingError`. This is the primary function used in
  Recursive Descent parsers.

- Method: `Tokenizr#peek(offset?: Number): Tokenizr.Token`<br/>
  Peek at the following token at the (0-based) offset without consuming
  the token. This is the secondary function used in Recursive Descent
  parsers.

- Method: `Tokenizr#begin(): Tokenizr`<br/>
  Begin a transaction. Until `Tokenizr#commit()` or
  `Tokenizr#rollback()` are called, all consumed tokens will
  be internally remembered and be either thrown away (on
  `Tokenizr#commit()`) or pushed back (on `Tokenizr#rollback()`). This
  can be used multiple times and this way supports nested transactions.
  It is intended to be used for tokenizing alternatives.

- Method: `Tokenizr#depth(): Number`<br/>
  Return the number of already consumed tokens in the currently
  active transaction. This is useful if multiple alternatives
  are parsed and in case all failed, to report the error for
  the most specific one, i.e., the one which consumed most tokens.

- Method: `Tokenizr#commit(): Tokenizr`<br/>
  End a transaction successfully. All consumed tokens are finally gone.

- Method: `Tokenizr#rollback(): Tokenizr`<br/>
  End a transaction unsuccessfully. All consumed tokens are pushed back
  and can be consumed again.

- Method: `Tokenizr#alternatives(...alternatives: Array[() => any]): any`<br/>
  Utility method for parsing alternatives. It internally executes the
  supplied callback functions in sequence, each wrapped into its own
  transaction. The first one which succeeds (does not throw an exception
  and returns a value) leads to the successful result. In case all
  alternatives failed (all throw an exception), the exception of the
  most-specific alterative (the one with the largest transaction depth)
  is re-thrown. The `this` in each callback function points to the
  `Tokenizr` object on which `alternatives` was called.

- Method: `Tokenizr#error(message: String): Tokenizr.ParsingError`<br/>
  Returns a new instance of `Tokenizr.ParsingError`, based
  on the current input character stream position, and with
  `Tokenizr.ParsingError#message` set to `message`.

### Class `Tokenizr.Token`

This is the class of all returned tokens.

- Property: `Tokenizr.Token#type: String`<br/>
  The type of the token as specified on `Tokenizr.ActionContext#accept()`.

- Property: `Tokenizr.Token#value: any`<br/>
  The value of the token. By default this is the same as
  `Tokenizr.Token#text`, but can be any pre-processed value
  as specified on `Tokenizr.ActionContext#accept()`.

- Property: `Tokenizr.Token#text: String`<br/>
  The corresponding input text of this token.

- Property: `Tokenizr.Token#pos: Number`<br/>
  The (0-based) position in the input.

- Property: `Tokenizr.Token#line: Number`<br/>
  The (1-based) line number in the input.

- Property: `Tokenizr.Token#column: Number`<br/>
  The (1-based) column number in the input.

- Method: `Tokenizr.Token#toString(): String`<br/>
  Returns a formatted representation of the token,
  usually for debugging or tracing purposes only.

- Method: `Tokenizr.Token#isA(type: String, value?: any): String`<br/>
  Checks whether token matches against a particular `type` and optionally
  a particular `value`. This is especially used internally by
  `Tokenizr#consume()`.

### Class `Tokenizr.ParsingError`

This is the class of all thrown exceptions related to parsing.

- Property: `Tokenizr.ParsingError#name: String`<br/>
  Always just the string `ParsingError` to be complaint to
  the JavaScript `Error` class specification.

- Property: `Tokenizr.ParsingError#message: String`<br/>
  The particular error message.

- Property: `Tokenizr.ParsingError#pos: Number`<br/>
  The (0-based) position in the input.

- Property: `Tokenizr.ParsingError#line: Number`<br/>
  The (1-based) line number in the input.

- Property: `Tokenizr.ParsingError#column: Number`<br/>
  The (1-based) column number in the input.

- Property: `Tokenizr.ParsingError#input: String`<br/>
  The total input itself.

- Method: `Tokenizr.ParsingError#toString(): String`<br/>
  Returns a formatted representation of the error,
  usually for convenient error displaying purposes.

### Class `Tokenizr.ActionContext`

This is the class of all rule action contexts.

- Method: `Tokenizr.ActionContext#data(key: String, value?: any): any`<br/>
  Store or retrieve any user data (indexed by `key`) to the action
  context for sharing data between two or more rules.

- Method: `Tokenizr.ActionContext#info(): { line: number, column: number, pos: number, len: number }`<br/>
  Retrieve information about the current matching.

- Method: `Tokenizr.ActionContext#push(state: String): Tokenizr`<br/>
  Method: `Tokenizr.ActionContext#pop(): String`<br/>
  Method: `Tokenizr.ActionContext#state(state: String): Tokenizr.ActionContext`<br/>
  Method: `Tokenizr.ActionContext#state(): String`<br/>
  Method: `Tokenizr.ActionContext#tag(tag: String): Tokenizr.ActionContext`<br/>
  Method: `Tokenizr.ActionContext#tagged(tag: String): Boolean`<br/>
  Method: `Tokenizr.ActionContext#untag(tag: String): Tokenizr.ActionContext`<br/>
  Methods just passed-through to the attached `Tokenizr` object. See above for details.

- Method: `Tokenizr.ActionContext#repeat(): Tokenizr.ActionContext`<br/>
  Mark the tokenization process to repeat the matching at the current
  input position from scratch. You first have to switch to a different
  state with `Tokenizr.ActionContext#state()` or this will lead to an endless loop, of course!

- Method: `Tokenizr.ActionContext#reject(): Tokenizr.ActionContext`<br/>
  Mark the current matching to be rejected. The tokenization process
  will continue matching following rules.

- Method: `Tokenizr.ActionContext#ignore(): Tokenizr.ActionContext`<br/>
  Mark the current matching to be just ignored. This is usually
  used for skipping whitespaces.

- Method: `Tokenizr.ActionContext#accept(type: String, value?: any): Tokenizr.ActionContext`<br/>
  Accept the current matching and produce a token of `type` and
  optionally with a different `value` (usually a pre-processed variant
  of the matched text). This function can be called multiple times to
  produce one or more distinct tokens in sequence.

- Method: `Tokenizr.ActionContext#stop(): Tokenizr.ActionContext`<br/>
  Immediately stop entire tokenization. After this the
  `Tokenizr#token()` method immediately starts to return `null`.

RegExp Flag Support
-------------------

The `pattern` passed to `Tokenizr.{before,after,rule}()` has to be a
regular JavaScript `RegExp` objects. Internally, Tokenizr creates a copy
of this object by skipping its `g` (global) and `y` (sticky) flags and
taking over its `m` (multiline), `s` (dotAll), `i` (ignoreCase), and `u`
(unicode) flags.

Implementation Notice
---------------------

Although Tokenizr is written in ECMAScript 6, it is transpiled to
ECMAScript 5 and this way runs in really all(!) current (as of 2015)
JavaScript environments, of course.

Internally, Tokenizr scans the input string in a read-only fashion
by leveraging `RegExp`'s `g` flag (global, for ECMAScript <= 5
environments) or `y` flag (sticky, for ECMAScript >= 2015 environments)
in combination with `RegExp`'s `lastIndex` field.

Alternatives
------------

The following alternatives are known:

- [moo](https://github.com/no-context/moo):
  A very powerful tokenizer/lexer. It provides nearly the same
  functionality than Tokenizr. In addition, it compiles all regular
  expressions into a single one and hence is one of the fastest
  tokenizers/lexers.

- [flex-js](https://github.com/sormy/flex-js)
  A medium powerful tokenizer/lexer. It provides nearly the same
  functionality than Tokenizr.

- [lex](https://github.com/aaditmshah/lexer):
  A tokenizer/lexer, modeled after the popular C solution Flex. This
  small library is similar in spirit, but not as flexible as it does not
  provide state supports.

License
-------

Copyright (c) 2015-2018 Ralf S. Engelschall (http://engelschall.com/)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

