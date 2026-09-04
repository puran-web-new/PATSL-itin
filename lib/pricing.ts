// Single source of truth for service-tier pricing, shared by the Square payment-link
// route and the invoice/receipt generator so the two never drift apart.
export const SERVICE_TIERS: Record<string, { amountCents: number; name: string }> = {
  EXPRESS_SELF_SERVICE: { amountCents: 14900, name: 'Express ITIN Prep - Self Service' },
  CAA_CONCIERGE: { amountCents: 18000, name: 'CAA Concierge ITIN Package' },
  B2B_PORTAL: { amountCents: 9900, name: 'Partner Portal Wholesale ITIN Filing' },
  SUPERIOR_STAFFING: { amountCents: 15000, name: 'Superior Staffing Employee ITIN Package' },
};

export function tierFor(serviceTier: string | null | undefined) {
  return SERVICE_TIERS[serviceTier || ''] || SERVICE_TIERS.CAA_CONCIERGE;
}
