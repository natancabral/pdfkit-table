/**
 * You need to install on terminal (node.js):
 * -----------------------------------------------------
 * $ npm install pdfkit-table
 * -----------------------------------------------------
 * Run this file:
 * -----------------------------------------------------
 * $ node index-json-example.js
 * -----------------------------------------------------
 * 
 */

const fs = require("fs");
const PDFDocument = require("pdfkit-table");

// start pdf document
let doc = new PDFDocument({ margin: 30, size: 'A4' });
// load json file
const json = require("./table.json");

// to save on server
doc.pipe(fs.createWriteStream("./document-json.pdf"));

// if json file is array
Array.isArray(json) ? 
// any tables
json.forEach( table => doc.table( table, table.options || {} ) ) : 
// one table
doc.table( json, json.options || {} ) ;

// done
doc.end();
