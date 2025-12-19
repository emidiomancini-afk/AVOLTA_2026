#!/usr/bin/env node
/**
 * Setup Folder Selection - AVOLTA_2026 Sync Agent
 * Script interattivo per selezionare cartelle da Google Drive
 * Genera folder-mapping.json con cartelle selezionate
 */

const { GoogleAuth } = require('google-auth-library');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
require('dotenv').config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

class FolderSetup {
  constructor() {
    this.auth = null;
    this.drive = null;
    this.selectedFolders = [];
    this.allFolders = [];
  }

  async setupAuth() {
    try {
      this.auth = new GoogleAuth({
        keyFile: process.env.GOOGLE_KEY_FILE,
        scopes: ['https://www.googleapis.com/auth/drive.readonly']
      });
      this.drive = google.drive({ version: 'v3', auth: this.auth });
      console.log('\u2713 Autenticazione Google Drive completata\n');
    } catch (err) {
      console.error('\u2717 Errore autenticazione:', err.message);
      process.exit(1);
    }
  }

  async fetchAllFolders(pageToken = null) {
    try {
      const query = "mimeType='application/vnd.google-apps.folder' and trashed=false";
      const { data: result } = await this.drive.files.list({
        q: query,
        spaces: 'drive',
        pageSize: 50,
        fields: 'nextPageToken, files(id, name, parents)',
        pageToken: pageToken
      });

      this.allFolders = this.allFolders.concat(result.files || []);

      if (result.nextPageToken) {
        return this.fetchAllFolders(result.nextPageToken);
      }
      return this.allFolders;
    } catch (err) {
      console.error('Errore nel fetch cartelle:', err.message);
      return [];
    }
  }

  displayFolders() {
    console.log('\n\ud83d� Cartelle disponibili su Google Drive:\n');
    console.log('Seleziona i numeri delle cartelle (separati da virgola):');
    console.log('Esempio: 1,3,5\n');

    this.allFolders.forEach((folder, index) => {
      console.log(`  [${index + 1}] ${folder.name}`);
      console.log(`     ID: ${folder.id}`);
    });
  }

  question(prompt) {
    return new Promise(resolve => rl.question(prompt, resolve));
  }

  async getUserSelection() {
    this.displayFolders();
    const input = await this.question('\nInserisci selezione: ');
    const indices = input.split(',').map(i => parseInt(i.trim()) - 1).filter(i => i >= 0 && i < this.allFolders.length);

    if (indices.length === 0) {
      console.log('\n\u26a0️  Nessuna cartella selezionata. Riprova.\n');
      return this.getUserSelection();
    }

    this.selectedFolders = indices.map(i => ({
      name: this.allFolders[i].name,
      id: this.allFolders[i].id
    }));

    console.log('\n\u2713 Cartelle selezionate:');
    this.selectedFolders.forEach(f => {
      console.log(`  - ${f.name} (${f.id})`);
    });
  }

  saveMappingFile() {
    const mappingFile = path.join(process.cwd(), 'folder-mapping.json');
    const mapping = {
      timestamp: new Date().toISOString(),
      folders: this.selectedFolders,
      syncRootPath: 'drive_sync'
    };

    fs.writeFileSync(mappingFile, JSON.stringify(mapping, null, 2));
    console.log(`\n\u2713 File mapping salvato: ${mappingFile}`);
    console.log(`\n⏳ Pronto per eseguire: npm start`);
  }

  async run() {
    console.log('\ud83e\udd16 Setup Folder Selection - AVOLTA_2026');
    console.log('========================================\n');

    await this.setupAuth();
    console.log('\ud83d\udd0d Caricamento cartelle...');
    await this.fetchAllFolders();
    console.log(`\u2713 ${this.allFolders.length} cartelle trovate\n`);

    await this.getUserSelection();
    this.saveMappingFile();

    rl.close();
  }
}

if (require.main === module) {
  const setup = new FolderSetup();
  setup.run().catch(err => {
    console.error('Errore:', err);
    process.exit(1);
  });
}

module.exports = FolderSetup;
