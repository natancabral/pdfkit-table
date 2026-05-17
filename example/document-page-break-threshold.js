'use strict';
/**
 * Example: pageBreakThreshold option
 *
 * pageBreakThreshold (0–1) decides when a tall row is moved to a new page.
 *
 * Default 1.0 → every row that doesn't fit in the remaining space is pushed
 *               to the next page, which can leave large empty gaps.
 *
 * 0.6         → only rows shorter than 60 % of the page height are moved.
 *               Taller rows start in-place and flow naturally across pages —
 *               no wasted blank space.
 *
 * Run: node example/document-page-break-threshold.js
 */

const fs          = require('fs');
const PDFDocument = require('pdfkit-table');

// ---------------------------------------------------------------------------
// Shared text fixtures
// ---------------------------------------------------------------------------
const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' +
  'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ' +
  'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. ' +
  'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. ' +
  'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. ' +
  'Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis molestie dictum semper, ' +
  'enim risus laoreet purus, eget pellentesque augue mauris eu diam. ' +
  'Phasellus tristique lorem vitae dui semper sagittis. Aenean commodo ligula eget dolor. ' +
  'Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. ' +
  'Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. ' +
  'In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. ' +
  'Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. ' +
  'Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. ' +
  'Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. ' +
  'Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. ';

/** Build a cell with `reps` repetitions of LOREM, prefixed/suffixed with word markers. */
function cell(label, reps) {
  return `[${label}-START] ` + LOREM.repeat(reps).trimEnd() + ` [${label}-END]`;
}

const SHORT  = 'Brief note — fits in one or two lines.';
const MEDIUM = cell('M', 2);   // ~700 chars — tall but fits on a single page
const LONG   = cell('L', 5);   // ~1 800 chars — spans multiple pages

// Common table structure: mix of short, medium, and long rows
function makeTable() {
  return {
    headers: [
      { label: '#',       property: 'n',    width: 30, align: 'center' },
      { label: 'Section', property: 'sec',  width: 110 },
      { label: 'Content', property: 'text', width: 370 },
    ],
    data: [
      { n: '1', sec: 'Introduction',      text: SHORT  },
      { n: '2', sec: 'Background',        text: MEDIUM },
      { n: '3', sec: 'Short note',        text: SHORT  },
      { n: '4', sec: 'Detailed analysis', text: LONG   },
      { n: '5', sec: 'Summary',           text: MEDIUM },
      { n: '6', sec: 'Conclusion',        text: SHORT  },
    ],
  };
}

const COMMON_OPTS = {
  padding: [5, 7, 5, 7],
  divider: { horizontal: { width: 0.4, color: '#bbb' } },
  prepareHeader: function () { this.font('Helvetica-Bold').fontSize(9); },
  prepareRow:    function () { this.font('Helvetica').fontSize(8); },
};

// ---------------------------------------------------------------------------

async function main() {
  const doc = new PDFDocument({ margin: 40, size: 'A4', compress: false });
  doc.pipe(fs.createWriteStream('./document-page-break-threshold.pdf'));

  // ── Title page ────────────────────────────────────────────────────────────
  doc.fontSize(16).font('Helvetica-Bold')
     .text('pageBreakThreshold — Demo', { align: 'center' });
  doc.fontSize(9).font('Helvetica').fillColor('#444')
     .text(
       'This document renders the SAME table three times with different\n' +
       'pageBreakThreshold values so you can compare the layout.',
       { align: 'center' }
     )
     .fillColor('black');
  doc.moveDown(1.5);

  // ── Section 1: default (1.0) ──────────────────────────────────────────────
  doc.fontSize(11).font('Helvetica-Bold')
     .text('1. pageBreakThreshold: 1.0  (default)').moveDown(0.2);
  doc.fontSize(8).font('Helvetica').fillColor('#555')
     .text(
       'Every row that doesn\'t fit in the remaining space is moved to a new page.\n' +
       'Rows 2, 4, and 5 are tall — expect large blank gaps before each.'
     )
     .fillColor('black').moveDown(0.5);

  await doc.table(makeTable(), {
    ...COMMON_OPTS,
    // pageBreakThreshold defaults to 1.0
  });

  // ── Section 2: threshold 0.6 ──────────────────────────────────────────────
  doc.addPage();
  doc.fontSize(11).font('Helvetica-Bold')
     .text('2. pageBreakThreshold: 0.6').moveDown(0.2);
  doc.fontSize(8).font('Helvetica').fillColor('#555')
     .text(
       'Only rows shorter than 60 % of the page height jump to a new page.\n' +
       'Taller rows (rows 2, 4, 5) start in-place and flow across pages naturally.\n' +
       'Compare: far fewer blank gaps vs. the default above.'
     )
     .fillColor('black').moveDown(0.5);

  await doc.table(makeTable(), {
    ...COMMON_OPTS,
    pageBreakThreshold: 0.6,
  });

  // ── Section 3: threshold 0.3 ──────────────────────────────────────────────
  doc.addPage();
  doc.fontSize(11).font('Helvetica-Bold')
     .text('3. pageBreakThreshold: 0.3').moveDown(0.2);
  doc.fontSize(8).font('Helvetica').fillColor('#555')
     .text(
       'Only very short rows (< 30 % of page height) are moved to a new page.\n' +
       'Almost all rows flow in-place — minimal blank space anywhere.'
     )
     .fillColor('black').moveDown(0.5);

  await doc.table(makeTable(), {
    ...COMMON_OPTS,
    pageBreakThreshold: 0.3,
  });

  // ── Section 4: two-column table with long cells ───────────────────────────
  doc.addPage();
  doc.fontSize(11).font('Helvetica-Bold')
     .text('4. Two-column table — pageBreakThreshold: 0.5').moveDown(0.2);
  doc.fontSize(8).font('Helvetica').fillColor('#555')
     .text(
       'Each row has two wide columns with 3 000+ character cells.\n' +
       'With threshold 0.5 the rows flow without introducing blank pages.'
     )
     .fillColor('black').moveDown(0.5);

  const LONG_A = cell('A', 8);  // ~2 900 chars
  const LONG_B = cell('B', 8);

  await doc.table(
    {
      headers: [
        { label: 'Column A', property: 'a', width: 245 },
        { label: 'Column B', property: 'b', width: 245 },
      ],
      data: [
        { a: SHORT,  b: SHORT  },
        { a: LONG_A, b: LONG_B },
        { a: SHORT,  b: SHORT  },
        { a: LONG_B, b: LONG_A },
      ],
    },
    {
      ...COMMON_OPTS,
      pageBreakThreshold: 0.5,
    }
  );

  doc.end();
  console.log('→ document-page-break-threshold.pdf');
}

main().catch(console.error);
