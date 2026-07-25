import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const templatePath = path.resolve(process.cwd(), 'public', 'templates', 'fw7.pdf');
  
  if (!fs.existsSync(templatePath)) {
    const pdfDoc = await PDFDocument.create();
    pdfDoc.addPage([612, 792]);
    await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    const pdfBytes = await pdfDoc.save();
    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="application-${id}.pdf"`,
      },
    });
  }

  const pdfBytes = fs.readFileSync(templatePath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const outputBytes = await pdfDoc.save();
  
  return new NextResponse(Buffer.from(outputBytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="application-${id}.pdf"`,
    },
  });
}
