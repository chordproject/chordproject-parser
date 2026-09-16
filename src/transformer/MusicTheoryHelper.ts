import { Key, KeyMode, MusicNote } from "../models";

export class MusicTheoryHelper {
    private static readonly sharpKeys = new Set([
        "G", "D", "A", "E", "B", "F#", "C#",
        "Em", "Bm", "F#m", "C#m", "G#m", "D#m", "A#m",
    ]);
    private static readonly flatKeys = new Set([
        "F", "Bb", "Eb", "Ab", "Db", "Gb", "Cb",
        "Dm", "Gm", "Cm", "Fm", "Bbm", "Ebm", "Abm",
    ]);
    static circleOfFifths: string[] = ["C", "G", "D", "A", "E", "B", "F#", "Db", "Ab", "Eb", "Bb", "F"];

    static pitchClassMap: Record<string, number> = {
        C: 0,
        "C#": 1,
        D: 2,
        Eb: 3,
        E: 4,
        F: 5,
        "F#": 6,
        G: 7,
        Ab: 8,
        A: 9,
        Bb: 10,
        B: 11,
        Cb: 11,
        "D#": 3,
        "E#": 5,
        Fb: 4,
        "G#": 8,
        "A#": 10,
        "B#": 0,
        Gb: 6,
        Db: 1,
    };

    static reversePitchClassMap: Record<number, string> = {
        0: "C",
        1: "C#",
        2: "D",
        3: "Eb",
        4: "E",
        5: "F",
        6: "F#",
        7: "G",
        8: "Ab",
        9: "A",
        10: "Bb",
        11: "B",
    };

    static getNextInCircle(note: string, steps: number): string {
        const idx = this.circleOfFifths.indexOf(note);
        if (idx === -1) return note;
        return this.circleOfFifths[(idx + steps + this.circleOfFifths.length) % this.circleOfFifths.length];
    }

    static normalizeKey(key: string): string {
        const baseKey = key.replace("m", "");
        if (this.pitchClassMap[baseKey] !== undefined) {
            return key.includes("m") ? `${baseKey}m` : baseKey;
        }
        return key;
    }

    static transposeKey(key: string, letterDiff: number, semiTones: number): string {
        const baseKey = key.replace("m", "");
        const pitchClass = this.pitchClassMap[baseKey];

        // Ajustar la letra de la nota usando letterDiff
        const newLetterIndex =
            (this.circleOfFifths.indexOf(baseKey) + letterDiff + this.circleOfFifths.length) %
            this.circleOfFifths.length;
        const newLetter = this.circleOfFifths[newLetterIndex];

        // Ajustar los semitonos usando semiTones
        const newPitchClass = (pitchClass + semiTones + 12) % 12;
        const newKey = this.reversePitchClassMap[newPitchClass];

        // Si hay discrepancia entre la letra y los semitonos, ajustar la letra nuevamente
        if (newKey !== newLetter) {
            const adjustedLetterIndex =
                (this.circleOfFifths.indexOf(newKey) + letterDiff + this.circleOfFifths.length) %
                this.circleOfFifths.length;
            const adjustedLetter = this.circleOfFifths[adjustedLetterIndex];
            return adjustedLetter;
        }

        return newKey;
    }

    static semiTonesBetween(note1: string, note2: string): number {
        const pitch1 = this.pitchClassMap[note1];
        const pitch2 = this.pitchClassMap[note2];

        if (pitch1 === undefined || pitch2 === undefined) {
            return 0; // Manejar notas inválidas
        }

        let diff = pitch2 - pitch1;
        return (diff + 12) % 12; // Normalizar a un rango de 0-11
    }

    static letterDiff(note1: string, note2: string): number {
        const index1 = this.circleOfFifths.indexOf(note1);
        const index2 = this.circleOfFifths.indexOf(note2);

        if (index1 === -1 || index2 === -1) {
            return 0; // Manejar notas inválidas
        }

        return index2 - index1;
    }

    static getPreferredEnharmonic(noteStr: string, keyContext?: string): string {
        const pitchClass = this.pitchClassMap[noteStr];
        if (pitchClass === undefined) {
            return noteStr;
        }

        // Default enharmonic preferences based on musical theory
        // Generally prefer sharps for ascending, flats for descending
        const sharpPreferred = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
        const flatPreferred = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

        // Prefer enharmonics from the actual key signature. Keys such as E major and C#m
        // contain sharps even though their written tonic has no # character.
        if (keyContext && MusicTheoryHelper.sharpKeys.has(keyContext)) {
            return sharpPreferred[pitchClass];
        } else if (keyContext && MusicTheoryHelper.flatKeys.has(keyContext)) {
            return flatPreferred[pitchClass];
        }

        // Default to the standard mapping
        return this.reversePitchClassMap[pitchClass];
    }

    /**
     * Converts a MusicNote's letter+accidental into a pitchClassMap key (e.g. "C#", "Eb"),
     * ignoring double sharps/flats which aren't represented in that map.
     */
    static noteToKey(note: MusicNote): string | null {
        const key = note.toString();
        return this.pitchClassMap[key] !== undefined ? key : null;
    }

    /**
      * Returns the normalized tonic plus mode, used to select enharmonics consistent with the
      * song's actual key signature (for example E and C#m prefer sharps).
     */
    static toKeySignature(key: Key): string {
          return key.toString();
    }

    // Common "easy" open-chord shapes guitarists use with a capo, expressed as pitch class + mode.
    private static readonly EASY_GUITAR_SHAPES: { pitchClass: number; mode: KeyMode }[] = [
        { pitchClass: 0, mode: KeyMode.Major }, // C
        { pitchClass: 7, mode: KeyMode.Major }, // G
        { pitchClass: 2, mode: KeyMode.Major }, // D
        { pitchClass: 9, mode: KeyMode.Major }, // A
        { pitchClass: 4, mode: KeyMode.Major }, // E
        { pitchClass: 9, mode: KeyMode.Minor }, // Am
        { pitchClass: 4, mode: KeyMode.Minor }, // Em
        { pitchClass: 2, mode: KeyMode.Minor }, // Dm
    ];

    /**
     * For a given song key, returns the capo fret positions where the song could instead be
     * played using an easy open-chord shape (C/G/D/A/E or Am/Em/Dm), along with that shape's key.
     */
    static getCapoSuggestions(key: Key): { fret: number; shapeKey: string }[] {
        const noteKey = this.noteToKey(key.note);
        if (noteKey === null) {
            return [];
        }
        const keyPitchClass = this.pitchClassMap[noteKey];

        const suggestions: { fret: number; shapeKey: string }[] = [];
        for (let fret = 0; fret <= 11; fret++) {
            const shapePitchClass = (keyPitchClass - fret + 12) % 12;
            const isEasyShape = this.EASY_GUITAR_SHAPES.some(
                (shape) => shape.pitchClass === shapePitchClass && shape.mode === key.mode
            );
            if (isEasyShape) {
                const shapeNote = this.reversePitchClassMap[shapePitchClass];
                suggestions.push({ fret, shapeKey: key.mode === KeyMode.Minor ? `${shapeNote}m` : shapeNote });
            }
        }
        return suggestions;
    }
}
