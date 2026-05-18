"use strict";
/**
 * Example: showcase of ALL pdfkit-table features.
 * Run: node example/document-all-features.js
 */

const fs = require("fs");
const PDFDocument = require("pdfkit-table");

const LOREM =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. " +
  "Pellentesque habitant morbi tristique senectus et netus et malesuada fames.";
const SHORT = "Sed ut perspiciatis unde omnis iste natus error sit voluptatem.";

function section(doc, title, threshold = 0.15) {
  doc
    .checkPageBreak(threshold)
    .moveDown(0.5)
    .fontSize(11)
    .font("Helvetica-Bold")
    .fillColor("#1a1a2e")
    .text(title)
    .font("Helvetica")
    .fillColor("black")
    .fontSize(9)
    .moveDown(0.3);
}

async function main() {
  const doc = new PDFDocument({ margin: 40, size: "A4", compress: false });
  doc.pipe(fs.createWriteStream("./document-05-all-features.pdf"));

  // Cover
  doc
    .fontSize(18)
    .font("Helvetica-Bold")
    .text("pdfkit-table", { align: "center" });
  doc
    .fontSize(13)
    .font("Helvetica")
    .text("All Features Showcase", { align: "center" });
  doc.moveDown(1.5);

  // ------------------------------------------------------------------
  // 1. String headers + rows array
  // ------------------------------------------------------------------
  section(doc, "1. String headers + rows array");
  await doc.table(
    {
      headers: ["Country", "Rate", "Trend"],
      rows: [
        ["Switzerland", "12%", "▲"],
        ["France", "67%", "▼"],
        ["Germany", "45%", "▲"],
      ],
    },
    { width: 300, columnSpacing: 4 },
  );

  // ------------------------------------------------------------------
  // 2. Object headers with alignment
  // ------------------------------------------------------------------
  section(doc, "2. Object headers — width + alignment");
  await doc.table({
    headers: [
      { label: "ID", property: "id", width: 40, align: "center" },
      { label: "Name", property: "name", width: 130, align: "left" },
      { label: "Score", property: "score", width: 60, align: "right" },
      { label: "Grade", property: "grade", width: 60, align: "center" },
    ],
    data: [
      { id: "1", name: "Alice", score: "98", grade: "A+" },
      { id: "2", name: "Bob", score: "74", grade: "C" },
      { id: "3", name: "Carol", score: "88", grade: "B+" },
    ],
  });

  // ------------------------------------------------------------------
  // 3. title + subtitle on table
  // ------------------------------------------------------------------
  section(doc, "3. Table with title + subtitle");
  await doc.table(
    {
      title: "Quarterly Revenue",
      subtitle: "Figures in USD thousands",
      headers: [
        { label: "Quarter", property: "q", width: 80 },
        { label: "Revenue", property: "rev", width: 100, align: "right" },
        { label: "YoY", property: "yoy", width: 70, align: "right" },
      ],
      data: [
        { q: "Q1 2026", rev: "$128,400", yoy: "+8.2%" },
        { q: "Q2 2026", rev: "$144,700", yoy: "+12.7%" },
        { q: "Q3 2026", rev: "$137,200", yoy: "+5.1%" },
      ],
    },
    { width: 350 },
  );

  // ------------------------------------------------------------------
  // 4. Custom dividers
  // ------------------------------------------------------------------
  section(doc, "4. Custom divider styles");
  await doc.table(
    {
      headers: ["A", "B", "C"],
      rows: [
        ["one", "two", "three"],
        ["four", "five", "six"],
      ],
    },
    {
      width: 300,
      divider: {
        header: { width: 2, color: "#333333" },
        horizontal: { width: 0.5, color: "#999999" },
      },
    },
  );

  // ------------------------------------------------------------------
  // 5. hideHeader
  // ------------------------------------------------------------------
  section(doc, "5. hideHeader — no header row");
  await doc.table(
    {
      headers: ["ignored", "because", "hidden"],
      rows: [
        ["Row A", "value", "100"],
        ["Row B", "value", "200"],
      ],
    },
    { width: 280, hideHeader: true },
  );

  // ------------------------------------------------------------------
  // 6. Padding variants
  // ------------------------------------------------------------------
  section(doc, "6. Padding — number / array / object per column");
  await doc.table({
    headers: [
      { label: "Pad=8 (all)", property: "a", width: 140, padding: 8 },
      {
        label: "Pad=[6,12] (v,h)",
        property: "b",
        width: 140,
        padding: [6, 12],
      },
      {
        label: "Pad obj",
        property: "c",
        width: 130,
        padding: { top: 10, right: 4, bottom: 2, left: 4 },
      },
    ],
    data: [{ a: "cell a", b: "cell b", c: "cell c" }],
  });

  // ------------------------------------------------------------------
  // 7. Row background colours + bold cells
  // ------------------------------------------------------------------
  section(doc, "7. Row backgrounds + bold text prefix");
  await doc.table({
    headers: [
      { label: "Item", property: "item", width: 160 },
      { label: "Status", property: "status", width: 100, align: "center" },
      { label: "Amount", property: "amount", width: 90, align: "right" },
    ],
    data: [
      { item: "Normal row", status: "OK", amount: "$10.00" },
      {
        item: "bold:Important row",
        status: "bold:WARN",
        amount: "$50.00",
        options: { columnColor: "#fff3cd" },
      },
      {
        item: "Critical issue",
        status: "ERROR",
        amount: "$200.00",
        options: { columnColor: "#f8d7da" },
      },
      {
        item: "Completed",
        status: "DONE",
        amount: "$0.00",
        options: { columnColor: "#d4edda" },
      },
    ],
  });

  // ------------------------------------------------------------------
  // 8. Per-cell object with options
  // ------------------------------------------------------------------
  section(doc, "8. Per-cell CellObject with individual style");
  await doc.table({
    headers: [
      { label: "Col 1", property: "c1", width: 160 },
      { label: "Col 2", property: "c2", width: 160 },
      { label: "Col 3", property: "c3", width: 115 },
    ],
    data: [
      {
        c1: { label: "Big text", options: { fontSize: 14 } },
        c2: "Normal cell",
        c3: { label: "Coloured", options: { color: "#0066cc" } },
      },
      {
        c1: "Regular",
        c2: {
          label: "PRICE $99",
          options: { fontSize: 11, columnColor: "#fff9c4" },
        },
        c3: "Another",
      },
    ],
  });

  // ------------------------------------------------------------------
  // 9. Custom prepareHeader / prepareRow hooks
  // ------------------------------------------------------------------
  section(doc, "9. prepareHeader + prepareRow hooks");
  await doc.table(
    {
      headers: [
        { label: "Metric", property: "m", width: 150 },
        { label: "Value", property: "v", width: 100 },
        { label: "Unit", property: "u", width: 80 },
      ],
      data: [
        { m: "Latency", v: "12", u: "ms" },
        { m: "Throughput", v: "4,500", u: "rps" },
        { m: "Error rate", v: "0.02", u: "%" },
      ],
    },
    {
      prepareHeader: () =>
        doc.font("Helvetica-Bold").fontSize(10).fillColor("blue"),
      prepareRow: (row, indexColumn) =>
        doc
          .font(indexColumn === 0 ? "Helvetica-Bold" : "Helvetica")
          .fontSize(9)
          .fillColor("orange"),
      divider: {
        header: { width: 1, color: "#004080" },
        horizontal: { width: 0.3, color: "#cccccc" },
      },
    },
  );

  // ------------------------------------------------------------------
  // 10. Cell renderer function
  // ------------------------------------------------------------------
  section(doc, "10. renderer function per header column");
  await doc.table({
    headers: [
      { label: "Product", property: "product", width: 150 },
      {
        label: "Price",
        property: "price",
        width: 90,
        align: "right",
        renderer: (val) => `€ ${Number(val).toFixed(2)}`,
      },
      {
        label: "Discount",
        property: "discount",
        width: 90,
        align: "right",
        renderer: (val) => `${val}%`,
      },
      {
        label: "Final",
        property: "final",
        width: 100,
        align: "right",
        renderer: (val, _col, _row, row) => {
          const p = Number(row.price);
          const d = Number(row.discount);
          return `€ ${(p * (1 - d / 100)).toFixed(2)}`;
        },
      },
    ],
    data: [
      { product: "Laptop Pro", price: "1299", discount: "10" },
      { product: "Wireless Mouse", price: "49", discount: "5" },
      { product: "USB-C Dock", price: "89", discount: "15" },
    ],
  });

  // ------------------------------------------------------------------
  // 11. Mixed datas + rows in same table
  // ------------------------------------------------------------------
  section(doc, "11. datas (object rows) + rows (array rows) in same table");
  await doc.table({
    headers: [
      { label: "Name", property: "name", width: 140 },
      { label: "Value", property: "value", width: 100 },
      { label: "Note", property: "note", width: 195 },
    ],
    datas: [
      { name: "Object row A", value: "42", note: "from datas array" },
      { name: "Object row B", value: "100", note: SHORT.slice(0, 60) },
    ],
    rows: [
      ["Array row C", "7", "from rows array"],
      ["Array row D", "99", "also from rows"],
    ],
  });

  // ------------------------------------------------------------------
  // 12. Long texts that wrap inside cells
  // ------------------------------------------------------------------
  section(doc, "12. Long wrapping texts inside cells");
  await doc.table(
    {
      headers: [
        { label: "#", property: "n", width: 30, align: "center" },
        { label: "Clause", property: "clause", width: 200 },
        { label: "Text", property: "text", width: 265 },
      ],
      data: [
        { n: "1", clause: "Liability", text: LOREM },
        { n: "2", clause: "Indemnification", text: LOREM + " " + SHORT },
        { n: "3", clause: "Governing Law", text: SHORT },
      ],
    },
    {
      padding: [5, 6, 5, 6],
      prepareHeader: () => doc.font("Helvetica-Bold").fontSize(8),
      prepareRow: () => doc.font("Helvetica").fontSize(8),
    },
  );

  // ------------------------------------------------------------------
  // 13. addPage option — table starts on fresh page
  // ------------------------------------------------------------------
  section(doc, "13. Option addPage: true — starts table on a fresh page");
  doc
    .fontSize(8)
    .font("Helvetica")
    .fillColor("#555")
    .text(
      "Tip: pass { addPage: true } to force the table to always begin on a new page.",
    )
    .fillColor("black")
    .moveDown(0.5);
  await doc.table(
    {
      headers: ["A", "B", "C"],
      rows: [
        ["value1", "value2", "value3"],
        ["value4", "value5", "value6"],
      ],
    },
    { width: 350 },
  );

  // ------------------------------------------------------------------
  // 14. Padding options 20px
  // ------------------------------------------------------------------
  section(doc, "14. Padding options [20, 20, 20, 20]");
  await doc.table(
    {
      headers: ["A", "B", "C"],
      rows: [
        ["value1", "value2", "value3"],
        ["value4", "value5", "value6"],
      ],
    },
    { width: 350, padding: [20, 20, 20, 20] },
  );

  // ------------------------------------------------------------------
  // 15. Padding options 20px
  // ------------------------------------------------------------------
  section(doc, "15. Padding options 20");
  await doc.table(
    {
      headers: ["A", "B", "C"],
      rows: [
        ["value1", "value2", "value3"],
        ["value4", "value5", "value6"],
      ],
    },
    { width: 350, padding: 20 },
  );

  // ------------------------------------------------------------------
  // 16. Padding options [10, 40, 10, 40]
  // ------------------------------------------------------------------
  section(doc, "16. Padding options 40");
  await doc.table(
    {
      headers: ["A", "B", "C"],
      rows: [
        ["value1", "value2", "value3"],
        ["value4", "value5", "value6"],
      ],
    },
    { width: 350, padding: [10, 40, 10, 40] },
  );

  // ------------------------------------------------------------------
  // 17. Padding options 40
  // ------------------------------------------------------------------
  section(doc, "17. Padding options padding: 40");
  await doc.table(
    {
      headers: ["A", "B", "C"],
      rows: [
        ["value1", "value2", "value3"],
        ["value4", "value5", "value6"],
      ],
    },
    { padding: 20 },
  );

  // ------------------------------------------------------------------
  // End
  // ------------------------------------------------------------------
  doc.end();
  console.log("→ document-all-features.pdf");
}

main().catch(console.error);
