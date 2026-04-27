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
    return new GoogleSyncService();
  }
  async getCalendarEvents(forceRefresh = false, timeMin?: string, timeMax?: string) {
    const cacheKey = (timeMin && timeMax) ? `calendar_${timeMin.split('T')[0]}_${timeMax.split('T')[0]}` : 'calendar';
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
    this.getCalendarEvents(true);
    return result;
  }
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
  async fetchMissionNotes() {
    return liquid.invoke('fetch-mission-notes');
  }
  async syncMissionNotes(content: string) {
    return liquid.invoke('sync-mission-notes', { content });
  }
  async uploadFile(name: string, content: any, mimeType: string, folderName?: string, module?: string, category?: string) {
    return liquid.invoke('drive-upload', { name, content, mimeType, folderName, module, category });
  }
  async appendToSheet(values: any[][], spreadsheetId?: string, range?: string) {
    return liquid.invoke('sheets-append', { values, spreadsheetId, range });
  }
  async getSheetsData(spreadsheetId?: string, range?: string) {
    return liquid.invoke('sheets-get', { spreadsheetId, range });
  }
  async createGoogleDoc(title: string, templateText?: string) {
    return liquid.invoke('create-doc', { title, templateText });
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
    localStorage.removeItem('google_refresh_token_encrypted');
    localStorage.removeItem('cached_user_profile');
    localStorage.removeItem('murrabi_guest_mode');
    const cachedKeys = Object.keys(localStorage).filter(k => 
      k.startsWith('cache_') || 
      k.startsWith('calendar') || 
      k.startsWith('gmail') || 
      k.startsWith('notes') ||
      k.includes('token')
    );
    cachedKeys.forEach(k => localStorage.removeItem(k));
    console.log('🧠 [SYNC] Protocol Termination: Local storage purged.');
    try {
      await liquid.invoke('logout');
    } catch (e) {
      console.warn('Cloud logout notification bypass.');
    }
  }
}
