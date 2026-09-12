import { Key, KeyMode, MusicNote, MusicLetter } from "../../models";
import { MusicTheoryHelper } from "../MusicTheoryHelper";
import { Transposer } from "../Transposer";
import { ChordProParser } from "../../parsers";

test("getCapoSuggestions returns easy-shape capo positions for a major key", () => {
    const key = new Key(new MusicNote(MusicLetter.D), KeyMode.Major);
    expect(MusicTheoryHelper.getCapoSuggestions(key)).toEqual([
        { fret: 0, shapeKey: "D" },
        { fret: 2, shapeKey: "C" },
        { fret: 5, shapeKey: "A" },
        { fret: 7, shapeKey: "G" },
        { fret: 10, shapeKey: "E" },
    ]);
});

test("getCapoSuggestions returns easy-shape capo positions for a minor key", () => {
    const key = new Key(new MusicNote(MusicLetter.E), KeyMode.Minor);
    expect(MusicTheoryHelper.getCapoSuggestions(key)).toEqual([
        { fret: 0, shapeKey: "Em" },
        { fret: 2, shapeKey: "Dm" },
        { fret: 7, shapeKey: "Am" },
    ]);
});

test("decapo transposes chords up by the capo amount and clears the capo", () => {
    const parser = new ChordProParser();
    const song = parser.parse(`{key: C}\n{capo: 2}\n[C]Hello [G]world\n`);

    const result = Transposer.decapo(song);

    expect(result.capo).toBe(0);
    expect(result.key?.toString()).toBe("D");
    expect(result.getAllChords().map((c) => c.toString())).toEqual(["D", "A"]);
});

test("decapo returns the song unchanged (clone) when there is no capo", () => {
    const parser = new ChordProParser();
    const song = parser.parse(`{key: C}\n[C]Hello\n`);

    const result = Transposer.decapo(song);

    expect(result.capo).toBe(0);
    expect(result.key?.toString()).toBe("C");
    expect(result.getAllChords().map((c) => c.toString())).toEqual(["C"]);
});

test("applyCapo transposes chords down by the fret amount and sets the capo", () => {
    const parser = new ChordProParser();
    const song = parser.parse(`{key: D}\n[D]Hello [A]world\n`);

    const result = Transposer.applyCapo(song, 2);

    expect(result.capo).toBe(2);
    expect(result.key?.toString()).toBe("C");
    expect(result.getAllChords().map((c) => c.toString())).toEqual(["C", "G"]);
});

test("applyCapo and decapo are inverses of each other", () => {
    const parser = new ChordProParser();
    const song = parser.parse(`{key: D}\n[D]Hello [A]world\n`);

    const roundTripped = Transposer.decapo(Transposer.applyCapo(song, 3));

    expect(roundTripped.capo).toBe(0);
    expect(roundTripped.key?.toString()).toBe("D");
    expect(roundTripped.getAllChords().map((c) => c.toString())).toEqual(["D", "A"]);
});
