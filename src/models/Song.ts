import { Chord, Key, ChordDiagram, MusicNote } from ".";
import { IClonable } from "./IClonable";
import { LyricsLine } from "./lines";
import { LyricsBase, Section, SectionType } from "./sections";
import { TimeSignature } from "./TimeSignature";

export class Song implements IClonable<Song> {
    /**
     * Title of the song
     */
    title: string | null = null;

    /**
     * Subtitle of the song
     */
    subtitle: string | null = null;

    /**
     * Album of the song
     * Multiple albums can be specified
     */
    albums: string[] = [];

    /**
     * Artist of the song
     * Multiple artists can be specified
     */
    artists: string[] = [];

    /**
     * Composer of the song
     */
    composers: string[] = [];

    /**
     * Arranger of the song.
     * Multiple arrangers can be specified
     */
    arrangers: string[] = [];

    /**
     * Writer of the lyrics of the song.
     * Multiple lyricists can be specified
     */
    lyricists: string[] = [];

    /**
     * Year of the first time the song was published
     */
    year: number | null = null;

    /**
     * Copyright information for the song
     */
    copyright: string | null = null;

    /**
     * Key the song is written in
     */
    key: Key | null = null;

    /** Stable key context used when a song is transposed repeatedly. */
    transpositionContext: Key | null = null;

    /**
     * Capo setting for the song
     */
    capo: number = 0;

    /**
     * Duration of the song (in seconds)
     */
    duration: number | null = null;

    /**
     * Time signature of the song
     */
    time: TimeSignature | null = null;

    /**
     * Tempo in number of beats per minute for the song
     */
    tempo: number | null = null;

    /**
     * Custom metadatas
     */
    customMetadatas: [string, string | null][] = [];

    /**
     * User defined diagrams
     */
    userDiagrams: ChordDiagram[] = [];

    /**
     * Raw content of the song
     */
    rawContent: string = "";

    sections: Section[] = [];

    public getLyrics(): string[] {
        let lyrics: string[] = [];
        this.sections.forEach((section) => {
            if (section instanceof LyricsBase) {
                (<LyricsBase>section).lines.forEach((line) => {
                    let lineLyrics = "";
                    if (line instanceof LyricsLine) {
                        (<LyricsLine>line).pairs.forEach((pair) => {
                            if (pair.lyrics) {
                                lineLyrics += pair.lyrics;
                            }
                        });
                    }
                    lineLyrics = lineLyrics.trim();
                    if(lineLyrics){
                        lyrics.push(lineLyrics);
                    }
                });
            }
        });
        return lyrics;
    }

    /**
     * Get the list of the song's chords
     * @returns All chords (in order)
     */
    public getAllChords(): Chord[] {
        let chords: Chord[] = [];
        this.sections.forEach((section) => {
            if (section instanceof LyricsBase) {
                (<LyricsBase>section).lines.forEach((line) => {
                    if (line instanceof LyricsLine) {
                        (<LyricsLine>line).pairs.forEach((pair) => {
                            if (pair.hasChord()) {
                                const chord = pair.chord!;
                                chords.push(chord);
                            }
                        });
                    }
                });
            }
        });
        return chords;
    }

    /**
     * Get the list of the song's unique chords
     * @returns Array of unique chords
     */
    public getUniqueChords(): Chord[] {
        const chords = this.getAllChords();
        let uniqueChords: Chord[] = [];
        chords.forEach((chord) => {
            if (!uniqueChords.find((f) => f.equals(chord))) {
                uniqueChords.push(chord);
            }
        });
        return uniqueChords;
    }

    /**
     * Try to determine the possible song's key
     * @returns Possible song's key
     */
    public getPossibleKey(): Key | undefined {
        const chords = this.getAllChords();
        if (chords.length == 0) {
            return undefined;
        }
        const firstKey = chords[0].key;
        const lastKey = chords[chords.length - 1].key;

        if (firstKey.equals(lastKey)) {
            return firstKey.clone();
        }

        let countChords: { count: number; key: Key }[] = [];
        chords.forEach((chord) => {
            let foundChord = countChords.find((c) => c.key.equals(chord.key));
            if (foundChord) {
                foundChord.count++;
            } else {
                countChords.push({ count: 0, key: chord.key.clone() });
            }
        });

        countChords.sort((c, c2) => c2.count - c.count);
        let topChord = countChords[0];
        let countFirstChord = countChords.find((c) => c.key.equals(firstKey))!.count;
        let countLastChord = countChords.find((c) => c.key.equals(lastKey))!.count;

        if (topChord.count > countFirstChord && topChord.count > countLastChord) {
            return topChord.key.clone();
        }
        if (countFirstChord > countLastChord) {
            return firstKey.clone();
        } else {
            return lastKey.clone();
        }
    }

    /**
     * Clone the song
     * @returns Cloned song
     */
    public clone(): Song {
        let clonedSong = new Song();
        clonedSong.albums = this.albums;
        clonedSong.arrangers = this.arrangers;
        clonedSong.artists = this.artists;
        clonedSong.capo = this.capo;
        clonedSong.composers = this.composers;
        clonedSong.copyright = this.copyright;
        clonedSong.customMetadatas = this.customMetadatas;
        clonedSong.duration = this.duration;
        clonedSong.lyricists = this.lyricists;
        clonedSong.rawContent = this.rawContent;
        clonedSong.subtitle = this.subtitle;
        clonedSong.tempo = this.tempo;
        clonedSong.title = this.title;
        clonedSong.year = this.year;
        if (this.time) {
            clonedSong.time = new TimeSignature(this.time.bottomNumber,this.time.topNumber);
        }
        if (this.key) {
            clonedSong.key = this.key.clone();
        }
        if (this.transpositionContext) {
            clonedSong.transpositionContext = this.transpositionContext.clone();
        }

        this.userDiagrams.forEach((userDiagram) => {
            clonedSong.userDiagrams.push(userDiagram.clone());
        });

        this.sections.forEach((section) => {
            clonedSong.sections.push(section.clone());
        });
        return clonedSong;
    }
}
