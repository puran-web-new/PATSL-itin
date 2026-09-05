import { getFirmProfile } from '../../../lib/firmProfile';
import { getClientSession } from '../../../lib/clientAuth';
import { F1040_FIELDS, W7_FIELD_MAP, COA_FIELD_MAP, coaRowField } from '../../../lib/pdfFieldMaps';
import { tierFor } from '../../../lib/pricing';
import { applicationReference } from '../../../lib/applicationReference';
import fs from 'fs/promises';
import path from 'path';

const INK = rgb(0.04, 0.05, 0.12);
const SLATE = rgb(0.35, 0.39, 0.45);
const BRAND = rgb(0.15, 0.32, 0.86);
const GOLD = rgb(0.82, 0.59, 0.15);

async function fileExists(p: string) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

// rest of file unchanged (this commit only adds imports and fileExists helper)
