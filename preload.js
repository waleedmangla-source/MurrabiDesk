const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  // Window Controls
  minimize: () => ipcRenderer.send('window-min'),
  maximize: () => ipcRenderer.send('window-max'),
  close: () => ipcRenderer.send('window-close'),

  // Authentication & Sync Init
  authExchangeCode: (code) => ipcRenderer.invoke('auth:exchange-code', code),
  syncInit: (refreshToken) => ipcRenderer.invoke('sync-init', refreshToken),
  logout: () => ipcRenderer.invoke('logout'),
  getUserInfo: () => ipcRenderer.invoke('get-user-info'),

  // Security
  decryptString: (encrypted) => ipcRenderer.invoke('decrypt-string', encrypted),
  encryptString: (plain) => ipcRenderer.invoke('encrypt-string', plain),

  // Storage
  localStoreSave: (key, value) => ipcRenderer.invoke('local-store-save', { key, value }),
  localStoreLoad: (key) => ipcRenderer.invoke('local-store-load', key),

  // Google Services
  calendarList: (params) => ipcRenderer.invoke('calendar-list', params),
  calendarInsert: (event) => ipcRenderer.invoke('calendar-insert', event),
  gmailList: () => ipcRenderer.invoke('gmail-list'),
  gmailSend: (payload) => ipcRenderer.invoke('gmail-send', payload),
  gmailArchive: (id) => ipcRenderer.invoke('gmail-archive', id),
  gmailTrash: (id) => ipcRenderer.invoke('gmail-trash', id),
  gmailMarkRead: (id) => ipcRenderer.invoke('gmail-mark-read', id),
  listNotes: () => ipcRenderer.invoke('list-notes'),
  getNoteContent: (fileId) => ipcRenderer.invoke('get-note-content', fileId),
  saveNote: (payload) => ipcRenderer.invoke('save-note', payload),
  fetchMissionNotes: () => ipcRenderer.invoke('fetch-mission-notes'),
  syncMissionNotes: (content) => ipcRenderer.invoke('sync-mission-notes', content)
});