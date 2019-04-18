export class ParsingError {
  /**
   * Always just the string ParsingError to be complaint to the JavaScript Error class specification.
   */
  name: string;

  /**
   * The particular error message.
   */
  message: string;

  /**
   * The (0-based) position in the variables.
   */
  pos: number;

  /**
   * The (1-based) line number in the variables.
   */
  line: number;

  /**
   * The (1-based) column number in the variables.
   */
  column: number;

  /**
   * The total variables itself.
   */
  input: string;

  /**
   * Returns a formatted representation of the error, usually for convenient error displaying purposes.
   */
  toString(): string;
}

export class Token {
  /**
   * The type of the token as specified on Tokenizr.ActionContext#accept().
   */
  type: string;

  /**
   * The value of the token. By default this is the same as Tokenizr.Token#text, but can be any pre-processed value as specified on Tokenizr.ActionContext#accept().
   */
  value: any;

  /**
   * The corresponding variables text of this token.
   */
  text: string;

  /**
   * The (0-based) position in the variables.
   */
  pos: number;

  /**
   * The (1-based) line number in the variables.
   */
  line: number;

  /**
   * The (1-based) column number in the variables.
   */
  column: number;

  /**
   * Returns a formatted representation of the token, usually for debugging or tracing purposes only.
   */
  toString(): string;

  /**
   * Checks whether token matches against a particular type and optionally a particular value. This is especially used internally by Tokenizr#consume().
   *
   * @param type
   * @param value
   */
  isA(type: string, value?: any): boolean;
}

export interface Info {
  line: number;
  column: number;
  pos: number;
  len: number;
}

export class ActionContext {
  /**
   * Store or retrieve any user data (indexed by key) to the action context for sharing data between two or more rules.
   *
   * @param key
   * @param value
   */
  data(key: string, value?: any): any;

  /**
   * Retrieve information about the current matching.
   */
  info(): Info;

  /**
   * Push a state onto the state stack.
   *
   * @param state
   */
  push(state: string): Tokenizr;

  /**
   * Pop a state from the state stack. The initial (aka first or lowest) stack value (default) cannot be popped.
   */
  pop(): string;

  /**
   * Set or get the state on the top of the state stack.
   * Use this to initially start tokenizing with a custom state. The initial state is named default.
   *
   * @param state
   */
  state(state: string): this;
  state(): string;

  /**
   * Methods just passed-through to the attached Tokenizr object. See above for details.
   *
   * @param tag
   */
  tag(tag: string): this;

  /**
   * Methods just passed-through to the attached Tokenizr object. See above for details.
   *
   * @param tag
   */
  tagged(tag: string): boolean;

  /**
   * Methods just passed-through to the attached Tokenizr object. See above for details.
   *
   * @param tag
   */
  untag(tag: string): this;

  /**
   * Mark the tokenization process to repeat the matching at the current variables position from scratch. You first have to switch to a different state with Tokenizr.ActionContext#state() or this will lead to an endless loop, of course!
   */
  repeat(): this;

  /**
   * Mark the current matching to be rejected. The tokenization process will continue matching following rules.
   */
  reject(): this;

  /**
   * Mark the current matching to be just ignored. This is usually used for skipping whitespaces.
   */
  ignore(): this;

  /**
   * Accept the current matching and produce a token of type and optionally with a different value (usually a pre-processed variant of the matched text). This function can be called multiple times to produce one or more distinct tokens in sequence.
   *
   * @param type
   * @param value
   */
  accept(type: string, value?: any): this;

  /**
   * Immediately stop entire tokenization. After this the Tokenizr#token() method immediately starts to return null.
   */
  stop(): this;
}

export default class Tokenizr {
  constructor();

  /**
   * Reset the tokenization instance to a fresh one by discarding all internal state information.
   */
  reset(): void;

  /**
   * Enable (or disable) verbose logging for debugging purposes.
   *
   * @param debug
   */
  debug(debug: boolean): this;

  /**
   * Enable (or disable) verbose logging for debugging purposes.
   * Set the variables string to tokenize. This implicitly performs a reset() operation beforehand.
   *
   * @param input
   */
  input(input: string): this;

  /**
   * Push a state onto the state stack.
   *
   * @param state
   */
  push(state: string): this;

  /**
   * Pop a state from the state stack. The initial (aka first or lowest) stack value (default) cannot be popped.
   */
  pop(): string;

  /**
   * Set or get the state on the top of the state stack.
   * Use this to initially start tokenizing with a custom state. The initial state is named default.
   *
   * @param state
   */
  state(state: string): ActionContext;
  state(): string;

  /**
   * Set a tag. The tag has to be matched by rules.
   *
   * @param tag
   */
  tag(tag: string): this;

  /**
   * Check whether a particular tag is set.
   *
   * @param tag
   */
  tagged(tag: string): boolean;

  /**
   * Unset a particular tag. The tag no longer will be matched by rules.
   *
   * @param tag
   */
  untag(tag: string): this;

