import { Lyrics, LyricsType, Tabs } from "../../models/sections";
import { TimeSignature } from "../../models";
import { ChordProParser } from "../../parsers";

test("parse chordpro", () => {
    const cp = new ChordProParser();
    const song = cp.parse(sheet);
    expect(song.albums[0]).toEqual("Chordpro");
    expect(song.arrangers[0]).toEqual("Ben");
    expect(song.artists[0]).toEqual("Paul Baloche");
    expect(song.capo).toEqual(4);
    expect(song.composers[0]).toEqual("Bill");
    expect(song.copyright).toEqual("2014 Shitting Bull Inc.");
    expect(song.duration).toEqual(4 * 60 + 32);
    expect(song.key?.toString()).toEqual("Am");
    expect(song.lyricists[0]).toEqual("John");
    expect(song.tempo).toEqual(120);
    expect(song.time).toEqual(<TimeSignature>{ topNumber: 6, bottomNumber: 8 });
    expect(song.title).toEqual("Praise Adonai");
    expect(song.subtitle).toEqual("ChordProject parser demo");
    expect(song.year).toEqual(2000);

    const tabSection = <Tabs>song.sections.find((f: any) => f instanceof Tabs);
    expect(tabSection?.lines.length).toEqual(6);
    expect(tabSection?.value).toBeNull();

    const chorusSection = <Lyrics>song.sections.find((f: any) => f instanceof Lyrics && f.type === LyricsType.Chorus);
    expect(chorusSection?.lines.length).toEqual(7);
    expect(chorusSection?.value).toEqual("Chorus 1");

    const uniqueChords = song.getUniqueChords();
    expect(uniqueChords.length).toEqual(10);
});

const sheet = `


{title: Praise Adonai}
{subtitle: ChordProject parser demo}
{artist: Paul Baloche}
{album: Chordpro}
{arranger: Ben}
{composer: Bill}
{lyricist: John}
{copyright: 2014 Shitting Bull Inc.}
{duration: 4:32}
{tempo: 120}
{time: 6/8}
{year: 2000}
{key: Am}
{capo: 4}

{sot}
E|-----2---2-----|-------3-3---
B|---3---3---3---|-----0-------
G|-2-------------|---0---------
D|---------------|---0---------
A|---------------|-2-----------
E|---------------|-------------
{eot}

{c:Verse 1}
[Am]Who is like [Bb11]Him,
The Lion and the [C#m]Lamb
Seated on the [Gm]throne    [E7]
[Am]Mountains bow [F]down
Every ocean [C]roars
To the Lord of [G]hosts  

{start_of_chorus: Chorus 1}
[F]Praise Ado[Am]nai
From the [G]rising of the sun
'Till the [Dm7]end of every [F]day[G]
[F]Praise Ado[Am]nai
All the [G]nations of the earth
All the [Dm7] Angels and the [F]Saints
[G]Sing [Bbsus2]praise
{end_of_chorus}

`.substring(1);

// Regression test: {meta: ...} tags used to fall through into start_of_block parsing
// (missing `break` in ChordProParser.parseTag's switch), silently injecting a bogus
// "Custom" lyrics section and splitting the surrounding verse in two.
test("parse custom meta tag without corrupting section structure", () => {
    const cp = new ChordProParser();
    const song = cp.parse(metaSheet);

    expect(song.customMetadatas).toContainEqual(["guitarist", "Ritchie Blackmore"]);

    const customSections = song.sections.filter(
        (s: any) => s instanceof Lyrics && s.type === LyricsType.Custom
    );
    expect(customSections.length).toEqual(0);

    const verseSection = <Lyrics>song.sections.find((f: any) => f instanceof Lyrics && f.type === LyricsType.Verse);
    expect(verseSection?.lines.length).toEqual(2);
});

test("warnings carry a stable code and interpolation params, not just an English message", () => {
    const cp = new ChordProParser();
    cp.parse(`{not a real tag}\n`);

    expect(cp.warnings).toHaveLength(1);
    expect(cp.warnings[0].code).toEqual("unknown_or_malformed_tag");
    expect(cp.warnings[0].params).toEqual({});
});

// Regression test: blank lines left between the metadata directives and an explicit
// {start_of_chorus}/{start_of_verse} used to be saved as their own "phantom" section (only
// EmptyLine entries, no real content), which counted as the song's first section - pushing
// the real chorus/verse down to "second section" and giving it a full top margin instead of
// being flush with the top like an actual first section should be.
test("does not create a phantom section from blank lines before the first start_of block", () => {
    const cp = new ChordProParser();
    const song = cp.parse(
        `
{title: Me gozare}
{key: B}


{start_of_chorus}
[Em]Me gozare, me alegrare,
{end_of_chorus}
`.substring(1)
    );

    expect(song.sections).toHaveLength(1);
    expect(song.sections[0]).toBeInstanceOf(Lyrics);
    expect((song.sections[0] as Lyrics).type).toEqual(LyricsType.Chorus);
});

const metaSheet = `
{title: Test Song}
{key: C}

{start_of_verse}
[C]Line one
{meta: guitarist Ritchie Blackmore}
[G]Line two
{end_of_verse}
`.substring(1);
