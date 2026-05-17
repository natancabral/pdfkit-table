'use strict';
/**
 * Example: keepRowsTogether option
 *
 * keepRowsTogether: true — no proactive page breaks are ever inserted.
 * Every row starts exactly where the cursor is, regardless of how tall it
 * is.  PDFKit handles all intra-row page overflow automatically.
 *
 * Ideal for tables where most or all cells contain multi-paragraph, multi-
 * page text — the rows flow end-to-end without any blank gaps.
 *
 * Run: node example/document-keep-rows-together.js
 */

const fs          = require('fs');
const PDFDocument = require('pdfkit-table');

// ---------------------------------------------------------------------------
// Text fixtures — all start with a marker and end with a marker so you can
// verify the content is complete in the PDF viewer.
// ---------------------------------------------------------------------------

const UNIT =
  'Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; ' +
  'Proin vel ante a orci tempus eleifend ut et magna. Lorem ipsum dolor sit amet, ' +
  'consectetur adipiscing elit. Vivamus luctus urna sed urna ultricies ac tempor dui sagittis. ' +
  'In condimentum facilisis porta. Sed nec diam eu diam mattis viverra. Nulla fringilla, ' +
  'orci ac euismod semper, magna diam porttitor mauris, quis sollicitudin sapien justo in libero. ' +
  'Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. ' +
  'Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. ' +
  'Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. ' +
  'Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra. ';

/** Build cell text of ~`chars` characters, bracketed with start/end markers. */
function cell(id, chars) {
  let body = '';
  while (body.length < chars) body += UNIT;
  return `[ROW-${id}-START] ` + body.slice(0, chars).trimEnd() + ` [ROW-${id}-END]`;
}

const SHORT     = 'Short row — fits in a few lines.';
const HALF_PAGE = cell('HALF',  900);    // ~half a page at 8 pt
const FULL_PAGE = cell('FULL', 2000);    // ~fills one full page
const TWO_PAGES = cell('TWO',  4200);    // ~two full pages

// ---------------------------------------------------------------------------

