import { createObjectCsvWriter } from 'csv-writer';
import PDFDocument from 'pdfkit';

/**
 * Generate a PDF from the given data
 */
export async function generatePDF(data: any[]): Promise<Buffer> {
  const doc = new PDFDocument();
  const buffers: Buffer[] = [];

  doc.on('data', buffers.push.bind(buffers));
  doc.on('end', () => {});

  doc.text(JSON.stringify(data, null, 2));
  doc.end();

  return new Promise((resolve) => {
    doc.on('end', () => {
      resolve(Buffer.concat(buffers));
    });
  });
}

/**
 * Generate a CSV from the given data
 */
export async function generateCSV(data: any[]): Promise<Buffer> {
  const csvWriter = createObjectCsvWriter({
    path: 'temp.csv',
    header: Object.keys(data[0] || {}).map((key) => ({ id: key, title: key })),
  });

  await csvWriter.writeRecords(data);

  const fs = await import('fs/promises');
  const csvBuffer = await fs.readFile('temp.csv');
  await fs.unlink('temp.csv');

  return csvBuffer;
}