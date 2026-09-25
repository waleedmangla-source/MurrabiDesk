import React from 'react';
import ResearchEngine from '@/components/research/ResearchEngine';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Theological Research — Murabbi Desk OS",
  description: "Unified multi-source Ahmadiyya research and citations engine."
};

export default function ResearchPage() {
  return (
    <div
      id="research-scroll-container"
      className="h-full flex-1 min-h-0 w-full custom-scrollbar overflow-y-auto"
    >
      <ResearchEngine />
    </div>
  );
}
