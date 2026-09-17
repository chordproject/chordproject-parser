# ChordProject Parser

A TypeScript library for parsing, transposing and formatting ChordPro songs.

## Overview

Parse any ChordPro song by using the **ChordProParser**.
This gives back a *Song* object that can then be transposed with the **Transposer** or formatted with the **ChordProFormatter**.

**Part of [ChordProject](https://chordproject.com/)**

## Usage

### Setup

To install run:

```sh
$ npm i @chordproject/parser
```

Load with `import`:

```typescript
import { ChordProParser } from "@chordproject/parser";
```

### Parser

To use the ChordProParser:

```typescript
const parser = new ChordProParser();
const song = parser.parse(chordSheet);
```
*chordSheet* is a string variable that contains the raw ChordPro song.

### Formatter

You can choose between 3 formatters: 
- **TextFormatter**: output the song as text
- **HtmlFormatter**: output the song as HTML
- **ChordProFormatter**: output the song as a "cleaned" ChordPro

```typescript
const formatter = new HtmlFormatter();
const songText = formatter.format(song);
```

The formatters have default settings.

You can pass the settings in the formatter's constructor...

```typescript
const settings = new FormatterSettings();
settings.showChords = false;
const formatter = new HtmlFormatter(settings);
```

...or directly change the settings after the initialization

```typescript
const formatter = new HtmlFormatter();
formatter.settings.showChords = false;
```

## ChordPro format: Lyrics and Chords

Essentially, it looks like this:

```
    {title: Praise Adonai}
    {artist: Paul Baloche}

    {sot}
    E|-----2---2-----|-------3-3---
    B|---3---3---3---|-----0-------
    G|-2-------------|---0---------
    D|---------------|---0---------
    A|---------------|-2-----------
    E|---------------|-------------
    {eot}

    [Am]Who is like [F]Him,
    The Lion and the [C]Lamb
    Seated on the [G]throne    [E7]
    [Am]Mountains bow [F]down
    Every ocean [C]roars
    To the Lord of [G]hosts

    {start_of_chorus}
    [F]Praise Ado[Am]nai
    From the [G]rising of the sun
    'Till the [Dm7]end of every [F]day[G]
    [F]Praise Ado[Am]nai
    All the [G]nations of the earth
    All the [Dm7] Angels and the [F]Saints
    [G]Sing [Bbsus2]praise
    {end_of_chorus}
```

# With source code

## Demo

To start the demo:

```sh
$ npm run dev
```

...then click on the http://localhost:8081/ link to open the demo in your browser

## Unit test

You can add tests in the tests directory and execute them with

```sh
$ npm run test
```

or for the coverage

```sh
$ npm run test:ci
```
## Contributing

This project welcomes contributions of all types. If you find any bug or want some new features, please feel free to create an issue or submit a pull request.

Join the community and chat with us on **[Discord](https://discord.gg/ZQAgwBC9c8)**

## License
[GNU Affero General Public License v3.0](LICENSE)
