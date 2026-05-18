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
  /** The x position of the rectangle. */
  x: number;
  /** The y position of the rectangle. */
  y: number;
  /** The width of the rectangle. */
  width: number;
  /** The height of the rectangle. @default 0 */
  height: number;
}

// ---------------------------------------------------------------------------
// Cell
// ---------------------------------------------------------------------------

export type CellRenderer = (
  /** The value of the cell. */
  value: unknown,
  /** The index of the column. @default 0 */
  indexColumn?: number,
  /** The index of the row. @default 0 */
  indexRow?: number,
  /** The row. */
  row?: unknown,
  /** The rectangle of the row. */
  rectRow?: Rect,
  /** The rectangle of the cell. */
  rectCell?: Rect,
  /** The document. */
  doc?: PDFDoc,
) => unknown;

export interface CellObject {
  /** The value of the cell. */
  label: string | number;
  /** The options of the cell. */
  options?: RowStyleOptions;
}

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

export interface Header {
  /** The label of the header. */
  label?: string;
  /** The property of the header. */
  property?: string;
  /**
   * Fixed column width in points.
   * Use null, undefined, or "*" to let the column fill the remaining
   * available width (shared equally among all flex columns).
   */
  width?: number | null | "*";
  /** The alignment of the header. @default "left" */
  align?: string;
  /** The vertical alignment of the header. @default "top" */
  valign?: string;
  /** The color of the header. @default "black" */
  headerColor?: string;
  headerOpacity?: number;
  /** The alignment of the header. @default "left" */
  headerAlign?: string;
  /** The color of the column. @default "black" */
  columnColor?: string;
  /** The opacity of the column. @default 0.5 */
  columnOpacity?: number;
  /** The padding of the column. @default 0 */
  padding?: PaddingInput;
  /** @deprecated string form — use a CellRenderer function instead */
  renderer?: CellRenderer | string;
}

// ---------------------------------------------------------------------------
// Title / Subtitle
// ---------------------------------------------------------------------------

export interface TitleObject {
  /** The label of the title. */
  label: string;
  /** The font size of the title. @default 12 */
  fontSize?: number;
  /** The font family of the title. @default "Helvetica" */
  fontFamily?: string;
  /** The color of the title. @default "black" */
  color?: string;
}

// ---------------------------------------------------------------------------
// Padding
// ---------------------------------------------------------------------------

/** The padding of the cell. @default 0 */
export type PaddingInput =
  | number
  | number[]
  | { top?: number; right?: number; bottom?: number; left?: number };

/** Fully-resolved padding (all four sides as integers). @internal */
export interface CellPadding {
  /** The top padding of the cell. @default 0 */
  top: number;
  /** The right padding of the cell. @default 0 */
  right: number;
  /** The bottom padding of the cell. @default 0 */
  bottom: number;
  /** The left padding of the cell. @default 0 */
  left: number;
}

// ---------------------------------------------------------------------------
// Row style / background
// ---------------------------------------------------------------------------

export interface RowStyleOptions {
  /** The font family of the row. @default "Helvetica" */
  fontFamily?: string;
  /** The font size of the row. @default 12 */
  fontSize?: number;
  /** The color of the row. @default "black" */
  color?: string;
  /** The separation of the row. @default false */
  separation?: boolean;
  /** The color of the column. @default "black" */
  columnColor?: string;
  /** The opacity of the column. @default 0.5 */
  columnOpacity?: number;
  /** The background color of the row. @default "white" */
  backgroundColor?: string;
  /** The background opacity of the row. @default 1 */
  backgroundOpacity?: number;
  /** The background of the row. @default { color: "white", opacity: 1 } */
  background?: {
    /** The color of the background. @default "white" */
    color?: string;
    /** The opacity of the background. @default 1 */
    opacity?: number;
  };
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
  /** Whether the divider is disabled. @default false */
  disabled?: boolean;
  /** The width of the divider. @default 0.5 */
  width?: number;
  /** The opacity of the divider. @default 0.5 */
  opacity?: number;
  /** The color of the divider. @default "black" */
  color?: string;
}

