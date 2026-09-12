import { ChordProParser } from "../../parsers";
import { HtmlFormatter } from "../HtmlFormatter";

// Regression test: blank lines left over in the source between the metadata block and the
// first lyric line (very common ChordPro formatting) used to render as a big empty gap at
// the top of the song, even with showMetadata off - because Formatter.format() rendered
// every EmptyLine unconditionally, including ones before any real content in a section.
test("does not render leading blank lines within a section as empty-line divs", () => {
    const sheet = `
{title: Test}
{key: Gm}


[Gm]Doce hombres, un maestro,
[F]doce panes y la vida,`.substring(1);

    const song = new ChordProParser().parse(sheet);
    const formatter = new HtmlFormatter();
    formatter.settings.showMetadata = false;
    const html = formatter.format(song).join("");

    expect(html).not.toContain("empty-line");
    expect(html).toContain("Doce");
    expect(html).toContain("hombres,");
});

test("still renders blank lines that separate paragraphs within a section", () => {
    const sheet = `
{title: Test}
{key: Gm}

[Gm]First line

[F]Second paragraph
`.substring(1);

    const song = new ChordProParser().parse(sheet);
    const formatter = new HtmlFormatter();
    const html = formatter.format(song).join("");

    expect(html).toContain("empty-line");
});
