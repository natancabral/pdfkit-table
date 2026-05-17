import type PDFDocument from "pdfkit";

/** Extracted from the PDFKit document instance (for use in callbacks and renderers). */
export type PDFDoc = InstanceType<typeof PDFDocument>;

/** Constructor options accepted by PDFKit. */
export type PDFDocOptions = ConstructorParameters<typeof PDFDocument>[0];

/** Horizontal text alignment values accepted by PDFKit. @internal */
export type PdfTextAlign = "left" | "right" | "center" | "justify";

// ---------------------------------------------------------------------------
// Geometry
// ---------------------------------------------------------------------------

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

// ---------------------------------------------------------------------------
// Cell
// ---------------------------------------------------------------------------

export type CellRenderer = (
  value: unknown,
  indexColumn?: number,
  indexRow?: number,
  row?: unknown,
  rectRow?: Rect,
  rectCell?: Rect,
  doc?: PDFDoc,
) => unknown;

export interface CellObject {
  label: string | number;
  options?: RowStyleOptions;
}

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

export interface Header {
  label?: string;
  property?: string;
  width?: number;
  align?: string;
  valign?: string;
  headerColor?: string;
  headerOpacity?: number;
  headerAlign?: string;
  columnColor?: string;
  columnOpacity?: number;
  padding?: PaddingInput;
  /** @deprecated string form — use a CellRenderer function instead */
  renderer?: CellRenderer | string;
}

// ---------------------------------------------------------------------------
// Title / Subtitle
// ---------------------------------------------------------------------------

export interface TitleObject {
  label: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
}

// ---------------------------------------------------------------------------
// Padding
// ---------------------------------------------------------------------------

export type PaddingInput =
  | number
  | number[]
  | { top?: number; right?: number; bottom?: number; left?: number };

/** Fully-resolved padding (all four sides as integers). @internal */
export interface CellPadding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

// ---------------------------------------------------------------------------
// Row style / background
// ---------------------------------------------------------------------------

export interface RowStyleOptions {
  fontFamily?: string;
  fontSize?: number;
  color?: string;
  separation?: boolean;
  columnColor?: string;
  columnOpacity?: number;
  backgroundColor?: string;
  backgroundOpacity?: number;
  background?: { color?: string; opacity?: number };
}

// ---------------------------------------------------------------------------
// Row data
// ---------------------------------------------------------------------------

export type DataRow = Record<
  string,
  string | number | CellObject | undefined
> & {
  options?: RowStyleOptions;
};

// ---------------------------------------------------------------------------
// Divider
// ---------------------------------------------------------------------------

export interface DividerPart {
  disabled?: boolean;
  width?: number;
  opacity?: number;
  color?: string;
}

// ---------------------------------------------------------------------------
// Table
// ---------------------------------------------------------------------------

export interface Table {
  title?: string | TitleObject;
  subtitle?: string | TitleObject;
  headers?: (string | Header)[];
  data?: DataRow[];
  /** @deprecated Use {@link Table.data} */
  datas?: DataRow[];
  rows?: (string | number)[][];
  options?: TableOptions;
}

// ---------------------------------------------------------------------------
// Table options
// ---------------------------------------------------------------------------

export interface TableOptions {
  title?: string | TitleObject;
  subtitle?: string | TitleObject;
  width?: number | string;
  x?: number | null;
  y?: number;
  divider?: {
    header?: DividerPart;
    horizontal?: DividerPart;
    vertical?: DividerPart;
  };
  columnsSize?: number[];
  columnSpacing?: number;
  padding?: PaddingInput;
  addPage?: boolean;
  hideHeader?: boolean;
  minRowHeight?: number;
  absolutePosition?: boolean;
  useSafelyMarginBottom?: boolean;
  /**
   * Fraction of the page content height (0–1). Rows shorter than
   * `pageContentHeight × pageBreakThreshold` are moved to a new page when
   * they don't fit; taller rows overflow naturally.
   * @default 0.8
   */
  pageBreakThreshold?: number;
  /**
   * Fraction of the usable page height (0–1) that defines "near the end of
   * the page". A proactive page break fires only when the remaining vertical
   * space is ≤ this fraction AND the row fits within `pageBreakThreshold`.
   * @default 0.10
   */
  endOfPageThreshold?: number;
  /**
   * When `true`, rows are never moved to a new page proactively.
   * @default false
   */
  keepRowsTogether?: boolean;
  prepareHeader?: (this: PDFDoc) => PDFDoc | void;
  prepareRow?: (
    this: PDFDoc,
    row?: unknown,
    indexColumn?: number,
    indexRow?: number,
    rectRow?: Rect,
    rectCell?: Rect,
  ) => PDFDoc | void;
}

// ---------------------------------------------------------------------------
// Backward-compatibility type aliases (deprecated)
// ---------------------------------------------------------------------------

/** @deprecated Use {@link TableOptions} */
export type Options = TableOptions;

/** @deprecated Use {@link DataRow} */
export type Data = DataRow;

/** @deprecated Use {@link RowStyleOptions} */
export type DataOptions = RowStyleOptions;

/** @deprecated Use {@link TitleObject} */
export type Title = TitleObject;

export type Divider = NonNullable<TableOptions["divider"]>;

/** @deprecated Use {@link DividerPart} */
export type DividerOptions = DividerPart;
