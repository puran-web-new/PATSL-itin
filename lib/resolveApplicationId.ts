import { query } from './db';
import { referencePrefix } from './applicationReference';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function resolveApplicationId(input: string) {
  const id = String(input || '').trim();
  if (!id) return null;
  if (UUID_REGEX.test(id)) return id;
  const prefix = referencePrefix(id);
  if (!prefix) return null;
  const { rows } = await query(
    `SELECT id FROM applications WHERE replace(id::text, '-', '') LIKE $1 LIMIT 1`,
    [`${prefix}%`]
  );
  if (rows && rows[0]) return rows[0].id;
  return null;
}
