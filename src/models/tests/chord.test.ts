import { Chord } from "../Chord";
import { Key, KeyMode } from "../Key";
import { MusicAccidental, MusicLetter, MusicNote } from "../MusicNote";

test.each`
    chord  | expected
    ${"A"} | ${new Chord(new Key(new MusicNote(MusicLetter.A), KeyMode.Major))}
    ${"B"} | ${new Chord(new Key(new MusicNote(MusicLetter.B), KeyMode.Major))}
    ${"C"} | ${new Chord(new Key(new MusicNote(MusicLetter.C), KeyMode.Major))}
    ${"D"} | ${new Chord(new Key(new MusicNote(MusicLetter.D), KeyMode.Major))}
    ${"E"} | ${new Chord(new Key(new MusicNote(MusicLetter.E), KeyMode.Major))}
    ${"F"} | ${new Chord(new Key(new MusicNote(MusicLetter.F), KeyMode.Major))}
    ${"G"} | ${new Chord(new Key(new MusicNote(MusicLetter.G), KeyMode.Major))}
`("parse the simple chord $chord and return the right chord", ({ chord, expected }) => {
    const resultKey = Chord.parse(chord);
    expect(resultKey).toMatchObject(expected);
});

test.each`
    chord    | letter           | accidental
    ${"A#"}  | ${MusicLetter.A} | ${MusicAccidental["#"]}
    ${"Bb"}  | ${MusicLetter.B} | ${MusicAccidental.b}
    ${"C"}   | ${MusicLetter.C} | ${MusicAccidental.none}
    ${"D#"}  | ${MusicLetter.D} | ${MusicAccidental["#"]}
    ${"Eb"}  | ${MusicLetter.E} | ${MusicAccidental.b}
    ${"F##"} | ${MusicLetter.F} | ${MusicAccidental["##"]}
    ${" G "} | ${MusicLetter.G} | ${MusicAccidental.none}
`("parse the simple chord $chord with accidental and return the right chord", ({ chord, letter, accidental }) => {
    const expected = new Chord(new Key(new MusicNote(letter, accidental), KeyMode.Major));
    const resultKey = Chord.parse(chord);
    expect(resultKey).toMatchObject<Chord>(expected);
});

test.each`
    chord         | letter           | accidental              | type
    ${"A#sus4"}   | ${MusicLetter.A} | ${MusicAccidental["#"]} | ${"sus4"}
    ${"Bb7"}      | ${MusicLetter.B} | ${MusicAccidental.b}    | ${"7"}
    ${"Cdim"}     | ${MusicLetter.C} | ${MusicAccidental.none} | ${"dim"}
    ${"D#M7"}     | ${MusicLetter.D} | ${MusicAccidental["#"]} | ${"M7"}
    ${"Eb"}       | ${MusicLetter.E} | ${MusicAccidental.b}    | ${""}
    ${" Gbsus2 "} | ${MusicLetter.G} | ${MusicAccidental.b}    | ${"sus2"}
`("parse the chord $chord and return the right chord", ({ chord, letter, accidental, type }) => {
    const expected = new Chord(new Key(new MusicNote(letter, accidental), KeyMode.Major), type);
    const resultKey = Chord.parse(chord);
    expect(resultKey).toMatchObject<Chord>(expected);
});

test("parse the chord with a bass and return the right chord", () => {
    const expected = new Chord(new Key(new MusicNote(MusicLetter.A, MusicAccidental.b), KeyMode.Major), "sus2sus4", new MusicNote(MusicLetter.C));
    const chord = Chord.parse("Absus2sus4/C");
    expect(chord).toMatchObject(expected);
});

test.each`
    chord
    ${"A/Bsus2"}
    ${"a"}
    ${"B/#C"}
`("parse the chord $chord should fail", ({ chord, letter, accidental, type }) => {
    const expected = new Chord(new Key(new MusicNote(letter, accidental), KeyMode.Major), type);
    const resultKey = Chord.parse(chord);
    expect(resultKey).toBeUndefined();
});

test.each`
    chord
    ${"A"}
    ${"Am"}
    ${"B#"}
    ${"C/E"}
    ${"Db/Ab"}
    ${"Esus2"}
    ${"Fsus2/C"}
`("return the chord $chord as text", ({ chord }) => {
    const result = Chord.parse(chord)?.toString();
    expect(result).toEqual(chord);
});

test.each`
    chord     | expectedMode
    ${"Am"}   | ${KeyMode.Minor}
    ${"Ami"}  | ${KeyMode.Minor}
    ${"Amin"} | ${KeyMode.Minor}
    ${"A-"}   | ${KeyMode.Minor}
`("parse minor chord alias $chord", ({ chord, expectedMode }) => {
    const result = Chord.parse(chord);
    expect(result?.key.mode).toBe(expectedMode);
    expect(result?.type).toBe("");
});

test("get key return the key", () => {
    const expectedNote = new Key(new MusicNote(MusicLetter.A, MusicAccidental.b));
    const chord = new Chord(expectedNote);
    expect(chord.key).toEqual(expectedNote);
});

test("get type return the type", () => {
    const expectedNote = new Key(new MusicNote(MusicLetter.A, MusicAccidental.b));
    const expectedType = "maj7";
    const chord = new Chord(expectedNote, expectedType);
    expect(chord.type).toEqual(expectedType);
});

test("get bass return the bass", () => {
    const expectedNote = new Key(new MusicNote(MusicLetter.A, MusicAccidental.b));
    const expectedBass = new MusicNote(MusicLetter.C, MusicAccidental.none);
    const chord = new Chord(expectedNote, "", expectedBass);
    expect(chord.bass).toEqual(expectedBass);
});

test("parse empty chord should fail", () => {
    const result = Chord.parse("");
    expect(result).toBeUndefined();
});

test("chord equality with two defined chords", () => {
    const chordString = "Absus4";
    const chord = Chord.parse(chordString)!;
    const expected = Chord.parse(chordString);
    expect(chord.equals(expected)).toBeTruthy();
});

test("chord equality with one undefined chord", () => {
    const chord = Chord.parse("Absus4")!;
    const expected = undefined;
    expect(chord.equals(expected)).toBeFalsy();
});

test("chord equality with two different chords", () => {
    const chord = Chord.parse("A")!;
    const expected = Chord.parse("B")!;
    expect(chord.equals(expected)).toBeFalsy();
});
