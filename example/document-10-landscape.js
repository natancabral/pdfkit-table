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
const PDFDocument = require("pdfkit-table");

// start pdf document
let doc = new PDFDocument({
  margin: 30,
  size: "A4",
  landscape: true,
  compress: false,
  layout: "landscape",
});
// to save on server
doc.pipe(fs.createWriteStream("./document-10-landscape.pdf"));

// -----------------------------------------------------------------------------------------------------
// Simple Table with Array
// -----------------------------------------------------------------------------------------------------

const tableArray = {
  headers: [
    { label: "Country", property: "country", renderer: null },
    { label: "Conversion rate", property: "conversionRate", renderer: null },
    { label: "Trend", property: "trend", renderer: null },
  ],
  data: [
    { country: "Switzerland", conversionRate: "12%", trend: "+1.12%" },
    { country: "France", conversionRate: "67%", trend: "-0.98%" },
    { country: "England", conversionRate: "33%", trend: "+4.44%" },
  ],
};

const tableWithPadding = Object.assign({}, tableArray, {
  headers: tableArray.headers.map((header) => ({
    ...header,
    padding: 5,
  })),
});
const tableWithPaddingTopRight = Object.assign({}, tableArray, {
  headers: tableArray.headers.map((header) => ({
    ...header,
    padding: 15,
    align: "right",
    valign: "center",
  })),
});

doc.table(tableArray, { width: 300 }); // A4 595.28 x 841.89 (portrait) (about width sizes)
doc.table(tableWithPadding); // A4 595.28 x 841.89 (portrait) (about width sizes)
doc.table(tableArray, { padding: 10 }); // A4 595.28 x 841.89 (portrait) (about width sizes)
doc.table(tableArray, { padding: 15 }); // A4 595.28 x 841.89 (portrait) (about width sizes)
doc.table(tableArray);

// move to down
doc.moveDown(); // separate tables

// -----------------------------------------------------------------------------------------------------
// Complex Table with Object
// -----------------------------------------------------------------------------------------------------
// A4 595.28 x 841.89 (portrait) (about width sizes)
const table = {
  headers: [
    { label: "Name", property: "name", renderer: null },
    {
      label: "Description",
      property: "description",
      renderer: null,
    },
    { label: "Price 1", property: "price1", renderer: null },
    { label: "Price 2", property: "price2", renderer: null },
    { label: "Price 3", property: "price3", renderer: null },
    {
      label: "Price 4",
      property: "price4",
      renderer: (value, indexColumn, indexRow, row) => {
        return `U$ ${Number(value).toFixed(2)}`;
      },
    },
  ],
  data: [
    {
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean mattis ante in laoreet egestas. ",
      price1: "$1",
      price3: "$ 3",
      price2: "$2",
      price4: "4",
      name: "Name 1",
    },
    {
      name: "bold:Name 2",
      description: "bold:Lorem ipsum dolor.",
      price1: "bold:$1",
      price3: "$3",
      price2: "$2",
      price4: "4",
      options: { fontSize: 10, separation: true },
    },
    {
      name: "Name 3",
      description: "Lorem ipsum dolor.",
      price1: "bold:$1",
      price4: "4.111111",
      price2: "$2",
      price3: { label: "PRICE $3", options: { fontSize: 12 } },
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
  prepareRow: (row, indexColumn, indexRow, rectRow) => {
    doc.font("Helvetica").fontSize(8);
    indexColumn === 0 &&
      doc.addBackground(rectRow, indexRow % 2 ? "blue" : "green", 0.15);
  },
});

doc.moveDown(1);

const tableArrayColor = {
  headers: ["Country", "Conversion rate", "Trend"],
  rows: [
    ["Switzerland", "12%", "+1.12%"],
    ["France", "67%", "-0.98%"],
    ["Brazil", "88%", "2.77%"],
  ],
};
doc.table(tableArrayColor, {
  columnsSize: [50, 300, null],
  prepareRow: (row, indexColumn, indexRow, rectRow) => {
    doc.font("Helvetica").fontSize(10);
    indexColumn === 0 &&
      doc.addBackground(rectRow, indexRow % 2 ? "red" : "green", 0.5);
  },
}); // A4 595.28 x 841.89 (portrait) (about width sizes)

// if your run express.js server:
// HTTP response only to show pdf
// doc.pipe(res);

// done
doc.end();
