# AVOLTA_2026
Assistente esperto in Data Architecture &amp; Governance.

## 🤖 Sync Agent GitHub ↔ Google Drive

Agente automatico che sincronizza il repository AVOLTA_2026 con Google Drive.

### ✨ Funzionalità

- **Sincronizzazione bidirezionale**: Sincronizza file da GitHub a Google Drive ogni ora
- **Aggiornamento automatico**: Rileva modifiche e aggiorna automaticamente
- **Creazione file**: Crea nuovi file su Drive quando aggiunti al repo
- **Scheduling flessibile**: Configurabile tramite cron expressions
- **Gestione errori**: Logging dettagliato e gestione robusti degli errori

### 📋 Prerequisiti

1. **GitHub Token**: Genera da [GitHub Settings > Tokens](https://github.com/settings/tokens)
   - Scopes richiesti: `repo`, `read:user`

2. **Google Service Account**: 
   - Vai a [Google Cloud Console](https://console.cloud.google.com)
   - Crea Service Account → Crea Chiave JSON
   - Attiva l'API di Google Drive
   - Scarica il file JSON

3. **Google Drive**: 
   - Crea una cartella dedicata per il sync
   - Copia l'ID della cartella (visibile nell'URL: `/drive/folders/ID_CARTELLA`)
   - Condividi con l'email del Service Account (vedi nel JSON scaricato)
  
   - ### 💫 Selezione Cartelle Google Drive

Prima di avviare l'agent, devi selezionare quali cartelle di Google Drive sincronizzare:

```bash
# 1. Esegui lo script di setup
node setup_folders.js

# 2. L'app ti mostrerà tutte le cartelle disponibili nel tuo Drive
# 3. Seleziona i numeri delle cartelle che desideri sincronizzare
# Esempio: 1,3,5 (sincronizza cartelle 1, 3 e 5)

# 4. Automaticamente verrà creato: folder-mapping.json
```

**Nota importante:**
- Il file `folder-mapping.json` viene **GENERATO** automaticamente da `setup_folders.js`
- Contiene l'elenco delle cartelle selezionate
- NON modificare manualmente (verrà sovrascritto al prossimo setup)
- Aggiungi `folder-mapping.json` al `.gitignore` se vuoi privacy
- 

### 🚀 Setup Rapido

```bash
# 1. Installa dipendenze
npm install

# 2. Copia il template di configurazione
cp .env.example .env

# 3. Compila il file .env con i tuoi dati
# - GITHUB_TOKEN: il token GitHub
# - GOOGLE_KEY_FILE: path al file JSON del service account
# - DRIVE_FOLDER_ID: l'ID della cartella Drive
# - SYNC_SCHEDULE: cron expression (default: ogni ora)

# 4. Avvia l'agent
npm start
```

### 📁 File Principali

- **sync_drive_agent.js**: Logica principale dell'agente
- **.env.example**: Template di configurazione
- **package.json**: Dipendenze npm
- - **setup_folders.js**: Script interattivo per selezionare cartelle da sincronizzare
  - - **folder-mapping.json**: Configurazione cartelle selezionate (generato automaticamente)

### 🔄 Scheduling

Esempi di cron expressions:

```
'0 * * * *'       # Ogni ora
'0 */2 * * *'     # Ogni 2 ore  
'0 9-17 * * *'    # Ogni ora dalle 9 alle 17
'30 2 * * *'      # Ogni giorno alle 2:30
'*/15 * * * *'    # Ogni 15 minuti
```

### 📊 Output

L'agente mostrerà nel log:

```
🤖 Agent AVOLTA_2026 avviato
✓ Creato: file_nuovo.js
✓ Aggiornato: documento.md
✓ Sync completato
📅 Prossimo sync: tra 1 ora
```

### 🔐 Sicurezza

- **Non committare .env**: Aggiungi a .gitignore
- **Non esporre token**: Usa variabili d'ambiente
- **Service Account**: Usa scopes minimi necessari
- **Credenziali**: Rotate periodicamente i token

### 🆘 Troubleshooting

**Errore: "GITHUB_TOKEN not found"**
→ Assicurati che .env sia nella root e compilato

**Errore: "Authentication failed"**
→ Verifica che il token GitHub sia ancora valido

**Errore: "Drive folder not accessible"**
→ Assicurati che il service account abbia accesso (check condivisione)

### 🛠️ Modalità Sviluppo

```bash
npm run dev  # Avvia con nodemon (reload automatico)
```

### 📝 Note

- L'agent sincronizza la root del repo
- I file sono sovrascritti se già esistono su Drive
- La cancellazione da GitHub NON cancella da Drive (protezione)
- Logged tutte le operazioni

---

**AVOLTA_2026** - Assistente esperto in Data Architecture & Governance


## 📅 Sincronizzazione Ogni 3 Giorni

Puoi sincronizzare una specifica cartella Google Drive nel repository **ogni 3 giorni** in automatico:

### Configurazione

Modifica il file `sync-config-3days.json` con:
- **Folder ID**: ID della cartella Google Drive da sincronizzare
- **Destination path**: Cartella di destinazione nel repository
- **Schedule**: Frequenza (default: ogni 3 giorni a mezzanotte CET)

### Esecuzione

```bash
# Sincronizzazione manuale
npm run sync:3days

# Oppure direttamente
node sync_drive_3days.js
```

### Cron Schedule

Il cron `0 0 */3 * *` significa:
- **0**: Al minuto 0
- **0**: All'ora 0 (mezzanotte)
- **/3**: Ogni 3 giorni
- ***: Ogni mese
- ***: Ogni giorno della settimana

### Esempio: Sincronizzazione AVOLTA_Data

Esempio già configurato nel repository:

```json
{
  "source": {
    "folderId": "1xjsQKJYXq0WtazeemCOmbbsEGRXMD29T",
    "folderName": "AVOLTA_Data"
  },
  "destination": {
    "path": "drive_sync/AVOLTA_Data"
  },
  "schedule": {
    "cron": "0 0 */3 * *"
  }
}
```

### File Utilizzati

- **sync-config-3days.json**: Configurazione di sincronizzazione
- **sync_drive_3days.js**: Script Node.js che implementa la sincronizzazione
- **package.json**: Script npm `sync:3days`

### Note

- La sincronizzazione esegue il **mirror** della cartella Drive nel repository
- Non cancella file dal repository quando rimossi da Drive (protezione)
- Supporta cartelle annidate e file di qualsiasi tipo
- I log sono salvati in `logs/sync_3days.log`

---
