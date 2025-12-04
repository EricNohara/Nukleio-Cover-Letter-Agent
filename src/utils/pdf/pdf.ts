import PDFDocument from "pdfkit";

export function generateCoverLetterPdf(text: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Uint8Array[] = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      doc.font("Times-Roman").fontSize(10);

      doc.text(text, {
        align: "left",
        lineGap: 2,
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
