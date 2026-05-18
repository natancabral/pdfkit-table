"use strict";

const fs = require("fs");
const PDFDocument = require("pdfkit-table");

const LONG_TEXT_SHORT = [
  "Alpha Widget lorem ipsum dolor sit amet consectetur adipiscing elit",
  "Lorem ipsum dolor sit amet consectetur adipiscing elit",
  "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua",
  "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat",
  "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur",
  "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur Excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum",
  "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur Excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum",
];

async function main() {
  const doc = new PDFDocument({ margin: 40, size: "A4", compress: false });
  doc.pipe(fs.createWriteStream("./document-11-many-lines.pdf"));

  doc
    .fontSize(20)
    .font("Helvetica-Bold")
    .text('columnsSize: [150, "*", 50]', { align: "center" })
    .moveDown(0.5);

  doc
    .fontSize(14)
    .text("Tables — Many Lines", { align: "center" })
    .moveDown(0.5);

  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .text("1. Default — tall rows jump to a new page")
    .moveDown(0.3);
  await doc.table(
    {
      headers: [
        { label: "Name", property: "name" },
        { label: "Description", property: "desc" },
        { label: "Price", property: "price" },
      ],
      data: new Array(100).fill(0).map((_, i) => ({
        name: "Alpha Widget lorem ipsum dolor sit amet consectetur adipiscing elit",
        desc: LONG_TEXT_SHORT[i % LONG_TEXT_SHORT.length],
        price: "$19.99",
      })),
    },
    {
      // width: 400,
      columnsSize: [150, "*", 50],
    },
  );

  doc.end();
  console.log("→ document-many-lines.pdf");
}

main().catch(console.error);
