import { ParserWarning } from "../../parsers/ParserWarning";

test("get the string value of the warning", () => {
    const message = "unexpected error";
    const lineNumber = 10;
    const warning = new ParserWarning(message, lineNumber);
    const expected = "Warning: unexpected error on line 10";
    expect(warning.toString()).toEqual(expected);
});

test("exposes message and lineNumber", () => {
    const warning = new ParserWarning("unexpected error", 10);
    expect(warning.message).toEqual("unexpected error");
    expect(warning.lineNumber).toEqual(10);
});

test("exposes code and params, defaulting to empty when not provided", () => {
    const withCode = new ParserWarning("Cannot parse the chord 'X'", 3, "chord_parse_error", { chord: "X" });
    expect(withCode.code).toEqual("chord_parse_error");
    expect(withCode.params).toEqual({ chord: "X" });

    const withoutCode = new ParserWarning("unexpected error", 10);
    expect(withoutCode.code).toEqual("");
    expect(withoutCode.params).toEqual({});
});

