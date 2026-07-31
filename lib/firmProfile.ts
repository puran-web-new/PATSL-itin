// Firm-level defaults for the Certified Acceptance Agent section of every case.
// Set these once as environment variables and every new case (and any case that
// hasn't had them overridden) auto-fills with your credentials — nobody has to
// retype the business name, EIN, PTIN, or office code per client.
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
    reviewerName: process.env.CAA_REVIEWER_NAME || 'Puran Ramratan',
    reviewerTitle: process.env.CAA_REVIEWER_TITLE || 'Certified Acceptance Agent',
    phone: process.env.CAA_PHONE || '',
    email: process.env.CAA_EMAIL || '',
    address: process.env.CAA_ADDRESS || '',
  };
}
