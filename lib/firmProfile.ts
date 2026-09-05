import { getPool } from './db';

export type FirmProfile = {
  businessName: string;
  ein: string;
  ptin: string;
  officeCode: string;
  reviewerName: string;
  reviewerTitle: string;
  phone: string;
  email: string;
  address: string;
};

export function getFirmProfile(): FirmProfile {
  return {
    businessName: process.env.CAA_BUSINESS_NAME || 'Puran Accounting & Tax Solution Lab',
    ein: process.env.CAA_EIN || '',
    ptin: process.env.CAA_PTIN || '',
    officeCode: process.env.CAA_OFFICE_CODE || '',
    reviewerName: process.env.CAA_REVIEWER_NAME || 'Puran Ramratan, A.S., CAA, ADP-CP',
    reviewerTitle: process.env.CAA_REVIEWER_TITLE || 'Accountant | IRS Tax Preparer & Certified Acceptance Agent',
    phone: process.env.CAA_PHONE || '929-468-3527',
    email: process.env.CAA_EMAIL || 'info@puranaccounting.com',
    address: process.env.CAA_ADDRESS || '',
  };
}

export async function getEditableFirmProfile(): Promise<FirmProfile> {
  const fallback = getFirmProfile();
  try {
    const { rows } = await getPool().query(`SELECT * FROM firm_profile WHERE id = TRUE`);
    const row = rows[0];
    if (!row) return fallback;
    return { businessName: row.business_name, ein: row.ein, ptin: row.ptin, officeCode: row.office_code, reviewerName: row.reviewer_name, reviewerTitle: row.reviewer_title, phone: row.phone, email: row.email, address: row.address };
  } catch {
    return fallback;
  }
}
