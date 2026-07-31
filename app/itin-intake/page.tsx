import { Suspense } from 'react';
import type { Metadata } from 'next';
import IntakeWizard from '../../components/intake/IntakeWizard';

export const metadata: Metadata = {
  title: 'Start Your ITIN Application',
  description: 'Secure four-step ITIN intake: personal details, case details, identity verification, and payment.',
};

export default function ITINIntakePage() {
  return (
    <Suspense fallback={<div className="container-page py-20 text-center text-sm text-slate-500">Loading application form...</div>}>
      <IntakeWizard />
    </Suspense>
  );
}
