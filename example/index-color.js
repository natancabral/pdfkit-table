/**
 * You need to install on terminal (node.js):
 * -----------------------------------------------------
 * $ npm install pdfkit-table
 * -----------------------------------------------------
 * Run this file:
 * -----------------------------------------------------
 * $ node index-example.js
 * -----------------------------------------------------
 * 
 */

const fs = require("fs");
const PDFDocument = require("./../index");

// start pdf document
let doc = new PDFDocument({ margin: 30, size: 'A4' });
// to save on server
doc.pipe(fs.createWriteStream("./document-color.pdf"));

// json file
const json = require("./table.json");

// -----------------------------------------------------------------------------------------------------
// Simple Table with Array
// -----------------------------------------------------------------------------------------------------
const tableArray = {
  title: 'Lorem ipsum dolor sit amet Month %',
  headers: ["CountryX", "Conversion rate", "Trend"],
  rows: [
    ["Switzerland", "12%", "+1.12%"],
    ["France", "67%", "-0.98%"],
    ["England", "33%", "+4.44%"],
    ["Brazil", "88%", "+2.44%"],
  ],
};
doc.table( tableArray, { 
  columnsSize: [150,150,150], 
  prepareRow: (row, indexColumn, indexRow, rectRow) => {
    doc.font("Helvetica").fontSize(8);
    indexColumn === 0 && doc.addBackground(rectRow,'blue',0.3);
  }, 
}); // A4 595.28 x 841.89 (portrait) (about width sizes)

doc.moveDown(); // separate tables
doc.table( tableArray, { 
  
  width: 400, 
  subtitle: 'Lorem ipsum dolor sit amet',
  x: 100,

  prepareRow: (row, indexColumn, indexRow, rectRow) => {
    indexColumn === 0 && doc.addBackground(rectRow, (indexRow % 2 ? 'red' : 'green') ,0.5);
    doc.font("Helvetica").fontSize(8);
  },


}); // A4 595.28 x 841.89 (portrait) (about width sizes)

// move to down
doc.moveDown(); // separate tables


Array.isArray(json) && json.forEach( table => doc.table( table, table.options || {} ) );

const tableJson = `{ 
  "title": "Title",
  "subtitle": "Subtitle",
  "headers": [
    { "label":"Name", "property":"name", "width":100, "background": {"color": "blue", "opacity": 0.5} },
    { "label":"Age", "property":"age", "width":100 },
    { "label":"Year Func", "property":"year", "width":100, "renderer": "function(value, i, e){ return value + '('+(1+2)+')'; }" }
  ],
  "datas": [
    { "name":"Name 1", "age":"Age 1", "year":"Year 1" },
    { "name":"Name 2", "age":"Age 2", "year":"Year 2" },
    { "name":"Name 3", "age":"Age 3", "year":"Year 3" }
  ],
  "rows": [
    ["Name 4", "Age 4", "Year 4"]
  ],
  "options": {
    "width": 300,
    "x": null, 
    "title": "Json Table",
    "subtitle": "Json Table"
  }
}`
doc.table( tableJson );

const tableJson2 = `{ 
  "headers": ["Name","Age","Year"],
  "rows": [
    ["Name 4", "Age 4", "Year 4"]
  ],
  "options": {
    "title":"Lorem ipsum dolor sit amet Month %",
    "columnsSize": [50, 50, 100]
  }
}`
doc.table( tableJson2 );


