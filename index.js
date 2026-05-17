'use strict';

const mod = require('./dist/index.js');

const PDFDocumentWithTables = mod.PDFDocumentWithTables;

module.exports = PDFDocumentWithTables;
module.exports.default = PDFDocumentWithTables;
module.exports.PDFDocumentWithTables = PDFDocumentWithTables;
module.exports.createPdfDocumentWithTables = mod.createPdfDocumentWithTables;
