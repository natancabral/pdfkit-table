'use strict';

const test = require('node:test');
const assert = require('node:assert');
const { PassThrough } = require('stream');
const path = require('path');

const root = path.join(__dirname, '..');

test('table(table, callback) legacy second-arg callback runs', async () => {
  const PDFDocument = require(root + '/index.js');
  const doc = new PDFDocument({ margin: 10, compress: false });
  const stream = new PassThrough();
  doc.pipe(stream);
  stream.resume();

  let called = false;
  await doc.table({ headers: ['A'], rows: [['b']] }, () => {
    called = true;
  });
  doc.end();
  assert.strictEqual(called, true);
});

test('table(table, options, callback) invokes callback', async () => {
  const PDFDocument = require(root + '/index.js');
  const doc = new PDFDocument({ margin: 10, compress: false });
  const stream = new PassThrough();
  doc.pipe(stream);
  stream.resume();

  let called = false;
  await doc.table({ headers: ['A'], rows: [['c']] }, { width: 200 }, () => {
    called = true;
  });
  doc.end();
  assert.strictEqual(called, true);
});
