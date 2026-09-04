// Single source-of-truth "case file" for one application. Every field here can be
// filled once by staff in the admin "Prepare Application" workspace and is then
// reused across the W-7, Certificate of Accuracy, and Form 1040 documents instead
// of re-entering the same information three times.

export type Dependent = {
  firstLast: string;
  ssnOrItin: string;
  relationship: string;
  childTaxCredit: boolean;
  creditForOtherDependents: boolean;
};

export type CaseData = {
  // --- Identity (shared across all documents) ---
  firstName: string;
  middleName: string;
  lastName: string;
  nameAtBirth: string;
  dateOfBirth: string; // YYYY-MM-DD
  countryOfBirth: string;
  birthCityState: string;
  sex: 'MALE' | 'FEMALE' | '';
  countryOfCitizenship: string;

  // --- Reason for applying (Form W-7) ---
  reasonCodes: string[]; // subset of a,b,c,d,e,f,g,h
  reasonOtherDetails: string;
  treatyCountry: string;
  treatyArticleNumber: string;
  dependentRelationship: string; // for reason d
  usCitizenName: string; // for reason d/e
  usCitizenSsnOrItin: string; // for reason d/e

  // --- Addresses ---
  mailingStreet: string;
  mailingAptOrRoute: string;
  mailingCity: string;
  mailingState: string;
  mailingZip: string;
  foreignStreet: string;
  foreignCity: string;
  foreignProvince: string;
  foreignPostalCode: string;
  foreignCountry: string;

  // --- Identification document ---
  idDocType: 'PASSPORT' | 'NATIONAL_ID' | 'DRIVERS_LICENSE' | 'USCIS' | 'OTHER';
  idIssuedBy: string;
  idNumber: string;
  idExpirationDate: string;
  dateOfEntryUs: string;
  foreignTaxId: string;
  visaType: string;
  visaNumber: string;
  visaExpirationDate: string;
  previousItinOrIrsn: string;

  // --- School / sponsor (Form W-7 line 6g — for F/J/M/Q visa holders) ---
  schoolOrCompanyName: string;
  schoolCityState: string;
  lengthOfStay: string;

  // --- Contact ---
  phone: string;
  email: string;
  occupation: string;

  // --- Certificate of Accuracy (CAA use only) ---
  caaBusinessName: string;
  caaEin: string;
  caaPtin: string;
  caaOfficeCode: string;
  caaReviewerName: string;
  caaReviewerTitle: string;
  documentsReviewedSummary: string;

  // --- Form 1040: filing ---
  filingStatus: 'SINGLE' | 'MARRIED_FILING_JOINTLY' | 'MARRIED_FILING_SEPARATELY' | 'HEAD_OF_HOUSEHOLD' | 'QUALIFYING_SURVIVING_SPOUSE' | '';
  digitalAssets: 'YES' | 'NO' | '';
  dependents: Dependent[];

  // --- Form 1040: income & tax (staff enters final reviewed figures) ---
  wagesLine1a: string;
  otherIncomeTotal: string;
  adjustmentsToIncome: string;
  standardDeduction: string;
  taxAmount: string;
  federalWithholding: string;
  estimatedTaxPayments: string;
  refundRoutingNumber: string;
  refundAccountNumber: string;
  refundAccountType: 'CHECKING' | 'SAVINGS' | '';

  // --- Signature ---
  signatureDate: string;

  // --- Invoice & payment (defaults to the real Square order on file; override
  //     only for cases paid outside Square, e.g. cash/check walk-ins) ---
  invoiceNumber: string;
  paymentMethod: string;
  serviceFeeOverride: string;
};

export const emptyCaseData: CaseData = {
  firstName: '', middleName: '', lastName: '', nameAtBirth: '',
  dateOfBirth: '', countryOfBirth: '', birthCityState: '', sex: '', countryOfCitizenship: '',

  reasonCodes: [], reasonOtherDetails: '', treatyCountry: '', treatyArticleNumber: '',
  dependentRelationship: '', usCitizenName: '', usCitizenSsnOrItin: '',

  mailingStreet: '', mailingAptOrRoute: '', mailingCity: '', mailingState: '', mailingZip: '',
  foreignStreet: '', foreignCity: '', foreignProvince: '', foreignPostalCode: '', foreignCountry: '',

  idDocType: 'PASSPORT', idIssuedBy: '', idNumber: '', idExpirationDate: '', dateOfEntryUs: '',
  foreignTaxId: '', visaType: '', visaNumber: '', visaExpirationDate: '', previousItinOrIrsn: '',

  schoolOrCompanyName: '', schoolCityState: '', lengthOfStay: '',

  phone: '', email: '', occupation: '',

  caaBusinessName: 'Puran Accounting & Tax Solution Lab', caaEin: '', caaPtin: '', caaOfficeCode: '',
  caaReviewerName: '', caaReviewerTitle: 'Certified Acceptance Agent', documentsReviewedSummary: '',

  filingStatus: '', digitalAssets: '', dependents: [],

  wagesLine1a: '', otherIncomeTotal: '', adjustmentsToIncome: '', standardDeduction: '',
  taxAmount: '', federalWithholding: '', estimatedTaxPayments: '',
  refundRoutingNumber: '', refundAccountNumber: '', refundAccountType: '',

  signatureDate: '',

  invoiceNumber: '', paymentMethod: '', serviceFeeOverride: '',
};

