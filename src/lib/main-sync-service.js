let electron;
try {
    electron = require('electron');
} catch (e) {
    // Pure Node environment
    electron = { ipcMain: { handle: () => {}, on: () => {} }, safeStorage: { isEncryptionAvailable: () => false } };
}
const { ipcMain, safeStorage } = electron;
const { google } = require('googleapis');

class MainSyncService {
  constructor(clientId, clientSecret, redirectUri) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri;
    this.oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  }

  setRefreshToken(token) {
    this.oauth2Client.setCredentials({ refresh_token: token });
  }

  async getUserInfo() {
    try {
      const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
      const res = await oauth2.userinfo.get();
      console.log('MainSyncService: User identity retrieved for:', res.data.email);
      return res.data;
    } catch (error) {
      console.error('MainSyncService: UserInfo Retrieval Error:', error.message);
      if (error.message.includes('insufficient permissions')) {
        console.error('CRITICAL: Re-authorization required for Profile Scopes (openid, email, profile).');
      }
      throw error;
    }
  }

  async getCalendarEvents(timeMin = new Date().toISOString(), timeMax) {
    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
    const params = {
      calendarId: 'primary',
      timeMin,
      maxResults: 100,
      singleEvents: true,
      orderBy: 'startTime',
    };
    if (timeMax) params.timeMax = timeMax;

    const res = await calendar.events.list(params);
    return res.data.items || [];
  }

  async createCalendarEvent(event) {
    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
    const res = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });
    return res.data;
  }

  async getEmails() {
    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
    const res = await gmail.users.messages.list({ userId: 'me', maxResults: 10 });
    if (!res.data.messages) return [];

    const details = await Promise.all(
      res.data.messages.map(msg => gmail.users.messages.get({ userId: 'me', id: msg.id }))
    );

    return details.map(d => d.data);
  }

  async sendEmail(to, subject, body, attachments = []) {
    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
    
    // Use nodemailer for robust MIME generation
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      streamTransport: true,
      newline: 'unix',
      buffer: true
    });

    const mailOptions = {
      from: 'me',
      to,
      subject,
      html: body,
      attachments: (attachments || []).map(att => ({
        filename: att.filename,
        content: Buffer.from(att.data, 'base64'),
        contentType: att.mimeType
      }))
    };

    const info = await transporter.sendMail(mailOptions);
    const raw = info.message.toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw },
    });
  }

  async archiveEmail(id) {
    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
    await gmail.users.messages.modify({
      userId: 'me',
      id,
      requestBody: { removeLabelIds: ['INBOX'] },
    });
  }

  async trashEmail(id) {
    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
    await gmail.users.messages.trash({ userId: 'me', id });
  }

  async markAsRead(id) {
    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
    await gmail.users.messages.modify({
      userId: 'me',
      id,
      requestBody: { removeLabelIds: ['UNREAD'] },
    });
  }

  async getSyncFolderId() {
    return this.ensureFolder('MurrabiDeskSync');
  }

  async ensureFolder(name, parentId = null) {
    const drive = google.drive({ version: 'v3', auth: this.oauth2Client });
    let query = `name = '${name}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
    if (parentId) {
      query += ` and '${parentId}' in parents`;
    }
    
    const res = await drive.files.list({
      q: query,
      fields: 'files(id)',
    });

    if (res.data.files && res.data.files.length) return res.data.files[0].id;

    const folderRes = await drive.files.create({
      requestBody: {
        name,
        parents: parentId ? [parentId] : [],
        mimeType: 'application/vnd.google-apps.folder',
      },
      fields: 'id',
    });
    return folderRes.data.id;
  }

  async uploadFile(name, content, mimeType, folderName = null) {
    const drive = google.drive({ version: 'v3', auth: this.oauth2Client });
    const rootFolderId = await this.getSyncFolderId();
    let targetFolderId = rootFolderId;

    if (folderName) {
      targetFolderId = await this.ensureFolder(folderName, rootFolderId);
    }

    // Check if file already exists to update or create
    const existing = await drive.files.list({
      q: `name = '${name}' and '${targetFolderId}' in parents and trashed = false`,
      fields: 'files(id)',
    });

    const media = {
      mimeType,
      body: content, // Can be string or Buffer
    };

    if (existing.data.files && existing.data.files.length) {
      const fileId = existing.data.files[0].id;
      await drive.files.update({
        fileId,
        media,
      });
      return fileId;
    } else {
      const res = await drive.files.create({
        requestBody: {
          name,
          parents: [targetFolderId],
          mimeType,
        },
        media,
        fields: 'id',
      });
      return res.data.id;
    }
  }

  async listNotes() {
    const drive = google.drive({ version: 'v3', auth: this.oauth2Client });
    const folderId = await this.getSyncFolderId();
    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'files(id, name, modifiedTime)',
    });
    return res.data.files || [];
  }

  async getNoteContent(fileId) {
    const drive = google.drive({ version: 'v3', auth: this.oauth2Client });
    const res = await drive.files.get({ fileId, alt: 'media' });
    return res.data;
  }

  async saveNote(name, content, fileId) {
    const drive = google.drive({ version: 'v3', auth: this.oauth2Client });
    const folderId = await this.getSyncFolderId();
    if (fileId) {
      await drive.files.update({
        fileId,
        media: { mimeType: 'text/markdown', body: content },
      });
    } else {
      await drive.files.create({
        requestBody: { name, parents: [folderId], mimeType: 'text/markdown' },
        media: { mimeType: 'text/markdown', body: content },
      });
    }
  }

  async fetchMissionNotes() {
    const drive = google.drive({ version: 'v3', auth: this.oauth2Client });
    const folderId = await this.getSyncFolderId();
    const res = await drive.files.list({
      q: `name = 'mission_notes.txt' and '${folderId}' in parents and trashed = false`,
      fields: 'files(id)',
    });

    if (res.data.files && res.data.files.length) {
      return this.getNoteContent(res.data.files[0].id);
    }
    return "";
  }

  async syncMissionNotes(content) {
    const drive = google.drive({ version: 'v3', auth: this.oauth2Client });
    const folderId = await this.getSyncFolderId();
    const res = await drive.files.list({
      q: `name = 'mission_notes.txt' and '${folderId}' in parents and trashed = false`,
      fields: 'files(id)',
    });

    if (res.data.files && res.data.files.length) {
      await drive.files.update({
        fileId: res.data.files[0].id,
        media: { mimeType: 'text/html', body: content },
      });
    } else {
      await drive.files.create({
        requestBody: { name: 'mission_notes.txt', parents: [folderId], mimeType: 'text/html' },
        media: { mimeType: 'text/html', body: content },
      });
    }
  }

  async createTemplatedDocument(title, templateText) {
    const docs = google.docs({ version: 'v1', auth: this.oauth2Client });
    const drive = google.drive({ version: 'v3', auth: this.oauth2Client });
    
    const res = await docs.documents.create({ requestBody: { title } });
    const documentId = res.data.documentId;
    
    if (templateText) {
      await docs.documents.batchUpdate({
        documentId,
        requestBody: {
          requests: [
            {
              insertText: {
                location: { index: 1 },
                text: templateText
              }
            }
          ]
        }
      });
    }

    try {
      const folderId = await this.getSyncFolderId();
      const file = await drive.files.get({
        fileId: documentId,
        fields: 'parents'
      });
      const previousParents = file.data.parents ? file.data.parents.join(',') : '';

      await drive.files.update({
        fileId: documentId,
        addParents: folderId,
        removeParents: previousParents,
        fields: 'id, parents'
      });
    } catch (err) {
      console.error('MainSyncService: Could not move spawned document to sync folder:', err.message);
    }
    
    return documentId;
  }
}

module.exports = MainSyncService;
