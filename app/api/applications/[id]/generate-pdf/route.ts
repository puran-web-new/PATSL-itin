import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const templatePath = path.resolve(process.cwd(), 'public', 'templates', 'fw7.pdf');

  if (!fs.existsSync(templatePath)) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]);
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const pdfBytes = await pdfDoc.save();
return new NextResponse(Buffer.from(pdfBytes), {
  headers: {
    'Content-Type': 'application/pdf',
    'Content-Disposition': `inline; filename="application-${params.id}.pdf"`,
  },
});

    return new NextResponse(await pdfDoc.save(), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="application-${params.id}.pdf"`,
      },
    });
  }

  const pdfBytes = fs.readFileSync(templatePath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const outputBytes = await pdfDoc.save();

  return new NextResponse(outputBytes, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="application-${params.id}.pdf"`,
    },
  });
}
