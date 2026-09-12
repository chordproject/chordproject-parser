import { CommentLine, CustomLine, LyricsLine, TabLine } from "../../models/lines";
import { Section } from "../../models/sections";
import { BuilderSettings } from "./BuilderSettings";

export interface IBuilder {
    settings:BuilderSettings;

    titleMetadata(value: string): string[];
    subtitleMetadata(value: string): string[];
    artistsMetadata(values: string[]): string[];
    composersMetadata(values: string[]): string[];
    lyricistsMetadata(values: string[]): string[];
    arrangersMetadata(values: string[]): string[];
    yearMetadata(value: number): string[];
    copyrightMetadata(value: string): string[];
    timeMetadata(value: string): string[];
    tempoMetadata(value: number): string[];
    durationMetadata(value: number): string[];
    capoMetadata(value: number): string[];
    keyMetadata(value: string): string[];
    customMetadatas(values: [string, string | null][]): string[];

    emptyLine(): string[];
    lyricsLine(line: LyricsLine): string[];
    commentLine(line: CommentLine): string[];
    tabLine(line: TabLine): string[];
    customLine(line: CustomLine): string[];

    metadataStart(): string[];
    metadataEnd(): string[];

    contentStart(): string[];
    contentEnd(): string[];

    sectionStart(section: Section, isFirstSection?: boolean): string[];
    sectionEnd(section: Section): string[];
}
