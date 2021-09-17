// jshint esversion: 6
// "use strict";
// https://jshint.com/

const PDFDocument = require("pdfkit");

class PDFDocumentWithTables extends PDFDocument {
  
  constructor(option) {
    super(option);
  }

  logg(...args) {
    // console.log(args);
  }

  /**
   * addBackground
   * @param {Object} rect
   * @param {String} fillColor 
   * @param {Number} fillOpacity 
   */
  addBackground ({x, y, width, height}, fillColor, fillOpacity) {

    // validate
    fillColor || (fillColor = 'gray');
    fillOpacity || (fillOpacity = 0.1);

    // draw bg
    this
    .fill(fillColor)
    //.stroke(fillColor)
    .fillOpacity(fillOpacity)
    .rect( x, y, width, height )
    //.stroke()
    .fill();

    // restore
    this
    .fillColor('black')
    .fillOpacity(1)
    .fill();
    
  }

  /**
   * table
   * @param {Object} table 
   * @param {Object} options 
   * @returns 
   */
  table(table, options) {
  
    typeof table === 'string' && (table = JSON.parse(table));

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

    const columnIsDefined  = options.columnsSize.length ? true : false ; 
    const columnCount      = table.headers.length; // TODO if not have header
    const columnSpacing    = options.columnSpacing || 3; // 15
      let columnSizes      = [];
      let columnPositions  = []; // 0, 10, 20, 30, 100
      let columnWidth      = 0;

    const rowDistance      = 0.5;

    const prepareHeader    = options.prepareHeader || (() => this.font("Helvetica-Bold").fontSize(8));
    const prepareRow       = options.prepareRow || ((row, indexColumn, indexRow, rectRow) => this.font("Helvetica").fontSize(8));
    
    const maxY             = this.page.height - (this.page.margins.bottom + 5);

      let startX           = options.x || this.x || this.page.margins.left;
      let startY           = options.y || this.y;
      let rowBottomY       = 0;
      let tableWidth       = 0;

    // if options.x === null 
    // reset position to margins.left
    if( options.x === null || options.x === -1 ){
      startX = this.page.margins.left;
    }

    const createTitle = ( data, size, opacity ) => {
      
      // Title
      if(!data) return;

      // get height line
      // let cellHeight = 0;
      // if string
      if(typeof data === 'string' ){
        // font size
        this.fontSize( size ).opacity( opacity );
        // get height line
        // cellHeight = this.heightOfString( data, {
        //   width: usableWidth,
        //   align: "left",
        // });
        // write 
        this.text( data, startX, startY ).opacity( 1 ); // moveDown( 0.5 )
        // startY += cellHeight;
        startY = this.y + columnSpacing + 2;
        // else object
      } else if(typeof data === 'object' ){
        // title object
        data.label && this.fontSize( data.fontSize || size ).text( data.label, startX, startY );
      }  
    };

    // add a new page before crate table
    options.addPage === true && this.addPage();

    // create title and subtitle
    createTitle( title, 12, 1 );
    createTitle( subtitle, 9, 0.7 );

    // add space after title
    if( title || subtitle ){
      startY += 3;
    }

    const onFirePageAdded = () => {
      // startX = this.page.margins.left;
      startY = this.page.margins.top;
      rowBottomY = 0;
      addHeader();
    }

    // add fire
    this.on("pageAdded", onFirePageAdded);

    // warning - eval can be harmful
    const fEval = (str) => {
      let f = null; eval('f = ' + str); return f;
    };

    const separationsRow = (x, y, strokeWidth, strokeOpacity) => {
      
      // validate
      strokeOpacity || (strokeOpacity = 0.5);
      strokeWidth || (strokeWidth = 0.5);

      // distance
      const d = rowDistance * 1.5;
      // margin
      const m = options.x || this.page.margins.left;

      // draw
      this
      .moveTo(x, y - d)
      .lineTo(x + tableWidth - m, y - d)
      .lineWidth(strokeWidth)
      .opacity(strokeOpacity)
      .stroke()
      // Reset opacity after drawing the line
      .opacity(1); 

    };

    const prepareRowOptions = (row) => {

      // validate
      if( typeof row !== 'object' || !row.hasOwnProperty('options') ) return; 

      const {fontFamily, fontSize, color} = row.options;

      fontFamily && this.font(fontFamily); 
      fontSize && this.fontSize(fontSize); 
      color && this.fillColor(color); 

      // row.options.hasOwnProperty('fontFamily') && this.font(row.options.fontFamily); 
      // row.options.hasOwnProperty('fontSize') && this.fontSize(row.options.fontSize); 
      // row.options.hasOwnProperty('color') && this.fillColor(row.options.color); 

    };

    const prepareRowBackground = (row, rect) => {

      // validate
      if( typeof row !== 'object' ) return; 

      // options
      row.options && (row = row.options);

      // add backgroundColor
      if(row.hasOwnProperty('backgroundColor')){
        const { backgroundColor, backgroundOpacity } = row;
        // add background
        this.addBackground(rect, backgroundColor, backgroundOpacity);
      }

      // add background
      if(row.hasOwnProperty('background')){
        const { color, opacity } = row.background;
        // add background
        this.addBackground(rect, color, opacity);
      }
      
    };
    
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
          width: columnSizes[i],
          align: "left",
        });
        
        result = Math.max(result, cellHeight);

      });

      return result + columnSpacing;
    };

    // Calc columns size
    
    const calcColumnsSizes = () => {

      // const columnPositions  = []; // 0, 10, 20, 30, 100

      // values
      // tableWidth 477
      // columnPositions [
      //   30, 180, 330,  
      //   30, 180, 330,  
      //   30, 180, 330,
      // ]

      let h = []; // header width
      let p = []; // position
      let w = 0;  // table width

      // 1o - Max size table
      w = this.page.width - this.page.margins.right - ( options.x || this.page.margins.left );
      // 2o - Size defined
      options.width && ( w = String(options.width).replace(/[^0-9]/g,'') );

      // 1o
      table.headers.forEach( el => {
        el.width && h.push(el.width); // - columnSpacing
      });
      // 2o
      if(h.length === 0) {
        h = options.columnsSize;
      } 
      // 3o
      if(h.length === 0) {
        columnWidth = (w / table.headers.length); // - columnSpacing
        table.headers.forEach( () => h.push(columnWidth) );
      }

      // Set columnPositions
      h.reduce((prev, curr, indx) => {
        p.push(prev >> 0);
        return prev + curr;
      },( options.x || this.page.margins.left ));

      // Set columnSizes
      h.length && (columnSizes = h);
      p.length && (columnPositions = p);

      // 3o - Sum last position + lest header width
      w = p[p.length-1] + h[h.length-1];

      // Set tableWidth
      w && ( tableWidth = w );
      
      // Ajust spacing
      // tableWidth = tableWidth - (h.length * columnSpacing); 

      this.logg('columnSizes', h);
      this.logg('columnPositions', p);

    }

    calcColumnsSizes();

    // Header

    const addHeader = () => { 

      // Allow the user to override style for headers
      prepareHeader();

      // Check to have enough room for header and first rows. default 3
      if (startY + 2 * computeRowHeight(table.headers) > maxY) {
        this.addPage();
      }

      let lastPosition = 0; // x position head

      if(table.headers && table.headers.length > 0){

        let rowHeight = computeRowHeight(table.headers);

        if(typeof table.headers[0] === 'string') {

          // we have columnSizes[] complete
          if(columnIsDefined) {

            // sum columns sizes
            columnWidth = columnSizes.reduce((acc, curr, index ) => acc + curr, 0);
    
            // background header
            const rectRow = {
              x: startX, 
              y: startY - columnSpacing - (rowDistance * 2), 
              width: columnWidth, 
              height: rowHeight + columnSpacing,
            };

            // add background
            this.addBackground(rectRow);

            lastPosition = startX;

            // print headers
            table.headers.forEach((header, i) => {

              this.text(header, lastPosition, startY, {
                width: columnSizes[i] >> 0,
                align: "left",
              });
              
              // columnPositions.push(lastPosition);
              lastPosition += columnSizes[i] >> 0;

            });
            
          } else {

            // background header
            const rectRow = {
              x: startX, 
              y: startY - columnSpacing - (rowDistance * 2), 
              width: columnWidth * table.headers.length, 
              height: rowHeight + columnSpacing,
            };

            // add background
            this.addBackground(rectRow);
            
            // print headers
            table.headers.forEach( (header, i) => {

              lastPosition = startX + i * columnWidth;
              this.text(header, lastPosition, startY, {
                width: columnWidth,
                align: "left",
              });

              // columnSizes.push(columnWidth);
              // columnPositions.push(lastPosition);

            });

          }
          
        }else{

          lastPosition = startX;

          // Print all headers
          table.headers.forEach(( dataHeader, i) => {

            let {label, width, renderer} = dataHeader;
            // check defination
            width = width || columnWidth;
    
            if(renderer && typeof renderer === 'string') {
              table.headers[i].renderer = fEval(renderer);
            }

            // force number
            width = width >> 0;
            
            // background header
            const rectRow = {
              x: lastPosition, 
              y: startY - columnSpacing - (rowDistance * 2), 
              width: width, 
              height: rowHeight + columnSpacing,
            };

            // add background
            this.addBackground(rectRow);

            // write
            this.text(label, lastPosition + 0, startY, {
              width: width,
              align: "left",
            })

            // columnSizes.push(width);
            // columnPositions.push(lastPosition);
            lastPosition += width;

          });

          // set style
          prepareRowOptions(table.headers);

        }
      }

      // Refresh the y coordinate of the bottom of the headers row
      rowBottomY = Math.max(startY + computeRowHeight(table.headers), rowBottomY);

      // update table width
      // tableWidth = columnPositions[columnPositions.length-1] + columnSizes[columnSizes.length-1];

      // this.logg('tableWidth',tableWidth);
      // this.logg('columnPositions',columnPositions);

      // Separation line between headers and rows
      separationsRow(startX, rowBottomY);

    }

    addHeader();

    // End header

    // datas ----------------------------------------------------

    table.datas.forEach((row, i) => {

      const rowHeight = computeRowHeight(row);

      // Switch to next page if we cannot go any further because the space is over.
      // For safety, consider 3 rows margin instead of just one
      // if (startY + 2 * rowHeight < maxY) startY = rowBottomY + columnSpacing + rowDistance; // 0.5 is spacing rows
      // else this.addPage();
      startY + 2 * rowHeight >= maxY && this.addPage();
      startY = rowBottomY + columnSpacing + rowDistance; // 0.5 is spacing rows

      const rectRow = {
        x: startX, 
        y: startY - columnSpacing - (rowDistance * 2), 
        width: tableWidth - startX, 
        height: rowHeight + columnSpacing,
      };

      // add background row
      prepareRowBackground(row, rectRow);

      let posX = startX; 

      // Print all cells of the current row
      table.headers.forEach(( dataHeader, index) => {

        let {property, width, renderer} = dataHeader;
        // check defination
        width = width || columnWidth;

        const rectCell = {
          x: posX,
          y: startY - columnSpacing - (rowDistance * 2),
          width: width,
          height: rowHeight + columnSpacing,
        }

        // allow the user to override style for rows
        prepareRowOptions(row);
        prepareRow(row, index, i, rectRow);

        let text = row[property];

        // cell object
        if(typeof text === 'object' ){

          text = String(text.label); // get label
          // row[property].hasOwnProperty('options') && prepareRowOptions(row[property]); // set style

          // options if text cell is object
          if( row[property].hasOwnProperty('options') ){

            // set font style
            prepareRowOptions(row[property]);
            prepareRowBackground(row[property], rectCell);

          }
    
        } else {

          // style column by header
          prepareRowBackground(table.headers[index], rectCell);

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
        // renderer && (text = renderer(text, index, i, row, rectRow, rectCell)) // value, index-column, index-row, row 
        // renderer column
        if(typeof renderer === 'function'){
          text = renderer(text, index, i, row, rectRow, rectCell); // value, index-column, index-row, row 
        }

        this.text(text, posX, startY, {
          width: width,
          align: "left",
        });
        posX += width; 

        // set style
        prepareRowOptions(row);
        prepareRow(row, index, i, rectRow);

      });

      // Refresh the y coordinate of the bottom of this row
      rowBottomY = Math.max(startY + rowHeight, rowBottomY);

      // Separation line between rows
      separationsRow(startX, rowBottomY);

      // review this code
      if( row.hasOwnProperty('options') ){
        if( row.options.hasOwnProperty('separation') ){
          // Separation line between rows
          separationsRow(startX, rowBottomY, 1, 1);
        }
      }
      

    });
    // end datas

    // rows ----------------------------------------------------
    table.rows.forEach((row, i) => {

      const rowHeight = computeRowHeight(row);

      // Switch to next page if we cannot go any further because the space is over.
      // For safety, consider 3 rows margin instead of just one
      // if (startY + 2 * rowHeight < maxY) startY = rowBottomY + columnSpacing + rowDistance; // 0.5 is spacing rows
      // else this.addPage();
      if(startY + 2 * rowHeight >= maxY) this.addPage();
      startY = rowBottomY + columnSpacing + rowDistance; // 0.5 is spacing rows

      const rectRow = {
        x: columnPositions[0], 
        // x: startX, 
        y: startY - columnSpacing - (rowDistance * 2), 
        width: tableWidth - startX, 
        height: rowHeight + columnSpacing,
      }

      // add background
      // doc.addBackground(rectRow);

      let posX = startX; 

      row.forEach((cell, index) => {

        const rectCell = {
          // x: columnPositions[index],
          x: posX,
          y: startY - columnSpacing - (rowDistance * 2),
          width: columnSizes[index],
          height: rowHeight + columnSpacing,
        }

        prepareRowBackground(table.headers[index], rectCell);

        // Allow the user to override style for rows
        prepareRow(row, index, i, rectRow);

        // renderer column
        if(typeof table.headers[index] === 'object') {
          table.headers[index].renderer && (cell = table.headers[index].renderer(cell, index, i, row, rectRow, rectCell)); // text-cell, index-column, index-line, row
        }

        this.text(cell, posX, startY, {
          width: columnSizes[index],
          align: "left",
        });

        posX += columnSizes[index];

      });

      // Refresh the y coordinate of the bottom of this row
      rowBottomY = Math.max(startY + rowHeight, rowBottomY);

      // Separation line between rows
      separationsRow(startX, rowBottomY);      

    });
    // end rows ----------------------------------------------------

    // update position
    this.x = startX;
    this.y = rowBottomY; // position y final;
    this.moveDown(); // break

    // add fire
    this.off("pageAdded", onFirePageAdded);

    return this;
  }

    /**
   * tables
   * @param {Object} tables 
   * @returns 
   */
  tables(tables) {
    // if tables is Array
    Array.isArray(tables) ?
    // for each on Array
    tables.forEach( table => this.table( table, table.options || {} ) ) :
    // else is tables is a unique table object
    ( typeof tables === 'object' ? this.table( tables, tables.options || {} ) : null ) ;
  }

}

module.exports = PDFDocumentWithTables;