  /**
   * Configure a single action which is called directly before any rule action (configured with Tokenizr#rule()) is called. This can be used to execute a common action just before all rule actions. The rule argument is the Tokenizr#rule() information of the particular rule which is executed.
   *
   * @param action
   */
  before(
    action: (
      ctx: ActionContext,
      match: string[],
      rule: {
        state: string;
        pattern: RegExp;
        action: () => void;
        name: string;
      },
    ) => void,
  ): this;

  /**
   * Configure a single action which is called directly after any rule action (configured with Tokenizr#rule()) is called. This can be used to execute a common action just after all rule actions. The rule argument is the Tokenizr#rule() information of the particular rule which is executed.
   *
   * @param action
   */
  after(
    action: (
      ctx: ActionContext,
      match: string[],
      rule: {
        state: string;
        pattern: RegExp;
        action: () => void;
        name: string;
      },
    ) => void,
  ): this;

  /**
   * Configure a single action which is called directly before an EOF token is emitted. This can be used to execute a common action just after the last rule action was called.
   *
   * @param action
   */
  finish(action: (ctx: ActionContext) => void): this;

  /**
   * Configure a token matching rule which executes its action in case the current tokenization state is one of the states (and all of the currently set tags) in state (by default the rule matches all states if state is not specified) and the next variables characters match against the pattern. The exact syntax of state is <state>[ #<tag> #<tag> ...][, <state>[ #<tag> #<tag> ...], ...], i.e., it is one or more comma-separated state matches (OR-combined) and each state match has exactly one state and zero or more space-separated tags (AND-combined). The ctx argument provides a context object for token repeating/rejecting/ignoring/accepting, the match argument is the result of the underlying RegExp#exec call.
   *
   * @param state
   * @param pattern
   * @param action
   */
  rule(
    state: string,
    pattern: RegExp,
    action: (ctx: ActionContext, match: string[]) => void,
  ): this;

  /**
   * Configure a token matching rule which executes its action in case the current tokenization state is one of the states (and all of the currently set tags) in state (by default the rule matches all states if state is not specified) and the next variables characters match against the pattern. The exact syntax of state is <state>[ #<tag> #<tag> ...][, <state>[ #<tag> #<tag> ...], ...], i.e., it is one or more comma-separated state matches (OR-combined) and each state match has exactly one state and zero or more space-separated tags (AND-combined). The ctx argument provides a context object for token repeating/rejecting/ignoring/accepting, the match argument is the result of the underlying RegExp#exec call.
   *
   * @param pattern
   * @param action
   */
  rule(
    pattern: RegExp,
    action: (ctx: ActionContext, match: string[]) => void,
  ): this;

  /**
   * Get the next token from the variables. Internally, the current position of the variables is matched against the patterns of all rules (in rule configuration order). The first rule action which accepts the matching leads to the token.
   */
  token(): Token;

  /**
   * Tokenizes the entire variables and returns all the corresponding tokens. This is a convenience method only. Usually one takes just single tokens at a time with Tokenizr#token().
   */
  tokens(): Token[];

  /**
   * Get and discard the next number of following tokens with Tokenizr#token().
   *
   * @param next
   */
  skip(next?: number): this;

  /**
   * Match (with Tokenizr.Token#isA) the next token. If it matches type and optionally also value, consume it. If it does not match, throw a Tokenizr.ParsingError. This is the primary function used in Recursive Descent parsers.
   *
   * @param type
   * @param value
   */
  consume(type: string, value?: string): Token;

  /**
   * Peek at the following token at the (0-based) offset without consuming the token. This is the secondary function used in Recursive Descent parsers.
   *
   * @param offset
   */
  peek(offset?: number): Token;

  /**
   * Begin a transaction. Until Tokenizr#commit() or Tokenizr#rollback() are called, all consumed tokens will be internally remembered and be either thrown away (on Tokenizr#commit()) or pushed back (on Tokenizr#rollback()). This can be used multiple times and this way supports nested transactions. It is intended to be used for tokenizing alternatives.
   */
  begin(): this;

  /**
   * Return the number of already consumed tokens in the currently active transaction. This is useful if multiple alternatives are parsed and in case all failed, to report the error for the most specific one, i.e., the one which consumed most tokens.
   */
  depth(): number;

  /**
   * End a transaction successfully. All consumed tokens are finally gone.
   */
  commit(): this;

  /**
   * End a transaction unsuccessfully. All consumed tokens are pushed back and can be consumed again.
   */
  rollback(): this;

  /**
   * Utility method for parsing alternatives. It internally executes the supplied callback functions in sequence, each wrapped into its own transaction. The first one which succeeds (does not throw an exception and returns a value) leads to the successful result. In case all alternatives failed (all throw an exception), the exception of the most-specific alterative (the one with the largest transaction depth) is re-thrown. The this in each callback function points to the Tokenizr object on which alternatives was called.
   *
   * @param alternatives
   */
  alternatives(...alternatives: Array<() => any>): any;

  /**
   * Returns a new instance of Tokenizr.ParsingError, based on the current variables character stream position, and with Tokenizr.ParsingError#message set to message.
   *
   * @param message
   */
  error(message: string): ParsingError;
}
