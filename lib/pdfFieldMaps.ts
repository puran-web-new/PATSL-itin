// Verified AcroForm field names for the official IRS PDFs bundled in public/templates.
//
// F1040_FIELDS was reverse-engineered from the real "2024 Form 1040" (confirmed via
// PDFDocument.getTitle()) using a published open-source field map + calculation script
// (github.com/wickedest/irs-form-filler, src/maps/f1040-map.yaml + src/scripts/f1040.yaml),
// cross-checked against the form's own field ordering. Only fields we could verify with
// high confidence are mapped — some rarely-needed lines (AMT, Schedule 3 credits, exact
// refund routing lines) are intentionally left unmapped rather than guessed.
export const F1040_FIELDS = {
  firstNameMI: 'topmostSubform[0].Page1[0].f1_04[0]',
  lastName: 'topmostSubform[0].Page1[0].f1_05[0]',
  ssn: 'topmostSubform[0].Page1[0].f1_06[0]',
  spouseFirstMI: 'topmostSubform[0].Page1[0].f1_07[0]',
  spouseLastName: 'topmostSubform[0].Page1[0].f1_08[0]',
  spouseSsn: 'topmostSubform[0].Page1[0].f1_09[0]',

  street: 'topmostSubform[0].Page1[0].Address_ReadOrder[0].f1_10[0]',
  apt: 'topmostSubform[0].Page1[0].Address_ReadOrder[0].f1_11[0]',
  city: 'topmostSubform[0].Page1[0].Address_ReadOrder[0].f1_12[0]',
  state: 'topmostSubform[0].Page1[0].Address_ReadOrder[0].f1_13[0]',
  zip: 'topmostSubform[0].Page1[0].Address_ReadOrder[0].f1_14[0]',
  foreignCountry: 'topmostSubform[0].Page1[0].Address_ReadOrder[0].f1_15[0]',
  foreignProvince: 'topmostSubform[0].Page1[0].Address_ReadOrder[0].f1_16[0]',
  foreignPostal: 'topmostSubform[0].Page1[0].Address_ReadOrder[0].f1_17[0]',

  filingStatus: {
    SINGLE: 'topmostSubform[0].Page1[0].FilingStatus_ReadOrder[0].c1_3[0]',
    MARRIED_FILING_JOINTLY: 'topmostSubform[0].Page1[0].FilingStatus_ReadOrder[0].c1_3[1]',
    MARRIED_FILING_SEPARATELY: 'topmostSubform[0].Page1[0].FilingStatus_ReadOrder[0].c1_3[2]',
    HEAD_OF_HOUSEHOLD: 'topmostSubform[0].Page1[0].c1_3[0]',
    QUALIFYING_SURVIVING_SPOUSE: 'topmostSubform[0].Page1[0].c1_3[1]',
  },

  digitalAssetsYes: 'topmostSubform[0].Page1[0].c1_5[0]',
  digitalAssetsNo: 'topmostSubform[0].Page1[0].c1_5[1]',

  dependentsOverflow: 'topmostSubform[0].Page1[0].Dependents_ReadOrder[0].c1_13[0]',
  dependentRows: [
    { name: 'topmostSubform[0].Page1[0].Table_Dependents[0].Row1[0].f1_20[0]', ssn: 'topmostSubform[0].Page1[0].Table_Dependents[0].Row1[0].f1_21[0]', relationship: 'topmostSubform[0].Page1[0].Table_Dependents[0].Row1[0].f1_22[0]', ctc: 'topmostSubform[0].Page1[0].Table_Dependents[0].Row1[0].c1_14[0]', odc: 'topmostSubform[0].Page1[0].Table_Dependents[0].Row1[0].c1_15[0]' },
    { name: 'topmostSubform[0].Page1[0].Table_Dependents[0].Row2[0].f1_23[0]', ssn: 'topmostSubform[0].Page1[0].Table_Dependents[0].Row2[0].f1_24[0]', relationship: 'topmostSubform[0].Page1[0].Table_Dependents[0].Row2[0].f1_25[0]', ctc: 'topmostSubform[0].Page1[0].Table_Dependents[0].Row2[0].c1_16[0]', odc: 'topmostSubform[0].Page1[0].Table_Dependents[0].Row2[0].c1_17[0]' },
    { name: 'topmostSubform[0].Page1[0].Table_Dependents[0].Row3[0].f1_26[0]', ssn: 'topmostSubform[0].Page1[0].Table_Dependents[0].Row3[0].f1_27[0]', relationship: 'topmostSubform[0].Page1[0].Table_Dependents[0].Row3[0].f1_28[0]', ctc: 'topmostSubform[0].Page1[0].Table_Dependents[0].Row3[0].c1_18[0]', odc: 'topmostSubform[0].Page1[0].Table_Dependents[0].Row3[0].c1_19[0]' },
    { name: 'topmostSubform[0].Page1[0].Table_Dependents[0].Row4[0].f1_29[0]', ssn: 'topmostSubform[0].Page1[0].Table_Dependents[0].Row4[0].f1_30[0]', relationship: 'topmostSubform[0].Page1[0].Table_Dependents[0].Row4[0].f1_31[0]', ctc: 'topmostSubform[0].Page1[0].Table_Dependents[0].Row4[0].c1_20[0]', odc: 'topmostSubform[0].Page1[0].Table_Dependents[0].Row4[0].c1_21[0]' },
  ],

  wages1a: 'topmostSubform[0].Page1[0].f1_32[0]',
  line1z: 'topmostSubform[0].Page1[0].f1_41[0]',
  totalIncome9: 'topmostSubform[0].Page1[0].Line4a-11_ReadOrder[0].f1_54[0]',
  adjustments10: 'topmostSubform[0].Page1[0].Line4a-11_ReadOrder[0].f1_55[0]',
  agi11: 'topmostSubform[0].Page1[0].Line4a-11_ReadOrder[0].f1_56[0]',
  standardDeduction12: 'topmostSubform[0].Page1[0].f1_57[0]',
  totalDeductions14: 'topmostSubform[0].Page1[0].f1_59[0]',
  taxableIncome15: 'topmostSubform[0].Page1[0].f1_60[0]',

  tax16: 'topmostSubform[0].Page2[0].f2_02[0]',
  totalTax24: 'topmostSubform[0].Page2[0].f2_10[0]',
  totalPayments33: 'topmostSubform[0].Page2[0].f2_22[0]',
  amountYouOwe37: 'topmostSubform[0].Page2[0].f2_28[0]',

  occupation: 'topmostSubform[0].Page2[0].f2_33[0]',
  phone: 'topmostSubform[0].Page2[0].f2_37[0]',
  email: 'topmostSubform[0].Page2[0].f2_38[0]',
} as const;

