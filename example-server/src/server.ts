import cors from "cors";
import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";
import PDFKitBase from "pdfkit";
import { createPdfDocumentWithTables } from "pdfkit-table";

const PDFDocument = createPdfDocumentWithTables(PDFKitBase);

const app = express();
const PORT = 3030;

app.use(cors());
app.use(express.json());

// -----------------------------------------------------------------------
// GET /pdf/simple   — array-based table, saves file + streams to browser
// -----------------------------------------------------------------------
app.get("/pdf/simple", async (req: Request, res: Response) => {

  const doc = new PDFDocument({ margin: 30, size: "A4" });

  // save a copy on disk
  const outPath = path.join(__dirname, "..", "pdf", "simple-table.pdf");
  doc.pipe(fs.createWriteStream(outPath));

  // stream directly to the HTTP response
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", 'inline; filename="simple-table.pdf"');
  doc.pipe(res);

  // ------------------------------------------------------------------
  // Simple array-based table
  // ------------------------------------------------------------------
  await doc.table(
    {
      headers: ["Country", "Conversion rate", "Trend"],
      rows: [
        ["Switzerland", "12%", "+1.12%"],
        ["France", "67%", "-0.98%"],
        ["England", "33%", "+4.44%"],
        ["Brazil", "45%", "+2.30%"],
      ],
    },
    {
      width: 400,
      padding: [8, 10, 8, 10],
      prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10),
      prepareRow: () => doc.font("Helvetica").fontSize(9),
    },
  );

  doc.end();
  console.log(`✔ simple-table.pdf saved → ${outPath}`);
});

// -----------------------------------------------------------------------
// GET /pdf/full   — object-row table with renderers, colors, padding
// -----------------------------------------------------------------------
app.get("/pdf/full", async (req: Request, res: Response) => {
  const doc = new PDFDocument({ margin: 40, size: "A4" });

  const outPath = path.join(__dirname, "..", "pdf", "full-table.pdf");
  doc.pipe(fs.createWriteStream(outPath));

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", 'inline; filename="full-table.pdf"');
  doc.pipe(res);

  // ------------------------------------------------------------------
  // Title
  // ------------------------------------------------------------------
  doc
    .font("Helvetica-Bold")
    .fontSize(18)
    .text("Product Price List", { align: "center" });
  doc.moveDown(1.5);

  // ------------------------------------------------------------------
  // Object-based table with column definitions
  // ------------------------------------------------------------------
  await doc.table(
    {
      headers: [
        {
          label: "Product",
          property: "name",
          width: 120,
          headerColor: "#2c3e50",
          headerOpacity: 1,
        },
        {
          label: "Description",
          property: "description",
          width: 200,
          headerColor: "#2c3e50",
          headerOpacity: 1,
        },
        {
          label: "Unit Price",
          property: "price",
          width: 90,
          align: "right",
          headerAlign: "right",
          headerColor: "#2c3e50",
          headerOpacity: 1,
          renderer: (value) => `$ ${Number(value).toFixed(2)}`,
        },
        {
          label: "Stock",
          property: "stock",
          width: 60,
          align: "center",
          headerAlign: "center",
          headerColor: "#2c3e50",
          headerOpacity: 1,
        },
      ],
      data: [
        {
          name: "Laptop Pro",
          description: "High-performance laptop with 16 GB RAM and 512 GB SSD.",
          price: 1299.99,
          stock: 42,
        },
        {
          name: "Wireless Mouse",
          description: "Ergonomic wireless mouse with long battery life.",
          price: 39.9,
          stock: 150,
        },
        {
          name: "Mechanical Keyboard",
          description:
            "Tenkeyless mechanical keyboard with RGB backlight and blue switches.",
          price: 89.0,
          stock: 73,
        },
        {
          name: "4K Monitor",
          description:
            "27-inch 4K UHD IPS display with 99% sRGB colour coverage.",
          price: 499.0,
          stock: 18,
        },
        {
          name: "USB-C Hub",
          description:
            "7-in-1 USB-C hub: HDMI 4K, 3× USB-A, SD card, 100 W PD.",
          price: 49.95,
          stock: 230,
        },
      ],
    },
    {
      padding: [10, 8, 10, 8],
      columnSpacing: 4,
      prepareHeader: () =>
        doc.font("Helvetica-Bold").fontSize(9).fillColor("#ffffff"),
      prepareRow: (_row, _col, i) => {
        doc.font("Helvetica").fontSize(9).fillColor("#000000");
        // alternating row background handled via backgroundColor on header objects
      },
    },
  );

  doc.moveDown(2);

  // ------------------------------------------------------------------
  // Summary row (manual text)
  // ------------------------------------------------------------------
  doc
    .font("Helvetica-Bold")
    .fontSize(9)
    .fillColor("#555555")
    .text(`Generated on ${new Date().toLocaleString()}`, { align: "right" });

  doc.end();
  console.log(`✔ full-table.pdf saved → ${outPath}`);
});

// -----------------------------------------------------------------------
// Start
// -----------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`
  pdfkit-table example server running on http://localhost:${PORT}

  Endpoints:
    GET http://localhost:${PORT}/pdf/simple   — simple array-based table
    GET http://localhost:${PORT}/pdf/full     — full object-based table
  `);
});
