import { MusicNote } from "../models/MusicNote";
import { Song } from "../models";
import { LyricsLine } from "../models/lines";
import { SectionType } from "../models/sections";
import { MusicTheoryHelper } from "./MusicTheoryHelper";

export abstract class Transposer {
    public static transpose(song: Song, direction: "up" | "down"): Song {
        const newSong = song.clone();
        const songKey = newSong.key ?? newSong.getPossibleKey();
        if (!songKey) {
            return song;
        }
        // Attach the (possibly inferred) key back to the song so callers always see the
        // transposed key, even when the original song had no explicit {key} directive.
        newSong.key = songKey;

        const semitones = direction === "up" ? 1 : -1;
        const baseContext = MusicTheoryHelper.toKeySignature(songKey);

        const transposeNote = (note: MusicNote, context: string): MusicNote | null => {
            const noteKey = MusicTheoryHelper.noteToKey(note);
            if (noteKey === null) {
                return null;
            }

            const currentPitchClass = MusicTheoryHelper.pitchClassMap[noteKey];
            if (currentPitchClass === undefined) {
                return null;
            }

            const nextPitchClass = (currentPitchClass + semitones + 12) % 12;
            const nextNote = MusicTheoryHelper.reversePitchClassMap[nextPitchClass];
            const preferred = MusicTheoryHelper.getPreferredEnharmonic(nextNote, context);
            return MusicNote.parse(preferred) ?? null;
        };

        songKey.note = transposeNote(songKey.note, baseContext) ?? songKey.note;

        newSong.sections.forEach((section) => {
            if (section.sectionType !== SectionType.Lyrics) {
                return;
            }
            section.lines.forEach((line) => {
                if (!(line instanceof LyricsLine)) {
                    return;
                }
                line.pairs.forEach((pair) => {
                    if (!pair.chord) {
                        return;
                    }

                    const chordContext = MusicTheoryHelper.toKeySignature(songKey);
                    const transposedChord = transposeNote(pair.chord.key.note, chordContext);
                    if (transposedChord) {
                        pair.chord.key.note = transposedChord;
                    }

                    if (pair.chord.bass) {
                        const transposedBass = transposeNote(pair.chord.bass, chordContext);
                        if (transposedBass) {
                            pair.chord.bass = transposedBass;
                        }
                    }
                });
            });
        });

        return newSong;
    }

    /**
     * Transposes a song written with a capo up by the capo amount, so chords reflect what
     * actually sounds (rather than the shape being fingered), then clears the capo setting.
     */
    public static decapo(song: Song): Song {
        if (!song.capo) {
            return song.clone();
        }

        let result = song;
        for (let i = 0; i < song.capo; i++) {
            result = Transposer.transpose(result, "up");
        }
        result.capo = 0;
        return result;
    }

    /**
     * The inverse of decapo(): transposes a song down by the given number of frets and sets
     * that as the capo, so it can be played with an easier shape while still sounding the same.
     */
    public static applyCapo(song: Song, fret: number): Song {
        if (fret <= 0) {
            return song.clone();
        }

        let result = song;
        for (let i = 0; i < fret; i++) {
            result = Transposer.transpose(result, "down");
        }
        result.capo = fret;
        return result;
    }
}
