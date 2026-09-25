import { Chord } from "../Chord";
import { Song } from "../Song";

test("should return the Am key when first and last chord are the same", async () => {
    const song = new Song();
    const mockGetAllChords = jest.fn();
    Song.prototype.getAllChords = mockGetAllChords;

    let stringChords = ["Am", "Dm", "C", "G", "F", "Am"];
    const chords = getChords(stringChords);
    mockGetAllChords.mockReturnValue(chords);
    const result = song.getPossibleKey();

    expect(result).toBeDefined();
    expect(result!.toString()).toBe("Am");
});

test("should return the C key when last chord is C", async () => {
    const song = new Song();
    const mockGetAllChords = jest.fn();
    Song.prototype.getAllChords = mockGetAllChords;

    let stringChords = ["Am", "Dm", "G", "F", "C"];
    const chords = getChords(stringChords);
    mockGetAllChords.mockReturnValue(chords);
    const result = song.getPossibleKey();

    expect(result).toBeDefined();
    expect(result!.toString()).toBe("C");
});

test("should return the Am key when it's the top used chord", async () => {
    const song = new Song();
    const mockGetAllChords = jest.fn();
    Song.prototype.getAllChords = mockGetAllChords;

    let stringChords = ["Am", "Dm", "C", "G", "F", "Am", "E"];
    const chords = getChords(stringChords);
    mockGetAllChords.mockReturnValue(chords);
    const result = song.getPossibleKey();

    expect(result).toBeDefined();
    expect(result!.toString()).toBe("Am");
});

test("should return the C key when it's the top used chord and last chord", async () => {
    const song = new Song();
    const mockGetAllChords = jest.fn();
    Song.prototype.getAllChords = mockGetAllChords;

    let stringChords = ["Am", "Dm", "C", "G", "F", "Am", "E", "C"];
    const chords = getChords(stringChords);
    mockGetAllChords.mockReturnValue(chords);
    const result = song.getPossibleKey();

    expect(result).toBeDefined();
    expect(result!.toString()).toBe("C");
});

test.each([
    { chords: ["B#", "C", "B#"], expected: "B#" },
    { chords: ["E#", "F", "E#"], expected: "E#" },
])("preserves the written spelling when inferring enharmonic keys", ({ chords, expected }) => {
    const song = new Song();
    song.getAllChords = jest.fn(() => getChords(chords));

    expect(song.getPossibleKey()?.toString()).toBe(expected);
});

function getChords(chords: string[]): Chord[] {
    const validChords: Chord[] = [];
    chords.forEach((chord) => {
        const parsedChord = Chord.parse(chord);
        if (parsedChord) {
            validChords.push(parsedChord);
        }
    });

    return validChords;
}
