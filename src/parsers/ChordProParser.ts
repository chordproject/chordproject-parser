import { Line, LyricsLine, CommentLine, EmptyLine, CustomLine, TabLine } from "../models/lines";
import { Key, ChordLyricsPair, ChordDiagram, Song, Chord, TimeSignature } from "../models";
import { Section, SectionType, Lyrics, LyricsBase, LyricsType, SimpleLyrics, Tabs } from "../models/sections";
import { ParserWarning } from "./ParserWarning";
import { Tag, TagType } from "./Tag";
import { TagConstants } from "./TagConstants";
import { WarningCode } from "./WarningCode";

export class ChordProParser {
    private _currentSection: Section;
    private _song: Song;
    private _currentLineIndex: number = 0;
    private _currentSectionTagName: string | null;
    private _warnings: ParserWarning[];

    /**
     * Getter warnings
     * @return The parser warnings
     */
    public get warnings(): ParserWarning[] {
        return this._warnings;
    }

    private readonly TAG_REGEX = /\{(?<value>.*)\}/;
    private readonly TAB_LINE_REGEX = /^[aA-zZ]\|[^ ]+$/;
    private readonly CHORD_REGEX = /\[(.*?)\]/g;
    private readonly SPLIT_CHORD_REGEX = /(?=\[.*?\])/g;

    /**
     * ChordProParser's constructor
     */
    constructor() {
        this._song = new Song();
        this._currentSection = new SimpleLyrics();
        this._currentSectionTagName = null;
        this._warnings = [];
    }

    /**
     * parse the sheet
     */
    parse(sheet: string): Song {
        if(!sheet.trim()){
            this.addWarning(WarningCode.EMPTY_SHEET, "The song sheet is empty");
            return new Song();
        }
        
        this._song.rawContent = sheet;
        const lines = sheet.split(/\r\n|\r|\n/);

        // remove empty lines at the begining of the song
        while (!lines[0].trim()) {
            lines.splice(0, 1);
        }

        // parse the lines
        lines.forEach((line) => {
            this.parseLine(line);
            this._currentLineIndex++;
        });
        this.completeCurrentSection();

        // set a possible key if none has been set
        if (!this._song.key) {
        }
        return this._song;
    }

    /**
     * Parse one line of the song
     * @param line Song's line
     */
    private parseLine(line: string) {
        line = line.trim();
        // empty
        if (!line) {
            this.addLine(new EmptyLine());
            return;
        }

        // tag
        if (this.TAG_REGEX.test(line)) {
            this.parseTag(line);
            return;
        }

        // simple line
        switch (this._currentSection.sectionType) {
            case SectionType.Tabs:
                this.parseTabLine(line);
                break;
            case SectionType.Lyrics:
                this.parseLyricsLine(line);
                break;
            default:
                break;
        }
    }

    /**
     * Parse the tab line
     * @param line Tab line
     */
    private parseTabLine(line: string) {
        if (this._currentSection instanceof Tabs) {
            if (!this.TAB_LINE_REGEX.test(line)) {
                this.addWarning(WarningCode.INVALID_TABS_LINE, "This tabs line is invalid. It must starts with the string name and a pipe.");
            }
            this.addLine(new TabLine(line)); // should it add the line even if the tab line is invalid?
        } else {
            this.addWarning(WarningCode.INTERNAL_ERROR_WRONG_SECTION_TYPE, "Internal error: wrong section type");
        }
    }

    /**
     * Parse the lyrics line
     * @param line Lyrics line
     */
    private parseLyricsLine(line: string) {
        if (this._currentSection instanceof LyricsBase) {
            const lineWithoutChords = line.replace(this.CHORD_REGEX, "");
            const invalidCharsRegex = /[\[\]\{\}]/;
            if (invalidCharsRegex.test(lineWithoutChords)) {
                this.addWarning(WarningCode.INVALID_LYRICS_LINE, "The lyrics line contains invalid characters or unclosed chords.");
            }

            const lineParts = line.split(this.SPLIT_CHORD_REGEX);
            const pairs: ChordLyricsPair[] = [];
            lineParts.forEach((part) => {
                const result = ChordLyricsPair.parse(part);
                if (!result[0]) {
                    const lyrics = result[1].lyrics.trim();
                    const chordText = result[1].text ?? "";
                    if (lyrics) {
                        this.addWarning(
                            WarningCode.CHORD_PARSE_ERROR_WITH_LYRICS,
                            `Cannot parse the chord '${chordText}' before the lyrics '${lyrics}'`,
                            { chord: chordText, lyrics }
                        );
                    } else {
                        this.addWarning(WarningCode.CHORD_PARSE_ERROR, `Cannot parse the chord '${chordText}'`, {
                            chord: chordText,
                        });
                    }
                }
                pairs.push(result[1]);
            });
            const lyricsLine = new LyricsLine(pairs);
            this.addLine(lyricsLine);
        } else {
            this.addWarning(WarningCode.INTERNAL_ERROR_WRONG_SECTION_TYPE, "Internal error: wrong section type");
        }
    }

