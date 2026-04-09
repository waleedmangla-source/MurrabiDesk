import { liquid } from './sync/bridge';

export class GoogleSyncService {
  constructor() {}

  static async fromLocalStorage() {
    if (typeof window === 'undefined') return null;
    
    const encrypted = localStorage.getItem('google_refresh_token_encrypted');
    
    if (encrypted) {
      try {
        const { decrypted } = await liquid.invoke('decrypt', { encrypted });
        if (decrypted) {
          await liquid.invoke('sync-init', { refreshToken: decrypted });
          return new GoogleSyncService();
        }
      } catch (err) {
        console.error('Failed to decrypt and init sync:', err);
      }
    }

    // Browser Fallback Instance
    return new GoogleSyncService();
  }

  // --- CALENDAR ---
  async getCalendarEvents(forceRefresh = false, timeMin?: string, timeMax?: string) {
    // Segmented cache key for temporal precision
    const cacheKey = (timeMin && timeMax) ? `calendar_${timeMin.split('T')[0]}_${timeMax.split('T')[0]}` : 'calendar';
    
    // Use standard localStorage for cache in Liquid mode
    let cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
    
    if (forceRefresh || !cached) {
      try {
        const events = await liquid.invoke('calendar-list', { timeMin, timeMax });
        if (events) {
          localStorage.setItem(cacheKey, JSON.stringify(events));
          return events;
        }
      } catch (err) {
        console.log('Sync failed: Using cached data if available');
      }
    } else {
      // Background reconciliation
      liquid.invoke('calendar-list', { timeMin, timeMax }).then(events => {
        if (events) {
          localStorage.setItem(cacheKey, JSON.stringify(events));
        }
      }).catch(() => {});
    }

    return cached || [];
  }

  async createCalendarEvent(event: any) {
    const result = await liquid.invoke('calendar-insert', event);
    // Force a cache refresh in the background
    this.getCalendarEvents(true);
    return result;
  }

  // --- GMAIL ---
  async getEmails() {
    const cached = JSON.parse(localStorage.getItem('gmail') || 'null');

    liquid.invoke('gmail-list').then(emails => {
       if (emails) {
          localStorage.setItem('gmail', JSON.stringify(emails));
       }
    }).catch(err => console.log('Offline: Using Gmail Cache'));

    return cached || [];
  }

  async sendEmail(to: string, subject: string, body: string, attachments: any[] = []) {
    return liquid.invoke('gmail-send', { to, subject, body, attachments });
  }

  async archiveEmail(id: string) {
    return liquid.invoke('gmail-archive', id);
  }

  async trashEmail(id: string) {
    return liquid.invoke('gmail-trash', id);
  }

  async markAsRead(id: string) {
    return liquid.invoke('gmail-mark-read', id);
  }

  // --- NOTES (DRIVE) ---
  async listNotes() {
    const cached = JSON.parse(localStorage.getItem('notes') || 'null');

    liquid.invoke('list-notes').then(notes => {
       if (notes) {
          localStorage.setItem('notes', JSON.stringify(notes));
       }
    }).catch(err => console.log('Offline: Using Notes Cache'));

    return cached || [];
  }

  async getNoteContent(fileId: string) {
    return liquid.invoke('get-note-content', fileId);
  }

  async saveNote(name: string, content: string, fileId?: string) {
    return liquid.invoke('save-note', { name, content, fileId });
  }

  // --- MISSION NOTES (CLOUD) ---
  async fetchMissionNotes() {
    return liquid.invoke('fetch-mission-notes');
  }

  async syncMissionNotes(content: string) {
    return liquid.invoke('sync-mission-notes', { content });
  }

  static async getUserProfile(): Promise<any> {
    try {
      const info = await liquid.invoke('get-user-info');
      if (info) {
        localStorage.setItem('cached_user_profile', JSON.stringify(info));
      }
      return info;
    } catch (error) {
      console.error('Failed to fetch user profile, trying cache:', error);
      return JSON.parse(localStorage.getItem('cached_user_profile') || 'null');
    }
  }

  static async logout(): Promise<void> {
    if (typeof window === 'undefined') return;
    
    // Clear tokens & profiles from LocalStorage
    localStorage.removeItem('google_refresh_token_encrypted');
    localStorage.removeItem('cached_user_profile');
    
    // Clear all service caches
    const cachedKeys = Object.keys(localStorage).filter(k => k.startsWith('cache_') || k.startsWith('calendar') || k === 'gmail' || k === 'notes');
    cachedKeys.forEach(k => localStorage.removeItem(k));

    // Clear Electron-side internal store & session
    await liquid.invoke('logout');
  }
}


