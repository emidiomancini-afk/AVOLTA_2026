#!/usr/bin/env node
/**
 * AVOLTA_2026 - Sync Drive Every 3 Days
 * Sincronizza una cartella Google Drive nel repository GitHub ogni 3 giorni
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
      const authConfig = {
        scopes: ['https://www.googleapis.com/auth/drive.readonly']
      };
      
      const keyContent = process.env.GOOGLE_KEY_FILE;
      if (keyContent) {
        if (keyContent.trim().startsWith('{')) {
          authConfig.credentials = JSON.parse(keyContent);
        } else {
          authConfig.keyFile = keyContent;
        }
      }

      this.auth = new GoogleAuth(authConfig);
      const authClient = await this.auth.getClient();
      this.drive = google.drive({ version: 'v3', auth: authClient });
      console.log('✓ Autenticazione Google Drive completata');
    } catch (err) {
      console.error('✗ Errore autenticazione:', err.message);
      process.exit(1);
    }
  }

  async listFolderContents(folderId, pageToken = null) {
    try {
      const { data: result } = await this.drive.files.list({
        q: \`${folderId}`in parents and trashed=false\`,
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

  async downloadFile(file, localPath) {
    const { id: fileId, name: fileName, mimeType } = file;
    try {
      let destPath = localPath;
      let response;

      if (mimeType.startsWith('application/vnd.google-apps.')) {
        let exportMimeType;
        let extension;

        if (mimeType.includes('spreadsheet')) {
          exportMimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          extension = '.xlsx';
        } else if (mimeType.includes('document')) {
          exportMimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          extension = '.docx';
        } else if (mimeType.includes('presentation')) {
          exportMimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
          extension = '.pptx';
        } else {
          exportMimeType = 'application/pdf';
          extension = '.pdf';
        }

        if (!destPath.toLowerCase().endsWith(extension)) {
          destPath += extension;
        }

        response = await this.drive.files.export(
          { fileId, mimeType: exportMimeType },
          { responseType: 'stream' }
        );
      } else {
        response = await this.drive.files.get(
          { fileId, alt: 'media' },
          { responseType: 'stream' }
        );
      }

      const dest = fs.createWriteStream(destPath);
      return new Promise((resolve, reject) => {
        response.data.on('end', () => {
          console.log(\`✓ Salvato: \${path.basename(destPath)}\`);
          resolve();
        });
        response.data.on('error', reject);
        response.data.pipe(dest);
      });
    } catch (err) {
      console.error(\`✗ Errore download \${fileName}:\`, err.message);
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
        await this.downloadFile(file, filePath);
      }
    }
  }

  async performSync() {
    const timestamp = new Date().toISOString();
    console.log(\`[\${timestamp}] 🔄 Avvio sincronizzazione cartella Drive...\`);
    
    try {
      const folderId = process.env.DRIVE_FOLDER_ID || this.config.source.folderId;
      const syncPath = path.join(process.cwd(), this.config.destination.path);
      
      console.log(\`📂 Folder ID: \${folderId}\`);
      console.log(\`📍 Destinazione: \${this.config.destination.path}\`);

      await this.syncFolderRecursive(folderId, syncPath);
      console.log(\`✓ Sync completato: \${this.config.destination.path}\`);
    } catch (err) {
      console.error('✗ Errore sync:', err.message);
    }
  }

  start() {
    console.log('🤖 Agent Sync Drive - AVOLTA_2026');
    console.log('======================================');

    this.performSync().then(() => {
      if (process.env.GITHUB_ACTIONS) {
        console.log('Esecuzione completata.');
        process.exit(0);
      }
    });

    if (!process.env.GITHUB_ACTIONS) {
      const cronExpr = this.config.schedule.cron || '0 0 */3 * *';
      cron.schedule(cronExpr, () => {
        this.performSync();
      }, {
        timezone: this.config.schedule.timezone || "Europe/Rome"
      });
      console.log(\`📅 Prossimo sync programmato: \${cronExpr}\`);
    }
  }
}

if (require.main === module) {
  const sync = new DriveSync3Days();
  sync.setupAuth().then(() => {
    sync.start();
  }).catch(err => {
    console.error('Errore fatale:', err.message);
    process.exit(1);
  });
}

module.exports = DriveSync3Days;
