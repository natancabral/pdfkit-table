import PDFDocument from "pdfkit";
import type {
  CellObject,
  CellPadding,
  CellRenderer,
  DataRow,
  DividerPart,
  Header,
  PaddingInput,
  PDFDoc,
  PDFDocOptions,
  PdfTextAlign,
  Rect,
  RowStyleOptions,
  Table,
  TableOptions,
  TitleObject,
} from "./types";

/**
 * Builds the PDFDocument subclass extended with `.table()` / `.tables()`,
 * using the PDFKit constructor you supply (fork, patched build, or version
 * pinned in your own app).
 *
 * @example
 * ```ts
 * import PDFKit from 'pdfkit';
 * import { createPdfDocumentWithTables } from 'pdfkit-table';
 * const PDF = createPdfDocumentWithTables(PDFKit);
 * const doc = new PDF({ compress: false });
 * ```
 */
export function createPdfDocumentWithTables(
  PdfKitDocument: typeof PDFDocument,
) {
  class PDFDocumentWithTables extends PdfKitDocument {
    declare opt?: PDFDocOptions;
    declare headerHeight: number;
    declare datasIndex: number;
    declare rowsIndex: number;

    constructor(option?: PDFDocOptions) {
      super(option);
      this.opt = option;
    }

    logg(..._args: unknown[]): void {
      // console.log(_args);
    }

    // -----------------------------------------------------------------------
    // addBackground
    // -----------------------------------------------------------------------

    addBackground(
      { x, y, width, height }: Rect,
      fillColor?: string,
      fillOpacity?: number,
      callback?: (doc: this) => void,
    ): void {
      fillColor ||= "grey";
      fillOpacity ||= 0.1;

      this.save();
      this.fill(fillColor)
        .fillOpacity(fillOpacity)
        .rect(x, y, width, height)
        .fill();
      this.restore();

      typeof callback === "function" && callback(this);
    }

    // -----------------------------------------------------------------------
    // checkPageBreak
    // -----------------------------------------------------------------------

    /**
     * Checks whether the remaining vertical space on the current page is less
     * than `minHeight` (default: 10% of the usable page height) and, if so,
     * adds a new page — preventing orphaned titles or section headers at the
     * very bottom of a page.
     *
     * @example
     * ```ts
     * doc.checkPageBreak();                     // default: 10% of page height
     * doc.checkPageBreak(80);                   // at least 80pt remaining
     * doc.checkPageBreak(0.15);                 // at least 15% of page height
     *
     * doc.checkPageBreak().fontSize(11).text("Section title");
     * await doc.table({ ... });
     * ```
     */
    checkPageBreak(minHeight?: number): this {
      const usableHeight =
        this.page.height - this.page.margins.top - this.page.margins.bottom;

      // If minHeight is a fraction ≤ 1, treat it as a percentage of usable height.
      const threshold =
        minHeight === undefined
          ? usableHeight * 0.1
          : minHeight <= 1
            ? usableHeight * minHeight
            : minHeight;

      const remaining = this.page.height - this.page.margins.bottom - this.y;

      if (remaining < threshold) {
        this.addPage({
          layout: this.page.layout as PDFDocOptions["layout"],
          size: this.page.size,
          margins: this.page.margins,
        });
      }

      return this;
    }

    // -----------------------------------------------------------------------
    // table
    // -----------------------------------------------------------------------

    /**
     * Renders a single table.
     * Signature is backward-compatible with older releases:
     *   `table(table, callback)`
     *   `table(table, options)`
     *   `table(table, options, callback)`
     */
    // pdfkit exposes Mixins.PDFTable.table(); this subclass replaces it at runtime.
    // @ts-expect-error — intentionally incompatible with pdfkit's PDFTable mixin signature
    table(
      table: string | Table,
      options?: TableOptions | ((doc: this) => void),
      callback?: (doc: this) => void,
    ): Promise<void> {
      return new Promise((resolve, reject) => {
        try {
          // ------------------------------------------------------------------
          // Normalize arguments
          // ------------------------------------------------------------------
          let incomingOpts: TableOptions | undefined;
          let resolvedCallback: ((doc: this) => void) | undefined;

          if (typeof options === "function") {
            resolvedCallback = options;
            incomingOpts = undefined;
          } else {
            incomingOpts = options;
            resolvedCallback = callback;
          }

          const docTable: Table =
            typeof table === "string"
              ? (JSON.parse(table) as Table)
              : ((table ?? {}) as Table);

          /** Mutable options object used throughout rendering */
          const opts: TableOptions = { ...(incomingOpts ?? {}) };

          docTable.headers ||= [];
          docTable.rows ||= [];

          /** Object-shaped rows: `data` wins when defined; otherwise legacy `datas` */
          const tableData: DataRow[] =
            docTable.data !== undefined
              ? docTable.data
              : (docTable.datas ?? []);

          if (docTable.options) Object.assign(opts, docTable.options);

          // ------------------------------------------------------------------
          // Option defaults
          // ------------------------------------------------------------------
          opts.hideHeader ||= false;
          opts.padding ||= 0;
          opts.columnsSize ||= [];
          opts.addPage ||= false;
          opts.absolutePosition ||= false;
          opts.minRowHeight ||= 0;

          opts.divider ||= {};
          opts.divider.header ||= {
            disabled: false,
            width: undefined,
            opacity: undefined,
          };
          opts.divider.horizontal ||= {
            disabled: false,
            width: undefined,
            opacity: undefined,
          };
          opts.divider.vertical ||= {
            disabled: true,
            width: undefined,
            opacity: undefined,
          };

          if (!docTable.headers.length)
            throw new Error(
              "Headers not defined. Use options: hideHeader to hide.",
            );

          if (opts.useSafelyMarginBottom === undefined)
            opts.useSafelyMarginBottom = true;

          // keepRowsTogether: true disables all proactive page breaks.
          if (opts.keepRowsTogether) opts.useSafelyMarginBottom = false;

          // pageBreakThreshold: fraction of page height below which a row
          // triggers a page break.
          // Default 0.8 — rows taller than 80 % of the page start in-place
          // and let PDFKit handle overflow; only explicit addPage() calls
          // (or keepRowsTogether/useSafelyMarginBottom) force a page change.
          const pageBreakThreshold = opts.keepRowsTogether
            ? 0
            : Math.min(1, Math.max(0, opts.pageBreakThreshold ?? 0.8));

          const title = docTable.title ?? opts.title ?? "";
          const subtitle = docTable.subtitle ?? opts.subtitle ?? "";

          // ------------------------------------------------------------------
          // Layout variables
          // ------------------------------------------------------------------
          const columnSpacing = opts.columnSpacing || 3;
          let columnSizes: number[] = [];
          let columnPositions: number[] = [];
          let columnWidth = 0;

          const rowDistance = 0.5;
          let cellPadding: CellPadding = {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
          };

          let tableWidth = 0;
          const maxY = this.page.height - this.page.margins.bottom;

          let startX = opts.x || this.x || this.page.margins.left;
          let startY = opts.y || this.y || this.page.margins.top;

          let lastPositionX = 0;
          let rowBottomY = 0;

          let titleHeight = 0;
          this.headerHeight = 0;
          let firstLineHeight = 0;
          this.datasIndex = 0;
          this.rowsIndex = 0;

          let lockAddTitles = false;
          let lockAddPage = false;
          let lockAddHeader = false;

          // Safety buffer before the bottom margin.
          // Use the document's own bottom margin so rows never start
          // if they won't fit with at least that much breathing room.
          const safelyMarginBottom = this.page.margins.bottom;

          /**
           * Original page top margin saved once so we can restore it after
           * temporarily raising it to push PDFKit's text-continuation point
           * below the repeated header on overflow pages.
           */
          const origMarginTop = this.page.margins.top;

          if (opts.x === null || opts.x === -1) {
            startX = this.page.margins.left;
          }

          // ------------------------------------------------------------------
          // Inner helpers
          // ------------------------------------------------------------------

          const prepareHeader = (): void => {
            if (opts.prepareHeader) {
              opts.prepareHeader.call(this as unknown as PDFDoc);
              return;
            }
            this.fillColor("black").font("Helvetica-Bold").fontSize(8).fill();
          };

          const prepareRow = (
            row: unknown,
            indexColumn: number,
            indexRow: number,
            rectRow: Rect,
            rectCell: Rect,
          ): void => {
            if (opts.prepareRow) {
              opts.prepareRow.call(
                this as unknown as PDFDoc,
                row,
                indexColumn,
                indexRow,
                rectRow,
                rectCell,
              );
              return;
            }
            this.fillColor("black").font("Helvetica").fontSize(8).fill();
          };

          /**
           * Convert a serialised renderer string to a callable function.
           *
           * `eval()` is avoided because it is blocked by strict CSP policies and
           * grants access to the enclosing scope. `new Function()` creates an
           * isolated function scope and works in more environments.
           *
           * @deprecated Pass a real `CellRenderer` function instead of a string.
           *   String renderers will be removed in a future major version.
           */
          const fEval = (str: string): CellRenderer => {
            try {
              const factory = new Function(
                "value",
                "indexColumn",
                "indexRow",
                "row",
                "rectRow",
                "rectCell",
                `"use strict"; return (${str})(value, indexColumn, indexRow, row, rectRow, rectCell);`,
              );
              return factory as CellRenderer;
            } catch {
              console.warn(
                "[pdfkit-table] renderer string could not be compiled; falling back to empty string. " +
                  "Pass a CellRenderer function directly instead of a string.",
              );
              return () => "";
            }
          };

          const separationsRow = (
            type: string | undefined,
            x: number,
            y: number,
            width?: number,
            opacity?: number,
            color?: string,
          ): void => {
            type ||= "horizontal";

            const d = rowDistance * 1.5;
            const m = opts.x || this.page.margins.left || 30;
            const dividerCfg: DividerPart =
              opts.divider?.[
                type as keyof NonNullable<TableOptions["divider"]>
              ] ?? {};

            if (dividerCfg.disabled) return;

            opacity = opacity ?? dividerCfg.opacity ?? 0.5;
            width = width ?? dividerCfg.width ?? 0.5;
            color = color ?? dividerCfg.color ?? "black";

            this.moveTo(x, y - d)
              .lineTo(x + tableWidth - m, y - d)
              .lineWidth(width)
              .strokeColor(color)
              .opacity(opacity)
              .stroke()
              .opacity(1);
          };

          const prepareCellPadding = (p: PaddingInput): CellPadding => {
            let arr: number[];

            if (Array.isArray(p)) {
              switch (p.length) {
                case 3:
                  arr = [p[0], p[1], p[2], p[1]];
                  break; // top, right, bottom, left=right
                case 2:
                  arr = [p[0], p[1], p[0], p[1]];
                  break; // top+bottom, right+left
                case 1:
                  arr = Array(4).fill(p[0]);
                  break;
                default:
                  arr = p as number[];
              }
            } else if (typeof p === "number") {
              arr = Array(4).fill(p);
            } else if (typeof p === "object" && p !== null) {
              const {
                top = 0,
                right = 0,
                bottom = 0,
                left = 0,
              } = p as {
                top?: number;
                right?: number;
                bottom?: number;
                left?: number;
              };
              arr = [top, right, bottom, left];
            } else {
              arr = Array(4).fill(0);
            }

            return {
              top: arr[0] >> 0,
              right: arr[1] >> 0,
              bottom: arr[2] >> 0,
              left: arr[3] >> 0,
            };
          };

          /**
           * Resolve the effective padding for a cell, respecting explicit `0`.
           *
           * The plain `||` operator treats `0` as falsy, so `padding: 0` on a
           * header column would silently fall through to `opts.padding`.
           * This helper uses `!== undefined` so an explicitly-set `0` wins
           * over the global option.
           *
           * Priority: per-column `padding` > `opts.padding` > 0
           */
          const resolvePadding = (
            columnPadding: PaddingInput | undefined,
          ): PaddingInput =>
            columnPadding !== undefined ? columnPadding : (opts.padding ?? 0);

          /**
           * Apply per-row font/color overrides declared in `row.options`.
           */
          const prepareRowOptions = (row: unknown): void => {
            if (
              typeof row !== "object" ||
              row === null ||
              !Object.prototype.hasOwnProperty.call(row, "options")
            )
              return;
            const { fontFamily, fontSize, color } =
              (row as { options: RowStyleOptions }).options ?? {};
            fontFamily && this.font(fontFamily);
            fontSize && this.fontSize(fontSize);
            color && this.fillColor(color);
          };

          /**
           * Draw a colored background behind a row or cell.
           */
          const prepareRowBackground = (row: unknown, rect: Rect): void => {
            if (typeof row !== "object" || row === null) return;

            const effective: Record<string, unknown> =
              Object.prototype.hasOwnProperty.call(row, "options") &&
              typeof (row as { options?: unknown }).options === "object" &&
              (row as { options?: unknown }).options !== null
                ? (row as { options: Record<string, unknown> }).options
                : (row as Record<string, unknown>);

            let fill: string | undefined;
            let opac: number | undefined;

            if (
              Object.prototype.hasOwnProperty.call(effective, "columnColor")
            ) {
              fill = effective.columnColor as string | undefined;
              opac = effective.columnOpacity as number | undefined;
            } else if (
              Object.prototype.hasOwnProperty.call(effective, "backgroundColor")
            ) {
              fill = effective.backgroundColor as string | undefined;
              opac = effective.backgroundOpacity as number | undefined;
            } else if (
              Object.prototype.hasOwnProperty.call(effective, "background") &&
              typeof effective.background === "object" &&
              effective.background !== null
            ) {
              const bg = effective.background as {
                color?: string;
                opacity?: number;
              };
              fill = bg.color;
              opac = bg.opacity;
            }

            fill && this.addBackground(rect, fill, opac);
          };

          /** Union of every shape that `computeRowHeight` legally receives. */
          type RowHeightInput =
            | DataRow
            | (string | Header)[]
            | (string | number)[];

          const computeRowHeight = (
            row: RowHeightInput,
            isHeader: boolean,
          ): number => {
            let result = isHeader ? 0 : opts.minRowHeight || 0;

            const cells: unknown[] = Array.isArray(row)
              ? (row as unknown[])
              : docTable.headers!.reduce<unknown[]>((acc, hdr) => {
                  const property =
                    typeof hdr === "object" ? hdr.property : undefined;
                  acc.push(
                    property !== undefined
                      ? (row as DataRow)[property]
                      : undefined,
                  );
                  return acc;
                }, []);

            cells.forEach((cell: unknown, i: number) => {
              let text: string;

              if (typeof cell === "object" && cell !== null) {
                text = String((cell as CellObject).label);
                Object.prototype.hasOwnProperty.call(cell, "options") &&
                  prepareRowOptions(cell);
              } else {
                text = String(cell ?? "");
              }

              text = text.replace("bold:", "").replace("size", "");

              const hdr = docTable.headers![i];
              const cellp = prepareCellPadding(
                resolvePadding(
                  typeof hdr === "object" ? hdr.padding : undefined,
                ),
              );

              const cellHeight = this.heightOfString(text, {
                width: columnSizes[i] - (cellp.left + cellp.right),
                align: "left",
              });

              // FIX: include vertical padding in the row height calculation
              // for both header and data rows.
              result = Math.max(result, cellHeight + cellp.top + cellp.bottom);
            });

            return result + columnSpacing;
          };

          // ------------------------------------------------------------------
          // Column sizing
          // ------------------------------------------------------------------

          const calcColumnSizes = (): void => {
            let h: number[] = [];
            let p: number[] = [];

            let w =
              this.page.width -
              this.page.margins.right -
              (opts.x || this.page.margins.left);

            if (opts.width) {
              w =
                parseInt(String(opts.width), 10) ||
                Number(String(opts.width).replace(/[^0-9]/g, "")) >> 0;
            }

            // ------------------------------------------------------------------
            // Flexible column sizing: null | undefined | '*' in columnsSize or
            // header.width means "fill the remaining available width equally".
            //
            // Examples:
            //   columnsSize: [50, 300, null]          → last col fills remainder
            //   columnsSize: [50, '*', '*', 20, null]  → three cols share space
            // ------------------------------------------------------------------

            /** Returns true when a column-size entry is a flex placeholder. */
            const isFlex = (v: unknown): boolean =>
              v === null || v === undefined || v === "*";

            // Build raw size list from headers (object form) or opts.columnsSize.
            // We allow null/undefined/'*' at this stage; they are resolved below.
            const rawSizes: (number | null | undefined | "*")[] = (() => {
              // Priority 1: object headers with explicit width
              const fromHeaders = docTable.headers!.map((el) =>
                typeof el === "object" && "width" in el
                  ? (el.width as number | null | undefined)
                  : undefined,
              );
              if (fromHeaders.some((v) => v !== undefined)) return fromHeaders;

              // Priority 2: opts.columnsSize (may contain flex markers)
              if (opts.columnsSize && opts.columnsSize.length > 0)
                return opts.columnsSize as unknown as (
                  | number
                  | null
                  | undefined
                  | "*"
                )[];

              // Priority 3: no sizing info — every column is flex
              return docTable.headers!.map(() => undefined);
            })();

            // Count flex slots and sum of fixed widths.
            const fixedSum = rawSizes.reduce<number>(
              (acc, v) => acc + (isFlex(v) ? 0 : (v as number)),
              0,
            );
            const flexCount = rawSizes.filter(isFlex).length;
            const flexWidth =
              flexCount > 0 ? Math.max(0, w - fixedSum) / flexCount : 0;

            // Resolve final numeric sizes.
            h = rawSizes.map((v) => (isFlex(v) ? flexWidth : (v as number)));

            if (h.length === 0) {
              columnWidth = w / docTable.headers!.length;
              docTable.headers!.forEach(() => h.push(columnWidth));
            }

            // Store the representative columnWidth for callers that use it
            // for cells without an explicit header width.
            columnWidth =
              h.length > 0 ? h.reduce((s, v) => s + v, 0) / h.length : w;

            if (opts.rtl) {
              // RTL: column positions go right-to-left.
              // Mirror of LTR: LTR anchors its left edge at startX (= opts.x ?? margin.left)
              // and grows rightward by summing column widths.
              // RTL anchors its RIGHT edge at startX + sum(columnWidths) and grows leftward.
              // When opts.width is set, it overrides the total column width (same as LTR).
              const rtlStartX = opts.x ?? this.page.margins.left;
              const totalW = opts.width
                ? parseInt(String(opts.width), 10) ||
                  Number(String(opts.width).replace(/[^0-9]/g, "")) >> 0
                : h.reduce((s, v) => s + v, 0);
              const rightEdge = rtlStartX + totalW;

              h.reduce((prev, curr) => {
                const colStart = prev - curr;
                p.push(colStart >> 0);
                return colStart;
              }, rightEdge);

              if (h.length) columnSizes = h;
              if (p.length) columnPositions = p;

              // tableWidth used by separationsRow — rightEdge as absolute x coordinate
              tableWidth = rightEdge;
            } else {
              h.reduce((prev, curr) => {
                p.push(prev >> 0);
                return prev + curr;
              }, opts.x || this.page.margins.left);

              if (h.length) columnSizes = h;
              if (p.length) columnPositions = p;

              w = p[p.length - 1] + h[h.length - 1];
              if (w) tableWidth = w;
            }
          };

          calcColumnSizes();

          // Total rendered width = sum of all column widths.
          // Computed after calcColumnSizes() so columnSizes is populated.
          const totalColumnsWidth = columnSizes.reduce((s, w) => s + w, 0);

          // ------------------------------------------------------------------
          // Title helper
          // ------------------------------------------------------------------

          const createTitle = (
            data: string | TitleObject | undefined | "",
            size: number,
            opacity: number,
          ): void => {
            if (!data) return;

            if (typeof data === "string") {
              this.fillColor("black").fontSize(size).opacity(opacity).fill();
              this.text(data, startX, startY).opacity(1);
              startY = this.y + columnSpacing + 2;
            } else if (typeof data === "object") {
              data.fontFamily && this.font(data.fontFamily);
              data.label &&
                this.fillColor(data.color || "black")
                  .fontSize(data.fontSize || size)
                  .text(data.label, startX, startY)
                  .fill();
              startY = this.y + columnSpacing + 2;
            }
          };

          // ------------------------------------------------------------------
          // Header rendering (forward-declared so onFirePageAdded can call it)
          // ------------------------------------------------------------------

          const addHeader = (): void => {
            prepareHeader();

            if (this.headerHeight === 0) {
              this.headerHeight = computeRowHeight(docTable.headers, true);
            }

            if (firstLineHeight === 0) {
              if (tableData.length > 0)
                firstLineHeight = computeRowHeight(tableData[0], true);
              if (docTable.rows!.length > 0)
                firstLineHeight = computeRowHeight(docTable.rows![0], true);
            }

            titleHeight = !lockAddTitles ? 24.1 : 0;
            const calc =
              startY +
              titleHeight +
              firstLineHeight +
              this.headerHeight +
              safelyMarginBottom;

            if (firstLineHeight > maxY) {
              lockAddPage = true;
            } else if (calc > maxY) {
              addNewPage();
              return;
            }

            if (!lockAddTitles) {
              createTitle(title, 12, 1);
              createTitle(subtitle, 9, 0.7);
              if (title || subtitle) startY += 3;
            }

            prepareHeader();
            lockAddTitles = true;

            if (opts.absolutePosition) {
              lastPositionX = opts.x || startX || this.x;
              startY = opts.y || startY || this.y;
            } else {
              lastPositionX = opts.rtl ? columnPositions[0] : startX;
            }

            if (!opts.hideHeader && docTable.headers!.length > 0) {
              if (typeof docTable.headers![0] === "string") {
                docTable.headers!.forEach((header, i) => {
                  // RTL: use pre-computed column position directly
                  const cellX = opts.rtl ? columnPositions[i] : lastPositionX;
                  const rectCell: Rect = {
                    x: cellX,
                    y: startY - columnSpacing - rowDistance * 2,
                    width: columnSizes[i],
                    height: this.headerHeight + columnSpacing,
                  };
                  this.addBackground(rectCell);
                  cellPadding = prepareCellPadding(opts.padding || 0);
                  this.text(
                    String(header),
                    cellX + cellPadding.left,
                    startY + cellPadding.top,
                    {
                      width:
                        Number(columnSizes[i]) -
                        (cellPadding.left + cellPadding.right),
                      align: opts.rtl ? "right" : "left",
                    },
                  );
                  if (!opts.rtl) lastPositionX += columnSizes[i] >> 0;
                });
              } else {
                docTable.headers!.forEach((dataHeader, i) => {
                  const dh = dataHeader as Header;
                  let {
                    label,
                    width,
                    renderer,
                    align,
                    headerColor,
                    headerOpacity,
                    headerAlign,
                    padding,
                  } = dh;

                  width =
                    ((typeof width === "number" ? width : undefined) ||
                      columnSizes[i]) >> 0;
                  // RTL: default align to right unless explicitly set
                  align = headerAlign || align || (opts.rtl ? "right" : "left");

                  if (renderer && typeof renderer === "string") {
                    dh.renderer = fEval(renderer) as CellRenderer;
                  }

                  // RTL: use pre-computed column position directly
                  const cellX = opts.rtl ? columnPositions[i] : lastPositionX;
                  const rectCell: Rect = {
                    x: cellX,
                    y: startY - columnSpacing - rowDistance * 2,
                    width,
                    height: this.headerHeight + columnSpacing,
                  };

                  // headerColor/headerOpacity are the primary header background.
                  // backgroundColor/background on the header object also apply
                  // to the header row (as well as to data cells in that column).
                  this.addBackground(rectCell, headerColor, headerOpacity);
                  prepareRowBackground(dh, rectCell);
                  cellPadding = prepareCellPadding(resolvePadding(padding));

                  this.text(
                    String(label ?? ""),
                    cellX + cellPadding.left,
                    startY + cellPadding.top,
                    {
                      width: width - (cellPadding.left + cellPadding.right),
                      align: align as PdfTextAlign,
                    },
                  );

                  if (!opts.rtl) lastPositionX += width;
                });
              }

              prepareRowOptions(docTable.headers);
            }

            if (!opts.hideHeader) {
              // Always compute the header's bottom from startY (the current page's
              // header top), never from the previous rowBottomY which may belong
              // to a different page and would place the divider line in the wrong
              // position when addHeader() is called from onFirePageAdded during
              // a mid-row overflow.
              rowBottomY = startY + computeRowHeight(docTable.headers, true);
              separationsRow("header", startX, rowBottomY);
            } else {
              rowBottomY = startY;
            }
          };

          // ------------------------------------------------------------------
          // Page management
          // ------------------------------------------------------------------

          /**
           * Add a new page with the same layout/margins as the current one.
           */
          const addNewPage = (): void => {
            if (lockAddPage) return;
            lockAddPage = true;
            this.addPage({
              layout: this.page.layout as PDFDocOptions["layout"],
              size: this.page.size,
              margins: this.page.margins,
            });
            lockAddPage = false;
          };

          let handlingPageAdded = false;
          let pageAddedCount = 0;
          let restoreRowStyle: (() => void) | null = null;

          const onFirePageAdded = (): void => {
            if (handlingPageAdded) return;
            handlingPageAdded = true;
            pageAddedCount++;

            this.page.margins.top = origMarginTop;
            startY = origMarginTop;

            // Only reset rowBottomY when we are NOT mid-cell (restoreRowStyle
            // is null between rows).  During a natural overflow of a tall cell,
            // restoreRowStyle is set; resetting rowBottomY here would lose the
            // row's start position and produce a huge blank gap after the row.
            if (restoreRowStyle === null) {
              // Normal inter-row page break: reset and draw header.
              rowBottomY = 0;
              lockAddHeader || addHeader();
            } else {
              // Mid-row overflow: draw header but preserve rowBottomY.
              // The row-finishing block will anchor it to this.y after text().
              lockAddHeader || addHeader();
              // Push page.margins.top below the header so PDFKit continues the
              // overflowing text beneath it instead of behind it.
              // cellPadding is captured via closure from the active cell loop —
              // add cellPadding.top so the continued text respects the same
              // top padding that was applied on the first page of the cell.
              const headerBottom = this.y + columnSpacing * 2 + cellPadding.top;
              this.page.margins.top = headerBottom;
              this.y = headerBottom;
              this.fillColor("black");
              restoreRowStyle();
            }

            handlingPageAdded = false;
          };

          // Register listener before any rendering begins.
          this.on("pageAdded", onFirePageAdded);

          if (opts.addPage === true) addNewPage();
          else addHeader();

          // ------------------------------------------------------------------
          // Data rows (Table.data / legacy Table.datas)
          // ------------------------------------------------------------------

          tableData.forEach((row, i) => {
            this.datasIndex = i;

            const _mr: Rect = { x: 0, y: 0, width: 0, height: 0 };
            prepareRow(row, 0, i, _mr, _mr);

            const rowHeight = computeRowHeight(row, false);

            // ----------------------------------------------------------------
            // Proactive page-break logic:
            //
            // The decision is based solely on WHERE THE CURSOR IS NOW,
            // not on the total height of the row. A tall row (multi-page
            // text) should start on a new page only if the cursor is already
            // in the last endOfPageThreshold% of the page — otherwise let
            // PDFKit render and break naturally across pages.
            //
            // Rule:
            //   • cursor is in the last 10% of usable height → break
            //   • cursor is in the first 90% → always continue (even for
            //     tall rows that will overflow — PDFKit handles that)
            //
            // Rows taller than pageBreakThreshold always flow naturally —
            // a proactive break would produce a blank gap before them.
            // ----------------------------------------------------------------
            const pageContentHeight = maxY - origMarginTop;
            const spaceRemaining = maxY - this.y;
            const rowFitsInPage =
              rowHeight <= pageContentHeight * pageBreakThreshold;

            // Fraction of page height that defines "near the bottom".
            const endOfPageFraction =
              opts.endOfPageThreshold !== undefined
                ? Math.min(1, Math.max(0, opts.endOfPageThreshold))
                : 0.1;
            const endOfPageMinSpace = pageContentHeight * endOfPageFraction;

            // Only break proactively when the cursor itself is in the last
            // endOfPageThreshold% of the page — the row height is irrelevant
            // for this decision. PDFKit handles natural overflow for tall rows.
            const cursorNearBottom = spaceRemaining < endOfPageMinSpace;

            if (
              opts.useSafelyMarginBottom &&
              !lockAddPage &&
              rowFitsInPage &&
              cursorNearBottom
            )
              addNewPage();

            startY = rowBottomY + columnSpacing + rowDistance;
            lockAddPage = false;

            const rowStartY = startY;

            const rectRow: Rect = {
              x: startX,
              y: rowStartY - columnSpacing - rowDistance * 2,
              width: totalColumnsWidth,
              height: rowHeight + columnSpacing,
            };

            prepareRowBackground(row, rectRow);
            lastPositionX = opts.rtl ? columnPositions[0] : startX;

            let rowHasOverflowed = false;
            let maxCellEndY = rowStartY;
            // When a tall cell overflows to a new page, subsequent short cells
            // must start below the repeated header on the new page instead of
            // at rowStartY (which belongs to the previous page).  Without this
            // fix, Math.max(rowStartY_old_page, this.y_new_page) always returns
            // the old-page value, placing the divider line far below the text.
            let postOverflowCellStartY: number | null = null;

            docTable.headers!.forEach((dataHeader, index) => {
              const hdr = dataHeader as Header;
              let { property, width, renderer, align, valign, padding } = hdr;

              // Use the pre-computed column size for this index.
              // columnWidth is only an average fallback — columnSizes[index]
              // has the correct resolved width (including flex columns).
              width =
                (typeof width === "number" ? width : undefined) ??
                columnSizes[index];
              // RTL: default text align to right unless explicitly set
              align = align || (opts.rtl ? "right" : "left");
              cellPadding = prepareCellPadding(resolvePadding(padding));

              // RTL: use pre-computed column position directly
              const cellX = opts.rtl ? columnPositions[index] : lastPositionX;
              const rectCell: Rect = {
                x: cellX,
                y: rowStartY - columnSpacing - rowDistance * 2,
                width: width as number,
                height: rowHeight + columnSpacing,
              };

              prepareRowOptions(row);
              prepareRow(row, index, i, rectRow, rectCell);

              const cellValue: string | number | CellObject | undefined =
                row[property!];

              let textStr: string;
              if (typeof cellValue === "object" && cellValue !== null) {
                textStr = String(cellValue.label);
                // Apply column background from header first, then cell-level
                // background on top (cell wins over column default).
                prepareRowBackground(docTable.headers![index], rectCell);
                if (
                  Object.prototype.hasOwnProperty.call(cellValue, "options")
                ) {
                  prepareRowOptions(cellValue);
                  prepareRowBackground(cellValue, rectCell);
                }
              } else {
                textStr = String(cellValue ?? "");
                prepareRowBackground(docTable.headers![index], rectCell);
              }

              if (textStr.startsWith("bold:")) {
                this.font("Helvetica-Bold");
                textStr = textStr.replace("bold:", "");
              }

              if (textStr.startsWith("size")) {
                const size =
                  Number(
                    textStr.slice(4, 6).replace(":", "").replace("+", ""),
                  ) >> 0;
                this.fontSize(size < 7 ? 7 : size);
                textStr = textStr.replace(`size${size}:`, "");
              }

              if (typeof renderer === "function") {
                textStr = String(
                  renderer(textStr, index, i, row, rectRow, rectCell),
                );
              }

              // Compute vertical offset respecting both valign and cellPadding.
              // Only apply valign when row fits in one page — multi-page rows
              // have a rectCell.height that spans pages and would mis-position.
              let topTextToAlignVertically = cellPadding.top;
              if (rowHeight <= pageContentHeight) {
                const usableHeight =
                  rectCell.height - cellPadding.top - cellPadding.bottom;
                const heightText = this.heightOfString(textStr, {
                  width:
                    (width as number) - (cellPadding.left + cellPadding.right),
                  align: align as PdfTextAlign,
                });
                if (valign === "center") {
                  topTextToAlignVertically =
                    cellPadding.top + (usableHeight - heightText) / 2;
                } else if (valign === "bottom") {
                  topTextToAlignVertically =
                    cellPadding.top + (usableHeight - heightText);
                }
                // valign "top" or undefined: keep cellPadding.top
              }

              restoreRowStyle = () => {
                prepareRowOptions(row);
                prepareRow(row, index, i, rectRow, rectCell);
              };

              const pageCountBefore = pageAddedCount;
              const cellY =
                postOverflowCellStartY ?? rowStartY + topTextToAlignVertically;

              this.text(textStr, cellX + cellPadding.left, cellY, {
                width:
                  (width as number) - (cellPadding.left + cellPadding.right),
                align: align as PdfTextAlign,
              });

              this.page.margins.top = origMarginTop;

              if (pageAddedCount > pageCountBefore) {
                rowHasOverflowed = true;
                // rowBottomY was updated by addHeader() inside onFirePageAdded.
                // Anchor subsequent cells just below the new-page header and
                // reset maxCellEndY so old-page Y values are discarded.
                postOverflowCellStartY =
                  rowBottomY + columnSpacing + rowDistance;
                maxCellEndY = this.y;
              } else {
                maxCellEndY = Math.max(maxCellEndY, this.y);
              }

              if (!opts.rtl) lastPositionX += width as number;
              prepareRowOptions(row);
              prepareRow(row, index, i, rectRow, rectCell);
            });

            restoreRowStyle = null;

            this.y = maxCellEndY;

            if (rowHasOverflowed) {
              rowBottomY = maxCellEndY + columnSpacing + rowDistance * 2;
            } else {
              rowBottomY = Math.max(rowStartY + rowHeight, rowBottomY);
              if (rowBottomY > this.page.height)
                rowBottomY = maxCellEndY + columnSpacing + rowDistance * 2;
            }

            separationsRow("horizontal", startX, rowBottomY);

            if (Object.prototype.hasOwnProperty.call(row, "options")) {
              if (
                Object.prototype.hasOwnProperty.call(row.options, "separation")
              ) {
                separationsRow("horizontal", startX, rowBottomY, 1, 1);
              }
            }
          });

          // ------------------------------------------------------------------
          // Array rows (Table.rows)
          // ------------------------------------------------------------------

          docTable.rows!.forEach((row, i) => {
            this.rowsIndex = i;

            const _mr2: Rect = { x: 0, y: 0, width: 0, height: 0 };
            prepareRow(row, 0, i, _mr2, _mr2);

            const rowHeight = computeRowHeight(row, false);

            // ----------------------------------------------------------------
            // Same page-break logic as the tableData loop above.
            // ----------------------------------------------------------------
            const pageContentHeight2 = maxY - origMarginTop;
            const spaceRemaining2 = maxY - this.y;
            const rowFitsInPage2 =
              rowHeight <= pageContentHeight2 * pageBreakThreshold;

            const endOfPageFraction2 =
              opts.endOfPageThreshold !== undefined
                ? Math.min(1, Math.max(0, opts.endOfPageThreshold))
                : 0.1;
            const endOfPageMinSpace2 = pageContentHeight2 * endOfPageFraction2;

            const cursorNearBottom2 = spaceRemaining2 < endOfPageMinSpace2;

            if (
              opts.useSafelyMarginBottom &&
              !lockAddPage &&
              rowFitsInPage2 &&
              cursorNearBottom2
            )
              addNewPage();

            startY = rowBottomY + columnSpacing + rowDistance;
            lockAddPage = false;

            const rowStartY2 = startY;

            const rectRow: Rect = {
              x: startX,
              y: rowStartY2 - columnSpacing - rowDistance * 2,
              width: totalColumnsWidth,
              height: rowHeight + columnSpacing,
            };

            lastPositionX = opts.rtl ? columnPositions[0] : startX;

            let rowHasOverflowed2 = false;
            let maxCellEndY2 = rowStartY2;
            // Same overflow-anchor fix as the tableData loop above.
            let postOverflowCellStartY2: number | null = null;

            row.forEach((cell, index) => {
              // RTL: default text align to right unless explicitly set by header
              let align = opts.rtl ? "right" : "left";
              let valign: string | undefined;

              // RTL: use pre-computed column position directly
              const cellX2 = opts.rtl ? columnPositions[index] : lastPositionX;
              const rectCell: Rect = {
                x: cellX2,
                y: rowStartY2 - columnSpacing - rowDistance * 2,
                width: columnSizes[index],
                height: rowHeight + columnSpacing,
              };

              prepareRowBackground(docTable.headers![index], rectCell);
              prepareRow(row, index, i, rectRow, rectCell);

              const colHeader =
                typeof docTable.headers![index] === "object"
                  ? (docTable.headers![index] as Header)
                  : undefined;

              if (colHeader) {
                if (typeof colHeader.renderer === "function") {
                  cell = colHeader.renderer(
                    cell,
                    index,
                    i,
                    row,
                    rectRow,
                    rectCell,
                    this as unknown as PDFDoc,
                  ) as string | number;
                }
                colHeader.align && (align = colHeader.align);
                colHeader.valign && (valign = colHeader.valign);
              }

              cellPadding = prepareCellPadding(
                resolvePadding(colHeader?.padding),
              );

              // Compute vertical offset respecting both valign and cellPadding.
              let topTextToAlignVertically = cellPadding.top;
              if (rowHeight <= pageContentHeight2) {
                const usableHeight =
                  rectCell.height - cellPadding.top - cellPadding.bottom;
                const heightText = this.heightOfString(String(cell), {
                  width:
                    columnSizes[index] - (cellPadding.left + cellPadding.right),
                  align: align as PdfTextAlign,
                });
                if (valign === "center") {
                  topTextToAlignVertically =
                    cellPadding.top + (usableHeight - heightText) / 2;
                } else if (valign === "bottom") {
                  topTextToAlignVertically =
                    cellPadding.top + (usableHeight - heightText);
                }
                // valign "top" or undefined: keep cellPadding.top
              }

              restoreRowStyle = () => {
                prepareRowBackground(docTable.headers![index], rectCell);
                prepareRow(row, index, i, rectRow, rectCell);
              };

              const pageCountBefore2 = pageAddedCount;
              const cellY2 =
                postOverflowCellStartY2 ??
                rowStartY2 + topTextToAlignVertically;

              this.text(String(cell), cellX2 + cellPadding.left, cellY2, {
                width:
                  columnSizes[index] - (cellPadding.left + cellPadding.right),
                align: align as PdfTextAlign,
              });

              this.page.margins.top = origMarginTop;

              if (pageAddedCount > pageCountBefore2) {
                rowHasOverflowed2 = true;
                postOverflowCellStartY2 =
                  rowBottomY + columnSpacing + rowDistance;
                maxCellEndY2 = this.y;
              } else {
                maxCellEndY2 = Math.max(maxCellEndY2, this.y);
              }

              if (!opts.rtl) lastPositionX += columnSizes[index];
            });

            restoreRowStyle = null;

            this.y = maxCellEndY2;

            if (rowHasOverflowed2) {
              rowBottomY = maxCellEndY2 + columnSpacing + rowDistance * 2;
            } else {
              rowBottomY = Math.max(rowStartY2 + rowHeight, rowBottomY);
              if (rowBottomY > this.page.height)
                rowBottomY = maxCellEndY2 + columnSpacing + rowDistance * 2;
            }

            separationsRow("horizontal", startX, rowBottomY);
          });

          // ------------------------------------------------------------------
          // Finalise
          // ------------------------------------------------------------------

          this.x = startX;
          this.y = rowBottomY;
          this.moveDown();
          this.off("pageAdded", onFirePageAdded);

          typeof resolvedCallback === "function" && resolvedCallback(this);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    }

    // -----------------------------------------------------------------------
    // purgeImage
    // -----------------------------------------------------------------------

    /**
     * Removes a previously rendered image from PDFKit's internal cache
     * (`_imageRegistry`), allowing the garbage collector to reclaim the memory
     * occupied by that image's decoded pixel data.
     *
     * **When to use:**
     * Call this immediately after the last `doc.image()` call that uses a given
     * source, when the image will NOT appear again later in the document.
     * This is useful for large one-off illustrations on memory-constrained
     * servers (≤1 GB heap).
     *
     * **When NOT to use:**
     * Do NOT call this for images that appear on multiple pages (e.g. watermarks,
     * logos in headers/footers).  PDFKit's registry enables XObject reuse — if
     * the entry is removed, the next `doc.image()` call for the same source will
     * re-decode and re-embed the image, producing a **larger** PDF and consuming
     * **more** memory overall, not less.
     *
     * **Large documents on low-memory servers:**
     * The most effective lever for heap pressure on multi-page PDFs is the
     * Node.js process flag, not in-process cleanup:
     * ```
     * node --max_old_space_size=4096 server.js
     * ```
     * Additionally, prefer `compress: true` in the PDFDocument constructor and
     * pass images as `Buffer` rather than base64 strings to avoid doubling the
     * in-memory representation.
     *
     * @param src - The same path, URL, or Buffer reference passed to `doc.image()`.
     *
     * @example
     * ```ts
     * // Safe: image appears exactly once
     * doc.image('./chart.png', 50, 200, { width: 400 });
     * doc.purgeImage('./chart.png');
     *
     * // Unsafe: logo appears on every page — do NOT release
     * doc.image('./logo.png', 20, 20, { width: 80 });
     * // doc.purgeImage('./logo.png');  ← would duplicate the XObject each page
     * ```
     */
    purgeImage(src: string): void {
      const registry = (this as unknown as Record<string, unknown>)
        ._imageRegistry as Record<string, unknown> | undefined;
      if (registry && Object.prototype.hasOwnProperty.call(registry, src)) {
        delete registry[src];
      }
    }

    // -----------------------------------------------------------------------
    // tables
    // -----------------------------------------------------------------------

    /** Render an array of tables sequentially. */
    async tables(
      tables: Table[],
      callback?: (doc: this) => void,
    ): Promise<void> {
      if (!Array.isArray(tables)) return;

      for (const t of tables) {
        await this.table(t, t.options ?? {});
      }

      typeof callback === "function" && callback(this);
    }
  }

  return PDFDocumentWithTables;
}
