const PDFDocument = require("pdfkit");

class PDFDocumentWithTables extends PDFDocument {
  renderCallbacksOnNewPage;

  constructor(options) {
    super(options);
    this.options = options;
    this.renderCallbacksOnNewPage = [];
  }

  queueRenderOnAddPage(renderFn, callback) {
    this.renderCallbacksOnNewPage.push(renderFn);
    if (typeof callback === "function") callback(this);
  }

  addBackground({ x, y, width, height }, fillColor = "grey", fillOpacity = 0.1, callback) {
    this.save()
      .fill(fillColor)
      .fillOpacity(fillOpacity)
      .rect(x, y, width, height)
      .fill()
      .restore();

    if (typeof callback === "function") callback(this);
  }

  async table(tableData, userOptions, callback) {
    return new Promise((resolve, reject) => {
      try {
        if (typeof tableData === "string") tableData = JSON.parse(tableData);
        if (!tableData) tableData = {};
        if (!userOptions) userOptions = {};

        tableData.headers ??= [];
        tableData.datas ??= [];
        tableData.rows ??= [];
        if (tableData.options) userOptions = { ...userOptions, ...tableData.options };

        const defaults = {
          hideHeader: false,
          padding: 0,
          columnsSize: [],
          addPage: false,
          absolutePosition: false,
          minRowHeight: 0,
          divider: {
            header: { disabled: false },
            horizontal: { disabled: false },
            vertical: { disabled: true },
          },
        };
        const options = { ...defaults, ...userOptions };

        if (!tableData.headers.length && !options.hideHeader)
          throw new Error("Headers not defined. Use hideHeader option to skip.");

        const title = tableData.title || options.title || "";
        const subtitle = tableData.subtitle || options.subtitle || "";
        const columnSpacing = options.columnSpacing || 3;
        let columnSizes = [];
        let columnPositions = [];
        let tableWidth = 0;
        let lastX = 0;
        let startX = options.x ?? this.page.margins.left;
        let startY = options.y ?? this.page.margins.top;
        const maxY = this.page.height - this.page.margins.bottom;
        const safeBottomMargin = this.page.margins.top / 2;

        const prepareHeader = options.prepareHeader || (() => this.fillColor("black").font("Helvetica-Bold").fontSize(8));
        const prepareRow = options.prepareRow || (() => this.fillColor("black").font("Helvetica").fontSize(8));

        const onNewPage = () => {
          startY = this.page.margins.top;
          this.addPage({
            layout: this.page.layout,
            size: this.page.size,
            margins: this.page.margins,
          });
          this.renderCallbacksOnNewPage.forEach((fn) => fn(this));
          addTableHeader();
        };

        const evalFunction = (code) => {
          let fn = null;
          eval("fn = " + code);
          return fn;
        };

        const parsePadding = (padding) => {
          if (Array.isArray(padding)) {
            if (padding.length === 2) padding = [...padding, ...padding];
            else if (padding.length === 1) padding = Array(4).fill(padding[0]);
          } else if (typeof padding === "number") {
            padding = Array(4).fill(padding);
          } else if (typeof padding === "object") {
            const { top, right, bottom, left } = padding;
            padding = [top, right, bottom, left];
          } else {
            padding = [0, 0, 0, 0];
          }
          return { top: padding[0], right: padding[1], bottom: padding[2], left: padding[3] };
        };

        const drawDivider = (type, x, y, width, opacity, color) => {
          const divider = options.divider[type] ?? {};
          if (divider.disabled) return;

          const strokeOpacity = opacity ?? divider.opacity ?? 0.5;
          const strokeWidth = width ?? divider.width ?? 0.5;
          const strokeColor = color ?? divider.color ?? "black";

          this.moveTo(x, y - 0.75)
            .lineTo(x + tableWidth - startX, y - 0.75)
            .lineWidth(strokeWidth)
            .strokeColor(strokeColor)
            .opacity(strokeOpacity)
            .stroke()
            .opacity(1);
        };

        const setRowStyles = (row) => {
          if (typeof row !== "object" || !row.options) return;
          const { fontFamily, fontSize, color } = row.options;
          if (fontFamily) this.font(fontFamily);
          if (fontSize) this.fontSize(fontSize);
          if (color) this.fillColor(color);
        };

        const drawRowBackground = (row, rect) => {
          if (typeof row !== "object") return;
          const opts = row.options ?? row;
          const color = opts.columnColor ?? opts.backgroundColor ?? opts.background?.color;
          const opacity = opts.columnOpacity ?? opts.backgroundOpacity ?? opts.background?.opacity;
          if (color) this.addRectBackground(rect, color, opacity);
        };

        const calcColumnLayout = () => {
          const headerWidths = tableData.headers.map((h) => h.width).filter(Boolean);
          const tableMaxWidth = options.width
            ? parseInt(options.width) || this.page.width - this.page.margins.right - startX
            : this.page.width - this.page.margins.right - startX;

          if (!headerWidths.length) {
            if (options.columnsSize.length) headerWidths.push(...options.columnsSize);
            else {
              const defaultWidth = tableMaxWidth / tableData.headers.length;
              for (let i = 0; i < tableData.headers.length; i++) headerWidths.push(defaultWidth);
            }
          }

          columnSizes = headerWidths;
          columnPositions = headerWidths.reduce((acc, width, i) => {
            acc.push((acc[i - 1] ?? startX) + width);
            return acc;
          }, []);

          tableWidth = columnPositions[columnPositions.length - 1];
        };

        const addTableHeader = () => {
          prepareHeader();
          const headerHeight = computeRowHeight(tableData.headers, true);
          const firstRowHeight =
            (tableData.datas.length && computeRowHeight(tableData.datas[0], false)) ||
            (tableData.rows.length && computeRowHeight(tableData.rows[0], false)) ||
            0;

          if (startY + headerHeight + firstRowHeight + safeBottomMargin > maxY) {
            onNewPage();
            return;
          }

          if (!options.hideHeader && tableData.headers.length) {
            tableData.headers.forEach((header, i) => {
              const rect = { x: startX + i * columnSizes[i], y: startY, width: columnSizes[i], height: headerHeight };
              this.addRectBackground(rect, "lightgray", 0.2);

              const pad = parsePadding(options.padding);
              const text = typeof header === "string" ? header : header.label;
              this.text(text, rect.x + pad.left, startY, {
                width: rect.width - pad.left - pad.right,
                align: "left",
              });
            });
            startY += headerHeight;
          }
        };

        const computeRowHeight = (row, isHeader) => {
          let maxHeight = isHeader ? 0 : options.minRowHeight || 0;
          let rowData = row;
          
          if(!Array.isArray(row) && typeof row === 'object' && !row.hasOwnProperty('property')){
            const cells = []; 
            table.headers.forEach(({property}) => cells.push(row[property]) );
            rowData = cells;  
          }

          rowData.forEach((cell, i) => {
            let text = typeof cell === "object" ? String(cell.label ?? "") : String(cell);
            const pad = parsePadding(tableData.headers[i]?.padding ?? options.padding);
            const height = this.heightOfString(text, {
              width: columnSizes[i] - pad.left - pad.right,
              align: "left",
            });
            maxHeight = Math.max(maxHeight, height);
          });
          return maxHeight + columnSpacing;
        };

        calcColumnLayout();
        addTableHeader();

        if (typeof callback === "function") callback(this);
        resolve(this);
      } catch (err) {
        reject(err);
      }
    });
  }
}

module.exports = PDFDocumentWithTables;
