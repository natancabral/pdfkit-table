import PDFDocument from "pdfkit";

export * from "./document";
export * from "./types";

/** Same constructor as in releases prior to the injectable PDFKit factory (`createPdfDocumentWithTables`). */
import { createPdfDocumentWithTables } from "./document";
export const PDFDocumentWithTables = createPdfDocumentWithTables(PDFDocument);

export default PDFDocumentWithTables;
