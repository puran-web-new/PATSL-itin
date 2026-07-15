import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 1. Fetch client data from Supabase/Neon using params.id
    const clientData = {
      firstName: "John",
      lastName: "Doe",
      reasonForApplying: "a", // Checkbox 'a'
      foreignAddress: "123 Main St, London",
    };

    // 2. Read the blank official IRS PDF template
    const templatePath = path.resolve(process.cwd(), 'public/templates/fw7.pdf');
    const pdfBytes = fs.readFileSync(templatePath);
    
    // 3. Load PDF and get the interactive form fields
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();

    // 4. Set values matching the exact IRS field names
    form.getTextField('f1_01[0]').setText(clientData.firstName);
    form.getTextField('f1_02[0]').setText(clientData.lastName);
    
    // Checkbox mapping
    if (clientData.reasonForApplying === 'a') {
      form.getCheckBox('c1_01[0]').check();
    }

    // 5. Serialize PDF and serve it to the browser for printing/download
    const modifiedPdfBytes = await pdfDoc.save();
    
    return new NextResponse(modifiedPdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="W7_${clientData.lastName}.pdf"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