// Verified AcroForm field names for the official "Form W-7 (Rev. December 2024)"
// bundled at public/templates/fW7.pdf. Confirmed by filling every field with its own
// name and rendering the page to an image for visual cross-check against the real
// form layout (not guessed from the cryptic Adobe field names alone).
export const W7_FIELD_MAP = {
  applyNew: 'topmostSubform[0].Page1[0].c1_1[0]',
  renewExisting: 'topmostSubform[0].Page1[0].c1_1[1]',

  reason: {
    a: 'topmostSubform[0].Page1[0].c1_2[0]',
    b: 'topmostSubform[0].Page1[0].c1_3[0]',
    c: 'topmostSubform[0].Page1[0].c1_4[0]',
    d: 'topmostSubform[0].Page1[0].c1_5[0]',
    e: 'topmostSubform[0].Page1[0].c1_6[0]',
    f: 'topmostSubform[0].Page1[0].c1_7[0]',
    g: 'topmostSubform[0].Page1[0].c1_8[0]',
    h: 'topmostSubform[0].Page1[0].c1_9[0]',
  },
  dependentRelationship: 'topmostSubform[0].Page1[0].f1_01[0]',
  usCitizenName: 'topmostSubform[0].Page1[0].f1_02[0]',
  usCitizenSsnOrItin: 'topmostSubform[0].Page1[0].f1_03[0]',
  reasonOtherDetails: 'topmostSubform[0].Page1[0].f1_04[0]',
  treatyCountry: 'topmostSubform[0].Page1[0].f1_05[0]',
  treatyArticleNumber: 'topmostSubform[0].Page1[0].f1_06[0]',

  firstName: 'topmostSubform[0].Page1[0].f1_07[0]',
  middleName: 'topmostSubform[0].Page1[0].f1_08[0]',
  lastName: 'topmostSubform[0].Page1[0].f1_09[0]',
  birthFirstName: 'topmostSubform[0].Page1[0].f1_10[0]',
  birthMiddleName: 'topmostSubform[0].Page1[0].f1_11[0]',
  birthLastName: 'topmostSubform[0].Page1[0].f1_12[0]',

  mailingLine1: 'topmostSubform[0].Page1[0].f1_13[0]',
  mailingLine2: 'topmostSubform[0].Page1[0].f1_14[0]',
  foreignLine1: 'topmostSubform[0].Page1[0].f1_15[0]',
  foreignLine2: 'topmostSubform[0].Page1[0].f1_16[0]',

  dateOfBirth: 'topmostSubform[0].Page1[0].Line4_ReadOrder[0].f1_17[0]',
  countryOfBirth: 'topmostSubform[0].Page1[0].f1_18[0]',
  birthCityState: 'topmostSubform[0].Page1[0].f1_19[0]',
  sexMale: 'topmostSubform[0].Page1[0].c1_10[0]',
  sexFemale: 'topmostSubform[0].Page1[0].c1_10[1]',

  countryOfCitizenship: 'topmostSubform[0].Page1[0].f1_20[0]',
  foreignTaxId: 'topmostSubform[0].Page1[0].f1_21[0]',
  visaInfo: 'topmostSubform[0].Page1[0].f1_22[0]',

  idDoc: {
    passport: 'topmostSubform[0].Page1[0].c1_11[0]',
    driversLicense: 'topmostSubform[0].Page1[0].c1_11[1]',
    uscis: 'topmostSubform[0].Page1[0].c1_11[2]',
    other: 'topmostSubform[0].Page1[0].c1_11[3]',
  },
  idOtherDescription: 'topmostSubform[0].Page1[0].f1_23[0]',
  idIssuedBy: 'topmostSubform[0].Page1[0].Issued_ReadOrder[0].f1_24[0]',
  idNumber: 'topmostSubform[0].Page1[0].Issued_ReadOrder[0].f1_25[0]',
  idExpirationDate: 'topmostSubform[0].Page1[0].Issued_ReadOrder[0].f1_26[0]',
  dateOfEntryUs: 'topmostSubform[0].Page1[0].f1_27[0]',

  previousItinKnownNo: 'topmostSubform[0].Page1[0].c1_12[0]',
  previousItinKnownYes: 'topmostSubform[0].Page1[0].c1_12[1]',
  previousItin: [
    'topmostSubform[0].Page1[0].ITIN[0].f1_28[0]',
    'topmostSubform[0].Page1[0].ITIN[0].f1_29[0]',
    'topmostSubform[0].Page1[0].ITIN[0].f1_30[0]',
  ],
  previousIrsn: [
    'topmostSubform[0].Page1[0].IRSN[0].f1_31[0]',
    'topmostSubform[0].Page1[0].IRSN[0].f1_32[0]',
    'topmostSubform[0].Page1[0].IRSN[0].f1_33[0]',
  ],
  previousNameFirst: 'topmostSubform[0].Page1[0].f1_34[0]',
  previousNameMiddle: 'topmostSubform[0].Page1[0].f1_35[0]',
  previousNameLast: 'topmostSubform[0].Page1[0].f1_36[0]',

  schoolOrCompanyName: 'topmostSubform[0].Page1[0].f1_37[0]',
  schoolCityState: 'topmostSubform[0].Page1[0].f1_38[0]',
  lengthOfStay: 'topmostSubform[0].Page1[0].f1_39[0]',

  applicantPhone: 'topmostSubform[0].Page1[0].f1_40[0]',
  delegateName: 'topmostSubform[0].Page1[0].f1_41[0]',
  delegateRelationship: {
    parent: 'topmostSubform[0].Page1[0].c1_13[0]',
    powerOfAttorney: 'topmostSubform[0].Page1[0].c1_13[1]',
    courtAppointedGuardian: 'topmostSubform[0].Page1[0].c1_13[2]',
  },

  aaPhone: 'topmostSubform[0].Page1[0].f1_42[0]',
  aaFax: 'topmostSubform[0].Page1[0].f1_43[0]',
  aaNameAndTitle: 'topmostSubform[0].Page1[0].f1_44[0]',
  aaCompanyName: 'topmostSubform[0].Page1[0].f1_45[0]',
  aaEin: 'topmostSubform[0].Page1[0].f1_46[0]',
  aaPtin: 'topmostSubform[0].Page1[0].f1_47[0]',
  aaOfficeCode: 'topmostSubform[0].Page1[0].f1_48[0]',
} as const;

