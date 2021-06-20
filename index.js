"use strict";

const PDFDocument = require("pdfkit");

class PDFDocumentWithTables extends PDFDocument {
  
  constructor(options) {
    super(options);
  }

  /**
   * table
   * @param {object} table 
   * @param {object} options 
   * @returns 
   */
  table(table, options) {
  
    typeof table === 'string' && ( table = JSON.parse(table) );

    table || (table = {});
    options || (options = {});

    table.headers || (table.headers = []);
    table.datas || (table.datas = []);
    table.rows || (table.rows = []);
    table.options && (options = table.options);
    
    const columnCount     = table.headers.length;
    const columnSpacing   = options.columnSpacing || 5; // 15
    const columnSizes     = options.columnSizes || [];
    const columnPositions = []; // 0, 10, 20, 30, 100
    const rowSpacing      = options.rowSpacing || 3; // 5
    const usableWidth     = String(options.width).replace(/[^0-9]/g,'') || this.page.width - this.page.margins.left - this.page.margins.right;

    const prepareHeader   = options.prepareHeader || (() => this.font("Helvetica-Bold").fontSize(8) );
    const prepareRow      = options.prepareRow || (() => this.font("Helvetica").fontSize(8) );
    
    const columnContainerWidth = usableWidth / columnCount;
    const columnWidth     = columnContainerWidth - columnSpacing;
    const maxY            = this.page.height - this.page.margins.bottom;

    const startX          = options.x || this.page.margins.left;
      let startY          = options.y || this.y;
      let rowBottomY      = 0;
      let tableWidth      = 0;
  
    this.on("pageAdded", () => {
      startY = this.page.margins.top;
      rowBottomY = 0;
    });

    const fEval = (str) => {
      let f = null; eval('f = ' + str); return f;
    }

    const prepareRowOptions = (row) => {
      if( typeof row !== 'object' || !row.hasOwnProperty('options') ) return; 
      row.options.hasOwnProperty('fontFamily') && this.font(row.options.fontFamily); 
      row.options.hasOwnProperty('fontSize') && this.fontSize(row.options.fontSize); 
      row.options.hasOwnProperty('color') && this.fillColor(row.options.color); 
    }
    
    const computeRowHeight = (row) => {
      
      let result = 0;
     
      // if row is object, content with property and options
      if( !Array.isArray(row) && typeof row === 'object' && !row.hasOwnProperty('property') ){
        const cells = []; 
        // get all properties names on header
        table.headers.forEach(({property}) => cells.push(row[property]) );
        // define row with properties header
        row = cells;  
      }

      row.forEach((cell,i) => {

        let text = cell;

        // object
        // read cell and get label of object
        if( typeof cell === 'object' ){
          // define label
          text = String(cell.label);
          // apply font size on calc about height row 
          cell.hasOwnProperty('options') && prepareRowOptions(cell);
        }

        // calc
        // calc height size of string
        const cellHeight = this.heightOfString(text, {
          // width: columnWidth,
          width: columnSizes[i],
          align: "left",
        });
        
        result = Math.max(result, cellHeight);

      });

      return result + rowSpacing;
    };

    // Allow the user to override style for headers
    prepareHeader();

    // Check to have enough room for header and first rows. default 3
    if (startY + 2 * computeRowHeight(table.headers) > maxY) this.addPage();

    if(table.headers && table.headers.length > 0){

      if(typeof table.headers[0] === 'string' ){

        //Print all headers
        table.headers.forEach((header, i) => {
          const posX = startX + i * columnContainerWidth;
          this.text(header, posX, startY, {
            width: columnWidth,
            align: "left",
          });
          columnSizes.push(columnWidth);
          columnPositions.push(posX);
        });

      }else{

        let rowHeight = computeRowHeight(table.headers);

        // Print all headers
        let lastPosition = startX;
        table.headers.forEach(({label, width, renderer}, i) => {
          
          // renderer && (table.headers[i].renderer = fEval(renderer));

          if(renderer && typeof renderer === 'string') {
            table.headers[i].renderer = fEval(renderer);
            // console.log('A',renderer);
            // console.log('B',table.headers[i].renderer);
          }

          width = width >> 0; // number
          //this.fillColor('red').strokeColor('#777777');
          
          // background
          this.rect(lastPosition, startY - 5, width - 0, rowHeight + 3)
          .fillColor('grey')
          .fillOpacity(.1)
          .strokeColor('black')
          .strokeOpacity(1)
          .fill()
          .stroke();

          // restore color
          this.fillColor('black')
          .fillOpacity(1)
          .strokeOpacity(1);

          // write
          this.text(label, lastPosition + 0, startY, {
            width: width,
            align: "left",
          })
          columnSizes.push(width);
          columnPositions.push(lastPosition);
          lastPosition += width;
        });

        if( table.headers.hasOwnProperty('options') ){
          table.headers.options.hasOwnProperty('fontFamily') && this.font(table.headers.options.fontFamily); 
          table.headers.options.hasOwnProperty('fontSize') && this.fontSize(table.headers.options.fontSize); 
        }

      }
    }

    // Refresh the y coordinate of the bottom of the headers row
    rowBottomY = Math.max(startY + computeRowHeight(table.headers), rowBottomY);
    tableWidth = columnPositions[columnPositions.length-1] + columnSizes[columnSizes.length-1];

    // Separation line between headers and rows
    this.moveTo(startX, rowBottomY - rowSpacing * 0.5)
      //.lineTo(startX + usableWidth, rowBottomY - rowSpacing * 0.5)
      .lineTo(tableWidth, rowBottomY - rowSpacing * 0.5)
      .lineWidth(1)
      .stroke();

    // complex data

    // ------------------------------------------------------------------------------
    // data -------------------------------------------------------------------------
    // ------------------------------------------------------------------------------
    table.datas.forEach((row, i) => {
      const rowHeight = computeRowHeight(row);

      // Switch to next page if we cannot go any further because the space is over.
      // For safety, consider 3 rows margin instead of just one
      if (startY + 2 * rowHeight < maxY) startY = rowBottomY + rowSpacing;
      else this.addPage();

      // Allow the user to override style for rows
      prepareRow(row, i);
      prepareRowOptions(row);

      if( row.hasOwnProperty('options') ){
        if( row.options.hasOwnProperty('separation') ){
            // Separation line between rows
            this.moveTo(startX, rowBottomY - rowSpacing * 0.5)
              .lineTo(startX + usableWidth, rowBottomY - rowSpacing * 0.5)
              .lineWidth(1)
              .opacity(1)
              .stroke();
        }
      }

      let posX = startX; 
      // Print all cells of the current row
      table.headers.forEach(({property,width,renderer}, index) => {

        let text = row[property];
        // let origText = row[property];

        // cell object
        if(typeof text === 'object' ){
          text = String(text.label); // get label
          // origText = String(text.label); // get label
          row[property].hasOwnProperty('options') && prepareRowOptions(row[property]); // set style
        }

        // bold
        if( String(text).indexOf('bold:') === 0 ){
          this.font('Helvetica-Bold');
          text = text.replace('bold:','');
        }

        // size
        if( String(text).indexOf('size') === 0 ){
          let size = String(text).substr(4,2).replace(':','').replace('+','') >> 0;
          this.fontSize( size < 7 ? 7 : size );
          text = text.replace(`size${size}:`,'');
        }

        // renderer column
        renderer && (text = renderer(text, index, i, row)) // value, index-column, index-row, row 

        this.text(text, posX, startY, {
          width: width,
          align: "left",
        });
        posX += width; 

        // repare font family
        // if( origText.indexOf('bold:') === 0 || origText.indexOf('size') === 0 ){
          prepareRow(row, i);
          prepareRowOptions(row);
        // }

      });

      // Refresh the y coordinate of the bottom of this row
      rowBottomY = Math.max(startY + rowHeight, rowBottomY);

      // Separation line between rows
      this.moveTo(startX, rowBottomY - rowSpacing * 0.5)
        //.lineTo(startX + usableWidth, rowBottomY - rowSpacing * 0.5)
        //.lineTo(posX, rowBottomY - rowSpacing * 0.5)
        .lineTo(tableWidth, rowBottomY - rowSpacing * 0.5)
        .lineWidth(.5)
        .opacity(.5)
        .stroke()
        .opacity(1); // Reset opacity after drawing the line
    });
    // ------------------------------------------------------------------------------
    // end data ---------------------------------------------------------------------
    // ------------------------------------------------------------------------------

    // simple data

    // ------------------------------------------------------------------------------
    // rows -------------------------------------------------------------------------
    // ------------------------------------------------------------------------------
    table.rows.forEach((row, i) => {
      const rowHeight = computeRowHeight(row);

      // Switch to next page if we cannot go any further because the space is over.
      // For safety, consider 3 rows margin instead of just one
      if (startY + 2 * rowHeight < maxY) startY = rowBottomY + rowSpacing;
      else this.addPage();

      // Allow the user to override style for rows
      prepareRow(row, i);

      row.forEach((cell, index) => {
        // renderer column
        if( typeof table.headers[index] === 'object' ){
          table.headers[index].renderer && (cell = table.headers[index].renderer(cell, index, i, row)) // text-cell, index-column, index-line, row
        }
        // const posX = startX + i * columnContainerWidth;
        this.text(cell, columnPositions[index], startY, {
          width: columnSizes[index], // columnWidth
          align: "left",
        });
      });

      // Refresh the y coordinate of the bottom of this row
      rowBottomY = Math.max(startY + rowHeight, rowBottomY);

      // Separation line between rows
      this.moveTo(startX, rowBottomY - rowSpacing * 0.5)
        //.lineTo(startX + usableWidth, rowBottomY - rowSpacing * 0.5)
        .lineTo(tableWidth, rowBottomY - rowSpacing * 0.5)
        .lineWidth(.5)
        .opacity(.5)
        .stroke()
        .opacity(1); // Reset opacity after drawing the line
    });
    // ------------------------------------------------------------------------------
    // rows -------------------------------------------------------------------------
    // ------------------------------------------------------------------------------

    this.x = startX;
    this.y = rowBottomY; // position y final;
    this.moveDown(); // break

    return this;
  }
}

module.exports = PDFDocumentWithTables;