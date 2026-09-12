/**
 * Stable identifiers for each kind of ParserWarning, so consumers can render their own
 * translated message instead of relying on ParserWarning.message, which is always English.
 */
export abstract class WarningCode {
    static readonly EMPTY_SHEET = "empty_sheet";
    static readonly INVALID_TABS_LINE = "invalid_tabs_line";
    static readonly INTERNAL_ERROR_WRONG_SECTION_TYPE = "internal_error_wrong_section_type";
    static readonly INVALID_LYRICS_LINE = "invalid_lyrics_line";
    /** Params: chord, lyrics */
    static readonly CHORD_PARSE_ERROR_WITH_LYRICS = "chord_parse_error_with_lyrics";
    /** Params: chord */
    static readonly CHORD_PARSE_ERROR = "chord_parse_error";
    static readonly INVALID_TAG = "invalid_tag";
    static readonly UNKNOWN_OR_MALFORMED_TAG = "unknown_or_malformed_tag";
    static readonly UNKNOWN_TAG_TYPE = "unknown_tag_type";
    static readonly COMMENT_TAG_MISSING_VALUE = "comment_tag_missing_value";
    static readonly DEFINE_TAG_MISSING_VALUE = "define_tag_missing_value";
    static readonly DEFINE_TAG_INVALID = "define_tag_invalid";
    /** Params: section */
    static readonly SECTION_NOT_CLOSED = "section_not_closed";
    static readonly END_OF_SECTION_USELESS = "end_of_section_useless";
    static readonly END_OF_SECTION_MISMATCH = "end_of_section_mismatch";
    static readonly TABS_SECTION_ONLY_TABS_LINES = "tabs_section_only_tabs_lines";
    static readonly METADATA_MISSING_VALUE = "metadata_missing_value";
    static readonly UNKNOWN_METADATA_TAG = "unknown_metadata_tag";
    static readonly YEAR_METADATA_INVALID = "year_metadata_invalid";
    static readonly CAPO_METADATA_INVALID = "capo_metadata_invalid";
    static readonly DURATION_METADATA_INVALID = "duration_metadata_invalid";
    static readonly DURATION_TIME_FORMAT_INVALID = "duration_time_format_invalid";
    static readonly TEMPO_METADATA_INVALID = "tempo_metadata_invalid";
    static readonly KEY_METADATA_INVALID = "key_metadata_invalid";
    static readonly TIME_METADATA_INVALID = "time_metadata_invalid";
}
