"use client";

import { useState } from 'react';

export default function TaxFormsWizard() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    reason: '',
    passportNumber: '',
    citizenship: '',
    address: '',
    phone: '',
    email: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="rounded-xl bg-white p-8 shadow-lg">
      <h1 className="mb-6 text-2xl font-semibold">ITIN Application Intake</h1>
      <form className="grid gap-4 md:grid-cols-2">
        <input name="firstName" placeholder="First name" onChange={handleChange} className="rounded border p-3" />
        <input name="lastName" placeholder="Last name" onChange={handleChange} className="rounded border p-3" />
        <input name="dob" type="date" onChange={handleChange} className="rounded border p-3" />
        <select name="reason" onChange={handleChange} className="rounded border p-3">
          <option value="">Select reason</option>
          <option value="tax filing">Tax filing</option>
          <option value="identity">Identity</option>
          <option value="banking">Banking</option>
        </select>
        <input name="passportNumber" placeholder="Passport number" onChange={handleChange} className="rounded border p-3" />
        <input name="citizenship" placeholder="Country of citizenship" onChange={handleChange} className="rounded border p-3" />
        <textarea name="address" placeholder="Mailing address" onChange={handleChange} className="md:col-span-2 rounded border p-3" />
        <input name="phone" placeholder="Phone number" onChange={handleChange} className="rounded border p-3" />
        <input name="email" placeholder="Email" onChange={handleChange} className="rounded border p-3" />
      </form>
    </div>
  );
}
