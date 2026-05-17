'use strict';

const test = require('node:test');
const { PassThrough } = require('stream');
const { root, assertPdfContains } = require('./helpers');

test('table() accepts JSON string for table payload', async () => {
  const PDFDocument = require(root + '/index.js');
  const payload = JSON.stringify({
    headers: ['Col'],
    rows: [['json-row']],
  });
  const doc = new PDFDocument({ margin: 10, compress: false });
  const stream = new PassThrough();
  const chunks = [];
  stream.on('data', (c) => chunks.push(c));
  const bufPromise = new Promise((resolve, reject) => {
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
  doc.pipe(stream);
  await doc.table(payload, {});
  doc.end();
  const buf = await bufPromise;
  assertPdfContains(buf, 'json-row');
});
