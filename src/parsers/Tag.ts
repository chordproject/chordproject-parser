import { TagConstants } from "./TagConstants";

/**
 * List of
 */
export enum TagType {
    Metadata,
    CustomMetadata,
    StartOfBlock,
    EndOfBlock,
    Comment,
    Define,
    Custom,
    None,
}

interface Alias {
    longName: string;
    shortName: string;
}

export class Tag {
    private static ALIASES: Alias[] = [
        { shortName: TagConstants.TITLE_SHORT, longName: TagConstants.TITLE },
        { shortName: TagConstants.SUBTITLE_SHORT, longName: TagConstants.SUBTITLE },
        { shortName: TagConstants.COMMENT_SHORT, longName: TagConstants.COMMENT },
        {
            shortName: TagConstants.START_OF_BRIDGE_SHORT,
            longName: TagConstants.START_OF_BRIDGE,
        },
        {
            shortName: TagConstants.END_OF_BRIDGE_SHORT,
            longName: TagConstants.END_OF_BRIDGE,
        },
        {
            shortName: TagConstants.START_OF_CHORUS_SHORT,
            longName: TagConstants.START_OF_CHORUS,
        },
        {
            shortName: TagConstants.END_OF_CHORUS_SHORT,
            longName: TagConstants.END_OF_CHORUS,
        },
        {
            shortName: TagConstants.START_OF_VERSE_SHORT,
            longName: TagConstants.START_OF_VERSE,
        },
        {
            shortName: TagConstants.END_OF_VERSE_SHORT,
            longName: TagConstants.END_OF_VERSE,
        },
        {
            shortName: TagConstants.START_OF_TAB_SHORT,
            longName: TagConstants.START_OF_TAB,
        },
        {
            shortName: TagConstants.END_OF_TAB_SHORT,
            longName: TagConstants.END_OF_TAB,
        },
        {
            shortName: TagConstants.START_OF_GRID_SHORT,
            longName: TagConstants.START_OF_GRID,
        },
        {
            shortName: TagConstants.END_OF_GRID_SHORT,
            longName: TagConstants.END_OF_GRID,
        },
    ];
    //#endregion
    private constructor() {}

    private static readonly META_TAG_REGEX = /^meta:\s*(?<name>[^:\s]+)(\s*(?<value>.+))?$/;
    private static readonly TAG_REGEX = /^(?<name>[^:\s]+)(:?\s*(?<value>.+))?$/;
    private static readonly CUSTOM_META_TAG_REGEX = /^(?<name>x_[^:]+)(:?\s*(?<value>.+))?$/;

    private _originalName: string = "";
    private _value: string | null = null;
    private _type: TagType = TagType.None;

    public get value(): string | null {
        return this._value;
    }

    public get type(): TagType {
        return this._type;
    }

    public get shortName(): string {
        return Tag.getShortName(this._originalName);
    }

    public get longName(): string {
        return Tag.getLongName(this._originalName);
    }

    private static getLongName(tag: string): string {
        if (!tag) {
            return tag;
        }

        const value = this.ALIASES.find((f) => f.shortName === tag);
        if (value) {
            return value.longName;
        }

        return tag;
    }

    private static getShortName(tag: string): string {
        if (!tag) {
            return tag;
        }

        const alias = this.ALIASES.find((f) => f.longName === tag);
        if (alias) {
            return alias.shortName;
        }

        return tag;
    }

    public static parse(name: string): Tag | undefined {
        const sanitizedName = name.trim();
        //Custom tag
        if (this.CUSTOM_META_TAG_REGEX.test(sanitizedName)) {
            let tag = this.parseRegex(sanitizedName, this.CUSTOM_META_TAG_REGEX);
            if (tag) {
                tag._type = TagType.Custom;
            }
            return tag;
        }

        //Meta tag
        if (this.META_TAG_REGEX.test(sanitizedName)) {
            let tag = this.parseRegex(sanitizedName, this.META_TAG_REGEX);
            if (tag) {
                tag._type = TagConstants.META_TAGS.find((f) => f === tag!.longName)
                    ? (tag._type = TagType.Metadata)
                    : (tag._type = TagType.CustomMetadata);
            }
            return tag;
        }

        //Other tag
        if (this.TAG_REGEX.test(sanitizedName)) {
            let tag = this.parseRegex(sanitizedName, this.TAG_REGEX);
            if (tag) {
                if (TagConstants.META_TAGS.find((f) => f === tag!.longName)) {
                    tag._type = TagType.Metadata;
                } else if (tag.longName.startsWith("start_of_")) {
                    tag._type = TagType.StartOfBlock;
                } else if (tag.longName.startsWith("end_of_")) {
                    tag._type = TagType.EndOfBlock;
                } else if (tag.longName === TagConstants.DEFINE) {
                    tag._type = TagType.Define;
                } else if (tag.longName === TagConstants.COMMENT) {
                    tag._type = TagType.Comment;
                } else if (TagConstants.RECOGNIZED_CUSTOM_TAGS.includes(tag.longName)) {
                    tag._type = TagType.Custom;
                } else {
                    return undefined;
                }
                return tag;
            }
        }

        return undefined;
    }

    private static parseRegex(name: string, regex: RegExp): Tag | undefined {
        let tag = new Tag();
        const sanitizedName = name.trim();
        const match = sanitizedName.match(regex);
        if (match && match.groups) {
            if (match.groups["name"]) {
                tag._originalName = match.groups["name"];
            } else {
                return undefined;
            }
            if (match.groups["value"]) {
                tag._value = match.groups["value"];
            }
            return tag;
        }
    }
}
