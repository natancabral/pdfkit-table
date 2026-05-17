"use strict";
/**
 * Example: a table where a SINGLE ROW spans multiple pages
 * because of extremely long text inside one cell.
 *
 * Run: node example/document-5pages-row.js
 */

const fs = require("fs");
const PDFDocument = require("pdfkit-table");

// Build a very long paragraph — repeating enough to overflow ~5 pages
const PARAGRAPH =
  "Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; " +
  "Proin vel ante a orci tempus eleifend ut et magna. Lorem ipsum dolor sit amet, " +
  "consectetur adipiscing elit. Vivamus luctus urna sed urna ultricies ac tempor dui sagittis. " +
  "In condimentum facilisis porta. Sed nec diam eu diam mattis viverra. Nulla fringilla, " +
  "orci ac euismod semper, magna diam porttitor mauris, quis sollicitudin sapien justo in libero. ";

// ~300 words × 6 chars ≈ 1 800 chars repeated 18× ≈ 32 000 chars → ~5 A4 pages in an 8pt font
const VERY_LONG_TEXT = PARAGRAPH.repeat(18);

async function main() {
  const doc = new PDFDocument({ margin: 40, size: "A4", compress: false });
  doc.pipe(fs.createWriteStream("./document-06-pages-in-row.pdf"));

  doc
    .fontSize(13)
    .font("Helvetica-Bold")
    .text("Single Row — 5-Page Overflow Demo", { align: "center" });
  doc
    .fontSize(9)
    .font("Helvetica")
    .text(
      'The table below has only ONE data row. Its "Details" cell contains enough text to span ~5 pages.',
      { align: "center" },
    );
  doc.moveDown();

  // Table: 3 columns.  The middle column holds the giant text.
  await doc.table(
    {
      headers: [
        { label: "ID", property: "id", width: 50, align: "center" },
        { label: "Details", property: "details", width: 380 },
        { label: "Status", property: "status", width: 65, align: "center" },
      ],
      data: [
        {
          id: "001",
          details: VERY_LONG_TEXT.trim(),
          status: "Active",
        },
      ],
    },
    {
      padding: [5, 8, 5, 8],
      divider: {
        header: { width: 1.5, color: "#333" },
        horizontal: { disabled: true },
      },
      prepareHeader: () => doc.font("Helvetica-Bold").fontSize(9),
      prepareRow: () => doc.font("Helvetica").fontSize(8),
    },
  );

  // Summary table on the same page where the giant row ended (if space allows)
  doc.moveDown(1);
  doc
    .fontSize(11)
    .font("Helvetica-Bold")
    .text("Summary (added after the giant row)")
    .moveDown(0.4);

  await doc.table(
    {
      headers: ["Key", "Value"],
      rows: [
        ["Pages used by giant row", "~5"],
        ["Document still works", "Yes ✓"],
        ["Overflow handled by", "pdfkit-table pageAdded event"],
      ],
    },
    { width: 350 },
  );

  doc.end();
  console.log("→ document-5pages-row.pdf");
}

main();
