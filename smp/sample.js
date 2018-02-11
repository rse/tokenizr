import path     from "path"
import fs       from "fs"
import Tokenizr from ".."

let lexer = new Tokenizr()

lexer.rule(/[a-zA-Z_][a-zA-Z0-9_]*/, (ctx, match) => {
    ctx.accept("id")
})
lexer.rule(/[+-]?[0-9]+/, (ctx, match) => {
    ctx.accept("number", parseInt(match[0]))
})
lexer.rule(/"((?:\\\"|[^\r\n])*)"/, (ctx, match) => {
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

let cfg = fs.readFileSync(path.join(__dirname, "sample.cfg"), "utf8")

lexer.input(cfg)
lexer.debug(false)
lexer.tokens().forEach((token) => {
    console.log(token.toString())
})
