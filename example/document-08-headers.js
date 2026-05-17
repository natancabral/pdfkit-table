"use strict";
/**
 * Example: all header object properties.
 *
 * Covers every field on a header object:
 *   label · property · width · align · valign
 *   headerColor · headerOpacity · headerAlign
 *   columnColor / backgroundColor · columnOpacity / backgroundOpacity
 *   padding (number | array | object)
 *   renderer (value, indexColumn, indexRow, row, rectRow, rectCell)
 *
 * Run from the project root:
 *   node example/document-08-headers.js
 */

const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit-table");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function section(doc, title, sub = "") {
  doc
    .checkPageBreak(0.15)
    .moveDown(0.6)
    .fontSize(11)
    .font("Helvetica-Bold")
    .fillColor("#1a1a2e")
    .text(title)
    .font("Helvetica")
    .fillColor("#444444")
    .fontSize(8);
  if (sub) doc.text(sub);
  doc.fillColor("black").fontSize(9).moveDown(0.3);
}

function label(doc, text) {
  doc
    .fontSize(8)
    .fillColor("#777777")
    .text(text)
    .fillColor("black")
    .fontSize(9);
}

// ---------------------------------------------------------------------------
// Sample data reused across tables
// ---------------------------------------------------------------------------

const DATA = [
  { id: "1", name: "Alice", role: "Engineer", score: "98", status: "Active" },
  { id: "2", name: "Bob", role: "Designer", score: "74", status: "On leave" },
  { id: "3", name: "Carol", role: "Manager", score: "88", status: "Active" },
  { id: "4", name: "David", role: "Engineer", score: "61", status: "Inactive" },
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const doc = new PDFDocument({ margin: 40, size: "A4", compress: false });
  doc.pipe(
    fs.createWriteStream(path.join(__dirname, "document-08-headers.pdf")),
  );

  // Cover -------------------------------------------------------------------
  doc
    .fontSize(18)
    .font("Helvetica-Bold")
    .text("pdfkit-table — Header Properties", { align: "center" });
  doc
    .fontSize(10)
    .font("Helvetica")
    .text(
      "label · property · width · align · valign · headerColor · headerOpacity\n" +
        "headerAlign · columnColor · columnOpacity · padding · renderer",
      { align: "center" },
    );
  doc.moveDown(1.5);

  // ── 1. label + property + width ──────────────────────────────────────────
  section(
    doc,
    "1. label · property · width",
    "label: display text in header row  |  property: key in data object  |  width: column width in pt",
  );
  await doc.table(
    {
      headers: [
        { label: "ID", property: "id", width: 30 },
        { label: "Name", property: "name", width: 120 },
        { label: "Role", property: "role", width: 110 },
        { label: "Score", property: "score", width: 60 },
        { label: "Status", property: "status", width: 100 },
      ],
      data: DATA,
    },
    { width: 515 },
  );

  // ── 2. align (cell text alignment) ───────────────────────────────────────
  section(
    doc,
    "2. align — horizontal alignment of data cell text",
    "align: 'left' | 'center' | 'right' | 'justify'  (applied to every data cell in the column)",
  );
  await doc.table(
    {
      headers: [
        { label: "left (default)", property: "id", width: 120, align: "left" },
        { label: "center", property: "name", width: 140, align: "center" },
        { label: "right", property: "score", width: 120, align: "right" },
        { label: "justify", property: "role", width: 130, align: "justify" },
      ],
      data: DATA,
    },
    { width: 515 },
  );

  // ── 3. valign (cell vertical alignment) ──────────────────────────────────
  section(
    doc,
    "3. valign — vertical alignment of data cell text",
    "valign: 'top' | 'center' | 'bottom'  (visible only when row height > text height)",
  );
  await doc.table(
    {
      headers: [
        {
          label: "top (default)",
          property: "id",
          width: 120,
          valign: "top",
          padding: 10,
        },
        {
          label: "center",
          property: "name",
          width: 140,
          valign: "center",
          padding: 10,
        },
        {
          label: "bottom",
          property: "score",
          width: 110,
          valign: "bottom",
          padding: 10,
        },
        {
          label: "right",
          property: "status",
          width: 70,
          align: "right",
          padding: 10,
        },
        {
          label: "bottom+right",
          property: "status",
          width: 70,
          valign: "bottom",
          align: "right",
          padding: 10,
        },
      ],
      data: DATA,
    },
    { minRowHeight: 48, width: 515 },
  );

  // ── 4. headerColor + headerOpacity ───────────────────────────────────────
  section(
    doc,
    "4. headerColor · headerOpacity — header row background",
    "headerColor: CSS color string  |  headerOpacity: 0–1 (default ~0.1)",
  );
  await doc.table(
    {
      headers: [
        { label: "default", property: "id", width: 90 },
        {
          label: "headerColor only",
          property: "name",
          width: 120,
          headerColor: "#e74c3c",
        },
        {
          label: "color + opacity 1",
          property: "role",
          width: 120,
          headerColor: "#2ecc71",
          headerOpacity: 1,
        },
        {
          label: "opacity 0.3",
          property: "score",
          width: 90,
          headerColor: "#3498db",
          headerOpacity: 0.3,
        },
        {
          label: "dark bg",
          property: "status",
          width: 90,
          headerColor: "#2c3e50",
          headerOpacity: 1,
        },
      ],
      data: DATA,
    },
    { width: 515 },
  );

  // ── 5. headerAlign (independent header label alignment) ──────────────────
  section(
    doc,
    "5. headerAlign — alignment of the header label text",
    "headerAlign overrides align for the header row only; data cells keep their own align",
  );
  await doc.table(
    {
      headers: [
        {
          label: "header left / data left",
          property: "id",
          width: 120,
          align: "left",
          headerAlign: "left",
        },
        {
          label: "header center / data left",
          property: "name",
          width: 140,
          align: "left",
          headerAlign: "center",
        },
        {
          label: "header right / data center",
          property: "role",
          width: 130,
          align: "center",
          headerAlign: "right",
        },
        {
          label: "header left / data right",
          property: "score",
          width: 120,
          align: "right",
          headerAlign: "left",
        },
      ],
      data: DATA,
    },
    { width: 515 },
  );

  // ── 6. columnColor / backgroundColor + opacity ───────────────────────────
  section(
    doc,
    "6. columnColor / backgroundColor · columnOpacity / backgroundOpacity",
    "Tints every data cell in the column (header uses headerColor). Both aliases work.",
  );
  await doc.table(
    {
      headers: [
        { label: "no tint", property: "id", width: 80 },
        {
          label: "columnColor",
          property: "name",
          width: 115,
          columnColor: "#f39c12",
          columnOpacity: 0.25,
        },
        {
          label: "backgroundColor",
          property: "role",
          width: 115,
          backgroundColor: "#9b59b6",
          backgroundOpacity: 0.2,
        },
        {
          label: "full opacity",
          property: "score",
          width: 90,
          columnColor: "#1abc9c",
          columnOpacity: 1,
        },
        {
          label: "header + column",
          property: "status",
          width: 110,
          headerColor: "#c0392b",
          headerOpacity: 1,
          columnColor: "#c0392b",
          columnOpacity: 0.15,
        },
      ],
      data: DATA,
    },
    { width: 515 },
  );

  // ── 7. padding variants ───────────────────────────────────────────────────
  section(
    doc,
    "7. padding — number | [vertical, horizontal] | { top, right, bottom, left }",
    "padding can be set per-column on the header object, or globally via table options",
  );
  await doc.table(
    {
      headers: [
        { label: "pad=2 (tight)", property: "id", width: 100, padding: 2 },
        { label: "pad=10 (loose)", property: "name", width: 120, padding: 10 },
        {
          label: "pad=[8,2] v,h",
          property: "role",
          width: 115,
          padding: [8, 2],
        },
        {
          label: "pad obj t4 r16 b4 l4",
          property: "score",
          width: 100,
          padding: { top: 4, right: 16, bottom: 4, left: 4 },
        },
        { label: "global pad (opts)", property: "status", width: 80 },
      ],
      data: DATA,
    },
    { width: 515, padding: 6 /* fallback for columns without own padding */ },
  );

  // ── 8. renderer — custom cell rendering ──────────────────────────────────
  section(
    doc,
    "8. renderer — function(value, indexColumn, indexRow, row, rectRow, rectCell)",
    "Returns the string to display. Use side-effects on doc for colours, images, etc.",
  );
  await doc.table(
    {
      headers: [
        // Plain column for reference
        { label: "Name", property: "name", width: 100 },

        // renderer: prefix bold text
        {
          label: "Score (bold if ≥ 90)",
          property: "score",
          width: 120,
          align: "center",
          renderer: (value) => {
            if (Number(value) >= 90) {
              doc.font("Helvetica-Bold");
            }
            return value;
          },
        },

        // renderer: color the text based on value
        {
          label: "Status (coloured)",
          property: "status",
          width: 120,
          renderer: (value) => {
            const color =
              value === "Active"
                ? "#27ae60"
                : value === "Inactive"
                  ? "#e74c3c"
                  : "#f39c12";
            doc.fillColor(color);
            return value;
          },
        },

        // renderer: transform value to display string
        {
          label: "Score bar",
          property: "score",
          width: 100,
          renderer: (value) => {
            const n = Number(value);
            const filled = Math.round(n / 10);
            return "█".repeat(filled) + "░".repeat(10 - filled);
          },
        },

        // renderer: expose all arguments
        {
          label: "Col / Row",
          property: "id",
          width: 70,
          align: "center",
          renderer: (_value, indexColumn, indexRow) =>
            `c${indexColumn} r${indexRow}`,
        },
      ],
      data: DATA,
    },
    {
      width: 515,
      prepareRow: () => {
        // Reset font/color after every cell so renderers don't bleed
        doc.font("Helvetica").fontSize(9).fillColor("black");
      },
    },
  );

  // ── 9. Combined — everything together ────────────────────────────────────
  section(
    doc,
    "9. Combined — all properties on the same table",
    "Real-world example mixing colours, alignment, padding and a renderer",
  );
  await doc.table(
    {
      title: "Team Overview",
      subtitle: "Q2 2026 — internal use only",
      headers: [
        {
          label: "#",
          property: "id",
          width: 30,
          align: "center",
          headerAlign: "center",
          headerColor: "#2c3e50",
          headerOpacity: 1,
          padding: 4,
        },
        {
          label: "Full Name",
          property: "name",
          width: 120,
          align: "left",
          headerColor: "#2c3e50",
          headerOpacity: 1,
          columnColor: "#ecf0f1",
          columnOpacity: 0.6,
          padding: [4, 8],
        },
        {
          label: "Role",
          property: "role",
          width: 110,
          align: "left",
          headerColor: "#2c3e50",
          headerOpacity: 1,
          padding: [4, 6],
        },
        {
          label: "Score",
          property: "score",
          width: 60,
          align: "center",
          headerAlign: "center",
          headerColor: "#2980b9",
          headerOpacity: 1,
          columnColor: "#2980b9",
          columnOpacity: 0.1,
          padding: 4,
          renderer: (value) => `${value} pts`,
        },
        {
          label: "Status",
          property: "status",
          width: 100,
          align: "center",
          headerAlign: "center",
          headerColor: "#2c3e50",
          headerOpacity: 1,
          padding: [4, 6],
          renderer: (value) => {
            const color =
              value === "Active"
                ? "#27ae60"
                : value === "Inactive"
                  ? "#e74c3c"
                  : "#e67e22";
            doc.fillColor(color);
            return value;
          },
        },
      ],
      data: DATA,
    },
    {
      divider: {
        header: { width: 2, color: "#2c3e50" },
        horizontal: { width: 0.5, color: "#bdc3c7" },
      },
      prepareRow: () => {
        doc.font("Helvetica").fontSize(9).fillColor("black");
      },
    },
  );

  // Done --------------------------------------------------------------------
  doc.end();
  console.log("Generated → example/document-08-headers.pdf");
}

main().catch(console.error);
