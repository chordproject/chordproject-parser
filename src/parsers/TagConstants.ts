export abstract class TagConstants {
    //#region Constants
    /**
     * Album meta directive. See https://www.chordpro.org/chordpro/directives-album/
     */
    static readonly ALBUM = "album";

    /**
     * Artist meta directive. See https://www.chordpro.org/chordpro/directives-arranger/
     */
    static readonly ARRANGER = "arranger";

    /**
     * Artist meta directive. See https://www.chordpro.org/chordpro/directives-artist/
     */
    static readonly ARTIST = "artist";

    /**
     * Capo meta directive. See https://www.chordpro.org/chordpro/directives-capo/
     */
    static readonly CAPO = "capo";

    /**
     * Comment directive. See https://www.chordpro.org/chordpro/directives-comment/
     */
    static readonly COMMENT = "comment";

    /**
     * Define directive. See https://www.chordpro.org/chordpro/directives-define/
     */
    static readonly DEFINE = "define";

    /**
     * Composer meta directive. See https://www.chordpro.org/chordpro/directives-composer/
     */
    static readonly COMPOSER = "composer";

    /**
     * Copyright meta directive. See https://www.chordpro.org/chordpro/directives-copyright/
     */
    static readonly COPYRIGHT = "copyright";

    /**
     * Duration meta directive. See https://www.chordpro.org/chordpro/directives-duration/
     */
    static readonly DURATION = "duration";
    /**
     * End of chorus directive. See https://www.chordpro.org/chordpro/directives-env_bridge/
     */
    static readonly END_OF_BRIDGE = "end_of_bridge";
    /**
     * End of chorus directive. See https://www.chordpro.org/chordpro/directives-env_chorus/
     */
    static readonly END_OF_CHORUS = "end_of_chorus";
    /**
     * End of chorus directive. See https://www.chordpro.org/chordpro/directives-env_tab/
     */
    static readonly END_OF_TAB = "end_of_tab";

    /**
     * End of verse directive. See https://www.chordpro.org/chordpro/directives-env_verse/
     */
    static readonly END_OF_VERSE = "end_of_verse";

    /**
     * Start of grid directive. See https://www.chordpro.org/chordpro/directives-env_grid/
     */
    static readonly START_OF_GRID = "start_of_grid";

    /**
     * End of grid directive. See https://www.chordpro.org/chordpro/directives-env_grid/
     */
    static readonly END_OF_GRID = "end_of_grid";

    /**
     * Key meta directive. See https://www.chordpro.org/chordpro/directives-key/
     */
    static readonly KEY = "key";

    /**
     * Lyricist meta directive. See https://www.chordpro.org/chordpro/directives-lyricist/
     */
    static readonly LYRICIST = "lyricist";

    /**
     * Start of bridge directive. See https://www.chordpro.org/chordpro/directives-env_bridge/
     */
    static readonly START_OF_BRIDGE = "start_of_bridge";

    /**
     * Start of chorus directive. See https://www.chordpro.org/chordpro/directives-env_chorus/
     */
    static readonly START_OF_CHORUS = "start_of_chorus";

    /**
     * Start of tab directive. See https://www.chordpro.org/chordpro/directives-env_verse/
     */
    static readonly START_OF_TAB = "start_of_tab";

    /**
     * Start of verse directive. See https://www.chordpro.org/chordpro/directives-env_verse/
     */
    static readonly START_OF_VERSE = "start_of_verse";

    /**
     * Subtitle meta directive. See https://www.chordpro.org/chordpro/directives-subtitle/
     */
    static readonly SUBTITLE = "subtitle";

    /**
     * Tempo meta directive. See https://www.chordpro.org/chordpro/directives-tempo/
     */
    static readonly TEMPO = "tempo";

    /**
     * Time meta directive. See https://www.chordpro.org/chordpro/directives-time/
     */
    static readonly TIME = "time";

    /**
     * Title meta directive. See https://www.chordpro.org/chordpro/directives-title/
     */
    static readonly TITLE = "title";

    /**
     * Year meta directive. See https://www.chordpro.org/chordpro/directives-year/
     */
    static readonly YEAR = "year";

    static readonly TITLE_SHORT = "t";
    static readonly SUBTITLE_SHORT = "st";
    static readonly COMMENT_SHORT = "c";
    static readonly START_OF_CHORUS_SHORT = "soc";
    static readonly END_OF_CHORUS_SHORT = "eoc";
    static readonly START_OF_VERSE_SHORT = "sov";
    static readonly END_OF_VERSE_SHORT = "eov";
    static readonly START_OF_BRIDGE_SHORT = "sob";
    static readonly END_OF_BRIDGE_SHORT = "eob";
    static readonly START_OF_TAB_SHORT = "sot";
    static readonly END_OF_TAB_SHORT = "eot";
    static readonly START_OF_GRID_SHORT = "sog";
    static readonly END_OF_GRID_SHORT = "eog";

    static readonly META_TAGS = [
        TagConstants.ALBUM,
        TagConstants.ARRANGER,
        TagConstants.ARTIST,
        TagConstants.CAPO,
        TagConstants.COMPOSER,
        TagConstants.COPYRIGHT,
        TagConstants.DURATION,
        TagConstants.KEY,
        TagConstants.LYRICIST,
        TagConstants.TEMPO,
        TagConstants.TIME,
        TagConstants.TITLE,
        TagConstants.SUBTITLE,
        TagConstants.YEAR,
    ];

    static readonly START_BLOCK_TAGS = [
        TagConstants.START_OF_BRIDGE,
        TagConstants.START_OF_CHORUS,
        TagConstants.START_OF_TAB,
        TagConstants.START_OF_VERSE,
    ];

    static readonly END_BLOCK_TAGS = [TagConstants.END_OF_BRIDGE, TagConstants.END_OF_CHORUS, TagConstants.END_OF_TAB, TagConstants.END_OF_VERSE];

    /**
     * Valid ChordPro directives this parser doesn't give special handling to yet (preamble,
     * sort keys, the generic {tag} escape hatch, comment/image variants). Accepted as a plain
     * Custom tag instead of an "unknown tag" warning, since they're valid spec syntax - the
     * editor (chordproject-editor) also treats these as known/valid, so the two must agree.
     */
    static readonly RECOGNIZED_CUSTOM_TAGS = [
        "new_song",
        "ns",
        "sorttitle",
        "sortartist",
        "tag",
        "highlight",
        "comment_italic",
        "ci",
        "comment_box",
        "cb",
        "image",
    ];
}
