declare module "pdfkit-table" {
    import PDFDocument from "pdfkit";

    export interface Rect {
        x: number;
        y: number;
        width: number;
        height: number;
    }

    export interface Header {
        label?: string;
        property?: string;
        width?: number;
        align?: string; //default 'left'
        valign?: string;
        headerColor?: string; //default '#BEBEBE'
        headerOpacity?: number; //default '0.5'
        headerAlign?: string; //default 'left'
        columnColor?: string;
        columnOpacity?: number;
        renderer?: (
            value: any,
            indexColumn?: number,
            indexRow?: number,
            row?: number,
            rectRow?: Rect,
            rectCell?: Rect
        ) => string;
    }

    export interface DataOptions {
        fontSize: number;
        fontFamily: string;
        separation: boolean;
    }

    export interface Data {
        [key: string]: string | { label: string; options?: DataOptions };
    }

    export interface Table {
        title?: string;
        subtitle?: string;
        headers?: (string | Header)[];
        datas?: Data[];
        rows?: string[][];
    }

    export interface DividerOptions {
        disabled?: boolean;
        width?: number;
        opacity?: number;
    }

    export interface Divider {
        header?: DividerOptions;
        horizontal?: DividerOptions;
    }

    export interface Title {
        label: string;
        fontSize?: number;
        fontFamily?: string;
        color?: string;
    }

    export interface Options {
        title?: string | Title;
        subtitle?: string | Title;
        width?: number;
        x?: number; //default doc.x
        y?: number; //default doc.y
        divider?: Divider;
        columnsSize?: number[];
        columnSpacing?: number; //default 5
        padding?: number[];
        addPage?: boolean; //default false
        hideHeader?: boolean;
        minRowHeight?: number;
        prepareHeader?: () => PDFDocumentWithTables;
        prepareRow?: (
            row?: any,
            indexColumn?: number,
            indexRow?: number,
            rectRow?: Rect,
            rectCell?: Rect
        ) => PDFDocumentWithTables;
    }

    class PDFDocumentWithTables extends PDFDocument {
        public table(table: Table, options?: Options): Promise<void>;

        public addBackground(
            rect?: Rect,
            fillColor?: string,
            fillOpacity: number,
            callback?: Function
        );
    }

    // export = PDFDocumentWithTables;
    export default PDFDocumentWithTables;
}
