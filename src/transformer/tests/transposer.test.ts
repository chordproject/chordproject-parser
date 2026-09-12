import { ChordProParser } from "../../parsers";
import { Transposer } from "../Transposer";

function transposeText(sheet: string, direction: "up" | "down", steps = 1) {
    const parser = new ChordProParser();
    let song = parser.parse(sheet);
    for (let i = 0; i < steps; i++) {
        song = Transposer.transpose(song, direction);
    }
    return song;
}

test("transpose up moves every chord and the key by one semitone", () => {
    const song = transposeText(
        `{key: C}\n[C]Hello [F]world [G]again\n`,
        "up"
    );
    expect(song.key?.toString()).toBe("C#");
    const chords = song.getAllChords().map((c) => c.toString());
    // The new key (C#) is sharp, so chords are spelled with sharps to match it.
    expect(chords).toEqual(["C#", "F#", "G#"]);
});

test("transpose down moves every chord and the key by one semitone", () => {
    const song = transposeText(
        `{key: C}\n[C]Hello [F]world [G]again\n`,
        "down"
    );
    expect(song.key?.toString()).toBe("B");
    const chords = song.getAllChords().map((c) => c.toString());
    expect(chords).toEqual(["B", "E", "F#"]);
});

test.each`
    alias
    ${"Am"}
    ${"Ami"}
    ${"Amin"}
    ${"A-"}
`("transposing a minor chord written as $alias keeps the minor quality untouched", ({ alias }) => {
    const song = transposeText(`{key: C}\n[${alias}]Hello\n`, "up");
    const chord = song.getAllChords()[0];
    expect(chord.key.mode).toBe(1); // KeyMode.Minor
    // NOTE: Key.toString() always renders minor as a trailing "m", regardless of whether the
    // original text used "mi"/"min"/"-" - the Song/Chord model doesn't remember the original
    // alias spelling. That's fine for the reader/formatter (which always renders through this
    // model), but it's exactly why the editor's own transpose command (Phase 4b) must rewrite
    // chords directly in the raw text - reusing only the note-transposition math from
    // MusicTheoryHelper - instead of round-tripping through Song/Chord, which would silently
    // normalize the user's original spelling.
    expect(chord.toString()).toBe("A#m");
});

test("transposing twelve semitones up returns to the original key and chords", () => {
    const song = transposeText(`{key: C}\n[C]Hello [Am]world [F]again [G]!\n`, "up", 12);
    expect(song.key?.toString()).toBe("C");
    expect(song.getAllChords().map((c) => c.toString())).toEqual(["C", "Am", "F", "G"]);
});

test("transposing does not mutate the original song", () => {
    const parser = new ChordProParser();
    const song = parser.parse(`{key: C}\n[C]Hello\n`);
    const original = song.getAllChords()[0].toString();
    Transposer.transpose(song, "up");
    expect(song.getAllChords()[0].toString()).toBe(original);
});

test("falls back to the song's inferred key when no {key} directive is present", () => {
    const song = transposeText(`[Am]Hello [Dm]world [C]again [G]!\n[Am]Hello\n`, "up");
    // No explicit key: inferred key is Am (flat-leaning, no # or b), so transposing up
    // one semitone lands on Bbm and every chord is re-spelled to match that flat key.
    expect(song.key?.toString()).toBe("Bbm");
    expect(song.getAllChords().map((c) => c.toString())).toEqual(["Bbm", "Ebm", "Db", "Ab", "Bbm"]);
});
