'use strict';

const test = require('node:test');
const { PassThrough } = require('stream');
const { finished } = require('stream/promises');
const { root, assertPdfContains } = require('./helpers');

test('tables([ table1, table2 ]) renders both', async () => {
  const PDFDocument = require(root + '/index.js');
  const doc = new PDFDocument({ margin: 20, compress: false });
  const chunks = [];
  const stream = new PassThrough();
  stream.on('data', (c) => chunks.push(c));
  doc.pipe(stream);

  await doc.tables([
    {
      headers: ['T1'],
      rows: [['one']],
      options: { width: 150 },
    },
    {
      headers: ['T2'],
      rows: [['two']],
      options: { width: 150 },
    },
  ]);
  doc.end();
  await finished(stream);

  const buf = Buffer.concat(chunks);
  assertPdfContains(buf, 'one');
  assertPdfContains(buf, 'two');
});