// ---------------------------------------------------------------------------
// Table
// ---------------------------------------------------------------------------

export interface Table {
  /** The title of the table. */
  title?: string | TitleObject;
  /** The subtitle of the table. */
  subtitle?: string | TitleObject;
  /** The headers of the table. */
  headers?: (string | Header)[];
  /** The data of the table. */
  data?: DataRow[];
  /** @deprecated Use Table.data */
  datas?: DataRow[];
  /** The rows of the table. */
  rows?: (string | number)[][];
  /** The options of the table. */
  options?: TableOptions;
}

// ---------------------------------------------------------------------------
// Table options
// ---------------------------------------------------------------------------

export interface TableOptions {
  /**
   * When true, the table will be rendered from right to left.
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
    /** @default { disabled: false, width: undefined, opacity: undefined } */
    header?: DividerPart;
    /** @default { disabled: false, width: undefined, opacity: undefined } */
    horizontal?: DividerPart;
    /** @default { disabled: true, width: undefined, opacity: undefined } */
    vertical?: DividerPart;
  };
  /**
   * Column widths in points.
   * Use null, undefined, or "*" as a flex placeholder: the available width
   * minus all fixed column widths is divided equally among flex columns.
   *
   * @example
   * columnsSize: [50, 300, null]       // last column fills remaining space
   * columnsSize: [50, "*", "*", 20]    // two columns share remaining space
   * columnsSize: ["*", "*", "*"]       // all columns equal width
   *
   * @default []
   */
  columnsSize?: (number | null | undefined | "*")[];
  /**
   * Spacing between columns in points.
   * @default 3
   */
  columnSpacing?: number;
  /**
   * Cell padding. Accepts a number (all sides), an array [top, right?, bottom?, left?],
   * or an object { top, right, bottom, left }.
   * Per-column padding on a Header object takes precedence over this global value.
   * @default 0
   */
  padding?: PaddingInput;
  /**
   * When true, the table will be added to a new page.
   * @default false
   */
  addPage?: boolean;
  /**
   * When true, the header row will be hidden.
   * @default false
   */
  hideHeader?: boolean;
  /**
   * Minimum row height in points.
   * @default 0
   */
  minRowHeight?: number;
  /**
   * When true, the table will be positioned absolutely using x/y.
   * @default false
   */
  absolutePosition?: boolean;
  /**
   * When true, a safety margin is applied before the bottom of the page
   * to avoid rows starting too close to the bottom margin.
   * @default true
   */
  useSafelyMarginBottom?: boolean;
  /**
   * Fraction of the page content height (0-1). Rows shorter than
   * pageContentHeight x pageBreakThreshold are moved to a new page when
   * they do not fit; taller rows overflow naturally across pages.
   * @default 0.8
   */
  pageBreakThreshold?: number;
  /**
   * Fraction of the usable page height (0-1) that defines "near the end of
   * the page". A proactive page break fires only when the remaining vertical
   * space is <= this fraction AND the row fits within pageBreakThreshold.
   * @default 0.10
   */
  endOfPageThreshold?: number;
  /**
   * When true, rows are never moved to a new page proactively.
   * @default false
   */
  keepRowsTogether?: boolean;
  /**
   * Called before the header row is rendered. Use to set font, size, color.
   * @default undefined
   */
  prepareHeader?: (this: PDFDoc) => PDFDoc | void;
  /**
   * Called before each data row cell is rendered.
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

/** @deprecated Use TableOptions */
export type Options = TableOptions;

/** @deprecated Use DataRow */
export type Data = DataRow;

/** @deprecated Use RowStyleOptions */
export type DataOptions = RowStyleOptions;

/** @deprecated Use TitleObject */
export type Title = TitleObject;

export type Divider = NonNullable<TableOptions["divider"]>;

/** @deprecated Use DividerPart */
export type DividerOptions = DividerPart;
