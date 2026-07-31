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

// Once the real fW7.pdf is added to public/templates, run `npm run pdf:fields` and paste
// the real field names here in the same "semantic key -> field name" shape as F1040_FIELDS
// above. Until then, generate-packages falls back to a clearly labeled placeholder page for
// the W-7 (and the CAA Certificate of Accuracy, which has no official IRS PDF at all — it is
// composed from scratch using the required content elements instead).
export const W7_FIELD_MAP: Record<string, string> = {
  // firstName: 'topmostSubform[0]...',
};