    /**
     * Parse the tag from the song
     * @param line Song's line
     */
    private parseTag(line: string) {
        const match = line.match(this.TAG_REGEX);
        if (!match || !match.groups || !match.groups["value"]) {
            this.addWarning(WarningCode.INVALID_TAG, "Invalid tag.");
            return;
        }

        const tag = Tag.parse(match.groups["value"].trim());
        if (!tag) {
            this.addWarning(WarningCode.UNKNOWN_OR_MALFORMED_TAG, "Unknown or mal-formatted tag.");
            return;
        }

        switch (tag.type) {
            case TagType.Metadata:
                this.parseMetadataTag(tag.longName, tag.value);
                break;
            case TagType.Comment:
                this.parseCommentTag(tag.value);
                break;
            case TagType.Define:
                this.parseDefineTag(tag.value);
                break;
            case TagType.Custom:
                this.parseCustomTag(tag.longName, tag.value);
                break;
            case TagType.CustomMetadata:
                this.parseCustomMetadataTag(tag.longName, tag.value);
                break;
            case TagType.StartOfBlock:
                this.parseStartOfBlockTag(tag.longName, tag.value);
                break;
            case TagType.EndOfBlock:
                this.parseEndOfBlockTag(tag.longName);
                break;
            default:
                this.addWarning(WarningCode.UNKNOWN_TAG_TYPE, "Unknown tag type.");
                break;
        }
    }

    /**
     * Parse the comment tag
     * @param value Comment text
     */
    private parseCommentTag(value: string | null) {
        if (!value) {
            this.addWarning(WarningCode.COMMENT_TAG_MISSING_VALUE, "The comment tag must have a value");
            return;
        }
        this.addLine(new CommentLine(value));
    }

    /**
     * Parse the define tag
     * @param value Define value (eg: Bes base-fret 1 frets 1 1 3 3 3 1 fingers 1 1 2 3 4 1)
     */
    private parseDefineTag(value: string | null) {
        if (!value) {
            this.addWarning(WarningCode.DEFINE_TAG_MISSING_VALUE, "The define tag must have a value");
            return;
        }
        const diagram = ChordDiagram.parse(value);
        if (!diagram) {
            this.addWarning(WarningCode.DEFINE_TAG_INVALID, "The define tag is invalid");
            return;
        }
        this._song.userDiagrams.push(diagram);
    }

    /**
     * Parse the custom tag
     * @param value Custom value (optional)
     */
    private parseCustomTag(name: string, value: string | null) {
        this.addLine(new CustomLine(name, value));
    }

    /**
     * Parse the start of block tag
     * @param name Tag name
     * @param value Tag value
     */
    private parseStartOfBlockTag(longName: string, value: string | null) {
        // check previous section is closed
        if (this._currentSectionTagName !== null) {
            this.addWarning(
                WarningCode.SECTION_NOT_CLOSED,
                `The section tag ${this._currentSectionTagName} must be closed before starting a new section`,
                { section: this._currentSectionTagName }
            );
        }

        this.completeCurrentSection();
        const name = longName.replace("start_of_", "");
        this._currentSectionTagName = name;
        const blockType = TagConstants.START_BLOCK_TAGS.find((f) => f === longName);

        // custom section
        if (!blockType) {
            this._currentSection = new Lyrics(LyricsType.Custom, name, value);
            return;
        }

        // other section
        switch (blockType) {
            case TagConstants.START_OF_BRIDGE:
                this._currentSection = new Lyrics(LyricsType.Bridge, name, value);
                return;
            case TagConstants.START_OF_CHORUS:
                this._currentSection = new Lyrics(LyricsType.Chorus, name, value);
                return;
            case TagConstants.START_OF_VERSE:
                this._currentSection = new Lyrics(LyricsType.Verse, name, value);
                return;
            case TagConstants.START_OF_TAB:
                this._currentSection = new Tabs(value);
                return;
            default:
                break;
        }
    }

    /**
     * Parse the end of block tag
     * @param name Tag name
     * @param value Tag value
     */
    private parseEndOfBlockTag(name: string) {
        if (!this._currentSectionTagName) {
            this.addWarning(WarningCode.END_OF_SECTION_USELESS, "This end of section tag is useless and will be ignore.");
            return;
        }
        if (name.replace("end_of_", "") !== this._currentSectionTagName) {
            this.addWarning(WarningCode.END_OF_SECTION_MISMATCH, "The end of section tag does not match the start of section tag.");
        }

        this.completeCurrentSection();
    }

    private completeCurrentSection() {
        // A section made up only of blank lines (e.g. leftover formatting between the
        // metadata directives and the first real content) isn't a real section - discard it
        // instead of pushing an empty "phantom" section that would otherwise count as the
        // song's first section and push the real content's margin/spacing down.
        const hasRealContent = this._currentSection.lines.some((line) => !(line instanceof EmptyLine));
        if (hasRealContent) {
            this._song.sections.push(this._currentSection);
        }
        this._currentSection = new SimpleLyrics();
        this._currentSectionTagName = null;
    }

