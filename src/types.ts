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
  /**
   * When `true`, the table will be rendered from right to left.
   * @default false
   */
  rtl?: boolean;
  /**
   * The title of the table.
   * @default ""
   */
  title?: string | TitleObject;
  /**
   * The subtitle of the table.
   * @default ""
   */
  subtitle?: string | TitleObject;
  /**
   * The width of the table.
   * @default "auto"
   */
  width?: number | string;
  /**
   * The x position of the table.
   * @default 0
   */
  x?: number | null;
  /**
   * The y position of the table.
   * @default 0
   */
  y?: number;
  divider?: {
    /**
     * The header divider.
     * @default { disabled: false, width: undefined, opacity: undefined }
     */
    header?: DividerPart;
    /**
     * The horizontal divider.
     * @default { disabled: false, width: undefined, opacity: undefined }
     */
    horizontal?: DividerPart;
    /**
     * The vertical divider.
     * @default { disabled: true, width: undefined, opacity: undefined }
     */
    vertical?: DividerPart;
  };
  /**
   * The column widths.
   * @default []
   */
  columnsSize?: number[];
  /**
   * The column spacing.
   * @default 3
   */
  columnSpacing?: number;
  /**
   * The padding of the table.
   * @default 0
   */
  padding?: PaddingInput;
  /**
   * When `true`, the table will be added to a new page.
   * @default false
   */
  addPage?: boolean;
  /**
   * When `true`, the header will be hidden.
   * @default false
   */
  hideHeader?: boolean;
  /**
   * The minimum row height.
   * @default 0
   */
  minRowHeight?: number;
  /**
   * When `true`, the table will be positioned absolutely.
   * @default false
   */
  absolutePosition?: boolean;
  /**
   * When `true`, the table will use the safely margin bottom.
   * @default true
   */
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
  /**
   * The header preparation function.
   * @default undefined
   */
  prepareHeader?: (this: PDFDoc) => PDFDoc | void;
  /**
   * The row preparation function.
   * @default undefined
   */
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
