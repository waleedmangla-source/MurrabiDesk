export {};

declare global {
  interface Window {
    electron?: {
      encryptString: (plainText: string) => Promise<string>;
      decryptString: (encryptedBase64: string) => Promise<string>;
      
      // Authentication & Sync
      authExchangeCode: (code: string) => Promise<any>;
      syncInit: (refreshToken: string) => Promise<any>;
      calendarList: (params?: { timeMin?: string, timeMax?: string }) => Promise<any[]>;
      calendarInsert: (event: any) => Promise<any>;
      gmailList: () => Promise<any[]>;
      gmailSend: (data: { to: string, subject: string, body: string, attachments?: { filename: string, data: string, mimeType: string }[] }) => Promise<any>;
      gmailArchive: (id: string) => Promise<any>;
      gmailTrash: (id: string) => Promise<any>;
      gmailMarkRead: (id: string) => Promise<any>;
      fetchMissionNotes: () => Promise<string>;
      syncMissionNotes: (content: string) => Promise<any>;
      listNotes: () => Promise<any[]>;
      getNoteContent: (fileId: string) => Promise<string>;
      saveNote: (data: { name: string, content: string, fileId?: string }) => Promise<any>;
      logout: () => Promise<void>;
      getUserInfo: () => Promise<any>;

      // Window Controls
      minimize: () => void;
      maximize: () => void;
      close: () => void;

      // Local Cache Bridge
      localStoreSave: (key: string, data: any) => Promise<{ success: boolean }>;
      localStoreLoad: (key: string) => Promise<any>;
    };
  }
}
