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

/*  utility function: create a source excerpt  */
const excerpt = (txt, o) => {
    var l = txt.length;
    var b = o - 20; if (b < 0) b = 0;
    var e = o + 20; if (e > l) e = l;
    var hex = function (ch) {
        return ch.charCodeAt(0).toString(16).toUpperCase();
    };
    var extract = function (txt, pos, len) {
        return txt.substr(pos, len)
            .replace(/\\/g,   "\\\\")
            .replace(/\x08/g, "\\b")
            .replace(/\t/g,   "\\t")
            .replace(/\n/g,   "\\n")
            .replace(/\f/g,   "\\f")
            .replace(/\r/g,   "\\r")
            .replace(/[\x00-\x07\x0B\x0E\x0F]/g, function(ch) { return "\\x0" + hex(ch); })
            .replace(/[\x10-\x1F\x80-\xFF]/g,    function(ch) { return "\\x"  + hex(ch); })
            .replace(/[\u0100-\u0FFF]/g,         function(ch) { return "\\u0" + hex(ch); })
            .replace(/[\u1000-\uFFFF]/g,         function(ch) { return "\\u"  + hex(ch); });
    }
    return {
        prologTrunc: b > 0,
        prologText:  extract(txt, b, o - b),
        tokenText:   extract(txt, o, 1),
        epilogText:  extract(txt, o + 1, e - (o + 1)),
        epilogTrunc: e < l
    }
}

export default excerpt

