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
    ein: process.env.CAA_EIN || '333131861',
    ptin: process.env.CAA_PTIN || 'P03318364',
    officeCode: process.env.CAA_OFFICE_CODE || '',
    reviewerName: process.env.CAA_REVIEWER_NAME || 'PURAN RAMRATAN',
    reviewerTitle: process.env.CAA_REVIEWER_TITLE || 'TAX PREPARER',
    phone: process.env.CAA_PHONE || '3474803527',
    email: process.env.CAA_EMAIL || 'ramratan@puranaccountin.com',
    address: process.env.CAA_ADDRESS || '',
  };
}
