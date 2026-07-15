'use client';

import { useState } from 'react';

export default function TaxFormsWizard({ applicationId }: { applicationId?: string }) {
  const [activeTab, setActiveTab] = useState<'personal' | 'address' | 'reason' | 'documents'>('personal');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    localStreet: '',
    foreignStreet: '',
    reason: 'a',
    docType: 'passport'
  });

  const handleSave = async () => {
    // API Post to save state to Supabase/Neon
    await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 text-gray-900">
      {/* Tab Headers */}
      <div className="flex border-b border-gray-200 mb-6">
        {(['personal', 'address', 'reason', 'documents'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 px-4 font-semibold capitalize border-b-2 transition-all ${
              activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Body */}
      {activeTab === 'personal' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800">Applicant Name Info</h3>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="First Name"
              className="p-2 border rounded"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            />
            <input
              type="text"
              placeholder="Last Name"
              className="p-2 border rounded"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            />
          </div>
        </div>
      )}

      {activeTab === 'address' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800">Address History</h3>
          <input
            type="text"
            placeholder="US Mailing Address"
            className="w-full p-2 border rounded"
            value={formData.localStreet}
            onChange={(e) => setFormData({ ...formData, localStreet: e.target.value })}
          />
        </div>
      )}

      {activeTab === 'reason' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800">IRS Reason Code</h3>
          <select
            className="w-full p-2 border rounded"
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          >
            <option value="a">a. Nonresident alien claiming treaty benefits</option>
            <option value="b">b. Nonresident alien filing US return</option>
            <option value="c">c. US Resident alien filing US return</option>
          </select>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800">ID Documentation (W-7 COA Checklist)</h3>
          <select
            className="w-full p-2 border rounded"
            value={formData.docType}
            onChange={(e) => setFormData({ ...formData, docType: e.target.value })}
          >
            <option value="passport">Passport (Standalone Proof)</option>
            <option value="birth_cert">Civil Birth Certificate</option>
          </select>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700">
          Save Progress
        </button>
      </div>
    </div>
  );
}