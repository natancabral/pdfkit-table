'use strict';

const test = require('node:test');
const assert = require('node:assert');
const path = require('path');

const root = path.join(__dirname, '..');

test('require("pdfkit-table") CommonJS export shape', () => {
  const mod = require(root + '/index.js');
  assert.strictEqual(typeof mod, 'function');
  assert.strictEqual(mod, mod.default);
  assert.strictEqual(mod, mod.PDFDocumentWithTables);
  assert.strictEqual(typeof mod.createPdfDocumentWithTables, 'function');
});
