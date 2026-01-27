
'use client';

import { LetterGenerator } from "@/components/letter-generator";

export default function DashboardPage() {
  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8">
      <LetterGenerator />
    </div>
  );
}
