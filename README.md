<p align="center">
  <br/>
  <br/>
  <img src="https://github.com/natancabral/pdfkit-table/blob/main/example/logo.png" alt="pdfkit-table (Natan Cabral)"/>
  <br/>
  <br/>
</p>

# pdfkit-table

#### Generate pdf tables with javascript (PDFKIT plugin)
Helps to draw informations in simple tables using pdfkit. #server-side.


## Examples

[view pdf example](https://github.com/natancabral/pdfkit-table/raw/main/example/document.pdf) | 
[color pdf](https://github.com/natancabral/pdfkit-table/raw/main/example/document-color.pdf) | 
[full code example](https://github.com/natancabral/pdfkit-table/blob/main/example/index-example.js) |
[server example](https://github.com/natancabral/pdfkit-table/blob/main/example/index-server-example.js) |
[json example](https://github.com/natancabral/pdfkit-table/blob/main/example/index-json-example.js) |
[all](https://github.com/natancabral/pdfkit-table/blob/main/example/)

<img src="https://github.com/natancabral/pdfkit-table/blob/main/example/pdf-sample.png"/>

## Install [<img src="https://github.com/natancabral/pdfkit-table/blob/main/example/npm-tile.png">](https://www.npmjs.com/package/pdfkit-table)

[![NPM](https://nodei.co/npm/pdfkit-table.png)](https://www.npmjs.com/package/pdfkit-table)

```bash
npm install pdfkit-table
```

## Use

```js
  // requires
  const fs = require("fs");
  const PDFDocument = require("pdfkit-table");

  // init document
  let doc = new PDFDocument({ margin: 30, size: 'A4' });
  // save document
  doc.pipe(fs.createWriteStream("./document.pdf"));
  
  ;(async function createTable(){
    // table
    const table = { 
      title: '',
      headers: [],
      datas: [ /* complex data */ ],
      rows: [ /* or simple data */ ],
    };

    // the magic (async/await)
    await doc.table(table, { /* options */ });
    // -- or --
    // doc.table(table).then(() => { doc.end() }).catch((err) => { })

    // if your run express.js server
    // to show PDF on navigator
    // doc.pipe(res);

    // done!
    doc.end();
  })();

```

## Examples

### Server response
[server example](https://github.com/natancabral/pdfkit-table/blob/main/example/index-server-example.js)
```js
  // router - Node + Express.js
  app.get('/create-pdf', async (req, res) => {
    // ...await table code
    // if your run express.js server
    // to show PDF on navigator
    doc.pipe(res);
    // done!
    doc.end();
  });
```

### Example 1 - Simple Array
```js
  ;(async function(){
    // table 
    const table = {
      title: "Title",
      subtitle: "Subtitle",
      headers: [ "Country", "Conversion rate", "Trend" ],
      rows: [
        [ "Switzerland", "12%", "+1.12%" ],
        [ "France", "67%", "-0.98%" ],
        [ "England", "33%", "+4.44%" ],
      ],
    };
    // A4 595.28 x 841.89 (portrait) (about width sizes)
    // width
    await doc.table(table, { 
      width: 300,
    });
    // or columnsSize
    await doc.table(table, { 
      columnsSize: [ 200, 100, 100 ],
    });
    // done!
    doc.end();
  })();
```


### Example 2 - Table
```js
  ;(async function(){
    // table
    const table = {
      title: "Title",
      subtitle: "Subtitle",
      headers: [
        { label: "Name", property: 'name', width: 60, renderer: null },
        { label: "Description", property: 'description', width: 150, renderer: null }, 
        { label: "Price 1", property: 'price1', width: 100, renderer: null }, 
        { label: "Price 2", property: 'price2', width: 100, renderer: null }, 
        { label: "Price 3", property: 'price3', width: 80, renderer: null }, 
        { label: "Price 4", property: 'price4', width: 43, 
          renderer: (value, indexColumn, indexRow, row, rectRow, rectCell) => { return `U$ ${Number(value).toFixed(2)}` } 
        },
      ],
      // complex data
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
          price3: { 
            label: 'PRICE $3', options: { fontSize: 12 } 
          }, 
          price2: '$2', 
          price4: '4', 
        },
        // {...},
      ],
      // simeple data
      rows: [
        [
          "Apple",
          "Nullam ut facilisis mi. Nunc dignissim ex ac vulputate facilisis.",
          "$ 105,99",
          "$ 105,99",
          "$ 105,99",
          "105.99",
        ],
        // [...],
      ],
    };
    // the magic
    doc.table(table, {
      prepareHeader: () => doc.font("Helvetica-Bold").fontSize(8),
      prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
        doc.font("Helvetica").fontSize(8);
        indexColumn === 0 && doc.addBackground(rectRow, 'blue', 0.15);
      },
    });
    // done!
    doc.end();
  })();

```

### Example 3 - Json

```js
  ;(async function(){
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
        [ "Name 4", "Age 4", "Year 4" ]
      ],
      "options": {
        "width": 300
      }
    }';
    // the magic
    doc.table(tableJson);
    // done!
    doc.end();
  })();
```

### Example 4 - Json file (many tables)

```js
  ;(async function(){
    // json file
    const json = require('./table.json');
    // if json file is array
    Array.isArray(json) ? 
    // any tables - array
    await doc.tables(json) : 
    // one table - string
    await doc.table(json) ;
    // done!
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
    - renderer <code>Function</code> function( value, indexColumn, indexRow, row, rectRow, rectCell ) { return value }
  - datas <code>Array.&lt;object&gt;</code>
  - rows <code>Array.[]</code>
  - title <code>String</code> | <code>Object</code>
  - subtitle <code>String</code> | <code>Object</code>

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
| **renderer**         | <code>Function</code> | Function           | function( value, indexColumn, indexRow, row, rectRow, rectCell ) { return value } |


#### Simple headers example

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
```

#### Complex headers example

```js
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
| **title**            | <code>String</code> <code>Object</code>  | undefined          | title             |
| **subtitle**         | <code>String</code> <code>Object</code>  | undefined          | subtitle          |
| **width**            | <code>Number</code>   | undefined          | width of table    |
| **x**                | <code>Number</code>   | undefined  | position x (left). To reset x position set "x: null" |
| **y**                | <code>Number</code>   | undefined  | position y (top)  |
| **divider**          | <code>Object</code>   | undefined          | define divider lines |
| **columnsSize**      | <code>Array</code>    | undefined          | define sizes      |
| **columnSpacing**    | <code>Number</code>   | 5                  |                   |
| **padding**    | <code>Number</code> <code>Array</code>   | 1 or [1, 5]                   |                   |
| **addPage**          | <code>Boolean</code>  | false              | add table on new page |
| **hideHeader**       | <code>Boolean</code>  | false              | hide header |
| **minRowHeight**     | <code>Number</code>  | 0              | min row height |
| **prepareHeader**    | <code>Function</code> | Function           | ()                  |
| **prepareRow**       | <code>Function</code> | Function           | (row, indexColumn, indexRow, rectRow, rectCell) => {} |

#### Options example

```js
const options = {
  // properties
  title: "Title", // { label: 'Title', fontSize: 30, color: 'blue', fontFamily: "./fonts/type.ttf" },
  subtitle: "Subtitle", // { label: 'Subtitle', fontSize: 20, color: 'green', fontFamily: "./fonts/type.ttf" },
  width: 500, // {Number} default: undefined // A4 595.28 x 841.89 (portrait) (about width sizes)
  x: 0, // {Number} default: undefined | To reset x position set "x: null"
  y: 0, // {Number} default: undefined | 
  divider: {
    header: { disabled: false, width: 2, opacity: 1 },
    horizontal: { disabled: false, width: 0.5, opacity: 0.5 },
  },
  padding: 5, // {Number} default: 0
  columnSpacing: 5, // {Number} default: 5
  hideHeader: false, 
  minRowHeight: 0,
  // functions
  prepareHeader: () => doc.font("Helvetica-Bold").fontSize(8), // {Function} 
  prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => doc.font("Helvetica").fontSize(8), // {Function} 
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
- striped {Boolean} (corsimcornao)
- colspan - the colspan attribute defines the number of columns a table cell should span.
- sample with database
- margin: marginBottom before, marginTop after

## Changelogs

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
+ **Background** color inside row options datas
  - datas: [
      { name:"My Name", age: 20, ***options: { backgroundColor: 'red', backgroundOpacity: 0.5 }*** },
      { name:"My Name", age: 20, ***options: { background: { color: 'green', opacity: 0.5 } }*** },
  ]
+ **Background** color inside cell options datas
  - datas: [
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
