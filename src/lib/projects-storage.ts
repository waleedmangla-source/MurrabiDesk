import { ResearchBookmarkItem } from './research-storage';

export type ProjectType = 'speech' | 'dars' | 'article';

export type ProjectStatus = 'drafting' | 'drafted' | 'planned' | 'in_progress' | 'completed';

export interface ProjectOutlineSection {
  title: string;
  durationOrWords?: string; // e.g. "5 mins" or "350 words"
  summary: string;
  talkingPoints: string[];
  referencedBookmarks: string[]; // Bookmark IDs or titles
}

export interface ProjectAIPlan {
  objective: string;
  targetAudience: string;
  deliveryStrategy: string; // Oratorical guidance for speech, pedagogy for dars, academic tone for article
  keyThemes: string[];
  structureBreakdown: ProjectOutlineSection[];
  pedagogicalTips: string[];
  pitfallsToAvoid: string[];
}

export interface MurabbiProject {
  id: string;
  title: string;
  type: ProjectType;
  description?: string;
  targetAudience?: string;
  language?: 'english' | 'urdu' | 'arabic';
  bookmarks: ResearchBookmarkItem[];
  aiPlan?: ProjectAIPlan | null;
  aiDraft?: string | null;
  userNotes?: string;
  status: ProjectStatus;
  createdAt: number;
  updatedAt: number;
  _driveId?: string;
}

const PROJECTS_LOCAL_KEY = 'murabbi_projects_v1';

export function getLocalProjects(): MurabbiProject[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PROJECTS_LOCAL_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('[Projects Storage] Failed to parse local projects', e);
    return [];
  }
}

export function saveLocalProjects(projects: MurabbiProject[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PROJECTS_LOCAL_KEY, JSON.stringify(projects));
  } catch (e) {
    console.warn('[Projects Storage] Failed to save local projects', e);
  }
}

export function getProjectById(id: string): MurabbiProject | null {
  const projects = getLocalProjects();
  return projects.find(p => p.id === id) || null;
}

export function createNewProject(payload: {
  title: string;
  type: ProjectType;
  description?: string;
  targetAudience?: string;
  language?: 'english' | 'urdu' | 'arabic';
  bookmarks?: ResearchBookmarkItem[];
  aiPlan?: ProjectAIPlan | null;
  aiDraft?: string | null;
}): MurabbiProject {
  const now = Date.now();
  const newProject: MurabbiProject = {
    id: `proj_${now}_${Math.random().toString(36).substring(2, 7)}`,
    title: payload.title.trim() || 'Untitled Project',
    type: payload.type,
    description: payload.description || '',
    targetAudience: payload.targetAudience || 'General Audience',
    language: payload.language || 'english',
    bookmarks: payload.bookmarks || [],
    aiPlan: payload.aiPlan || null,
    aiDraft: payload.aiDraft || null,
    userNotes: '',
    status: 'drafting',
    createdAt: now,
    updatedAt: now,
  };

  const existing = getLocalProjects();
  const updated = [newProject, ...existing];
  saveLocalProjects(updated);
  triggerProjectsDriveSync(updated);

  return newProject;
}

export function updateProjectInStorage(
  id: string,
  updates: Partial<MurabbiProject>
): MurabbiProject | null {
  const existing = getLocalProjects();
  const index = existing.findIndex(p => p.id === id);
  if (index === -1) return null;

  const updatedProject: MurabbiProject = {
    ...existing[index],
    ...updates,
    updatedAt: Date.now(),
  };

  existing[index] = updatedProject;
  saveLocalProjects(existing);
  triggerProjectsDriveSync(existing);

  return updatedProject;
}

export function deleteProjectFromStorage(id: string): void {
  const existing = getLocalProjects();
  const updated = existing.filter(p => p.id !== id);
  saveLocalProjects(updated);
  triggerProjectsDriveSync(updated);
}

let syncTimeout: NodeJS.Timeout | null = null;

/**
 * Debounced synchronization of projects to Google Drive.
 */
export function triggerProjectsDriveSync(projects: MurabbiProject[]) {
  if (typeof window === 'undefined') return;
  const token = localStorage.getItem('google_refresh_token_encrypted');
  if (!token || localStorage.getItem('murabbi_guest_mode') === 'true') {
    return;
  }

  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(async () => {
    try {
      await fetch('/api/brain/projects-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-murabbi-token': token,
        },
        body: JSON.stringify({ projects }),
      });
    } catch (err) {
      console.warn('[Projects Storage] Drive sync error:', err);
    }
  }, 1200);
}

/**
 * Fetches latest projects from Google Drive and merges with localStorage.
 */
export async function syncProjectsFromDrive(): Promise<MurabbiProject[]> {
  const localProjects = getLocalProjects();
  if (typeof window === 'undefined') return localProjects;

  const token = localStorage.getItem('google_refresh_token_encrypted');
  if (!token || localStorage.getItem('murabbi_guest_mode') === 'true') {
    return localProjects;
  }

  try {
    const res = await fetch('/api/brain/projects-sync', {
      method: 'GET',
      headers: {
        'x-murabbi-token': token,
      },
    });

    if (!res.ok) {
      return localProjects;
    }

    const data = await res.json();
    const driveProjects: MurabbiProject[] = Array.isArray(data.projects) ? data.projects : [];

    // Merge by id, keeping newer updatedAt
    const map = new Map<string, MurabbiProject>();
    [...driveProjects, ...localProjects].forEach(proj => {
      const existing = map.get(proj.id);
      if (!existing || proj.updatedAt > existing.updatedAt) {
        map.set(proj.id, proj);
      }
    });

    const merged = Array.from(map.values()).sort((a, b) => b.updatedAt - a.updatedAt);
    saveLocalProjects(merged);
    return merged;
  } catch (err) {
    console.warn('[Projects Storage] Failed to sync projects from Drive:', err);
    return localProjects;
  }
}
