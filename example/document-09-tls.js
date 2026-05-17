"use strict";
/**
 * pdfkit-table — RTL (Right-to-Left) example
 *
 * Demonstrates rtl: true with:
 *   1. LTR baseline (default — proves RTL does not break LTR)
 *   2. String headers with Hebrew text
 *   3. Object headers with per-column width, color and alignment
 *   4. Mixed Latin content with columnsSize
 *   5. valign center with tall rows
 *
 * Run from the project root:
 *   node example/document-09-tls.js
 */

const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit-table");

async function main() {
  const doc = new PDFDocument({
    compress: false,
    margins: { top: 40, bottom: 40, left: 40, right: 40 },
  });

  const output = fs.createWriteStream(
    path.join(__dirname, "document-09-tls.pdf"),
  );
  doc.pipe(output);

  // ─────────────────────────────────────────────────────────────────────────
  // Helper: section title
  // ─────────────────────────────────────────────────────────────────────────
  const section = (label) => {
    doc
      .moveDown(0.5)
      .font("Helvetica-Bold")
      .fontSize(11)
      .fillColor("#1a1a2e")
      .text(label)
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#555555")
      .moveDown(0.3);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // 1. LTR baseline (no changes — proves RTL does not break LTR)
  // ─────────────────────────────────────────────────────────────────────────
  section("1. LTR baseline (default)");

  await doc.table(
    {
      headers: ["Name", "Role", "Score"],
      rows: [
        ["Alice", "Engineer", "98"],
        ["Bob", "Designer", "87"],
        ["Carol", "Manager", "91"],
      ],
    },
    {
      width: 400,
      padding: 6,
      divider: {
        header: { disabled: false, width: 0.5, opacity: 0.8 },
        horizontal: { disabled: false, width: 0.3, opacity: 0.5 },
      },
    },
  );

  // ─────────────────────────────────────────────────────────────────────────
  // 2. RTL — string headers (simplest form)
  // ─────────────────────────────────────────────────────────────────────────
  section("2. RTL — string headers");

  await doc.table(
    {
      // Hebrew column labels (right-to-left reading order)
      headers: ["שם", "תפקיד", "ציון"],
      rows: [
        ["אליס", "מהנדסת", "98"],
        ["בוב", "מעצב", "87"],
        ["קרול", "מנהלת", "91"],
      ],
    },
    {
      width: 400,
      padding: 6,
      rtl: true,
      divider: {
        header: { disabled: false, width: 0.5, opacity: 0.8 },
        horizontal: { disabled: false, width: 0.3, opacity: 0.5 },
      },
    },
  );

  // ─────────────────────────────────────────────────────────────────────────
  // 3. RTL — object headers with individual column widths and colors
  // ─────────────────────────────────────────────────────────────────────────
  section("3. RTL — object headers (per-column width, color, align)");

  await doc.table(
    {
      headers: [
        {
          label: "שם",
          property: "name",
          width: 160,
          headerColor: "#1a1a2e",
          headerOpacity: 1,
          align: "right",
          padding: [6, 10, 6, 6],
        },
        {
          label: "תפקיד",
          property: "role",
          width: 140,
          headerColor: "#16213e",
          headerOpacity: 1,
          align: "right",
          padding: [6, 10, 6, 6],
        },
        {
          label: "ציון",
          property: "score",
          width: 100,
          headerColor: "#0f3460",
          headerOpacity: 1,
          align: "right",
          padding: [6, 10, 6, 6],
        },
      ],
      data: [
        { name: "אליס", role: "מהנדסת", score: "98" },
        { name: "בוב", role: "מעצב", score: "87" },
        { name: "קרול", role: "מנהלת", score: "91" },
        { name: "דן", role: "מוצר", score: "79" },
      ],
    },
    {
      rtl: true,
      padding: [5, 10, 5, 6],
      prepareHeader: function () {
        // White bold text on dark header
        this.fillColor("white").font("Helvetica-Bold").fontSize(9);
      },
      prepareRow: function (_row, _ic, ir) {
        this.fillColor("#1a1a2e").font("Helvetica").fontSize(8).fill();
        // Zebra stripe
        // (background set via prepareRowBackground / backgroundColor option instead)
      },
      divider: {
        header: { disabled: false, width: 0.5, opacity: 1 },
        horizontal: { disabled: false, width: 0.3, opacity: 0.4 },
      },
    },
  );

  // ─────────────────────────────────────────────────────────────────────────
  // 4. RTL — mixed Latin + RTL values, custom column sizes
  // ─────────────────────────────────────────────────────────────────────────
  section("4. RTL — mixed Latin content with columnsSize");

  await doc.table(
    {
      headers: ["Product", "Qty", "Unit Price", "Total"],
      rows: [
        ["Widget A", "10", "$5.00", "$50.00"],
        ["Gadget B", "3", "$29.99", "$89.97"],
        ["Doohickey C", "1", "$199.00", "$199.00"],
      ],
    },
    {
      rtl: true,
      columnsSize: [180, 50, 90, 80],
      padding: 7,
      divider: {
        header: { disabled: false, width: 0.5, opacity: 0.9 },
        horizontal: { disabled: false, width: 0.3, opacity: 0.45 },
      },
    },
  );

  // ─────────────────────────────────────────────────────────────────────────
  // 5. RTL — valign center demonstration
  // ─────────────────────────────────────────────────────────────────────────
  section("5. RTL — valign center with tall rows");

  await doc.table(
    {
      headers: [
        { label: "כותרת", property: "title", width: 200, align: "right" },
        {
          label: "תיאור",
          property: "desc",
          width: 200,
          align: "right",
          valign: "center",
        },
        {
          label: "סטטוס",
          property: "status",
          width: 100,
          align: "right",
          valign: "center",
        },
      ],
      data: [
        {
          title: "פרויקט אלפא",
          desc: "תיאור ארוך של הפרויקט הראשון\nהכולל מספר שורות טקסט\nלבדיקת valign",
          status: "פעיל",
        },
        {
          title: "פרויקט בטא",
          desc: "תיאור קצר",
          status: "בהמתנה",
        },
      ],
    },
    {
      rtl: true,
      padding: 8,
      minRowHeight: 50,
      divider: {
        header: { disabled: false, width: 0.5, opacity: 0.8 },
        horizontal: { disabled: false, width: 0.3, opacity: 0.5 },
      },
    },
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Finalise
  // ─────────────────────────────────────────────────────────────────────────
  doc.end();

  await new Promise((resolve, reject) => {
    output.on("finish", resolve);
    output.on("error", reject);
  });

  console.log("Generated →", path.join(__dirname, "document-09-tls.pdf"));
}

main().catch((err) => {
  console.error("Error generating RTL sample:", err);
  process.exit(1);
});
