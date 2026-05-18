<p align="center">
  <br/>
  <br/>
  <img src="https://github.com/natancabral/pdfkit-table/blob/main/example/logo.png" alt="pdfkit-table (Natan Cabral)"/>
  <br/>
  <br/>
  <a href="https://www.buymeacoffee.com/natancabral" target="_blank"><img width="150" src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me a Coffee" style="width: 150px !important;" ></a>
  <br/>
  <br/>
</p>

# pdfkit-table

<div>
  <a href="https://www.npmjs.com/package/pdfkit-table">
    <img src="https://img.shields.io/badge/npm-pdfkit--table-red?style=for-the-badge&logo=npm" alt="pdfkit-table on npm"/>
  </a>
  &nbsp;
  <a href="https://github.com/natancabral/pdfkit-table">
    <img src="https://img.shields.io/badge/GitHub-pdfkit--table-black?style=for-the-badge&logo=github" alt="pdfkit-table on GitHub"/>
  </a>
</div>

#### Generate PDF tables with TypeScript / JavaScript (PDFKit plugin)
Helps to draw information in simple tables using pdfkit.

> **v0.2.00** — full TypeScript rewrite, ESM `import` support and pdfkit dependency injection,


## Examples ([open](https://github.com/natancabral/pdfkit-table/tree/main/example/))

