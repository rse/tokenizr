
Tokenizr
========

String Tokenization

<p/>
<img src="https://nodei.co/npm/tokenizr.png?downloads=true&stars=true" alt=""/>

<p/>
<img src="https://david-dm.org/rse/tokenizr.png" alt=""/>

About
-----

Tokenizr is a small JavaScript library, providing...

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

- `new Tokenizr(): Tokenizr`<br/>
  Create a new tokenizter instance.

- `Tokenizr#input(input: String): Tokenizr`<br/>
  Set the input string to tokenize.

- `Tokenizr#rule(state?: String, pattern: RegExp, action: (match: Array[String]) => Void): Void`<br/>
  Configure a token matching rule.

- `Tokenizr#token(): Token`<br/>
  Get next token.

Implementation Notice
---------------------

Although Tokenizr is written in ECMAScript 6, it is transpiled to ECMAScript
5 and this way runs in really all(!) current (as of 2015) JavaScript
environments, of course.

Internally, Tokenizr scans the input string in a read-only fashion
by leveraging `RegExp`'s `g` (global) flag in combination with the
`lastIndex` field, the best one can do on ECMAScript 5 runtime.
For ECMAScript 6 runtimes we will switch to `RegExp`'s new `y` (sticky)
flag in the future as it is even more efficient.

License
-------

Copyright (c) 2015 Ralf S. Engelschall (http://engelschall.com/)

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

