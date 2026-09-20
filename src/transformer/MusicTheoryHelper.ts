import { Chord, Key, KeyMode, MusicNote } from "../models";

interface ChordDegree {
    degree: number;
    semitones: number;
}

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

    static getPreferredEnharmonicForChord(noteStr: string, sourceNote: string, keyContext?: string): string {
        if (sourceNote.includes('#')) {
            return this.getPreferredEnharmonic(noteStr, 'G');
        }
        if (sourceNote.includes('b')) {
            return this.getPreferredEnharmonic(noteStr, 'F');
        }

        const sourcePitch = this.pitchClassMap[sourceNote];
        const targetPitch = this.pitchClassMap[noteStr];
        if (sourcePitch !== undefined && targetPitch === (sourcePitch + 1) % 12) {
            if (sourceNote === 'E') return 'E#';
            if (sourceNote === 'B') return 'B#';
        }
        return this.getPreferredEnharmonic(noteStr, keyContext);
    }

    static getChordTones(value: Chord | string): string[] {
        const chord = typeof value === "string" ? Chord.parse(value) : value;
        if (!chord) {
            return [];
        }

        const root = chord.key.note.toString();
        const rootMatch = root.match(/^([A-G])((?:#{1,2}|b{1,2}|x)?)$/);
        if (!rootMatch) {
            return [];
        }

        let minor = chord.key.mode === KeyMode.Minor;
        let type = chord.type ?? "";
        if (/^(?:minor|min|mi|-)$/.test(type)) {
            minor = true;
            type = "";
        } else if (/^m(?=maj|\d|add)/.test(type)) {
            minor = true;
            type = type.slice(1);
        } else if (/^(?:major|maj|M)$/.test(type)) {
            type = "";
        }
        type = type.replace(/^Maj/, "maj").replace(/^M(?=\d)/, "maj");

        const degrees = this.getChordDegrees(type, minor);
        const rootPitch = this.getWrittenPitch(rootMatch[1], rootMatch[2]);
        const rootLetterIndex = this.noteLetters.indexOf(rootMatch[1]);
        const tones = degrees.map(({ degree, semitones }) => {
            const letter = this.noteLetters[(rootLetterIndex + degree - 1) % this.noteLetters.length];
            const targetPitch = (rootPitch + semitones) % 12;
            return this.spellPitch(letter, targetPitch);
        });

        const bass = chord.bass?.toString();
        if (bass && !tones.some((tone) => this.getNotePitch(tone) === this.getNotePitch(bass))) {
            tones.push(bass);
        }
        return tones;
    }

    private static readonly noteLetters = ["C", "D", "E", "F", "G", "A", "B"];
    private static readonly naturalPitchByLetter: Record<string, number> = {
        C: 0,
        D: 2,
        E: 4,
        F: 5,
        G: 7,
        A: 9,
        B: 11,
    };

    private static getChordDegrees(type: string, minor: boolean): ChordDegree[] {
        const degrees = new Map<number, number>();
        const set = (degree: number, semitones: number): void => {
            degrees.set(degree, semitones);
        };

        set(1, 0);
        if (type === "5") {
            set(5, 7);
        } else if (type.includes("sus2sus4")) {
            set(2, 2);
            set(4, 5);
            set(5, 7);
        } else if (type.includes("sus2")) {
            set(2, 2);
            set(5, 7);
        } else if (type.includes("sus") || type === "4") {
            set(4, 5);
            set(5, 7);
        } else if (type.startsWith("dim")) {
            set(3, 3);
            set(5, 6);
        } else {
            set(3, minor ? 3 : 4);
            set(5, type.startsWith("aug") || type.includes("#5") ? 8 : 7);
        }

        if (type.includes("b5")) {
            set(5, 6);
        }
        if (type === "6" || type === "69") {
            set(6, 9);
        }
        if (type === "69") {
            set(9, 14);
        }
        if (type.includes("add9")) {
            set(9, 14);
        }
        if (type.includes("add11")) {
            set(11, 17);
        }

        const extensionMatch = type.match(/(?:maj)?(7|9|11|13)/);
        if (extensionMatch) {
            const extension = Number(extensionMatch[1]);
            const majorSeventh = type.startsWith("maj");
            set(7, type.startsWith("dim7") ? 9 : majorSeventh ? 11 : 10);
            if (extension >= 9) set(9, 14);
            if (extension >= 11) set(11, 17);
            if (extension >= 13) set(13, 21);
        }

        if (type.includes("b9")) set(9, 13);
        if (type.includes("#9")) set(9, 15);
        if (type.includes("#11")) set(11, 18);
        if (type === "alt") {
            set(7, 10);
            set(9, 13);
            set(5, 8);
        }

        return [...degrees.entries()]
            .map(([degree, semitones]) => ({ degree, semitones }))
            .sort((left, right) => left.degree - right.degree);
    }

    private static getWrittenPitch(letter: string, accidental: string): number {
        const offset = accidental === "x"
            ? 2
            : [...accidental].reduce((sum, symbol) => sum + (symbol === "#" ? 1 : -1), 0);
        return (this.naturalPitchByLetter[letter] + offset + 12) % 12;
    }

    private static getNotePitch(note: string): number {
        const match = note.match(/^([A-G])((?:#{1,2}|b{1,2}|x)?)$/);
        return match ? this.getWrittenPitch(match[1], match[2]) : -1;
    }

    private static spellPitch(letter: string, pitch: number): string {
        let accidental = pitch - this.naturalPitchByLetter[letter];
        if (accidental > 6) accidental -= 12;
        if (accidental < -6) accidental += 12;
        if (accidental === 0) return letter;
        return `${letter}${accidental > 0 ? "#".repeat(accidental) : "b".repeat(-accidental)}`;
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