// Verified AcroForm field names for the official "Form W-7-COA (Rev. 8-2025)"
// Certificate of Accuracy, bundled at public/templates/fw7coa.pdf. This one ships
// with self-descriptive field names, confirmed the same way as the W-7 above.
export const COA_FIELD_MAP = {
  theUndersigned: 'topmostSubform[0].page1[0].theUndersigned[0]',
  businessName: 'topmostSubform[0].page1[0].businessName[0]',
  datedMonth: 'topmostSubform[0].page1[0].datedMonth[0]',
  datedDay: 'topmostSubform[0].page1[0].datedDay[0]',
  datedYear: 'topmostSubform[0].page1[0].datedYear[0]',
  applicantsName: 'topmostSubform[0].page1[0].applicantsName[0]',
  signatureResponsible: 'topmostSubform[0].page1[0].signatureResponsibleParty[0]',
  dateResponsibleParty: 'topmostSubform[0].page1[0].dateResponsibleParty[0]',
  acceptanceAgentEIN: 'topmostSubform[0].page1[0].acceptanceAgentEIN[0]',
  agentCode: 'topmostSubform[0].page1[0].agentCode[0]',
  agentPTIN: 'topmostSubform[0].page1[0].agentPTIN[0]',
  // Supporting documentation table — 13 rows, each with an Identity and a Foreign
  // Status checkbox column, in the order printed on the form.
  docRows: {
    PASSPORT: 1, NATIONAL_ID: 2, US_DRIVERS_LICENSE: 3, CIVIL_BIRTH_CERTIFICATE: 4,
    MEDICAL_RECORDS: 5, FOREIGN_DRIVERS_LICENSE: 6, US_STATE_ID: 7, FOREIGN_VOTER_ID: 8,
    US_MILITARY_ID: 9, FOREIGN_MILITARY_ID: 10, SCHOOL_RECORDS: 11, VISA: 12, USCIS: 13,
  },
} as const;

export function coaRowField(row: number, column: 'identity' | 'foreignStatus') {
  return `topmostSubform[0].page1[0].supportingDocumentation[0].Row${row}[0].${column}[0]`;
}
