"use strict";

const PDFDocument = require("pdfkit");

class PDFDocumentWithTables extends PDFDocument {
  
  constructor(option) {
    super(option);
  }

  /**
   * addBackground
   * @param {*} {object} 
   * @param {*} fillColor 
   * @param {*} fillOpacity 
   * @param {*} fontColor 
   */
  addBackground = ( {x, y, width, height}, fillColor, fillOpacity, fontColor ) => {
    console.log('--');
    fillColor || (fillColor = 'gray');
    fillOpacity || (fillOpacity = 0.1);
    fontColor || (fontColor = 'black');
    // set
    this
    .fill(fillColor)
    //.stroke(fillColor)
    .fillOpacity(fillOpacity)
    .rect( x, y + 0.5, width, height )
    .fill()
    //.stroke();
    // retore
    this
    //.restore()
    .fillColor('black')
    .fillOpacity(1)
    .fill()
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

    options.columnsSize || (options.columnsSize = []);
    options.addPage || (options.addPage = false);

    const title            = table.title    ? table.title    : ( options.title    ? options.title    : '' ) ;
    const subtitle         = table.subtitle ? table.subtitle : ( options.subtitle ? options.subtitle : '' ) ;

      let columnIsDefined  = options.columnsSize.length ? true : false ; 
    const columnCount      = table.headers.length;
    const columnSpacing    = options.columnSpacing || 5; // 15
    const columnSizes      = options.columnsSize;
    const columnPositions  = []; // 0, 10, 20, 30, 100
    const rowSpacing       = options.rowSpacing || 3; // 5
    const usableWidth      = String(options.width).replace(/[^0-9]/g,'') || this.page.width - this.page.margins.left - this.page.margins.right;

    const prepareHeader    = options.prepareHeader || (() => this.font("Helvetica-Bold").fontSize(8) );
    const prepareRow       = options.prepareRow || ((row, indexColumn, indexRow, rectRow) => this.font("Helvetica").fontSize(8) );
    
    const columnContainerWidth = usableWidth / columnCount;
    const columnWidth      = columnContainerWidth - columnSpacing;
    const maxY             = this.page.height - this.page.margins.bottom;

      let startX           = options.x || this.x || this.page.margins.left ;
      let startY           = options.y || this.y ;
      let rowBottomY       = 0;
      let tableWidth       = 0;

    // if options.x === null 
    // reset position to margins.left
    if( options.x === null || options.x === -1 ){
      startX = this.page.margins.left;
    }

    const createTitle = ( data, size, opacity ) => {
      // Title
      if( !data ) return;

      // get height line
      let cellHeight = 0;
      // if string
      if(typeof data === 'string' ){
        // font size
        this.fontSize( size ).opacity( opacity );
        // get height line
        cellHeight = this.heightOfString( data, {
          width: usableWidth,
          align: "left",
        });
        // write 
        this.text( data, startX, startY ).opacity( 1 ); // moveDown( 0.5 )
        // startY += cellHeight;
        startY = this.y + 2;
        // else object
      } else if(typeof data === 'object' ){
        // title object
        data.label && this.fontSize( data.fontSize || size ).text( data.label, startX, startY );
      }  
    }

    // add a new page before crate table
    if( options.addPage === true) {
      this.addPage(); // option );
    }

    // create title and subtitle
    createTitle( title, 12, 1 );
    createTitle( subtitle, 9, 0.7 );

    // add space after title
    if( title || subtitle ){
      startY += 3;
    }

    // add fire
    this.on("pageAdded", () => {
      startY = this.page.margins.top;
      rowBottomY = 0;
    });

    const fEval = (str) => {
      let f = null; eval('f = ' + str); return f;
    }

    const separationsRow = (xStart, xEnd, y, strokeWidth, strokeOpacity ) => {
      strokeOpacity || (strokeOpacity = 0.5);
      strokeWidth || (strokeWidth = 0.5);
      this.moveTo(xStart, y - rowSpacing * 0.5)
      //.lineTo(startX + usableWidth, rowBottomY- rowSpacing * 0.5)
      //.lineTo(psX, rowBottomY- rowSpacing * 0.5)
      .lineTo(xEnd, y - rowSpacing * 0.5 )
      .lineWidth(strokeWidth)
      .opacity(strokeOpacity)
      .stroke()
      .opacity(1); // Reset opacity after drawing the line
    }

    // add background
    // const addBackground = ( {x, y, width, height}, fillColor, fillOpacity, fontColor ) => {
    //   fillColor || (fillColor = 'gray');
    //   fillOpacity || (fillOpacity = 0.1);
    //   fontColor || (fontColor = 'black');
    //   // set
    //   this
    //   .fill(fillColor)
    //   //.stroke(fillColor)
    //   .fillOpacity(fillOpacity)
    //   .rect( x, y, width, height )
    //   .fill()
    //   //.stroke();
    //   // retore
    //   this
    //   //.restore()
    //   .fillColor('black')
    //   .fillOpacity(1)
    //   .fill()
    // }

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

    let lastPosition = 0; // x position head

    if(table.headers && table.headers.length > 0){

      let rowHeight = computeRowHeight(table.headers);

      if(typeof table.headers[0] === 'string' ){

        // background header
        // addBackground( startX, startY - 5, 100, rowHeight + rowSpacing );

        // we have columnSizes[] complete
        if( columnIsDefined ){

          lastPosition = startX;
          // print headers
          table.headers.forEach((header, i) => {
            this.text(header, lastPosition, startY, {
              width: columnSizes[i] >> 0,
              align: "left",
            });
            columnPositions.push(lastPosition);
            lastPosition += columnSizes[i] >> 0;
          });
          
        } else {

          // print headers
          table.headers.forEach((header, i) => {

            lastPosition = startX + i * columnContainerWidth;
            this.text(header, lastPosition, startY, {
              width: columnWidth,
              align: "left",
            });
            columnSizes.push(columnWidth);
            columnPositions.push(lastPosition);

          });

        }
        
      }else{

        // Print all headers
        lastPosition = startX;
        table.headers.forEach(({label, width, renderer}, i) => {

          if(renderer && typeof renderer === 'string') {
            table.headers[i].renderer = fEval(renderer);
          }

          width = width >> 0; // number
          
          // background header
          // addBackground( lastPosition, startY - 5, width - 0, rowHeight + 3, '#EEE', 1 );

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
    separationsRow( startX, tableWidth, rowBottomY, 1, 1 );

    // data -------------------------------------------------------------------------
    table.datas.forEach((row, i) => {
      const rowHeight = computeRowHeight(row);

      // Switch to next page if we cannot go any further because the space is over.
      // For safety, consider 3 rows margin instead of just one
      if (startY + 2 * rowHeight < maxY) startY = rowBottomY + rowSpacing;
      else this.addPage();

      const rectRow = {
        x: startX, 
        y: startY - 5, 
        width: tableWidth - startX, 
        height: rowHeight + rowSpacing,
      }

      // add background
      //doc.addBackground(rectRow);

      if( row.hasOwnProperty('options') ){
        if( row.options.hasOwnProperty('separation') ){
            // Separation line between rows
            separationsRow( startX, tableWidth, rowBottomY, 1, 1);
          }
      }

      let posX = startX; 

      // Print all cells of the current row
      table.headers.forEach(({property,width,renderer}, index) => {

        // Allow the user to override style for rows
        prepareRow(row, index, i, rectRow);
        prepareRowOptions(row);

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
          prepareRow(row, index, i, rectRow);
          prepareRowOptions(row);
        // }

      });

      // Refresh the y coordinate of the bottom of this row
      rowBottomY = Math.max(startY + rowHeight, rowBottomY);

      // Separation line between rows
      separationsRow( startX, tableWidth, rowBottomY );

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

      const rectRow = {
        x: startX, 
        y: startY - 5, 
        width: tableWidth - startX, 
        height: rowHeight + rowSpacing,
      }

      // add background
      //doc.addBackground(rectRow);
      
      row.forEach((cell, index) => {

        // Allow the user to override style for rows
        prepareRow(row, index, i, rectRow);

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
      separationsRow( startX, tableWidth, rowBottomY );

    });
    // ------------------------------------------------------------------------------
    // rows -------------------------------------------------------------------------
    // ------------------------------------------------------------------------------

    this.x = startX;
    this.y = rowBottomY; // position y final;
    this.moveDown(); // break

    return this;
  }

    /**
   * tables
   * @param {object} tables 
   * @returns 
   */
  tables(tables) {
    // if tables is Array
    Array.isArray( tables ) ?
    // for each on Array
    tables.forEach( table => this.table( table, table.options || {} ) ) :
    // else is tables is a unique table object
    ( typeof tables === 'object' ? this.table( tables, tables.options || {} ) : null ) ;
  }

}

module.exports = PDFDocumentWithTables;

function t2j( element ){

  if( !element ) return;

    let head = [];
    let data = [];

  const table = element;
  const rows = table.rows.length;
    let cells = 0;
    let text = '';

  for( var r = 0; r < rows; r++ ){
    cells || (cells = table.rows[0].cells.length);
    let simpleRow = [];
    for( var c = 0; c < cells; c++ ){
      text = table.rows[r].cells[c].textContent;
      if( r === 0 ) {
        head.push(text);
      }else {
        simpleRow.push(text);
      }
    }
    simpleRow.length && data.push(simpleRow);
  }

  return {
    headers: head,
    datas: [],
    rows: data,
  };

  // console.log(head, data);
  // console.log(table.rows);
  // console.log(table.rows.length);
  // console.log(table.rows[0].cells);
  // console.log(table.rows[0].cells[0].textContent);
  // console.log(table.rows[0].cells[0].cellIndex);
  // console.log(table.rows[0].innerHTML);

}

function tableToJson( idElement ){
  return t2j( document.getElementById(idElement) );
}

function allTablesToJson(){  
  
    let all = [];

  const table = document.getElementsByTagName('table');
  const rows = table.length;

  for( var r = 0; r < rows; r++ ){
    all.push( t2j(table[r]) );
  }
  
  return all;

}

module.exports.tableToJson = tableToJson;
module.exports.allTablesToJson = allTablesToJson;