// -----------------------------------------------------------------------------------------------------
// Complex Table with Object
// -----------------------------------------------------------------------------------------------------
// A4 595.28 x 841.89 (portrait) (about width sizes)
const table = {
  headers: [
    { label:"Name", property: 'name', width: 60, renderer: null },
    { label:"Description", property: 'description', width: 150, renderer: null }, 
    { label:"Price 1", property: 'price1', width: 100, renderer: null, backgroundColor: 'green', backgroundOpacity: 0.5 }, 
    { label:"Price 2", property: 'price2', width: 100, renderer: null, background: {color: 'blue', opacity: 0.5} }, 
    { label:"Price 3", property: 'price3', width: 80, renderer: null }, 
    { label:"Price 4", property: 'price4', width: 63, renderer: (value, indexColumn, indexRow, row) => { return `U$ ${Number(value).toFixed(2)}` } },
  ],
  datas: [
    { description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean mattis ante in laoreet egestas. ', price1: '$1', price3: '$ 3', price2: '$2', price4: '4', name: 'Name 1', options: { backgroundColor: 'green', backgroundOpacity: 0.5 } },
    { name: 'bold:Name 2', description: 'bold:Lorem ipsum dolor.', price1: 'bold:$1', price3: '$3', price2: '$2', price4: '4', options: { fontSize: 10, separation: true } },
    { name: 'Name 3', description: 'Lorem ipsum dolor.', price1: 'bold:$1', price4: '4.111111', price2: '$2', price3: { label:'PRICE $3', options: { fontSize: 12, backgroundColor: 'red', backgroundOpacity: 0.5 } }, },
    { description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean mattis ante in laoreet egestas. ', price1: '$1', price3: '$ 3', price2: '$2', price4: '4', name: 'Name 1', options: { backgroundColor: 'green', backgroundOpacity: 0.5 } },
    { description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean mattis ante in laoreet egestas. ', price1: '$1', price3: '$ 3', price2: '$2', price4: '4', name: 'Name 1', options: { backgroundColor: 'green', backgroundOpacity: 0.5, separation: true } },
    { name: 'Name 3', description: 'Lorem ipsum dolor.', price1: 'bold:$1', price4: '4.111111', price2: '$2', price3: { label:'PRICE $3', options: { fontSize: 12, separation: true, backgroundColor: 'red', backgroundOpacity: 0.5 }}, },
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
  prepareRow: (row, indexColumn, indexRow, rectRow) => {
    if( typeof row === 'object' && Array.isArray(row) === false ){
      if(row.name === 'Name 3'){
        // doc.fillColor('red');
        // doc.font("Helvetica").fontSize(8);
        indexColumn === 0 && doc.addBackground(rectRow,'green',0.3);
        //return;
      } else {
        indexColumn === 0 && doc.addBackground(rectRow,'grey',0.3);
      }
    }
    // doc.fillColor('black');
    doc.font("Helvetica").fontSize(8);
  },
});

// link

const createLink1 = (value, indexColumn, indexRow, row, rectRow, rectCell) => { 
  // get cell rect
  const {x, y, width, height} = rectCell;
  // set link box in doc. (pdf)
  doc.fill('blue').link( x, y, width, height, value);
  // return value text
  return `${value}`; 
}

const createLink2 = (value, indexColumn, indexRow, row, rectRow, rectCell) => { 
  const {x, y, width, height} = rectCell;
  doc
  .fillColor('blue')
  .underline( x, y, width, height - 2, { color: '#0000FF' }) // undeline
  .link( x, y, width, height, value)
  return `Link Here`; 
}

const tableLink = {
  title: 'Table with link',
  subtitle: 'version 0.1.45',
  headers: [
    { label: "Name", property: 'name', width: 100, renderer: null },
    { label: "Website", property: 'url', width: 100, renderer: createLink1 },
    { label: "Link To", property: 'url', width: 100, renderer: createLink2 },
  ],
  datas: [
    { name: 'Google', url: 'https://google.com', },
    { name: 'Duck Duck Go', url: 'https://duckduckgo.com', },
    { name: 'Bing', url: 'https://bing.com', },
  ],
}

doc.table( tableLink, { 
  prepareRow: () => {
    doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor('black');
  } 
});


// if your run express.js server:
// HTTP response only to show pdf
// doc.pipe(res);

// done
doc.end();
