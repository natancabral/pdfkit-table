'use strict';

const test = require('node:test');
const { PassThrough } = require('stream');
const { finished } = require('stream/promises');
const { root, assertPdfBuffer, assertPdfContains } = require('./helpers');

test('createPdfDocumentWithTables(pdfkit) produces working subclass', async () => {
  const pdfkit = require('pdfkit');
  const { createPdfDocumentWithTables } = require(root + '/index.js');
  const PDF = createPdfDocumentWithTables(pdfkit);
  const doc = new PDF({ margin: 12, compress: false });
  const stream = new PassThrough();
  const chunks = [];
  stream.on('data', (c) => chunks.push(c));
  doc.pipe(stream);
  await doc.table({
    headers: ['Injected'],
    rows: [['ok']],
  });
  doc.end();
  await finished(stream);
  const buf = Buffer.concat(chunks);
  assertPdfBuffer(buf);
  assertPdfContains(buf, 'Injected');
});
