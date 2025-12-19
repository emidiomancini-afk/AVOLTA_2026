/**
 * AVOLTA_2026 - GitHub to Drive Sync Agent
 * Sincronizza il repository GitHub con Google Drive via API
 * Agent: Esegue check periodici e sync automatico
 */

const { GoogleAuth } = require('google-auth-library');
const { google } = require('googleapis');
const { Octokit } = require('@octokit/rest');
const cron = require('node-cron');

class AVOLTASyncAgent {
  constructor(config) {
    this.githubToken = config.GITHUB_TOKEN;
    this.googleKeyFile = config.GOOGLE_KEY_FILE;
    this.driveFolder = config.DRIVE_FOLDER_ID;
    this.repoOwner = 'emidiomancini-afk';
    this.repoName = 'AVOLTA_2026';
    
    // Inizializza client
    this.octokit = new Octokit({ auth: this.githubToken });
    this.driveClient = null;
    this.setupGoogleAuth();
  }

  async setupGoogleAuth() {
    const auth = new GoogleAuth({
      keyFile: this.googleKeyFile,
      scopes: ['https://www.googleapis.com/auth/drive']
    });
    this.driveClient = google.drive({ version: 'v3', auth });
  }

  // Scarica file dal repo GitHub
  async fetchRepoFiles() {
    try {
      const { data: contents } = await this.octokit.repos.getContent({
        owner: this.repoOwner,
        repo: this.repoName,
        path: ''
      });
      return contents;
    } catch (err) {
      console.error('Errore nel fetch da GitHub:', err.message);
      return [];
    }
  }

  // Crea/Aggiorna file su Drive
  async syncToDrive(files) {
    for (const file of files) {
      if (file.type === 'file') {
        try {
          const fileContent = await this.octokit.repos.getContent({
            owner: this.repoOwner,
            repo: this.repoName,
            path: file.path
          });
          
          const buffer = Buffer.from(fileContent.data.content, 'base64');
          
          // Cerca se esiste già su Drive
          const existingFile = await this.findFileInDrive(file.name);
          
          if (existingFile) {
            // Aggiorna
            await this.driveClient.files.update({
              fileId: existingFile.id,
              media: { body: buffer },
              fields: 'id, webViewLink'
            });
            console.log(`✓ Aggiornato: ${file.name}`);
          } else {
            // Crea nuovo
            await this.driveClient.files.create({
              requestBody: {
                name: file.name,
                parents: [this.driveFolder]
              },
              media: { body: buffer },
              fields: 'id, webViewLink'
            });
            console.log(`✓ Creato: ${file.name}`);
          }
        } catch (err) {
          console.error(`Errore sync ${file.name}:`, err.message);
        }
      }
    }
  }

  // Trova file su Drive per nome
  async findFileInDrive(fileName) {
    const { data: files } = await this.driveClient.files.list({
      q: `name='${fileName}' and trashed=false and '${this.driveFolder}' in parents`,
      spaces: 'drive',
      fields: 'files(id, name)'
    });
    return files.files[0] || null;
  }

  // Sync completo
  async performSync() {
    console.log(`[${new Date().toISOString()}] Avvio sync AVOLTA_2026...`);
    const files = await this.fetchRepoFiles();
    if (files.length > 0) {
      await this.syncToDrive(files);
      console.log('✓ Sync completato');
    }
  }

  // Avvia agent con scheduling
  start() {
    console.log('🤖 Agent AVOLTA_2026 avviato');
    
    // Sync immediato
    this.performSync();
    
    // Scheduled: ogni ora
    cron.schedule('0 * * * *', () => {
      this.performSync();
    });
    
    console.log('📅 Prossimo sync: tra 1 ora');
  }
}

// Esporta
module.exports = AVOLTASyncAgent;

// Se eseguito direttamente
if (require.main === module) {
  const agent = new AVOLTASyncAgent({
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
    GOOGLE_KEY_FILE: process.env.GOOGLE_KEY_FILE,
    DRIVE_FOLDER_ID: process.env.DRIVE_FOLDER_ID
  });
  
  agent.start();
}
