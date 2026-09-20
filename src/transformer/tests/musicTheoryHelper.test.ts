import { MusicTheoryHelper } from "../MusicTheoryHelper";

test.each([
    ["C", ["C", "E", "G"]],
    ["Cm", ["C", "Eb", "G"]],
    ["G#m6", ["G#", "B", "D#", "E#"]],
    ["Bbmaj7", ["Bb", "D", "F", "A"]],
    ["C#dim7", ["C#", "E", "G", "Bb"]],
    ["Faug", ["F", "A", "C#"]],
    ["Dsus4", ["D", "G", "A"]],
    ["E7b9", ["E", "G#", "B", "D", "F"]],
    ["Gbmaj9", ["Gb", "Bb", "Db", "F", "Ab"]],
    ["C#m11", ["C#", "E", "G#", "B", "D#", "F#"]],
    ["B#maj7", ["B#", "D##", "F##", "A##"]],
])("spells %s by diatonic chord degree", (name, expected) => {
    expect(MusicTheoryHelper.getChordTones(name as string)).toEqual(expected);
});

test("returns no tones for an invalid chord", () => {
    expect(MusicTheoryHelper.getChordTones("not-a-chord")).toEqual([]);
});