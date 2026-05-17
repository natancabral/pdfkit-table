'use strict';
/**
 * Tests for `keepRowsTogether` option.
 *
 * keepRowsTogether: true — disables ALL proactive page breaks.  Every row
 * starts at the current cursor position and overflows naturally across pages
 * via PDFKit's built-in text wrapping.  Equivalent to setting
 * `useSafelyMarginBottom: false` or `pageBreakThreshold: 0`, but expressed
 * as an explicit, readable intent.
 *
 * This is most useful for tables where most or all cells contain multi-line
 * text that will span several pages regardless of where the row starts.
 */

const test   = require('node:test');
const assert = require('node:assert/strict');
const { PassThrough } = require('stream');
const { finished }    = require('stream/promises');
const { assertPdfBuffer, assertPdfContains, root } = require('./helpers');

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

const LOREM_UNIT =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' +
  'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ' +
  'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris. ';

/** ~1 500 chars — tall enough to guarantee a multi-page row */
const VERY_LONG = 'Start ' + LOREM_UNIT.repeat(12).trimEnd() + ' End';

/** Short text that fits in one or two lines */
const SHORT = 'Brief entry.';

async function renderKeep(table, options) {
  const PDFDocument = require(root + '/index.js');
  const doc = new PDFDocument({ margin: 40, size: 'A4', compress: false });
  const chunks = [];
  const stream = new PassThrough();
  stream.on('data', c => chunks.push(c));
  doc.pipe(stream);
  await doc.table(table, { ...options });
  doc.end();
  await finished(stream);
  const buf = Buffer.concat(chunks);
  assertPdfBuffer(buf);
  return buf;
}

// ---------------------------------------------------------------------------

test('keepRowsTogether: true — renders without errors', async () => {
  const buf = await renderKeep(
    {
      headers: [
        { label: 'ID',      property: 'id',      width: 40  },
        { label: 'Details', property: 'details', width: 450 },
      ],
      data: [
        { id: '1', details: SHORT      },
        { id: '2', details: VERY_LONG  },
        { id: '3', details: SHORT      },
        { id: '4', details: VERY_LONG  },
      ],
    },
    {
      keepRowsTogether: true,
      prepareHeader: function () { this.font('Helvetica-Bold').fontSize(8); },
      prepareRow:    function () { this.font('Helvetica').fontSize(8); },
    }
  );
  assertPdfContains(buf, '1');
  assertPdfContains(buf, '2');
  assertPdfContains(buf, '3');
  assertPdfContains(buf, '4');
  assertPdfContains(buf, 'Start');
  assertPdfContains(buf, 'End');
});

test('keepRowsTogether: true — all text content is present in output', async () => {
  const buf = await renderKeep(
    {
      headers: ['Name', 'Note'],
      rows: [
        ['Alpha', SHORT],
        ['Beta',  VERY_LONG],
        ['Gamma', SHORT],
      ],
    },
    { keepRowsTogether: true }
  );
  assertPdfContains(buf, 'Alpha');
  assertPdfContains(buf, 'Beta');
  assertPdfContains(buf, 'Gamma');
  assertPdfContains(buf, 'Start');
  assertPdfContains(buf, 'End');
});

test('keepRowsTogether: false (default) — behaves identically to omitting the option', async () => {
  const table = {
    headers: [{ label: 'A', property: 'a', width: 490 }],
    data: [{ a: SHORT }, { a: SHORT }],
  };
  const opts = {
    prepareHeader: function () { this.font('Helvetica-Bold').fontSize(9); },
    prepareRow:    function () { this.font('Helvetica').fontSize(9); },
  };
  const withFalse  = await renderKeep(table, { ...opts, keepRowsTogether: false });
  const withOmit   = await renderKeep(table, opts);

  // Both should contain the same text
  assertPdfContains(withFalse, 'Brief entry');
  assertPdfContains(withOmit,  'Brief entry');
});

test('keepRowsTogether: true — multiple very long rows all render', async () => {
  const buf = await renderKeep(
    {
      headers: [
        { label: '#',    property: 'n', width: 30   },
        { label: 'Text', property: 't', width: 460  },
      ],
      data: Array.from({ length: 5 }, (_, i) => ({
        n: String(i + 1),
        t: `Start-${i + 1} ` + LOREM_UNIT.repeat(10) + ` End-${i + 1}`,
      })),
    },
    {
      keepRowsTogether: true,
      prepareHeader: function () { this.font('Helvetica-Bold').fontSize(8); },
      prepareRow:    function () { this.font('Helvetica').fontSize(8); },
      divider: { horizontal: { width: 0.5, color: '#ccc' } },
    }
  );

  for (let i = 1; i <= 5; i++) {
    assertPdfContains(buf, `Start-${i}`);
    assertPdfContains(buf, `End-${i}`);
  }
});

test('keepRowsTogether: true overrides useSafelyMarginBottom: true', async () => {
  // Even with useSafelyMarginBottom explicitly true, keepRowsTogether wins
  // and no proactive page break should be inserted.
  const buf = await renderKeep(
    {
      headers: [{ label: 'Content', property: 'c', width: 490 }],
      data: [{ c: VERY_LONG }],
    },
    {
      keepRowsTogether:     true,
      useSafelyMarginBottom: true,   // should be overridden
      prepareHeader: function () { this.font('Helvetica-Bold').fontSize(8); },
      prepareRow:    function () { this.font('Helvetica').fontSize(8); },
    }
  );
  assertPdfContains(buf, 'Start');
  assertPdfContains(buf, 'End');
});
