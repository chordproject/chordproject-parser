/**
 * Represents a parser warning, currently only used by ChordProParser.
 */
export class ParserWarning {
    /**
     * The warning message
     * @member
     * @type {string}
     */
    private _message: string;

    /**
     * The chord sheet line number on which the warning occurred
     */
    private _lineNumber: number;

    /**
     * Stable identifier (see WarningCode) for consumers that want to render their own
     * translated message instead of the English _message.
     */
    private _code: string;

    /** Values to interpolate into a translated message template for _code, if any. */
    private _params: Record<string, string>;

    constructor(message: string, lineNumber: number, code: string = "", params: Record<string, string> = {}) {
        this._message = message;
        this._lineNumber = lineNumber;
        this._code = code;
        this._params = params;
    }

    public get message(): string {
        return this._message;
    }

    public get lineNumber(): number {
        return this._lineNumber;
    }

    public get code(): string {
        return this._code;
    }

    public get params(): Record<string, string> {
        return this._params;
    }

    /**
     * Returns a stringified version of the warning
     */
    public toString(): string {
        return `Warning: ${this._message} on line ${this._lineNumber}`;
    }
}
