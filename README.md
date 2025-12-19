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
