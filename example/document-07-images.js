"use strict";
/**
 * Example: images inside table cells.
 *
 * Sources:  file path · base64 data URI · Buffer · hardcoded base64
 * Sizing:   width · height · width+height · scale · fit · cover · align/valign
 *
 * How it works
 * ───────────────────────────────────────────────────────────────────────────
 * The header `renderer` function is a closure that captures `doc`.
 * It calls doc.image() as a side-effect and returns '' so pdfkit-table
 * does not draw any text on top of the image.
 *
 * Run from the project root:
 *   node example/document-07-images.js
 */

const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit-table");

// ---------------------------------------------------------------------------
// Image sources
// ---------------------------------------------------------------------------

const IMAGE_PATH = path.join(__dirname, "npm-tile.png");

// Base64 data URI — accepted directly by doc.image()
const imageBase64 =
  "data:image/png;base64," + fs.readFileSync(IMAGE_PATH).toString("base64");

// Raw Buffer — also accepted directly by doc.image()
const imageBuffer = fs.readFileSync(IMAGE_PATH);

// Hardcoded inline base64 — no file needed at runtime.
// Swap the payload string for any PNG or JPEG encoded as base64.
const INLINE_BASE64 =
  "data:image/png;base64," +
  "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";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function section(doc, title) {
  doc
    .checkPageBreak(0.15)
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

/**
 * Returns a CellRenderer that draws `src` inside the cell using `imgOpts`.
 * `imgOpts` is passed verbatim to doc.image() — supports all PDFKit options.
 * When fit/cover are functions they are called with (cellWidth, cellHeight, pad).
 *
 * @param {string|Buffer} src
 * @param {object}        imgOpts  PDFKit image options
 * @param {number}        [pad=4]  Inset from each cell edge
 */
function makeRenderer(src, imgOpts, pad = 4) {
  return (_value, _col, _row, _rowData, _rectRow, rectCell) => {
    if (!rectCell) return "";
    const { x, y, width, height } = rectCell;
    const resolved = { ...imgOpts };
    if (typeof resolved.fit === "function")
      resolved.fit = resolved.fit(width, height, pad);
    if (typeof resolved.cover === "function")
      resolved.cover = resolved.cover(width, height, pad);
    try {
      doc.image(src, x + pad, y + pad, resolved);
    } catch (err) {
      console.warn("[image renderer]", err.message);
    }
    return ""; // '' → pdfkit-table draws no text over the image
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

let doc; // outer binding so every makeRenderer closure shares the same doc

async function main() {
  doc = new PDFDocument({ margin: 40, size: "A4", compress: false });
  doc.pipe(
    fs.createWriteStream(path.join(__dirname, "document-07-images.pdf")),
  );

  // Cover -------------------------------------------------------------------
  doc
    .fontSize(18)
    .font("Helvetica-Bold")
    .text("pdfkit-table — Images in Cells", { align: "center" });
  doc
    .fontSize(10)
    .font("Helvetica")
    .text(
      "Sources: file path · base64 URI · Buffer · inline base64\n" +
        "Sizing: width · height · width+height · scale · fit · cover · align/valign",
      { align: "center" },
    );
  doc.moveDown(1.5);

  // ── 1. Source: file path ─────────────────────────────────────────────────
  section(doc, "1. Source — file path (string)");
  await doc.table(
    {
      headers: [
        {
          label: "Image",
          property: "img",
          width: 80,
          align: "center",
          renderer: makeRenderer(IMAGE_PATH, {
            fit: (w, h, p) => [w - p * 2, h - p * 2],
            align: "center",
            valign: "center",
          }),
        },
        { label: "Code", property: "code", width: 200 },
        { label: "Note", property: "note", width: 155 },
      ],
      data: [
        {
          img: "",
          code: "doc.image(filePath, x, y, opts)",
          note: "Reads from disk at render time",
        },
        {
          img: "",
          code: "path.join(__dirname, 'npm-tile.png')",
          note: "Use path.join() for cross-platform paths",
        },
      ],
    },
    { minRowHeight: 56, padding: 2 },
  );

  // ── 2. Source: base64 data URI ────────────────────────────────────────────
  section(doc, '2. Source — base64 data URI  "data:image/png;base64,…"');
  await doc.table(
    {
      headers: [
        {
          label: "Image",
          property: "img",
          width: 80,
          align: "center",
          renderer: makeRenderer(imageBase64, {
            fit: (w, h, p) => [w - p * 2, h - p * 2],
            align: "center",
            valign: "center",
          }),
        },
        { label: "Code", property: "code", width: 200 },
        { label: "Note", property: "note", width: 155 },
      ],
      data: [
        {
          img: "",
          code: '"data:image/png;base64," + buf.toString("base64")',
          note: "PDFKit decodes to binary — base64 is NOT stored in the PDF",
        },
        {
          img: "",
          code: "Same string passed twice → one XObject",
          note: "PDFKit caches by string key — no duplication in the file",
        },
      ],
    },
    { minRowHeight: 56, padding: 2 },
  );

  // ── 3. Source: Buffer ──────────────────────────────────────────────────────
  section(doc, "3. Source — Buffer  (fs.readFileSync / fs.promises.readFile)");
  await doc.table(
    {
      headers: [
        {
          label: "Image",
          property: "img",
          width: 80,
          align: "center",
          renderer: makeRenderer(imageBuffer, {
            fit: (w, h, p) => [w - p * 2, h - p * 2],
            align: "center",
            valign: "center",
          }),
        },
        { label: "Method", property: "method", width: 200 },
        { label: "Note", property: "note", width: 155 },
      ],
      data: [
        {
          img: "",
          method: "fs.readFileSync(path)",
          note: "Sync — fine for CLI / build scripts",
        },
        {
          img: "",
          method: "await fs.promises.readFile(path)",
          note: "Async — preferred in HTTP servers",
        },
      ],
    },
    { minRowHeight: 56, padding: 2 },
  );

  // ── 4. Source: hardcoded inline base64 ───────────────────────────────────
  section(
    doc,
    "4. Source — hardcoded inline base64 (no file needed at runtime)",
  );
  await doc.table(
    {
      headers: [
        {
          label: "Image",
          property: "img",
          width: 80,
          align: "center",
          renderer: makeRenderer(INLINE_BASE64, {
            fit: (w, h, p) => [w - p * 2, h - p * 2],
            align: "center",
            valign: "center",
          }),
        },
        { label: "Use-case", property: "use", width: 355 },
      ],
      data: [
        {
          img: "",
          use:
            "Embed tiny icons, watermarks or QR codes directly in your " +
            "script or JSON config — no extra asset files required.",
        },
        {
          img: "",
          use:
            "Generate with:  Buffer.from(bytes).toString('base64')  " +
            "or any online Base64 encoder. Supports PNG and JPEG.",
        },
      ],
    },
    { minRowHeight: 56, padding: 2 },
  );

  // ── 5. Per-row dynamic source (value = path or URI) ───────────────────────
  section(
    doc,
    "5. Dynamic source — image path or URI stored in the cell value",
  );

  const dynamicRenderer = (value, _col, _row, _rowData, _rectRow, rectCell) => {
    if (!rectCell || !value) return "";
    const { x, y, width, height } = rectCell;
    try {
      doc.image(String(value), x + 4, y + 4, {
        fit: [width - 8, height - 8],
        align: "center",
        valign: "center",
      });
    } catch (err) {
      console.warn("[image renderer]", err.message);
    }
    return "";
  };

  await doc.table(
    {
      headers: [
        {
          label: "Preview",
          property: "preview",
          width: 80,
          align: "center",
          renderer: dynamicRenderer,
        },
        { label: "Filename", property: "filename", width: 150 },
        { label: "Type", property: "type", width: 80, align: "center" },
        { label: "Size", property: "size", width: 125, align: "right" },
      ],
      data: [
        {
          preview: IMAGE_PATH,
          filename: "npm-tile.png",
          type: "file path",
          size: `${(fs.statSync(IMAGE_PATH).size / 1024).toFixed(1)} KB`,
        },
        {
          preview: imageBase64,
          filename: "npm-tile.png",
          type: "base64 URI",
          size: `${(imageBase64.length / 1024).toFixed(1)} KB (URI len)`,
        },
      ],
    },
    { minRowHeight: 60, padding: 2 },
  );

  // ── 6. All PDFKit sizing options ──────────────────────────────────────────
  //
  // Each row stores a string key in the "preview" cell.
  // The shared renderer maps that key → PDFKit image options using rectCell
  // dimensions so fit/cover boxes adapt to the actual cell size.
  // ─────────────────────────────────────────────────────────────────────────
  section(doc, "6. All PDFKit image() sizing options");

  /** Map of option-key → (cellW, cellH) → PDFKit image options */
  const SIZING = {
    "width-only": () => ({ width: 48 }),
    "height-only": () => ({ height: 44 }),
    stretch: () => ({ width: 60, height: 30 }),
    scale: () => ({ scale: 0.35 }),
    "fit-center": (w, h) => ({
      fit: [w - 8, h - 8],
      align: "center",
      valign: "center",
    }),
    "cover-center": (w, h) => ({
      cover: [w - 8, h - 8],
      align: "center",
      valign: "center",
    }),
    "fit-right-bottom": (w, h) => ({
      fit: [w - 8, h - 8],
      align: "right",
      valign: "bottom",
    }),
    "fit-left-top": (w, h) => ({
      fit: [w - 8, h - 8],
      align: "left",
      valign: "top",
    }),
  };

  const sizingRenderer = (value, _col, _row, _rowData, _rectRow, rectCell) => {
    if (!rectCell) return "";
    const { x, y, width, height } = rectCell;
    const optsFn = SIZING[String(value)];
    if (!optsFn) return "";
    try {
      doc.image(IMAGE_PATH, x + 4, y + 4, optsFn(width, height));
    } catch (err) {
      console.warn("[image renderer]", err.message);
    }
    return "";
  };

  await doc.table(
    {
      headers: [
        {
          label: "Preview",
          property: "preview",
          width: 80,
          align: "center",
          renderer: sizingRenderer, // shared renderer — reads option key from value
        },
        { label: "Option(s)", property: "opt", width: 175 },
        { label: "Behavior", property: "behavior", width: 180 },
      ],
      data: [
        {
          preview: "width-only",
          opt: "{ width: 48 }",
          behavior: "Proportional to width — height auto-scales",
        },
        {
          preview: "height-only",
          opt: "{ height: 44 }",
          behavior: "Proportional to height — width auto-scales",
        },
        {
          preview: "stretch",
          opt: "{ width: 60, height: 30 }",
          behavior: "Stretch to exact size — may distort aspect ratio",
        },
        {
          preview: "scale",
          opt: "{ scale: 0.35 }",
          behavior: "Scale proportionally by factor (35% of original)",
        },
        {
          preview: "fit-center",
          opt: "{ fit: [w, h], align: 'center', valign: 'center' }",
          behavior: "Fit inside cell box — keeps aspect ratio (best for cells)",
        },
        {
          preview: "cover-center",
          opt: "{ cover: [w, h], align: 'center', valign: 'center' }",
          behavior: "Fill cell completely — may crop image edges",
        },
        {
          preview: "fit-right-bottom",
          opt: "{ fit: [w, h], align: 'right', valign: 'bottom' }",
          behavior: "Fit + snap to bottom-right corner of the cell",
        },
        {
          preview: "fit-left-top",
          opt: "{ fit: [w, h], align: 'left', valign: 'top' }",
          behavior: "Fit + snap to top-left corner of the cell",
        },
      ],
    },
    { minRowHeight: 60, padding: 2 },
  );

  // Done --------------------------------------------------------------------
  doc.end();
  console.log("Generated →", path.join(__dirname, "document-07-images.pdf"));
}

main().catch(console.error);
