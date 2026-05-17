'use strict';

const { PassThrough } = require('stream');
const { finished } = require('stream/promises');
const path = require('path');

/**
 * Extract plain text from an uncompressed PDFKit buffer.
 *
 * PDFKit stores glyph codes as hex strings inside TJ operators, e.g.
 *   [<436f6c> -10 <536f6d65>] TJ
 * Each pair of hex digits maps to a single Latin-1 / Win-1252 byte.
 * We also handle literal-string Tj operators: (text) Tj
 *
 * Works without any third-party parser; requires the PDF to be
 * generated with `compress: false`.
 *
 * @param {Buffer} buf
 * @returns {string}
 */
function extractText(buf) {
  const str = buf.toString('binary');
  let result = '';

  // 1) Hex strings in TJ: <hexdata>
  const hexRe = /<([0-9a-fA-F]+)>/g;
  let m;
  while ((m = hexRe.exec(str)) !== null) {
    const hex = m[1];
    // Decode each byte pair as Latin-1
    for (let i = 0; i + 1 < hex.length; i += 2) {
      const code = parseInt(hex.slice(i, i + 2), 16);
      if (code >= 0x20) result += String.fromCharCode(code);
    }
  }

  // 2) Literal strings: (text) Tj  — handles plain ASCII fallback
  const tjRe = /\(([^)]+)\)\s*Tj/g;
  while ((m = tjRe.exec(str)) !== null) {
    result += m[1];
  }

  return result;
}

/** Resolve package root (parent of tests/) */
const root = path.join(__dirname, '..');

/**
 * @param {import('buffer').Buffer} buf
 */
function assertPdfBuffer(buf) {
  if (!Buffer.isBuffer(buf) || buf.length < 20) {
    throw new Error('Expected non-empty PDF buffer');
  }
  const head = buf.subarray(0, 8).toString('latin1');
  if (!head.startsWith('%PDF')) {
    throw new Error(`Expected PDF header, got: ${JSON.stringify(head)}`);
  }
}

/**
 * Extract plain text from a PDFKit-generated buffer (no dependencies).
 * @param {Buffer} buf
 * @returns {string}
 */
function pdfText(buf) {
  return extractText(buf);
}

/**
 * Assert that the PDF buffer contains the given string after text extraction.
 * @param {Buffer} buf
 * @param {string} needle
 */
function assertPdfContains(buf, needle) {
  const text = pdfText(buf);
  if (!text.includes(needle)) {
    throw new Error(
      `Expected PDF text to include ${JSON.stringify(needle)}; full text: ${JSON.stringify(text)}`
    );
  }
}

/**
 * Render one table and collect PDF bytes (does not write disk).
 * @param {Record<string, unknown>} table
 * @param {Record<string, unknown>} [options]
 * @param {(doc: unknown) => void} [callback]
 */
async function renderTable(table, options, callback) {
  const PDFDocument = require(root + '/index.js');
  const doc = new PDFDocument({ margin: 30, size: 'A4', compress: false });
  const chunks = [];
  const stream = new PassThrough();
  stream.on('data', (c) => chunks.push(c));
  doc.pipe(stream);
  await doc.table(table, options ?? {}, callback);
  doc.end();
  await finished(stream);
  const buf = Buffer.concat(chunks);
  assertPdfBuffer(buf);
  return buf;
}

module.exports = {
  root,
  assertPdfBuffer,
  assertPdfContains,
  pdfText,
  renderTable,
};
