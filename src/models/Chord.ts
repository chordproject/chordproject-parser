import { IClonable } from "./IClonable";
import { Key } from "./Key";
import { MusicNote } from "./MusicNote";

export class Chord implements IClonable<Chord> {
    key: Key;
    type: string;
    bass: MusicNote | null;

    constructor(note: Key, type: string = "", bass: MusicNote | null = null) {
        this.key = note;
        this.type = type;
        this.bass = bass;
    }
    clone(): Chord {
        return new Chord(this.key.clone(), this.type, this.bass?.clone());
    }

    // Minor qualifiers per the ChordPro spec (m, mi, min, -). "min" and "mi" are ordered before
    // the bare "m(?!aj)" alt so e.g. "Amin7" captures the full "min" instead of stopping at "mi".
    private static readonly chordRegex = /^(?<note>[A-G](#{1,2}|b{1,2}|x)?(min|mi|m(?!aj)|-)?)(?<type>(?!\/).*?)?(?:$|(?:\/(?<bass>[A-G](#{1,2}|b{1,2}|x)?)))$/;

    public static parse(text: string): Chord | undefined {
        if (!text) {
            return undefined;
        }
        text = text.trim();

        const matches = text.match(Chord.chordRegex);
        if (!matches || !matches.groups) {
            return undefined;
        }
        const noteMatch = matches.groups["note"];
        const note = Key.parse(noteMatch);
        if (note == undefined) {
            return undefined;
        }
        const type = matches.groups["type"];
        const bassMatch = matches.groups["bass"];
        const bass = MusicNote.parse(bassMatch);

        return new Chord(note, type, bass);
    }

    /**
     * Get the string description of the chord
     */
    public toString(showType: boolean = true, showBass: boolean = true): string {
        var name = this.key.toString();
        if (showType) {
            name += this.type;
        }
        if (showBass && this.bass) {
            name += "/" + this.bass.toString();
        }
        return name;
    }

    public toSimpleString(): string {
        return this.toString(false, false);
    }

    /**
     * Compare this chord with the given chord and return TRUE if they are identical
     * @param chord Chord to compare with
     * @returns TRUE if the chord is identical
     */
    public equals(chord: Chord | null | undefined): boolean {
        if (!chord) {
            return false;
        }
        return chord.toString() === this.toString();
    }
}
