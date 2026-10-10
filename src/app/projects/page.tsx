import React from 'react';
import ProjectsManager from '@/components/projects/ProjectsManager';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Taleef (Compositions & Manuscripts) — Murabbi Desk OS",
  description: "Synthesize saved research bookmarks into structured speeches, dars lessons, and scholarly treatises."
};

export default function ProjectsPage() {
  return (
    <div className="h-full flex-1 min-h-0 w-full overflow-hidden">
      <ProjectsManager />
    </div>
  );
}
