#!/usr/bin/env node
/**
 * AVOLTA_2026 - Sync Drive Every 3 Days
 * Sincronizza una cartella Google Drive nel repository GitHub ogni 3 giorni
 * Folder: https://drive.google.com/drive/folders/1xjsQKJYXq0WtazeemCOmbbsEGRXMD29T
 */

const { GoogleAuth } = require('google-auth-library');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
require('dotenv').config();

class DriveSync3Days {
  constructor() {
    this.config = require('./sync-config-3days.json');
    this.auth = null;
    this.drive = null;
  }

  async setupAuth() {
    try {
      this.auth = new GoogleAuth({
        keyFile: process.env.GOOGLE_KEY_FILE,
        scopes: ['https://www.googleapis.com/auth/drive.readonly']
      });
      this.drive = google.drive({ version: 'v3', auth: this.auth });
      console.log('\u2713 Autenticazione Google Drive completata');
    } catch (err) {
      console.error('\u2717 Errore autenticazione:', err.message);
      process.exit(1);
    }
  }

  async listFolderContents(folderId, pageToken = null) {
    try {
      const { data: result } = await this.drive.files.list({
        q: `'${folderId}' in parents and trashed=false`,
        spaces: 'drive',
        pageSize: 100,
        fields: 'nextPageToken, files(id, name, mimeType, modifiedTime)',
        pageToken: pageToken
      });
      return { files: result.files || [], nextPageToken: result.nextPageToken };
    } catch (err) {
      console.error('Errore lista file:', err.message);
      return { files: [], nextPageToken: null };
    }
  }

  async downloadFile(fileId, fileName, localPath) {
    try {
      const dest = fs.createWriteStream(localPath);
      const { data } = await this.drive.files.get(
        { fileId, alt: 'media' },
        { responseType: 'stream' }
      );
      return new Promise((resolve, reject) => {
        data.on('end', () => {
          console.log(`\u2713 Scaricato: ${fileName}`);
          resolve();
        });
        data.on('error', reject);
        data.pipe(dest);
      });
    } catch (err) {
      console.error(`Errore download ${fileName}:`, err.message);
    }
  }

  async syncFolderRecursive(folderId, localPath) {
    if (!fs.existsSync(localPath)) {
      fs.mkdirSync(localPath, { recursive: true });
    }

    let allFiles = [];
    let pageToken = null;

    do {
      const { files, nextPageToken } = await this.listFolderContents(folderId, pageToken);
      allFiles = allFiles.concat(files);
      pageToken = nextPageToken;
    } while (pageToken);

    for (const file of allFiles) {
      const filePath = path.join(localPath, file.name);
      if (file.mimeType === 'application/vnd.google-apps.folder') {
        await this.syncFolderRecursive(file.id, filePath);
      } else {
        await this.downloadFile(file.id, file.name, filePath);
      }
    }
  }

  async performSync() {
    const timestamp = new Date().toISOString();
    console.log(`\n[${timestamp}] \ud83d\udd04 Avvio sincronizzazione cartella Drive (ogni 3 giorni)...`);
    console.log(`\ud83d\udcc1 Cartella: ${this.config.source.folderName}`);
    console.log(`\ud83d\udcc4 ID: ${this.config.source.folderId}`);

    try {
      const syncPath = path.join(process.cwd(), this.config.destination.path);
      await this.syncFolderRecursive(this.config.source.folderId, syncPath);
      console.log(`\u2713 Sync completato: ${this.config.destination.path}`);
      console.log(`\u23f3 Prossimo sync: tra 3 giorni\n`);
    } catch (err) {
      console.error('Errore sync:', err.message);
    }
  }

  start() {
    console.log('\ud83e\udd16 Agent Sync Drive - AVOLTA_2026');
    console.log('======================================');
    console.log(`Configurazione: ${this.config.syncName}`);
    console.log(`Frequenza: ${this.config.schedule.interval}`);
    console.log(`Cron: ${this.config.schedule.cron}`);
    console.log('');

    // Sync immediato
    this.performSync();

    // Scheduled: ogni 3 giorni (cron: "0 0 */3 * *")
    // Esegui a mezzanotte ogni 3 giorni
    cron.schedule('0 0 */3 * *', () => {
      this.performSync();
    }, {
      timezone: this.config.schedule.timezone
    });

    console.log('\ud83d\udcc5 Prossimo sync programmato (ogni 3 giorni)...');
  }
}

if (require.main === module) {
  const sync = new DriveSync3Days();
  sync.setupAuth().then(() => {
    sync.start();
  }).catch(err => {
    console.error('Errore:', err);
    process.exit(1);
  });
}

module.exports = DriveSync3Days;
