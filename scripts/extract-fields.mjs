import fs from 'fs';
import path from 'path';
import { PDFDocument } from 'pdf-lib';

async function inspect(fileName) {
  const filePath = path.join(process.cwd(), 'public', 'templates', fileName);
  if (!fs.existsSync(filePath)) {
    console.error(`Missing ${filePath}`);
    return;
  }
  const pdf = await PDFDocument.load(fs.readFileSync(filePath));
  const fields = pdf.getForm().getFields();
  console.log(`\n${fileName}: ${fields.length} fields`);
  for (const field of fields) {
    console.log(`${field.constructor.name}\t${field.getName()}`);
  }
}

await inspect('fW7.pdf');
await inspect('fw7coa.pdf');
await inspect('f1040.pdf');