const STANDARD_DEDUCTION_2024: Record<string, number> = {
  SINGLE: 14600,
  MARRIED_FILING_SEPARATELY: 14600,
  MARRIED_FILING_JOINTLY: 29200,
  QUALIFYING_SURVIVING_SPOUSE: 29200,
  HEAD_OF_HOUSEHOLD: 21900,
};

function toNumber(value: string | undefined): number {
  const n = Number(String(value || '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

// Pure arithmetic only — this intentionally does NOT calculate tax liability from
// income (that requires the IRS Tax Table / Tax Computation Worksheet). Staff enter
// the reviewed tax amount directly; this just totals the numbers they've already
// provided so the same subtotal appears consistently everywhere it's printed.
export function deriveFinancials(data: CaseData) {
  const wages = toNumber(data.wagesLine1a);
  const otherIncome = toNumber(data.otherIncomeTotal);
  const totalIncome = wages + otherIncome;
  const adjustments = toNumber(data.adjustmentsToIncome);
  const agi = Math.max(0, totalIncome - adjustments);
  const standardDeduction = data.standardDeduction
    ? toNumber(data.standardDeduction)
    : STANDARD_DEDUCTION_2024[data.filingStatus] || 0;
  const taxableIncome = Math.max(0, agi - standardDeduction);
  const tax = toNumber(data.taxAmount);
  const withholding = toNumber(data.federalWithholding);
  const estimatedPayments = toNumber(data.estimatedTaxPayments);
  const totalPayments = withholding + estimatedPayments;
  const refund = Math.max(0, totalPayments - tax);
  const amountOwed = Math.max(0, tax - totalPayments);

  return {
    wages, otherIncome, totalIncome, adjustments, agi, standardDeduction,
    taxableIncome, tax, withholding, estimatedPayments, totalPayments, refund, amountOwed,
  };
}

export const REASON_LABELS: Record<string, string> = {
  a: 'Nonresident alien required to get an ITIN to claim tax treaty benefit',
  b: 'Nonresident alien filing a U.S. federal tax return',
  c: 'U.S. resident alien (based on days present) filing a U.S. federal tax return',
  d: 'Dependent of U.S. citizen/resident alien',
  e: 'Spouse of U.S. citizen/resident alien',
  f: 'Nonresident alien student, professor, or researcher',
  g: 'Dependent/spouse of a nonresident alien holding a U.S. visa',
  h: 'Other',
};


export type ApplicationSourceRow = {
  w7_data?: any;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  date_of_birth?: string | null;
  country_of_citizenship?: string | null;
  mailing_address?: string | null;
  foreign_address?: string | null;
};

// Shared by the admin case-data editor (client) and the package generator (server) so
// both read application.w7_data the same way, whether it already holds the new CaseData
// shape or the older raw intake payload from before this editor existed.
export function hydrateCaseData(app: ApplicationSourceRow): CaseData {
  const stored = app.w7_data || {};
  const looksLikeCaseData = 'firstName' in stored && 'reasonCodes' in stored;
  if (looksLikeCaseData) {
    return { ...emptyCaseData, ...stored, dependents: stored.dependents || [] };
  }
  const legacyReasonMap: Record<string, string[]> = {
    STANDARD_RETURN: ['b'],
    EXCEPTION_1A_PARTNERSHIP: ['a'],
    TAX_TREATY: ['a'],
  };
  return {
    ...emptyCaseData,
    firstName: stored.firstName || app.first_name || '',
    middleName: stored.middleName || '',
    lastName: stored.lastName || app.last_name || '',
    email: stored.email || app.email || '',
    phone: stored.phone || app.phone || '',
    dateOfBirth: stored.dateOfBirth || app.date_of_birth || '',
    countryOfCitizenship: stored.countryOfCitizenship || app.country_of_citizenship || '',
    mailingStreet: stored.mailingAddress || app.mailing_address || '',
    foreignStreet: stored.foreignAddress || app.foreign_address || '',
    reasonCodes: legacyReasonMap[stored.exceptionType] || [],
  };
}