- HTTP server — [JS](https://github.com/natancabral/pdfkit-table/blob/main/example/document-00-server.js) | *(streamed response)*
- Basic table — [JS](https://github.com/natancabral/pdfkit-table/blob/main/example/document-01-example.js) | [PDF](https://github.com/natancabral/pdfkit-table/raw/main/example/document-01-example.pdf)
- Colors — [JS](https://github.com/natancabral/pdfkit-table/blob/main/example/document-02-color.js) | [PDF](https://github.com/natancabral/pdfkit-table/raw/main/example/document-02-color.pdf)
- JSON + `table.json` — [JS](https://github.com/natancabral/pdfkit-table/blob/main/example/document-03-json.js) | [PDF](https://github.com/natancabral/pdfkit-table/raw/main/example/document-03-json.pdf)
- All scenarios — [JS](https://github.com/natancabral/pdfkit-table/blob/main/example/document-04-all-scenerios.js) | [PDF](https://github.com/natancabral/pdfkit-table/raw/main/example/document-04-all-scenerios.pdf)
- All features — [JS](https://github.com/natancabral/pdfkit-table/blob/main/example/document-05-all-features.js) | [PDF](https://github.com/natancabral/pdfkit-table/raw/main/example/document-05-all-features.pdf)
- Pages in row — [JS](https://github.com/natancabral/pdfkit-table/blob/main/example/document-06-pages-in-row.js) | [PDF](https://github.com/natancabral/pdfkit-table/raw/main/example/document-06-pages-in-row.pdf)
- Images — [JS](https://github.com/natancabral/pdfkit-table/blob/main/example/document-07-images.js) | [PDF](https://github.com/natancabral/pdfkit-table/raw/main/example/document-07-images.pdf)
- Headers — [JS](https://github.com/natancabral/pdfkit-table/blob/main/example/document-08-headers.js) | [PDF](https://github.com/natancabral/pdfkit-table/raw/main/example/document-08-headers.pdf)
- RTL (right-to-left) — [JS](https://github.com/natancabral/pdfkit-table/blob/main/example/document-09-tls.js) | [PDF](https://github.com/natancabral/pdfkit-table/raw/main/example/document-09-tls.pdf)
- Landscape — [JS](https://github.com/natancabral/pdfkit-table/blob/main/example/document-10-landscape.js) | [PDF](https://github.com/natancabral/pdfkit-table/raw/main/example/document-10-landscape.pdf)
- Many lines — [JS](https://github.com/natancabral/pdfkit-table/blob/main/example/document-11-many-lines.js) | [PDF](https://github.com/natancabral/pdfkit-table/raw/main/example/document-11-many-lines.pdf)


<img src="https://github.com/natancabral/pdfkit-table/blob/main/example/pdf-sample.png"/>

## Install 

[![NPM](https://nodei.co/npm/pdfkit-table.png)](https://www.npmjs.com/package/pdfkit-table)


[![Yarn](https://img.shields.io/badge/yarn-install-blue.svg)](https://yarnpkg.com/package/pdfkit-table)
```bash
yarn add pdfkit-table
```

[![NPM](https://img.shields.io/badge/npm-install-red.svg)](https://www.npmjs.com/package/pdfkit-table)
```bash
npm install pdfkit-table
```

<div>

</div>

## Import

All three styles work out of the box — no bundler configuration needed:

```js
// ESM / Node ≥ 12
import PDFDocument from 'pdfkit-table';
import { PDFDocumentWithTables, createPdfDocumentWithTables } from 'pdfkit-table';

// TypeScript
import PDFDocument, { type Table, type TableOptions } from 'pdfkit-table';

// CommonJS
const PDFDocument = require('pdfkit-table');
const { PDFDocumentWithTables, createPdfDocumentWithTables } = require('pdfkit-table');

```

## Using your own PDFKit

Use **`createPdfDocumentWithTables`** when you want to plug in **your** `pdfkit` package (different semver, fork, patched build, or single shared copy with the rest of the app). The constructor must stay compatible with **pdfkit’s `PDFDocument`** (same methods this library calls on `super`, drawing API, fonts, etc.).

### CommonJS

```js
const fs = require('fs');
const pdfkit = require('pdfkit'); // resolved from your project / fork
const { createPdfDocumentWithTables } = require('pdfkit-table');

const PDFDocument = createPdfDocumentWithTables(pdfkit);
const doc = new PDFDocument({ margin: 30, size: 'A4' });
doc.pipe(fs.createWriteStream('./document.pdf'));

(async () => {
  await doc.table({ headers: ['Column'], rows: [['value']] }, {});
  doc.end();
})();
```

### TypeScript / ESM

```ts
import fs from 'fs';
import pdfkit from 'pdfkit';
import { createPdfDocumentWithTables } from 'pdfkit-table';

const PDFDocument = createPdfDocumentWithTables(pdfkit);
const doc = new PDFDocument({ margin: 30, size: 'A4' });
doc.pipe(fs.createWriteStream('./document.pdf'));

void (async () => {
  await doc.table({ headers: ['Column'], rows: [['value']] }, {});
  doc.end();
})();
```


<!---
### Default export

`require('pdfkit-table')` (and `import PDFDocument from 'pdfkit-table'`) still builds on **`pdfkit` declared as a dependency of `pdfkit-table`** — existing snippets keep working without injection.

### Backward compatibility (previous releases)

- **CommonJS**: `const PDFDocument = require('pdfkit-table')` — same as before (`module.exports`, `module.exports.default`, and **`PDFDocumentWithTables`** alias).
- **`doc.table(table, options?, callback?)`** — parameter names match the legacy API (`table`, then `options`, then optional `callback`). If the **second argument is a function**, it is treated as **`callback`** (older behaviour).
- **`doc.tables(tables, callback?)`** — first argument is the **array of tables**, second optional callback (same shape as before).
- **`addBackground(rect, fillColor?, fillOpacity?, callback?)`** — unchanged.
- **`Table.data` / `Table.data`**: prefer **`data`** for object rows; **`data`** is still supported. If **`data` is present** (even `[]`), it wins; otherwise **`data`** is used (backward compatible JSON and old examples).
- **TypeScript**: older type names remain as aliases — **`Options`** (`TableOptions`), **`Data`** (`DataRow`), **`DataOptions`** (`RowStyleOptions`), **`Title`** (`TitleObject`), **`Divider`**, **`DividerOptions`** (`DividerPart`). **`CellRenderer`** keeps optional indices compatible with older typings.
-->


## Use

Minimal flow: create a document, **`await doc.table(...)`** (tables are asynchronous), then `doc.end()`.

```js
const fs = require('fs');
const PDFDocument = require('pdfkit-table');

const doc = new PDFDocument({ margin: 30, size: 'A4' });
doc.pipe(fs.createWriteStream('./document.pdf'));

(async () => {
  const table = {
    title: '',
    headers: [],
    data: [],   // keyed rows ({ property } per header)
    rows: [],   // or simple string[][] when headers are strings
  };

  await doc.table(table, { /* TableOptions — width, prepareRow, … */ });

  // Express: pipe once — doc.pipe(res);
  doc.end(); // closes the stream after all awaited tables resolve
})();
```

## Recipe examples

The **Examples** section at the top lists every script and PDF under [`example/`](https://github.com/natancabral/pdfkit-table/tree/main/example/). Below are the same patterns in short form for documentation.

### Server example

- [Simple Server Example — TypeScript](https://github.com/natancabral/pdfkit-table/blob/main/example-server)
<br />
<img src="https://github.com/natancabral/pdfkit-table/blob/main/example-server/assets/server-terminal.png">

Pipe the PDFKit stream **once** (to `res` or to `fs`). Avoid `doc.pipe(fs)` and `doc.pipe(res)` on the same document.

```js
app.get('/create-pdf', async (req, res) => {
  const PDFDocument = require('pdfkit-table');

  res.setHeader('Content-Type', 'application/pdf');

  const doc = new PDFDocument({ margin: 30, size: 'A4' });
  doc.pipe(res);

  const table = {
    headers: ['Country', 'Conversion rate'],
    rows: [['Switzerland', '12%']],
  };

  await doc.table(table, { width: 300 });
  doc.end();
});
```

See also [`example/document-00-server.js`](https://github.com/natancabral/pdfkit-table/blob/main/example/document-00-server.js).

### Example 1 — simple array (`rows`)

```js
;(async () => {
  const table = {
    title: 'Title',
    subtitle: 'Subtitle',
    headers: ['Country', 'Conversion rate', 'Trend'],
    rows: [
      ['Switzerland', '12%', '+1.12%'],
      ['France', '67%', '-0.98%'],
      ['England', '33%', '+4.44%'],
    ],
  };

  await doc.table(table, { width: 300 });
  // …or explicit column widths (pt): { columnsSize: [200, 100, 100] }

  doc.end();
})();
```


### Example 2 — `data` + `rows`, custom renderers

```js
;(async () => {
  const table = {
    title: 'Title',
    subtitle: 'Subtitle',
    headers: [
      { label: 'Name', property: 'name', width: 60, renderer: null },
      { label: 'Description', property: 'description', width: 150, renderer: null },
      { label: 'Price 1', property: 'price1', width: 100, renderer: null },
      { label: 'Price 2', property: 'price2', width: 100, renderer: null },
      { label: 'Price 3', property: 'price3', width: 80, renderer: null },
      {
        label: 'Price 4',
        property: 'price4',
        width: 43,
        renderer: (value, indexColumn, indexRow, row, rectRow, rectCell) =>
          `U$ ${Number(value).toFixed(2)}`,
      },
    ],
    data: [
      {
        name: 'Name 1',
        description:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean mattis ante in laoreet egestas. ',
        price1: '$1',
        price3: '$ 3',
        price2: '$2',
        price4: '4',
      },
      {
        options: { fontSize: 10, separation: true },
        name: 'bold:Name 2',
        description: 'bold:Lorem ipsum dolor.',
        price1: 'bold:$1',
        price3: { label: 'PRICE $3', options: { fontSize: 12 } },
        price2: '$2',
        price4: '4',
      },
    ],
    rows: [
      [
        'Apple',
        'Nullam ut facilisis mi. Nunc dignissim ex ac vulputate facilisis.',
        '$ 105,99',
        '$ 105,99',
        '$ 105,99',
        '105.99',
      ],
    ],
  };

  await doc.table(table, {
    prepareHeader: () => doc.font('Helvetica-Bold').fontSize(8),
    prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
      doc.font('Helvetica').fontSize(8);
      if (indexColumn === 0) doc.addBackground(rectRow, 'blue', 0.15);
    },
  });

  doc.end();
})();
```

### Example 3 — JSON **string** (`JSON.stringify` → `doc.table`)

String renderers belong on **`headers[].renderer`** when you need serialized JSON (`@deprecated` — prefer real functions).

```js
;(async () => {
  const tableJson = JSON.stringify({
    headers: [
      { label: 'Name', property: 'name', width: 100 },
      { label: 'Age', property: 'age', width: 100 },
      {
        label: 'Year',
        property: 'year',
        width: 100,
        renderer:
          'function(value, indexColumn, indexRow){ return value + "(" + (1 + indexRow) + ")"; }',
      },
    ],
    data: [
      { name: 'bold:Name 1', age: 'Age 1', year: 'Year 1' },
      { name: 'Name 2', age: 'Age 2', year: 'Year 2' },
      { name: 'Name 3', age: 'Age 3', year: 'Year 3' },
    ],
    rows: [['Name 4', 'Age 4', 'Year 4']],
    options: { width: 300 },
  });

  await doc.table(tableJson); // parses JSON; merges embedded `options`
  doc.end();
})();
```

### Example 4 — JSON file (object **or** array)

See [`example/table.json`](https://github.com/natancabral/pdfkit-table/blob/main/example/table.json).

```js
;(async () => {
  const json = require('./table.json');

  if (Array.isArray(json)) {
    await doc.tables(json);
  } else {
    await doc.table(json, json.options ?? {});
  }

  doc.end();
})();
```


## Table

- <code>Array.&lt;object&gt;</code> | <code>JSON</code>
  - headers <code>Array.&lt;object&gt;</code> | <code>Array.[]</code>
    - label <code>String</code>
    - property <code>String</code>
    - width <code>Number</code>
    - align <code>String</code>
    - valign <code>String</code>
    - headerColor <code>String</code>
    - headerOpacity <code>Number</code>
    - headerAlign <code>String</code>
    - columnColor or ~~backgroundColor~~: <code>String</code>
    - columnOpacity or ~~backgroundOpacity~~: <code>Number</code>
    - padding <code>Number</code> | <code>Array</code> | <code>Object</code>
    - renderer <code>Function</code> function( value, indexColumn, indexRow, row, rectRow, rectCell ) { return value }
  - data <code>Array.&lt;object&gt;</code>
  - ~~datas~~ <code>Array.&lt;object&gt;</code> (deprecated — use `data`)
  - rows <code>Array.[]</code>
  - title <code>String</code> | <code>Object</code>
  - subtitle <code>String</code> | <code>Object</code>
  - options <code>Object</code>

### Headers

| Properties           | Type                  | Default            | Description       |
-----------------------|-----------------------|--------------------|-------------------|
| **label**            | <code>String</code>   | undefined          | description       |
| **property**         | <code>String</code>   | undefined          | id                |
| **width**            | <code>Number</code>   | undefined          | width of column   |
| **align**            | <code>String</code>   | left               | alignment         |
| **valign**           | <code>String</code>   | undefined          | vertical alignment. ex: valign: "center"|
| **headerColor**      | <code>String</code>   | grey or #BEBEBE    | color of header   |
| **headerOpacity**    | <code>Number</code>   | 0.5                | opacity of header |
| **headerAlign**      | <code>String</code>   | left               | only header       |
| **columnColor** or ~~backgroundColor~~  | <code>String</code>   | undefined          | color of column   |
| **columnOpacity** or ~~backgroundOpacity~~| <code>Number</code>   | undefined          | opacity of column   |
| **padding**          | `Number | Array | Object` | `0`         | cell padding — overrides global `padding`. CSS shorthand: `[top, right, bottom, left]` |
| **renderer**         | <code>Function</code> | Function           | function( value, indexColumn, indexRow, row, rectRow, rectCell ) { return value } |


#### Simple headers example

```js
const table = {
  // simple headers only with ROWS (not DATA)  
  headers: ['Name', 'Age'],
  // simple content
  rows: [
    ['Jack', '32'], // row 1
    ['Maria', '30'], // row 2
  ]
};
```

#### Complex headers example

```js
const table = {
  // complex headers work with ROWS and DATA  
  headers: [
    { label:"Name", property: 'name', width: 100, renderer: null },
    { label:"Age", property: 'age', width: 100, renderer: (value) => `U$ ${Number(value).toFixed(1)}` },
  ],
  // complex content
  data: [
    { name: 'bold:Jack', age: 32, },
    // age is object value with style options
    { name: 'Maria', age: { label: 30 , options: { fontSize: 12 }}, },
  ],
  // simple content (works fine!)
  rows: [
    ['Jack', '32'], // row 1
    ['Maria', '30'], // row 2
  ]
};

```

### Options

| Property | Type | Default | Description |
|---|---|---|---|
| **title** | `String | Object` | undefined | table title |
| **subtitle** | `String | Object` | undefined | table subtitle |
| **width** | `Number` | undefined | total table width |
| **x** | `Number | null` | undefined | x position. Pass `null` or `-1` to reset to left margin |
| **y** | `Number` | undefined | y position (top) |
| **divider** | `Object` | — | divider line config `{ header, horizontal, vertical }` |
| **columnsSize** | `Array` | `[]` | column widths (simple tables) |
| **columnSpacing** | `Number` | `3` | vertical space between rows |
| **padding** | `Number | Array | Object` | `0` | cell padding — CSS shorthand `[top, right, bottom, left]` |
| **addPage** | `Boolean` | `false` | start table on a fresh page |
| **hideHeader** | `Boolean` | `false` | hide the header row |
| **minRowHeight** | `Number` | `0` | minimum row height in points |
| **useSafelyMarginBottom** | `Boolean` | `true` | enable proactive page-break before rows that do not fit |
| **pageBreakThreshold** | `Number` (0–1) | `0.8` | fraction of page height below which a row triggers a proactive page break. Rows **taller** than `pageContentHeight × threshold` render in-place without an empty gap. Default `0.8` means only rows that fill < 80 % of the page are moved to a new page. |
| **endOfPageThreshold** | `Number` (0–1) | — | fraction of usable page height defining "near the bottom". A proactive break fires when remaining space ≤ this fraction AND the row fits within `pageBreakThreshold`. Default: page bottom margin |
| **keepRowsTogether** | `Boolean` | `false` | when `true`, every row starts at the current cursor — no proactive page breaks. Ideal for tables where every cell contains multi-page text. |
| **absolutePosition** | `Boolean` | `false` | use absolute x / y coordinates |
| **prepareHeader** | `Function` | — | `(this: PDFDoc) => void` — called before rendering the header row |
| **prepareRow** | `Function` | — | `(row, indexColumn, indexRow, rectRow, rectCell) => void` — called before each cell |

#### Options example

```js
const options = {
  title: "Title", // or { label: 'Title', fontSize: 18, color: 'blue', fontFamily: "./fonts/type.ttf" }
  subtitle: "Subtitle",
  width: 500,           // A4 portrait ≈ 595 pt wide
  x: 0,                 // pass null or -1 to reset to left margin
  y: 0,
  divider: {
    header:     { disabled: false, width: 2,   opacity: 1   },
    horizontal: { disabled: false, width: 0.5, opacity: 0.5 },
  },
  padding: 5,           // or [top, right, bottom, left] like CSS
  columnSpacing: 5,
  hideHeader: false,
  minRowHeight: 0,
  prepareHeader: () => doc.font("Helvetica-Bold").fontSize(8),
  prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) =>
    doc.font("Helvetica").fontSize(8),
}
```

#### Page-break control

```js
// Option A — pageBreakThreshold
// Only move rows to a new page if they fit in < 60 % of the page.
// Rows taller than 60 % start in-place and flow naturally across pages.
await doc.table(table, {
  pageBreakThreshold: 0.6,
  prepareHeader: () => doc.font('Helvetica-Bold').fontSize(8),
  prepareRow:    () => doc.font('Helvetica').fontSize(8),
});

// Option B — keepRowsTogether
// Never insert a proactive page break — every row starts where the cursor is.
// Best for tables where every cell contains long multi-page text.
await doc.table(table, {
  keepRowsTogether: true,
  prepareHeader: () => doc.font('Helvetica-Bold').fontSize(8),
  prepareRow:    () => doc.font('Helvetica').fontSize(8),
});
```

| `pageBreakThreshold` | Effect |
|---|---|
| `0.8` (**default**) | Only rows shorter than 80 % of the page are moved proactively — tall rows stay in-place and overflow naturally. Equivalent to "only `addPage()` breaks the page for big rows." |
| `1.0` | Old behaviour — every row that doesn't fit in remaining space gets a page break, regardless of height. |
| `0.6` | Only move if row < 60 % of page height — tall rows flow in-place |
| `0.0` | Never move any row (same as `keepRowsTogether: true`) |

#### `doc.checkPageBreak(minHeight?)` — prevent orphaned titles

A chainable helper method available on any `PDFDocumentWithTables` instance.
Call it **before** a section title, heading, or `doc.table()` to ensure there
is enough room on the current page.  If the remaining vertical space is less
than `minHeight`, a new page is added automatically.

| Argument | Type | Default | Meaning |
|---|---|---|---|
| *(none)* | — | 10 % of usable height | add a page if less than 10 % remains |
| `0 < n ≤ 1` | `Number` (fraction) | — | treat as percentage of usable page height |
| `n > 1` | `Number` (points) | — | minimum absolute space required (pt) |

Returns `this` so calls can be chained fluently.

```js
// Default — add a page if less than 10 % of usable height remains
doc.checkPageBreak();

// At least 80 pt must remain, otherwise add a new page
doc.checkPageBreak(80);

// At least 15 % of the usable page height must remain
doc.checkPageBreak(0.15);

// Typical chained usage — keeps a title and its table together
doc
  .checkPageBreak(0.2)          // ensure 20 % space before writing the title
  .fontSize(11)
  .font('Helvetica-Bold')
  .text('Section Title')
  .font('Helvetica')
  .fontSize(9)
  .moveDown(0.3);

await doc.table(myTable, opts);
```

#### Options Row

- separation <code>{Boolean}</code>
- color <code>{String}</code>
- columnColor <code>{String}</code>
- columnOpacity <code>{Number}</code>
- backgroundColor <code>{String}</code> (deprecated — use `columnColor`)
- backgroundOpacity <code>{Number}</code> (deprecated — use `columnOpacity`)
- background <code>{Object}</code> `{ color, opacity }` (deprecated — use `columnColor` / `columnOpacity`)
- fontSize <code>{Number}</code>
- fontFamily <code>{String}</code>

```js
data: [
  // options row
  { name: 'Jack', options: { fontSize: 10, fontFamily: 'Courier-Bold', separation: true } },
]
``` 

- String
  - **bold:** 
    - 'bold:Jack'
  - **size{n}:** 
    - 'size11:Jack'
    - 'size20:Jack'

```js
data: [
  // bold
  { name: 'bold:Jack' },
  // size{n}
  { name: 'size20:Maria' },
  { name: 'size8:Will' },
  // normal
  { name: 'San' },
]
``` 

#### Options Cell

- fontSize <code>{Number}</code>
- fontFamily <code>{String}</code>
- color <code>{String}</code>

```js
data: [
  // options cell — value is { label, options }
  {
    name: { label: 'Jack', options: { fontSize: 10, fontFamily: 'Courier-Bold' } },
  },
]
``` 

#### Fonts Family

- Courier
  - Courier-Bold
  - Courier-Oblique
  - Courier-BoldOblique
- Helvetica
  - Helvetica-Bold
  - Helvetica-Oblique
  - Helvetica-BoldOblique
- Symbol
- Times-Roman
  - Times-Bold
  - Times-Italic
  - Times-BoldItalic
- ZapfDingbats

## ToDo

- [Suggestions / Issues / Fixes](https://github.com/natancabral/pdfkit-table/issues)
- striped {Boolean} (corsimcornao)
- colspan - the colspan attribute defines the number of columns a table cell should span.
- sample with database
- margin: marginBottom before, marginTop after

## Changelogs

### 0.2.11
- accept relative column sizes: (null, undefined or '*') [JS](https://github.com/natancabral/pdfkit-table/blob/main/example/document-11-many-lines.js) | [PDF](https://github.com/natancabral/pdfkit-table/raw/main/example/document-11-many-lines.pdf)
    - columnsSize: [50, 300, null],
    - columnsSize: [50, 300, undefined, 200],
    - columnsSize: [100, '*', 50, null],


### 0.2.9

- CG memory
    - Thanks [spanwair-r](https://github.com/spanwair-r)
```js
doc.image('./chart-large.png', 50, 200, { width: 400 });
// Do not use in repeated images. ex: brand
// Use in large images
doc.purgeImage('./chart-large.png');
```


### 0.2.8

- RTL
    - Thanks [moshfeu](https://github.com/moshfeu)
```js
options: {
  rtl: true, // boolean
}
```

### 0.2.2

- Fix
   - Thanks [***@mar10-emil***](https://github.com/mar10-emil)
```js
- added render queue onAddPage
- setting renders queue in constructor
- fixed override for addPage
- added debugging logs
- logging for deb debugging
- removed event handler
- added callback
- rendering set in onFirePageAdded
- removed logs and disabled event triggers
- logging for debugging
- testing sections order
- refactored code 
```

### 0.2.0

#### New features

- **Full TypeScript rewrite** — source moved to `src/` (`types.ts`, `document.ts`, `index.ts`). Ships compiled `dist/` + `.d.ts` declarations. Backward-compatible type aliases preserved (`Options`, `Data`, `Title`, `Divider`, …).
- **ESM `import` support** — `import PDFDocument from 'pdfkit-table'` works in Node.js ESM, TypeScript, and bundlers (Vite, Webpack). `package.json` now includes an `"exports"` map.
- **Dependency injection** — `createPdfDocumentWithTables(PDFKit)` lets you plug in your own `pdfkit` version or fork.
- **`pageBreakThreshold`** option (Number 0–1, default `0.8`) — controls when a tall row is moved to a new page. Rows taller than `80 %` of the page start in-place and overflow naturally; only shorter rows are moved proactively. Set to `1.0` to restore the old always-break behaviour.
- **`keepRowsTogether`** option (Boolean, default `false`) — disables all proactive page breaks; every row starts at the current cursor and overflows naturally.
- **`doc.checkPageBreak(minHeight?)`** — new chainable helper that adds a page when remaining vertical space is less than `minHeight` (default: 10 % of usable height; fractions ≤ 1 are treated as percentages; values > 1 as absolute points). Ideal for keeping section titles and their tables on the same page.

#### Bug fixes

- **`pageAdded` event listener** — `onFirePageAdded` was defined but never registered; repeated header rendering now works correctly on overflow pages.
- **Font mismatch in height calculation** — `computeRowHeight` now applies `prepareRow` before `heightOfString`, so measured height matches rendered height (eliminates gap between text and divider line).
- **Page-break forced for multi-page rows** — rows taller than one full page no longer trigger a forced new page before every row.
- **Text style after mid-row page break** — continued text on overflow pages no longer inherits the header font / color (`restoreRowStyle` mechanism).
- **Text overlap with header on overflow pages** — fixed by temporarily raising `page.margins.top` after the header is drawn so PDFKit's `LineWrapper.nextSection()` positions continued text below the header.
- **`prepareCellPadding` case 3** — corrected CSS shorthand: `[top, right, bottom, left=right]` (was incorrectly `[top, right, bottom, 0]`).
- **`eval()` in renderer** — replaced with `new Function()` (CSP-safe). String renderers are now `@deprecated`.
- **`String.substr`** — replaced deprecated `substr(4, 2)` with `slice(4, 6)`.
- **Weak types** — `any` removed from `prepareRowOptions`, `prepareRowBackground`, `computeRowHeight`; replaced with `unknown` + runtime guards and a `RowHeightInput` union.


### 0.1.90

- Add options minRowHeight
  - Thanks LouiseEH ***@LouiseEH***
```js
  options: {
    minRowHeight: 30, // pixel
  }
```

### 0.1.89

- Fix first line height
  - Thanks José Luis Francisco ***@JoseLuis21*** 

### 0.1.88

- Fix header font family or title object
  - Thanks ***@RastaGrzywa***
```js
let localType = "./font/Montserrat-Regular.ttf";
const table = {
  title: { label: 'Title Object 2', fontSize: 30, color: 'blue', fontFamily: localType },
}
```

### 0.1.87

- Add options hideHeader
  - Thanks Ville ***@VilleKoo***
```js
  options: {
    hideHeader: true,
  }
```

### 0.1.86

- TypeScript (ts) interface (index.ts)
  - Thanks Côte Arthur ***@CoteArthur***

### 0.1.83

- Avoid a table title appearing alone
  - Thanks Alexis Arriola ***@AlexisArriola***
- Problem with long text in cell spreading on several pages
  - Thanks Ed ***@MeMineToMe***

### 0.1.72

- Add ***Divider Lines*** on options
```js
  options: {
    // divider lines
    divider: {
      header: {disabled: false, width: 0.5, opacity: 0.5},
      horizontal: {disabled: true, width: 0.5, opacity: 0.5},
    },
  }
```
  - Thanks Luc Swart ***@lucswart***

### 0.1.70

+ Fix ***y*** position.
  - Thanks Nabil Tahmidul Karim ***@nabiltkarim***

### 0.1.68

+ Added ***Promise***. table is a Promise();
  - Async/Await function 
```js
;(async function(){
  // create document
  const doc = new PDFDocument({ margin: 30, });
  // to save on server
  doc.pipe(fs.createWriteStream("./my-table.pdf"));
  // tables
  await doc.table(table, options);
  await doc.table(table, options);
  await doc.table(table, options);
  // done
  doc.end();
})();
```

+ Added ***callback***. 
```js
  ~~doc.table(table, options, callback)~~;
```

### 0.1.63

+ Added ***valign*** on headers options. (ex: valign:"center")
+ Added ***headerAlign***, alignment only to header.
  ```js
  headers: [
    {label:"Name", property:"name", valign: "center", headerAlign:"right", headerColor:"#FF0000", headerOpacity:0.5 }
  ]
  ```
  - Thanks ***@DPCLive***

### 0.1.60

+ Add callback on addBackground function, add .save() and .restore() style.
+ Header font color
  - Thanks ***@dev-fema***

### 0.1.59

+ Add padding

### 0.1.57

+ Header color and opacity
  ```js
  headers: [
    {label:"Name", property:"name", headerColor:"#FF0000", headerOpacity:0.5 }
  ]
  ```
  - Thanks ***Albert Taveras*** @itsalb3rt


### 0.1.55

+ Align on headers
  ```js
  headers: [
    {label:"Name", property:"name", align:"center"}
  ]
  ```
  - Thanks ***Andrea Fucci***

### 0.1.49

+ Max size page

### 0.1.48

+ Header height size
+ Separate line width

### 0.1.47

+ addHeader() function on all add pages
  - Thanks Anders Wasen ***@QAnders***

### 0.1.46

+ addBackground() function to node 8
  - Thanks ***@mehmetunubol***

### 0.1.45

+ Add **rectCell** on renderer
  - renderer = ( value, indexColumn, indexRow, row, rectRow, rectCell ) => {}
  - Thanks ***Eduardo Miranda***

### 0.1.44

+ Fix paddings and distances

### 0.1.43

+ Remove **rowSpacing**
+ Fix **columnSpacing**

### 0.1.41

+ **Background** color on header to colorize ***column***
  - headers: [
      { label:"Name", property: 'name', ***backgroundColor: 'red', backgroundOpacity: 0.5*** },
      { label:"Age", property: 'age', ***background: { color: 'green', opacity: 0.5 } }***,
  ]
+ **Background** color inside row options data
  - data: [
      { name:"My Name", age: 20, ***options: { backgroundColor: 'red', backgroundOpacity: 0.5 }*** },
      { name:"My Name", age: 20, ***options: { background: { color: 'green', opacity: 0.5 } }*** },
  ]
+ **Background** color inside cell options data
  - data: [
      { name:{ label: "My Name", age: 20, ***options: { backgroundColor: 'red', backgroundOpacity: 0.5 }*** }},
      { name:{ label: "My Name", age: 20, ***options: { background: { color: 'green', opacity: 0.5 } }*** }},
  ]

### 0.1.39

+ **addBackground**  <code>{Function}</code> - Add background peer line. 
  - doc.addBackground( {x, y, width, height}, fillColor, opacity, callback );
+ **prepareRow**  <code>{Function}</code>
  - const options = { prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => { indexColumn === 0 && doc.addBackground(rectRow, 'red', 0.5) } }

### 0.1.38

+ **tables**  <code>{Function}</code> - Add many tables. 
  - doc.tables([ table0, table1, table2, ... ]);

### 0.1.37

+ **addPage**  <code>{Boolean}</code> - Add table on new page.
  - const options = { addPage: true, }; 

### 0.1.36

+ Fix position x, y of title
+ **options.x**: **null** | **-1** // reset position to margins.left

### 0.1.35

+ add **title** <code>{String}</code>
  - const table = { title: "", };
  - const options = { title: "", };
+ add **subtitle** <code>{String}</code>
  - const table = { subtitle: "", };
  - const options = { subtitle: "", };

### 0.1.34

+ add **columnsSize** on options = {} // only to simple table

### 0.1.33

+ Function **tableToJson**
  - import {tableToJson} from 'pdfkit-table';
  - const table = tableToJson('#id_table'); <code>{Object}</code>
+ Function **allTablesToJson**
  - import {allTablesToJson} from 'pdfkit-table';
  - const tables = allTablesToJson(); <code>{Array}</code>

### 0.1.32

+ spacing cell and header alignment
+ **Thank you, contributors!**

### 0.1.31

+ renderer function on json file. { "renderer": "function(value, icol, irow, row){ return (value+1) + `(${(irow+2)})`; }" }
+ fix width table and separation lines size 

## License

The MIT License.

## Author

<table>
  <tr>
    <td>
      <img src="https://github.com/natancabral.png?s=100" width="100"/>
    </td>
    <td>
      Natan Cabral<br />
      <a href="mailto:natancabral@hotmail.com">natancabral@hotmail.com</a><br />
      <a href="https://github.com/natancabral/">https://github.com/natancabral/</a>
    </td>
  </tr>
</table>

## Thank you

- pdfkit - [pdfkit](https://www.npmjs.com/package/pdfkit)
- ideas - [giuseppe-santoro](https://github.com/foliojs/pdfkit/issues/29#issuecomment-56504943)
