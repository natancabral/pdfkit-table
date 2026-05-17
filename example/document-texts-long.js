"use strict";
/**
 * Example: tables with long texts — multi-line cells, wrapping, overflow to new pages.
 * Run: node example/document-texts-long.js
 */

const fs = require("fs");
const PDFDocument = require("pdfkit-table");

const LOREM_UNIT =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. " +
  "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. " +
  "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. " +
  "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. " +
  "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. " +
  "Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. " +
  "Nullam varius, turpis molestie dictum semper, enim risus laoreet purus, eget pellentesque augue mauris eu diam. " +
  "Phasellus tristique lorem vitae dui semper sagittis. Aenean commodo ligula eget dolor. " +
  "Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. " +
  "Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. " +
  "Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. " +
  "In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. " +
  "Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. " +
  "Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. " +
  "Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. " +
  "Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. " +
  "Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. " +
  "Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. ";

/** Build a cell text of at least `minLen` chars, prefixed with "Start" and suffixed with "End". */
function makeLongCell(minLen) {
  let body = "";
  while (body.length < minLen) body += LOREM_UNIT;
  return "Start " + body.slice(0, minLen - 10).trimEnd() + " End";
}

// Three variants with 3 000+ characters each (different starting offsets for variety)
const LONG_A = makeLongCell(3100);
const LONG_B =
  "Start " +
  LOREM_UNIT.repeat(Math.ceil(3000 / LOREM_UNIT.length))
    .slice(200, 3210)
    .trimEnd() +
  " End";
const LONG_C =
  "Start " +
  LOREM_UNIT.repeat(Math.ceil(3000 / LOREM_UNIT.length))
    .slice(400, 3410)
    .trimEnd() +
  " End";

const SHORT =
  "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.";
const LOREM = LOREM_UNIT.slice(0, 280).trimEnd() + ".";

async function main() {
  const doc = new PDFDocument({ margin: 40, size: "A4", compress: false });
  doc.pipe(fs.createWriteStream("./document-texts-long.pdf"));

  doc
    .fontSize(14)
    .text("Tables — Long Texts", { align: "center" })
    .moveDown(0.5);

  // ------------------------------------------------------------------
  // 1. Default behaviour — tall rows jump to new page when they don't fit
  // ------------------------------------------------------------------
  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .text("1. Default — tall rows jump to a new page")
    .moveDown(0.3);
  await doc.table(
    {
      headers: [
        { label: "Name", property: "name", width: 90 },
        { label: "Description", property: "desc", width: 310 },
        { label: "Price", property: "price", width: 60, align: "right" },
      ],
      data: [
        { name: "Alpha Widget", desc: LONG_A, price: "$19.99" },
        { name: "Beta Gadget", desc: SHORT, price: "$49.00" },
        { name: "Gamma Device", desc: LONG_B, price: "$129.90" },
        { name: "Delta Module", desc: LONG_C, price: "$8.50" },
      ],
    },
    {
      // pageBreakThreshold defaults to 1.0 — rows shorter than the full page
      // height are moved to a new page when they don't fit in remaining space.
      padding: [4, 6, 4, 6],
      prepareHeader: () => doc.font("Helvetica-Bold").fontSize(8),
      prepareRow: () => doc.font("Helvetica").fontSize(8),
      divider: { horizontal: { width: 0.4, color: "#bbb" } },
    },
  );

  doc.addPage();

  // ------------------------------------------------------------------
  // 2. pageBreakThreshold: 0.6 — rows > 60 % of page render in-place
  // ------------------------------------------------------------------
  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .text("2. pageBreakThreshold: 0.6 — tall rows start in-place, no empty gap")
    .moveDown(0.3);
  doc
    .fontSize(8)
    .font("Helvetica")
    .fillColor("#555")
    .text(
      "Rows taller than 60 % of the page height begin at the current cursor\n" +
        "and flow across pages naturally — no blank gap before them.",
    )
    .fillColor("black")
    .moveDown(0.4);
  await doc.table(
    {
      headers: [
        { label: "#", property: "num", width: 30, align: "center" },
        { label: "Section", property: "section", width: 100 },
        { label: "Content", property: "content", width: 370 },
      ],
      data: [
        { num: "1", section: "Introduction", content: LONG_A },
        { num: "2", section: "Scope of Work", content: LONG_B },
        { num: "3", section: "Payment Terms", content: SHORT },
        { num: "4", section: "Confidentiality", content: LONG_C },
        { num: "5", section: "Termination", content: LONG_A },
      ],
    },
    {
      pageBreakThreshold: 0.6, // ← rows > 60 % of page height flow in-place
      padding: [5, 6, 5, 6],
      divider: { horizontal: { width: 0.5, color: "#ccc" } },
      prepareHeader: () => doc.font("Helvetica-Bold").fontSize(8),
      prepareRow: () => doc.font("Helvetica").fontSize(8),
    },
  );

  doc.addPage();

  // ------------------------------------------------------------------
  // 3. keepRowsTogether: true — no proactive page break for any row
  // ------------------------------------------------------------------
  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .text("3. keepRowsTogether: true — rows always start at current position")
    .moveDown(0.3);
  doc
    .fontSize(8)
    .font("Helvetica")
    .fillColor("#555")
    .text(
      "All rows begin exactly where the cursor is. PDFKit handles all page\n" +
        "overflow internally. Ideal for tables with mostly multi-page cells.",
    )
    .fillColor("black")
    .moveDown(0.4);
  await doc.table(
    {
      headers: [
        { label: "Name", property: "name", width: 90 },
        { label: "Description", property: "desc", width: 310 },
        { label: "Price", property: "price", width: 60, align: "right" },
      ],
      data: [
        { name: "Alpha Widget", desc: LONG_A, price: "$19.99" },
        { name: "Beta Gadget", desc: SHORT, price: "$49.00" },
        { name: "Gamma Device", desc: LONG_B, price: "$129.90" },
      ],
    },
    {
      keepRowsTogether: true, // ← never insert a proactive page break
      padding: [4, 6, 4, 6],
      divider: { horizontal: { width: 0.4, color: "#bbb" } },
      prepareHeader: () => doc.font("Helvetica-Bold").fontSize(8),
      prepareRow: () => doc.font("Helvetica").fontSize(8),
    },
  );

  doc.moveDown();

  // ------------------------------------------------------------------
  // 3. Table spanning multiple pages — enough rows to force page breaks
  // ------------------------------------------------------------------
  doc
    .fontSize(10)
    .text("3. Many rows — forces automatic page breaks")
    .moveDown(0.3);

  const manyRows = Array.from({ length: 40 }, (_, i) => ({
    row: String(i + 1).padStart(3, "0"),
    name: `Item ${i + 1}`,
    note: i % 3 === 0 ? LOREM.slice(0, 120) : SHORT,
    amount: `$${((i + 1) * 7.77).toFixed(2)}`,
  }));

  await doc.table(
    {
      headers: [
        { label: "Row", property: "row", width: 35, align: "center" },
        { label: "Name", property: "name", width: 80 },
        { label: "Note", property: "note", width: 300 },
        { label: "Amount", property: "amount", width: 75, align: "right" },
      ],
      data: manyRows,
    },
    {
      padding: [3, 5, 3, 5],
      prepareHeader: () => doc.font("Helvetica-Bold").fontSize(8),
      prepareRow: () => doc.font("Helvetica").fontSize(8),
    },
  );

  doc.end();
  console.log("→ document-texts-long.pdf");
}

main().catch(console.error);
