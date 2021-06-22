# pdfkit-table

#### Generate pdf tables with javascript (PDFKIT plugin)
Helps to draw informations in simple tables using pdfkit. #server-side.


## Examples

[view pdf example](https://github.com/natancabral/pdfkit-table/raw/main/example/document.pdf) | 
[full code example](https://github.com/natancabral/pdfkit-table/blob/main/example/index-example.js) |
[server example](https://github.com/natancabral/pdfkit-table/blob/main/example/index-server-example.js) |
[json example](https://github.com/natancabral/pdfkit-table/blob/main/example/index-json-example.js) |
[both](https://github.com/natancabral/pdfkit-table/blob/main/example/)

<img src="https://github.com/natancabral/pdfkit-table/blob/main/example/pdf-sample.png"/>

## Install

```bash
npm install pdfkit-table
```

## Use

```js
  const fs = require("fs");
  const PDFDocument = require("pdfkit-table");
  const doc = new PDFDocument({ margin: 30, size: 'A4' });
  
  // file name
  doc.pipe(fs.createWriteStream("./file-table.pdf"));
  
  // table
  const table = { 
    headers: [],
    datas: [/* complex data */],
    rows: [/* or simple data */],
  }
  // options
  const options = {}
  // the magic
  doc.table( table, options );

  // done!
  doc.end();

```

### Example 1 - Simple Array
```js
  // requires 
  const table = {
    headers: ["Country", "Conversion rate", "Trend"],
    rows: [
      ["Switzerland", "12%", "+1.12%"],
      ["France", "67%", "-0.98%"],
      ["England", "33%", "+4.44%"],
    ],
  };
  doc.table( table, { width: 300 }); // A4 595.28 x 841.89 (portrait) (about width sizes)
  // end code
```


### Example 2 - Table
```js
  // require
  // A4 595.28 x 841.89 (portrait) (about width sizes)
  const table = {
    headers: [
      { label:"Name", property: 'name', width: 60, renderer: null },
      { label:"Description", property: 'description', width: 150, renderer: null }, 
      { label:"Price 1", property: 'price1', width: 100, renderer: null }, 
      { label:"Price 2", property: 'price2', width: 100, renderer: null }, 
      { label:"Price 3", property: 'price3', width: 80, renderer: null }, 
      { label:"Price 4", property: 'price4', width: 43, 
        renderer: (value, indexColumn, indexRow, row) => { return `U$ ${Number(value).toFixed(2)}` } 
      },
    ],
    datas: [
      { 
        name: 'Name 1', 
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean mattis ante in laoreet egestas. ', 
        price1: '$1', 
        price3: '$ 3', 
        price2: '$2', 
        price4: '4', 
      },
      { 
        options: { fontSize: 10, separation: true},
        name: 'bold:Name 2', 
        description: 'bold:Lorem ipsum dolor.', 
        price1: 'bold:$1', 
        price3: '$3', 
        price2: '$2', 
        price4: '4', 
      },
      { 
        name: 'Name 3', 
        description: 'Lorem ipsum dolor.', 
        price1: 'bold:$1', 
        price4: '4', 
        price2: '$2', 
        price3: { 
          label: 'PRICE $3', options: { fontSize: 12 } 
        }, 
      },
    ],
    rows: [
      [
        "Apple",
        "Nullam ut facilisis mi. Nunc dignissim ex ac vulputate facilisis.",
        "$ 105,99",
        "$ 105,99",
        "$ 105,99",
        "105.99",
      ],
      [
        "Tire",
        "Donec ac tincidunt nisi, sit amet tincidunt mauris. Fusce venenatis tristique quam, nec rhoncus eros volutpat nec. Donec fringilla ut lorem vitae maximus. Morbi ex erat, luctus eu nulla sit amet, facilisis porttitor mi.",
        "$ 105,99",
        "$ 105,99",
        "$ 105,99",
        "105.99",
      ],
    ],
  };

  doc.table(table, {
    prepareHeader: () => doc.font("Helvetica-Bold").fontSize(8),
    prepareRow: (row, i) => doc.font("Helvetica").fontSize(8),
  });
```

### Example 3 - Json

```js
// renderer function inside json file
const tableJson = '{ 
  "headers": [
    { "label":"Name", "property":"name", "width":100 },
    { "label":"Age", "property":"age", "width":100 },
    { "label":"Year", "property":"year", "width":100 }
  ],
  "datas": [
    { "name":"bold:Name 1", "age":"Age 1", "year":"Year 1" },
    { "name":"Name 2", "age":"Age 2", "year":"Year 2" },
    { "name":"Name 3", "age":"Age 3", "year":"Year 3",
        "renderer": "function(value, i, irow){ return value + `(${(1+irow)})`; }"
    }
  ],
  "rows": [
    ["Name 4", "Age 4", "Year 4"]
  ],
  "options": {
    "width": 300
  }
}';
doc.table( tableJson );
```

or

```js
const json = require('./table.json');
// if json file is array
Array.isArray(json) ? 
// any tables
json.forEach( table => doc.table( table, table.options || {} ) ) : 
// one table
doc.table( json, json.options || {} ) ;
```

### Example 4 - Full Code
```js
  // require
  const fs = require("fs");
  const PDFDocument = require("pdfkit-table");
  const doc = new PDFDocument({ margin: 30, size: 'A4', });
  // file name
  doc.pipe(fs.createWriteStream("./file-table.pdf"));

  // ------------------
  // table code here
  // ------------------

  // if your run express.js server:
  // HTTP response only to show pdf
  doc.pipe(res);
  // done
  doc.end();
```

## Table

- <code>Array.&lt;object&gt;</code> | <code>JSON</code>
  - headers <code>Array.&lt;object&gt;</code> | <code>Array.[]</code>
    - label <code>String</code>
    - property <code>String</code>
    - width <code>Number</code>
    - renderer <code>Function</code> function(value, indexColumn, indexRow, row) { return value }
  - datas <code>Array.&lt;object&gt;</code>
  - rows <code>Array.[]</code>

Example code:
```js
const table = {
  // simple headers only with ROWS (not DATAS)  
  headers: ['Name', 'Age'],
  // simple content
  rows: [
    ['Jack', '32'], // row 1
    ['Maria', '30'], // row 2
  ]
};

const table = {
  // complex headers work with ROWS and DATAS  
  headers: [
    { label:"Name", property: 'name', width: 100, renderer: null },
    { label:"Age", property: 'age', width: 100, renderer: (value) => `U$ ${Number(value).toFixed(1)}` },
  ],
  // complex content
  datas: [
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

| Properties           | Type                  | Default            | Description       |
-----------------------|-----------------------|--------------------|-------------------|
| **width**            | <code>Number</code>   | undefined          | width of table    |
| **x**                | <code>Number</code>   | undefined / doc.x  | position x (left) |
| **y**                | <code>Number</code>   | undefined / doc.y  | position y (top)  |
| **columnSpacing**    | <code>Number</code>   | 5                  |                   |
| **rowSpacing**       | <code>Number</code>   | 3                  |                   |
| **prepareHeader**    | <code>Function</code> | Function           |                   |
| **prepareRow**       | <code>Function</code> | Function           |                   |


Example code:
```js
const options = {
  // properties
  width: 500, // {Number} default: undefined // A4 595.28 x 841.89 (portrait) (about width sizes)
  x: 0, // {Number} default: undefined | doc.x
  y: 0, // {Number} default: undefined | doc.y
  columnSpacing: 5, // {Number} default: 5
  rowSpacing: 3, // {Number} default: 3
  // functions
  prepareHeader: () => doc.font("Helvetica-Bold").fontSize(8), // {Function} 
  prepareRow: (row, i) => doc.font("Helvetica").fontSize(8), // {Function} 
}
```

#### Options Row

- separation <code>{Booleon}</code>
- fontSize <code>{Number}</code>
- fontFamily <code>{String}</code>

```js
datas: [
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
datas: [
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

```js
datas: [
  // options cell | value is object | label is string
  { name: { label: 'Jack', options: { fontSize: 10, fontFamily: 'Courier-Bold' } },
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
- renderer function on cell. Like renderer: (value) => { return `$${value}`}
- sample with database
- alignment
- setFontFamily {String}
- setBoldFontFamily {String}
- verticalLines {Boolean}
- verticalLinesWidth {Number}
- verticalLinesColor {String}
- horizontalLines {Boolean}
- horizontalLinesWidth {Number}
- horizontalLinesColor {String}
- tableLine {Boolean}
- tableLineWidth {Number}
- tableLineColor {String}
- backgroundColor  {String}
- striped {Boolean} (corsimcornao)

## Changelogs

### 0.1.33

+ const table = tableToJson('#id_table') <code>{Object}</code>. import {tableToJson} from 'pdfkit-table';
+ const tables = allTablesToJson() <code>{Array}</code>. import {allTablesToJson} from 'pdfkit-table';

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
- code base - [andronio](https://www.andronio.me/2017/09/02/pdfkit-tables/)
- ideas - [giuseppe-santoro](https://github.com/foliojs/pdfkit/issues/29#issuecomment-56504943)
- influence [voilab](https://github.com/voilab/voilab-pdf-table)
- **Marcos Aurelio P. Araujo**, thanks for give me the challenge.