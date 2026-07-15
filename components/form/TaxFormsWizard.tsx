"use client";

import { useState } from 'react';

type FormData = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  reasonForApplying: string;
  passportNumber: string;
  countryOfCitizenship: string;
  mailingAddress: string;
  phoneNumber: string;
  email: string;
};

const initialState: FormData = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  reasonForApplying: '',
  passportNumber: '',
  countryOfCitizenship: '',
  mailingAddress: '',
  phoneNumber: '',
  email: '',
};

export default function TaxFormsWizard() {
  const [formData, setFormData] = useState<FormData>(initialState);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-3xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold text-slate-800">ITIN Application Intake</h2>
      <p className="mb-6 text-sm text-slate-600">
        This intake form collects the core details needed for IRS ITIN-related document preparation and PDF generation.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <input className="rounded border border-slate-300 p-2" placeholder="First Name" value={formData.firstName} onChange={(e) => handleChange('firstName', e.target.value)} />
        <input className="rounded border border-slate-300 p-2" placeholder="Last Name" value={formData.lastName} onChange={(e) => handleChange('lastName', e.target.value)} />
        <input className="rounded border border-slate-300 p-2" type="date" value={formData.dateOfBirth} onChange={(e) => handleChange('dateOfBirth', e.target.value)} />
        <input className="rounded border border-slate-300 p-2" placeholder="Reason for applying" value={formData.reasonForApplying} onChange={(e) => handleChange('reasonForApplying', e.target.value)} />
        <input className="rounded border border-slate-300 p-2" placeholder="Passport Number" value={formData.passportNumber} onChange={(e) => handleChange('passportNumber', e.target.value)} />
        <input className="rounded border border-slate-300 p-2" placeholder="Country of Citizenship" value={formData.countryOfCitizenship} onChange={(e) => handleChange('countryOfCitizenship', e.target.value)} />
        <textarea className="rounded border border-slate-300 p-2 md:col-span-2" placeholder="Mailing Address" rows={3} value={formData.mailingAddress} onChange={(e) => handleChange('mailingAddress', e.target.value)} />
        <input className="rounded border border-slate-300 p-2" placeholder="Phone Number" value={formData.phoneNumber} onChange={(e) => handleChange('phoneNumber', e.target.value)} />
        <input className="rounded border border-slate-300 p-2" placeholder="Email" type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} />
      </div>

      <div className="mt-6 rounded bg-slate-50 p-4 text-sm text-slate-700">
        <strong>IRS references used:</strong> Form W-7 instructions, supporting documentation guidance, and in-person ITIN document review locations.
      </div>
    </div>
  );
}
