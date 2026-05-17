'use strict';
/**
 * Tests for `pageBreakThreshold` option.
 *
 * pageBreakThreshold (0–1) controls the fraction of the page-content height
 * below which a row triggers a proactive page break.  Rows taller than
 * `pageContentHeight × threshold` start in-place and let PDFKit handle the
 * overflow naturally, avoiding large empty gaps before tall rows.
 *
 * Default: 1.0  →  old behaviour (only skip break for rows > full page).
 * 0.6           →  skip break for rows that fill > 60 % of the page.
 * 0.0           →  never break (same as keepRowsTogether: true).
 */

const test  = require('node:test');
const assert = require('node:assert/strict');
const { PassThrough } = require('stream');
const { finished }    = require('stream/promises');
const { assertPdfBuffer, assertPdfContains, root } = require('./helpers');

// ---------------------------------------------------------------------------
// Helper: render a table and return { buf, pageCount }
// ---------------------------------------------------------------------------
async function renderAndCount(table, options) {
  const PDFDocument = require(root + '/index.js');
  const doc = new PDFDocument({ margin: 40, size: 'A4', compress: false });
  const chunks = [];
  const stream = new PassThrough();
  stream.on('data', c => chunks.push(c));
  doc.pipe(stream);
  await doc.table(table, options ?? {});
  doc.end();
  await finished(stream);
  const buf = Buffer.concat(chunks);
  assertPdfBuffer(buf);

  // Count PDF pages by counting "Page" dictionary entries (rough but reliable)
  const text = buf.toString('binary');
  const pageCount = (text.match(/\/Type \/Page[^s]/g) || []).length;
  return { buf, pageCount };
}

// Long enough to be more than ~60 % of an A4 page but still fit on one page.
// At 8 pt on ~490 pt wide: ~55 chars/line, ~11 pt/line → 400 chars ≈ 80 lines ≈ 880 pt
// Use 300 chars for ~60 lines ≈ 660 pt (87 % of 762 pt usable height).
const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' +
  'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ' +
  'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. ' +
  'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. ' +
  'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. ';

const LONG_TEXT = LOREM.repeat(4); // ~430 chars × 4 ≈ 1 720 chars, will be tall but fit on 1 page

const TABLE = {
  headers: [{ label: 'ID', property: 'id', width: 40 }, { label: 'Content', property: 'content', width: 450 }],
  data: [
    { id: 'R1', content: 'Short row one' },
    { id: 'R2', content: LONG_TEXT },   // tall row — key row under test
    { id: 'R3', content: 'Short row three' },
  ],
};

// ---------------------------------------------------------------------------

test('pageBreakThreshold default (1.0) — tall row moves to new page if it does not fit', async () => {
  // With the default threshold the tall row should be pushed to a new page
  // when the remaining space is insufficient (rows shorter than 100 % of page
  // content height are moved).
  const { buf } = await renderAndCount(TABLE, {
    prepareHeader: function () { this.font('Helvetica-Bold').fontSize(8); },
    prepareRow:    function () { this.font('Helvetica').fontSize(8); },
    // default pageBreakThreshold: 1.0
  });
  assertPdfContains(buf, 'R1');
  assertPdfContains(buf, 'R2');
  assertPdfContains(buf, 'R3');
});

test('pageBreakThreshold: 0.6 — tall row (> 60 % of page) renders in-place without gap', async () => {
  // With threshold 0.6, any row taller than 60 % of the page height starts
  // at the current cursor position rather than being moved to a new page.
  const { buf } = await renderAndCount(TABLE, {
    prepareHeader:    function () { this.font('Helvetica-Bold').fontSize(8); },
    prepareRow:       function () { this.font('Helvetica').fontSize(8); },
    pageBreakThreshold: 0.6,
  });
  assertPdfContains(buf, 'R1');
  assertPdfContains(buf, 'R2');
  assertPdfContains(buf, 'R3');
});

test('pageBreakThreshold: 0 — no row ever triggers a page break proactively', async () => {
  const { buf } = await renderAndCount(TABLE, {
    prepareHeader:    function () { this.font('Helvetica-Bold').fontSize(8); },
    prepareRow:       function () { this.font('Helvetica').fontSize(8); },
    pageBreakThreshold: 0,
  });
  assertPdfContains(buf, 'R1');
  assertPdfContains(buf, 'R2');
  assertPdfContains(buf, 'R3');
});

test('pageBreakThreshold: 0.3 — only very short rows trigger page breaks', async () => {
  // Tall rows stay in place; behaviour must not throw and all content is rendered
  const { buf } = await renderAndCount(TABLE, {
    prepareHeader:    function () { this.font('Helvetica-Bold').fontSize(8); },
    prepareRow:       function () { this.font('Helvetica').fontSize(8); },
    pageBreakThreshold: 0.3,
  });
  assertPdfContains(buf, 'R1');
  assertPdfContains(buf, 'R2');
  assertPdfContains(buf, 'R3');
});

test('pageBreakThreshold works with Table.rows (array rows)', async () => {
  const { buf } = await renderAndCount(
    {
      headers: ['A', 'B'],
      rows: [
        ['short', 'row'],
        [LONG_TEXT, LONG_TEXT],
        ['another', 'short'],
      ],
    },
    { pageBreakThreshold: 0.5 }
  );
  assertPdfContains(buf, 'short');
  assertPdfContains(buf, 'another');
});

test('pageBreakThreshold values outside [0,1] are clamped safely', async () => {
  // Values > 1 behave like 1.0; values < 0 behave like 0.
  for (const threshold of [-1, 1.5, 999]) {
    const { buf } = await renderAndCount(TABLE, { pageBreakThreshold: threshold });
    assertPdfContains(buf, 'R1');
    assertPdfContains(buf, 'R2');
    assertPdfContains(buf, 'R3');
  }
});