async function main() {
  const doc = new PDFDocument({ margin: 40, size: 'A4', compress: false });
  doc.pipe(fs.createWriteStream('./document-keep-rows-together.pdf'));

  // ── Title ─────────────────────────────────────────────────────────────────
  doc.fontSize(16).font('Helvetica-Bold')
     .text('keepRowsTogether: true — Demo', { align: 'center' });
  doc.fontSize(9).font('Helvetica').fillColor('#444')
     .text(
       'With keepRowsTogether: true every row starts at the current cursor\n' +
       'and flows naturally across pages — no blank gaps, no forced new pages.',
       { align: 'center' }
     )
     .fillColor('black').moveDown(1.5);

  // ── Section 1: basic mix ──────────────────────────────────────────────────
  doc.fontSize(11).font('Helvetica-Bold')
     .text('1. Basic mix — short + half-page + full-page rows').moveDown(0.2);
  doc.fontSize(8).font('Helvetica').fillColor('#555')
     .text(
       'Rows 2 and 4 are tall (~half a page each). Without keepRowsTogether\n' +
       'they would jump to a new page leaving blank space. Here they flow inline.'
     )
     .fillColor('black').moveDown(0.5);

  await doc.table(
    {
      headers: [
        { label: '#',       property: 'n',    width: 30, align: 'center' },
        { label: 'Type',    property: 'type', width: 100 },
        { label: 'Content', property: 'text', width: 370 },
      ],
      data: [
        { n: '1', type: 'Short',     text: SHORT      },
        { n: '2', type: 'Half-page', text: HALF_PAGE  },
        { n: '3', type: 'Short',     text: SHORT      },
        { n: '4', type: 'Half-page', text: HALF_PAGE  },
        { n: '5', type: 'Short',     text: SHORT      },
      ],
    },
    {
      keepRowsTogether: true,
      padding:  [5, 7, 5, 7],
      divider:  { horizontal: { width: 0.5, color: '#ccc' } },
      prepareHeader: function () { this.font('Helvetica-Bold').fontSize(9); },
      prepareRow:    function () { this.font('Helvetica').fontSize(8); },
    }
  );

  // ── Section 2: full-page and two-page rows ────────────────────────────────
  doc.addPage();
  doc.fontSize(11).font('Helvetica-Bold')
     .text('2. Full-page and two-page rows').moveDown(0.2);
  doc.fontSize(8).font('Helvetica').fillColor('#555')
     .text(
       'Row 2 fills roughly one full page, row 3 fills about two pages.\n' +
       'All start immediately after the previous row — no blank space.'
     )
     .fillColor('black').moveDown(0.5);

  await doc.table(
    {
      headers: [
        { label: 'ID',      property: 'id',   width: 40  },
        { label: 'Label',   property: 'lbl',  width: 120 },
        { label: 'Details', property: 'det',  width: 350 },
      ],
      data: [
        { id: 'A1', lbl: 'Short intro',    det: SHORT      },
        { id: 'A2', lbl: 'Full-page row',  det: FULL_PAGE  },
        { id: 'A3', lbl: 'Short note',     det: SHORT      },
        { id: 'A4', lbl: 'Two-page row',   det: TWO_PAGES  },
        { id: 'A5', lbl: 'Final short',    det: SHORT      },
      ],
    },
    {
      keepRowsTogether: true,
      padding:  [5, 6, 5, 6],
      divider:  {
        header:     { width: 1.5, color: '#333' },
        horizontal: { width: 0.4, color: '#aaa' },
      },
      prepareHeader: function () { this.font('Helvetica-Bold').fontSize(9); },
      prepareRow:    function () { this.font('Helvetica').fontSize(8); },
    }
  );

  // ── Section 3: three-column legal table ───────────────────────────────────
  doc.addPage();
  doc.fontSize(11).font('Helvetica-Bold')
     .text('3. Three-column legal table — all rows with long text').moveDown(0.2);
  doc.fontSize(8).font('Helvetica').fillColor('#555')
     .text(
       'Every content cell has 900+ characters. The table flows continuously\n' +
       'across many pages with the header repeated on each new page.'
     )
     .fillColor('black').moveDown(0.5);

  await doc.table(
    {
      headers: [
        { label: '§',       property: 'num',     width: 28, align: 'center' },
        { label: 'Clause',  property: 'clause',  width: 110 },
        { label: 'Text',    property: 'content', width: 372 },
      ],
      data: Array.from({ length: 6 }, (_, i) => ({
        num:     String(i + 1),
        clause:  ['Definitions', 'Scope', 'Obligations', 'Liability',
                  'Termination', 'Governing Law'][i],
        content: cell(String(i + 1), 950 + i * 120),
      })),
    },
    {
      keepRowsTogether: true,
      padding:  [6, 8, 6, 8],
      divider:  { horizontal: { width: 0.5, color: '#ddd' } },
      prepareHeader: function () {
        this.font('Helvetica-Bold').fontSize(8).fillColor('#333');
      },
      prepareRow: function () {
        this.font('Helvetica').fontSize(8).fillColor('black');
      },
    }
  );

  // ── Section 4: rows API (simple array rows) ───────────────────────────────
  doc.addPage();
  doc.fontSize(11).font('Helvetica-Bold')
     .text('4. Simple rows[] API with long text + keepRowsTogether').moveDown(0.2);
  doc.fontSize(8).font('Helvetica').fillColor('#555')
     .text('Demonstrates the option also works with the simple rows[] syntax.')
     .fillColor('black').moveDown(0.5);

  await doc.table(
    {
      headers: ['Name', 'Description', 'Status'],
      rows: [
        ['Alpha',   SHORT,        'OK'      ],
        ['Beta',    HALF_PAGE,    'Active'  ],
        ['Gamma',   SHORT,        'Pending' ],
        ['Delta',   FULL_PAGE,    'Active'  ],
        ['Epsilon', SHORT,        'Done'    ],
      ],
    },
    {
      keepRowsTogether: true,
      width: 510,
      padding: [4, 6, 4, 6],
      prepareHeader: function () { this.font('Helvetica-Bold').fontSize(9); },
      prepareRow:    function () { this.font('Helvetica').fontSize(8); },
      divider: { horizontal: { width: 0.4, color: '#bbb' } },
    }
  );

  doc.end();
  console.log('→ document-keep-rows-together.pdf');
}

main().catch(console.error);
