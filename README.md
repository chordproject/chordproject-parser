# ChordProject Parser

A TypeScript toolkit for parsing, analyzing, transposing, and formatting ChordPro songs.
Part of [ChordProject](https://chordproject.com/).

## Install

```sh
npm install @chordproject/parser
```

## Parse a song

`ChordProParser.parse()` converts ChordPro source into a structured `Song`. The parser keeps
diagnostics on the parser instance so applications can show warnings beside the source or
translate them for their own UI.

```ts
import { ChordProParser, HtmlFormatter } from '@chordproject/parser';

const parser = new ChordProParser();
const song = parser.parse(`{title: Amazing Grace}
{key: G}
[G]Amazing [C]grace`);

const html = new HtmlFormatter().format(song);
const warnings = parser.warnings;
```

Warnings expose a human-readable `message`, source `lineNumber`, stable `code`, and any
interpolation `params`. Use `code` and `params` instead of `message` when building localized
diagnostics.

## Transform and analyze

`Transposer` returns a transformed song without mutating the original. `transpose()` moves the
song up or down one semitone; `decapo()` converts capo chord shapes to sounding pitches, while
`applyCapo()` transposes down and sets a capo.

```ts
import { ChordProParser, MusicTheoryHelper, Transposer } from '@chordproject/parser';

const song = new ChordProParser().parse('{key: G}\n[G]Amazing grace');
const upOneSemitone = Transposer.transpose(song, 'up');
const soundingPitches = Transposer.decapo(song);
const chordTones = MusicTheoryHelper.getChordTones('G'); // ['G', 'B', 'D']
```

`MusicTheoryHelper` also provides key and enharmonic helpers for applications that need to
reason about notes and chord spelling.

## Format output

The package includes `ChordProFormatter`, `HtmlFormatter`, and `TextFormatter`. All formatters
accept optional `FormatterSettings`; settings can also be changed after construction.

```ts
import { FormatterSettings, HtmlFormatter } from '@chordproject/parser';

const settings = new FormatterSettings();
settings.showChords = false;
settings.showTabs = true;
settings.showMetadata = false;

const formatter = new HtmlFormatter(settings);
const html = formatter.format(song);
```

## ChordPro coverage

The parser builds structured song, section, lyric, chord, tab, and metadata models. It handles
common metadata directives, chord-and-lyric lines, section blocks, tab blocks, chord definitions,
comments, and custom metadata, and reports malformed or unsupported input through `warnings`.
The package also exports the underlying song and music models for applications that need to
inspect or compose parsed content.

## Development

Run the demo on [http://localhost:8081](http://localhost:8081):

```sh
npm install
npm run dev
```

Run the test suite, or the coverage-enabled CI suite:

```sh
npm test
npm run test:ci
```

## Contributing

Issues and pull requests are welcome. Join the community on
[Discord](https://discord.gg/ZQAgwBC9c8).

## License

[GNU Affero General Public License v3.0](LICENSE)