    /**
     * Add the line to the current section lines.
     * If the current section is of Tabs type, add a warning and continue without adding the line
     * @param line The line
     */
    private addLine(line: Line) {
        if (this._currentSection.sectionType === SectionType.Tabs && !(line instanceof TabLine)) {
            this.addWarning(WarningCode.TABS_SECTION_ONLY_TABS_LINES, "Tabs section can only contains tabs lines");
            return;
        }
        this._currentSection.addLine(line);
    }

    //#region Metadata

    /**
     * Parse the metadata tag
     * @param name Tag name
     * @param value Tag value
     */
    private parseMetadataTag(name: string, value: string | null) {
        if (!value || !value.trim()) {
            this.addWarning(WarningCode.METADATA_MISSING_VALUE, "The metadata must have a value");
            return;
        }
        switch (name) {
            case TagConstants.ALBUM:
                this._song.albums.push(value);
                break;
            case TagConstants.ARRANGER:
                this._song.arrangers.push(value);
                break;
            case TagConstants.ARTIST:
                this._song.artists.push(value);
                break;
            case TagConstants.CAPO:
                this.parseCapoMetadata(value);
                break;
            case TagConstants.COMPOSER:
                this._song.composers.push(value);
                break;
            case TagConstants.COPYRIGHT:
                this._song.copyright = value;
                break;
            case TagConstants.DURATION:
                this.parseDurationMetadata(value);
                break;
            case TagConstants.KEY:
                this.parseKeyMetadata(value);
                break;
            case TagConstants.LYRICIST:
                this._song.lyricists.push(value);
                break;
            case TagConstants.TEMPO:
                this.parseTempoMetadata(value);
                break;
            case TagConstants.TIME:
                this.parseTimeMetadata(value);
                break;
            case TagConstants.TITLE:
                this._song.title = value;
                break;
            case TagConstants.SUBTITLE:
                this._song.subtitle = value;
                break;
            case TagConstants.YEAR:
                this.parseYearMetadata(value);
                break;
            default:
                this.addWarning(WarningCode.UNKNOWN_METADATA_TAG, "Unknown metadata tag");
                break;
        }
    }

    private parseYearMetadata(value: string) {
        const year = parseInt(value, 10);
        if (isNaN(year) || year.toString().length != 4) {
            this.addWarning(WarningCode.YEAR_METADATA_INVALID, "The year metadata must be a 4 digits number");
            return;
        }
        this._song.year = year;
    }

    private parseCapoMetadata(value: string) {
        const capo = parseInt(value, 10);
        if (isNaN(capo)) {
            this.addWarning(WarningCode.CAPO_METADATA_INVALID, "The capo metadata must be a number");
            return;
        }
        this._song.capo = capo;
    }

    private parseDurationMetadata(value: string) {
        const regex = /^((?<time>[0-9]+)|(?<minutes>[0-5]?[0-9]):(?<seconds>[0-5][0-9]))$/;
        const match = value.match(regex);
        if (!match || !match.groups) {
            this.addWarning(WarningCode.DURATION_METADATA_INVALID, "The duration metadata is invalid. Must be a number or a time (eg: 5:30)");
            return;
        }

        const timeString = match.groups["time"];
        if (timeString) {
            const time = parseInt(value, 10);
            this._song.duration = time;
        }

        const minutes = match.groups["minutes"];
        const seconds = match.groups["seconds"];
        if (!minutes || !seconds) {
            this.addWarning(WarningCode.DURATION_TIME_FORMAT_INVALID, "The duration metadata time format is invalid");
            return;
        }
        this._song.duration = parseInt(minutes, 10) * 60 + parseInt(seconds);
        return;
    }

    private parseTempoMetadata(value: string) {
        const tempo = parseInt(value, 10);
        if (isNaN(tempo)) {
            this.addWarning(WarningCode.TEMPO_METADATA_INVALID, "The tempo metadata must be a number");
            return;
        }
        this._song.tempo = tempo;
    }

    private parseKeyMetadata(value: string) {
        const key = Key.parse(value);
        if (!key) {
            this.addWarning(WarningCode.KEY_METADATA_INVALID, "The key metadata is not a valid key");
            return;
        }
        this._song.key = key;
    }

    private parseTimeMetadata(value: string) {
        const regex = /^(?<top>[0-9]{1,2})\/(?<bottom>[0-9]{1,2})$/;
        const match = value.match(regex);

        if (!match || !match.groups || !match.groups["top"] || !match.groups["bottom"]) {
            this.addWarning(WarningCode.TIME_METADATA_INVALID, "The time metadata is invalid. Must be number/number (eg: 6/8)");
            return;
        }

        const top = parseInt(match.groups["top"]);
        const bottom = parseInt(match.groups["bottom"]);
        this._song.time = new TimeSignature(top, bottom);
    }

    private parseCustomMetadataTag(name: string, value: string | null) {
        this._song.customMetadatas.push([name, value]);
    }
    //#endregion

    private addWarning(code: string, message: string, params: Record<string, string> = {}) {
        const warning = new ParserWarning(message, this._currentLineIndex + 1, code, params);
        this._warnings.push(warning);
    }
}
