// =============================================
// Type Declaration for pdf-parse
// =============================================
// This module doesn't have official TypeScript types
// So we declare it here to satisfy the compiler

declare module 'pdf-parse' {
  interface PDFData {
    numpages: number;
    numrender: number;
    info: {
      Title?: string;
      Author?: string;
      Subject?: string;
      Creator?: string;
      Producer?: string;
      CreationDate?: string;
      ModDate?: string;
    };
    metadata: Record<string, unknown> | null;
    text: string;
    version: string;
  }

  interface PDFOptions {
    pagerender?: (pageData: unknown) => string;
    max?: number;
    version?: string;
  }

  function pdfParse(
    dataBuffer: Buffer | Uint8Array,
    options?: PDFOptions
  ): Promise<PDFData>;

  export = pdfParse;
}
