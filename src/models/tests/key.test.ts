import { Key, KeyMode } from "../Key";
import { MusicLetter, MusicNote, MusicAccidental } from "../MusicNote";

test.each`
    key    | expected
    ${"A"} | ${MusicLetter.A}
    ${"B"} | ${MusicLetter.B}
    ${"C"} | ${MusicLetter.C}
    ${"D"} | ${MusicLetter.D}
    ${"E"} | ${MusicLetter.E}
    ${"F"} | ${MusicLetter.F}
    ${"G"} | ${MusicLetter.G}
`("parse the simple key $key and return the correct key", ({ key, expected }) => {
    const expectedKey = new Key(new MusicNote(expected), KeyMode.Major);
    const resultKey = Key.parse(key);
    expect(resultKey).toMatchObject(expectedKey);
});

test.each`
    key     | expected
    ${"Ab"} | ${MusicLetter.A}
    ${"Bb"} | ${MusicLetter.B}
    ${"Cb"} | ${MusicLetter.C}
    ${"Db"} | ${MusicLetter.D}
    ${"Eb"} | ${MusicLetter.E}
    ${"Fb"} | ${MusicLetter.F}
    ${"Gb"} | ${MusicLetter.G}
`("parse the bemol key $key and return the correct key", ({ key, expected }) => {
    const expectedKey = new Key(new MusicNote(expected, MusicAccidental.b), KeyMode.Major);
    const resultKey = Key.parse(key);
    expect(resultKey).toMatchObject(expectedKey);
});

test.each`
    key       | expected
    ${"A#"}   | ${MusicLetter.A}
    ${"B#"}   | ${MusicLetter.B}
    ${"C#"}   | ${MusicLetter.C}
    ${"D#"}   | ${MusicLetter.D}
    ${"E#"}   | ${MusicLetter.E}
    ${"F#"}   | ${MusicLetter.F}
    ${" G# "} | ${MusicLetter.G}
`("parse the sharp key $key and return the correct key", ({ key, expected }) => {
    const expectedKey = new Key(new MusicNote(expected, MusicAccidental["#"]), KeyMode.Major);
    const resultKey = Key.parse(key);
    expect(resultKey).toMatchObject(expectedKey);
});

test.each`
    key        | expected
    ${"a#"}
    ${"H"}
    ${"Asus4"}
    ${"E###"}
`("parse the key $key should fail", ({ key }) => {
    const resultKey = Key.parse(key);
    expect(resultKey).toBeUndefined();
});

test.each`
    key          | expectedNote | expectedMode
    ${"Am"}     | ${MusicLetter.A} | ${KeyMode.Minor}
    ${"Amin"}   | ${MusicLetter.A} | ${KeyMode.Minor}
    ${"A-"}     | ${MusicLetter.A} | ${KeyMode.Minor}
    ${"Cmaj"}   | ${MusicLetter.C} | ${KeyMode.Major}
    ${"Cmajor"} | ${MusicLetter.C} | ${KeyMode.Major}
`("parse key aliases $key", ({ key, expectedNote, expectedMode }) => {
    const resultKey = Key.parse(key);
    expect(resultKey).toBeDefined();
    expect(resultKey?.note.letter).toBe(expectedNote);
    expect(resultKey?.mode).toBe(expectedMode);
});

describe("return the key as text", () => {
    it("minor key", () => {
        const key = new Key(new MusicNote(MusicLetter.A, MusicAccidental.b), KeyMode.Minor);
        const keyString = key.toString();
        expect(keyString).toEqual("Abm");
    });
    it("major key", () => {
        const key = new Key(new MusicNote(MusicLetter.A, MusicAccidental["#"]), KeyMode.Major);
        const keyString = key.toString();
        expect(keyString).toEqual("A#");
    });
});

test("get note should return the key note", () => {
    const expectedNote = new MusicNote(MusicLetter.A, MusicAccidental.b);
    const key = new Key(expectedNote, KeyMode.Major);
    expect(key.note).toEqual(expectedNote);
});

test("get mode should return the key mode", () => {
    const expectedNote = new MusicNote(MusicLetter.A, MusicAccidental.b);
    const expectedMode = KeyMode.Major;
    const key = new Key(expectedNote, expectedMode);
    expect(key.mode).toEqual(expectedMode);
});

test("parse empty key should fail", () => {
    const result = Key.parse("");
    expect(result).toBeUndefined();
});
