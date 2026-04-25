import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
export class SyncService {
  private oauth2Client: any;
  private tokenPath = path.join(process.cwd(), 'data', 'google_token.json');
  constructor(clientId: string, clientSecret: string, redirectUri: string) {
    this.oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    this.loadToken();
  }
  private loadToken() {
    if (fs.existsSync(this.tokenPath)) {
      try {
        const token = JSON.parse(fs.readFileSync(this.tokenPath, 'utf8'));
        this.oauth2Client.setCredentials(token);
      } catch (err) {
        console.error('SyncService: Failed to load token:', err);
      }
    }
  }
  async saveToken(tokens: any) {
    if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
      fs.mkdirSync(path.join(process.cwd(), 'data'), { recursive: true });
    }
    fs.writeFileSync(this.tokenPath, JSON.stringify(tokens, null, 2));
    this.oauth2Client.setCredentials(tokens);
  }
  async setRefreshToken(token: string) {
    this.oauth2Client.setCredentials({ refresh_token: token });
    await this.saveToken({ refresh_token: token });
  }
  async getUserInfo() {
    try {
      const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
      const res = await oauth2.userinfo.get();
      return res.data;
    } catch (error: any) {
      console.error('SyncService: UserInfo Retrieval Error:', error.message);
      throw error;
    }
  }
  async getCalendarEvents(timeMin = new Date().toISOString()) {
    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
    const res = await calendar.events.list({
      calendarId: 'primary',
      timeMin,
      maxResults: 20,
      singleEvents: true,
      orderBy: 'startTime',
    });
    return res.data.items || [];
  }
  async createCalendarEvent(event: any) {
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
      res.data.messages.map(msg => gmail.users.messages.get({ userId: 'me', id: msg.id! }))
    );
    return details.map(d => d.data);
  }
  async sendEmail(to: string, subject: string, body: string) {
    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
    const messageParts = [
      `From: me`,
      `To: ${to}`,
      `Content-Type: text/html; charset=utf-8`,
      `MIME-Version: 1.0`,
      `Subject: ${utf8Subject}`,
      '',
      body,
    ];
    const message = messageParts.join('\n');
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: encodedMessage },
    });
  }
  private async getSyncFolderId() {
    const drive = google.drive({ version: 'v3', auth: this.oauth2Client });
    const res = await drive.files.list({
      q: "name = 'MurrabiDeskSync' and mimeType = 'application/vnd.google-apps.folder'",
      fields: 'files(id)',
    });
    if (res.data.files && res.data.files.length) return res.data.files[0].id;
    const folderRes = await drive.files.create({
      requestBody: {
        name: 'MurrabiDeskSync',
        mimeType: 'application/vnd.google-apps.folder',
      },
      fields: 'id',
    });
    return folderRes.data.id;
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
  async getNoteContent(fileId: string) {
    const drive = google.drive({ version: 'v3', auth: this.oauth2Client });
    const res = (await drive.files.get({ fileId, alt: 'media' })) as any;
    return res.data;
  }
  async saveNote(name: string, content: string, fileId?: string) {
    const drive = google.drive({ version: 'v3', auth: this.oauth2Client });
    const folderId = await this.getSyncFolderId();
    if (fileId) {
      await drive.files.update({
        fileId,
        media: { mimeType: 'text/markdown', body: content },
      });
    } else {
      await drive.files.create({
        requestBody: { name, parents: [folderId!], mimeType: 'text/markdown' },
        media: { mimeType: 'text/markdown', body: content },
      });
    }
  }
  async syncMissionNotes(content: string) {
    const drive = google.drive({ version: 'v3', auth: this.oauth2Client });
    const folderId = await this.getSyncFolderId();
    const res = await drive.files.list({
      q: `name = 'mission_notes.txt' and '${folderId}' in parents and trashed = false`,
      fields: 'files(id)',
    });
    if (res.data.files && res.data.files.length) {
      await drive.files.update({
        fileId: res.data.files[0].id!,
        media: { mimeType: 'text/html', body: content },
      });
    } else {
      await drive.files.create({
        requestBody: { name: 'mission_notes.txt', parents: [folderId!], mimeType: 'text/html' },
        media: { mimeType: 'text/html', body: content },
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
      return this.getNoteContent(res.data.files[0].id!);
    }
    return "";
  }
}
