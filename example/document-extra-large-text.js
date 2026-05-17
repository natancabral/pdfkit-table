"use strict";
/**
 * Example: table where every cell holds 5 000+ characters.
 * First word: "Start" — Last word: "End"
 * Run: node example/document-extra-large-text.js
 */

const fs = require("fs");
const PDFDocument = require("pdfkit-table");
const { isBreakOrContinueStatement } = require("typescript");

// ---------------------------------------------------------------------------
// Build a block of Lorem Ipsum that, together with the "Start" prefix and
// "End" suffix, exceeds 5 000 characters per cell.
// ---------------------------------------------------------------------------
const LOREM_UNIT =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. " +
  "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. " +
  "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. " +
  "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. " +
  "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. " +
  "Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. " +
  "Nullam varius, turpis molestie dictum semper, enim risus laoreet purus, " +
  "eget pellentesque augue mauris eu diam. " +
  "Phasellus tristique lorem vitae dui semper sagittis. " +
  "Aenean commodo ligula eget dolor. Aenean massa. " +
  "Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. " +
  "Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. " +
  "Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. " +
  "In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. " +
  "Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. " +
  "Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. " +
  "Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. " +
  "Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. " +
  "Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. " +
  "Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. ";

// Repeat until we have at least 4 900 chars for the body, so total > 5 000
const BODY = LOREM_UNIT.repeat(Math.ceil(4900 / LOREM_UNIT.length));

/**
 * Build a cell string: "Start " + body (trimmed to ~4 990 chars) + " End"
 * Total length >= 5 000 characters.
 */
function makeLargeCell(body) {
  const trimmed = body.slice(0, 4990);
  return `Start ${trimmed} End`;
}

const CELL_A = makeLargeCell(BODY);
const CELL_B = makeLargeCell(BODY.split("").reverse().join("")); // reversed variant
const CELL_C = makeLargeCell(BODY.slice(200, 5190)); // offset variant

console.log(`Cell A length: ${CELL_A.length} chars`);
console.log(`Cell B length: ${CELL_B.length} chars`);
console.log(`Cell C length: ${CELL_C.length} chars`);

async function main() {
  const doc = new PDFDocument({
    margin: 40,
    size: "A4",
    compress: false,
    keepRowsTogether: true,
    pageBreakThreshold: 0.1,
  });
  doc.pipe(fs.createWriteStream("./document-extra-large-text.pdf"));

  doc
    .fontSize(14)
    .font("Helvetica-Bold")
    .text("Extra-Large Text Demo", { align: "center" });
  doc
    .fontSize(9)
    .font("Helvetica")
    .text(
      `Each cell contains ${CELL_A.length.toLocaleString()}+ characters. First word: "Start" · Last word: "End"`,
      { align: "center" },
    );
  doc.moveDown(1);

  // ------------------------------------------------------------------
  // Table 1 — single column, three extra-large rows
  // ------------------------------------------------------------------
  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .text("Table 1 — single column")
    .moveDown(0.3);

  await doc.table(
    {
      headers: [{ label: "Content", property: "content", width: 490 }],
      data: [{ content: CELL_A }, { content: CELL_B }, { content: CELL_C }],
    },
    {
      padding: [6, 8, 6, 8],
      prepareHeader: () => doc.font("Helvetica-Bold").fontSize(9),
      prepareRow: () => doc.font("Helvetica").fontSize(8),
      divider: {
        header: { width: 1, color: "#333" },
        horizontal: { width: 0.5, color: "#aaa" },
      },
    },
  );

  // doc.addPage();

  // ------------------------------------------------------------------
  // Table 2 — two columns, each cell > 5 000 chars
  // ------------------------------------------------------------------
  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .text("Table 2 — two columns")
    .moveDown(0.3);

  await doc.table(
    {
      headers: [
        { label: "Column A", property: "a", width: 245 },
        { label: "Column B", property: "b", width: 245 },
      ],
      data: [
        { a: CELL_A, b: CELL_B },
        { a: CELL_C, b: CELL_A },
      ],
    },
    {
      padding: [5, 6, 5, 6],
      prepareHeader: () => doc.font("Helvetica-Bold").fontSize(9),
      prepareRow: () => doc.font("Helvetica").fontSize(8),
    },
  );

  // doc.addPage();

  // ------------------------------------------------------------------
  // Table 3 — mixed: one tiny column + one giant column
  // ------------------------------------------------------------------
  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .text("Table 3 — narrow ID + wide body")
    .moveDown(0.3);

  await doc.table(
    {
      headers: [
        { label: "#", property: "id", width: 30, align: "center" },
        { label: "Body", property: "body", width: 460 },
      ],
      data: [
        { id: "1", body: CELL_A },
        { id: "2", body: CELL_B },
        { id: "3", body: CELL_C },
      ],
    },
    {
      padding: [5, 6, 5, 6],
      prepareHeader: () => doc.font("Helvetica-Bold").fontSize(9),
      prepareRow: () => doc.font("Helvetica").fontSize(8),
      divider: { horizontal: { width: 0.3, color: "#cccccc" } },
    },
  );

  doc.end();
  console.log("→ document-extra-large-text.pdf");
}

main().catch(console.error);
