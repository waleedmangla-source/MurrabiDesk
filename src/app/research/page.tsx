import React from 'react';
import ResearchEngine from '@/components/research/ResearchEngine';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Theological Research — Murabbi Desk OS",
  description: "Unified multi-source Ahmadiyya research and citations engine."
};

export default function ResearchPage() {
  return (
    <div className="min-h-screen w-full custom-scrollbar overflow-y-auto">
      <ResearchEngine />
    </div>
  );
}
