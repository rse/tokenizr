//in real life =>  import Tokenizr from "./src/tokenizrBasic";

//for now
const Tokenizr = require("./dist/main-bundle").default;

function compactGraphQLQuery (query) {
  let lexer = new Tokenizr()

  /*  configure lexical analysis  */
  lexer.rule(/#[^\r\n]*(?=\r?\n)/,                       (ctx, match) => { ctx.accept("comment") })
  lexer.rule(/"(?:\\"|[^\r\n]+)*"/,                      (ctx, match) => { ctx.accept("string") })
  lexer.rule(/$[a-zA-Z_][a-zA-Z0-9_]*/,                  (ctx, match) => { ctx.accept("var") })
  lexer.rule(/[a-zA-Z_][a-zA-Z0-9_]*/,                   (ctx, match) => { ctx.accept("id") })
  lexer.rule(/[+-]?[0-9]*\.?[0-9]+(?:[eE][+-]?[0-9]+)?/, (ctx, match) => { ctx.accept("number") })
  lexer.rule(/[ \t\r\n]+/,                               (ctx, match) => { ctx.accept("ws", " ") })
  lexer.rule(/[{}]/,                                     (ctx, match) => { ctx.accept("brace") })
  lexer.rule(/[[\]]/,                                    (ctx, match) => { ctx.accept("bracket") })
  lexer.rule(/[()]/,                                     (ctx, match) => { ctx.accept("parenthesis") })
  lexer.rule(/,/,                                        (ctx, match) => { ctx.accept("comma") })
  lexer.rule(/!/,                                        (ctx, match) => { ctx.accept("not") })
  lexer.rule(/\.\.\./,                                   (ctx, match) => { ctx.accept("ellipsis") })
  lexer.rule(/@/,                                        (ctx, match) => { ctx.accept("at") })
  lexer.rule(/:/,                                        (ctx, match) => { ctx.accept("colon") })
  lexer.rule(/./,                                        (ctx, match) => { ctx.accept("any") })
  lexer.input(query)

  /*  fetch all parsed tokens  */
  let tokens = lexer.tokens()

  /*  remove whitespace tokens at harmless positions  */
  let output = ""
  let re = /^(?:brace|bracket|parenthesis|comma|colon)$/
  for (let i = 0; i < tokens.length; i++) {
      if (   tokens[i].type === "comment"
          || (   tokens[i].type === "ws"
              && (   (   i < tokens.length - 1
                      && tokens[i + 1].type.match(re))
                  || (    i > 0
                      && tokens[i - 1].type.match(re))))) {
          tokens.splice(i, 1)
          i--
      }
  }

  /*  assembly and return new query string  */
  tokens.forEach((token) => {
      output += token.value
  })
  return output
}

let gql = `

query readAllBooks ($id: id) {
  allBooks(id: $id) {
    title
  }
}


`;

console.log(gql);
console.log(compactGraphQLQuery(gql)); //works!