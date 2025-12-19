# 🔍 Diagnosi Allineamento File - Costa Coffee

## Problema Identificato

**File:** `01_Scheda apertura COSTA COFFEE`
**Ubicazione:** Google Drive - Cartella "CREAZIONE NUOVO BRAND"
**Cartella Drive ID:** `1ls1k_CHyTEakoOlv3OozJa1tQ94Ho5zm`
**Status:** ❌ NON ALLINEATO con Repository GitHub

---

## 🎯 Causa Principale

### Google Sheets Nativo vs File Esportabile

**Il file è un Google Sheet nativo**, non un file esportato (.xlsx, .csv, ecc.).

**Questo crea i seguenti problemi:**

1. **Formato File Cloud-Native**
   - Google Sheets non ha un formato file standard
   - Non è scaricabile come file binario direttamente
   - L'API di Google Drive lo mantiene come oggetto cloud

2. **Script di Sincronizzazione Non Compatibili**
   - `sync_drive_3days.js` è progettato per scaricare file esportabili
   - Non può esportare automaticamente Google Sheets
   - Mancanza di esportazione a CSV/XLSX nel workflow

3. **Cartella di Sincronizzazione Non Configurata**
   - La cartella `1ls1k_CHyTEakoOlv3OozJa1tQ94Ho5zm` potrebbe non essere stata selezionata in `setup_folders.js`
   - Il file non è incluso nel mapping delle cartelle da sincronizzare
   - Nessun trigger di sincronizzazione automatica

---

## 📊 Analisi Tecnica

### Flusso di Sincronizzazione Attuale

```
Google Drive (Cartelle Selezionate)
    ↓
setup_folders.js (mapping interattivo)
    ↓
folder-mapping.json (configurazione)
    ↓
sync_drive_3days.js (esecuzione)
    ↓
github.com (repository)
```

**Problema:** Il file Google Sheets non passa per questo flusso perché:
- ❌ Non è un file "standard" (non è .docx, .xlsx, .pdf)
- ❌ Richiede esportazione prima del download
- ❌ L'API di Google Drive non lo permette senza esportazione esplicita

---

## ✅ Soluzioni Proposte

### Soluzione 1: Esportare il File Manualmente (Rapido)

1. Apri il Google Sheet "01_Scheda apertura COSTA COFFEE"
2. File → Scarica → Formato Excel (.xlsx)
3. Upload il file .xlsx nel repository GitHub
4. Posizionalo in: `drive_sync/CREAZIONE_NUOVO_BRAND/`

**Pro:** Veloce e semplice
**Contro:** Non automatizzato

---

### Soluzione 2: Aggiungere Export Automatico (Migliore)

Modificare `sync_drive_3days.js` per:

```javascript
// Aggiungere funzione di export per Google Sheets
async function exportGoogleSheet(fileId, fileName, exportPath) {
  // Usa Google Drive API per esportare a XLSX
  const exportUrl = `https://docs.google.com/spreadsheets/d/${fileId}/export?format=xlsx`;
  // Scarica il file esportato
  // Salva in drive_sync/
}
```

**Pro:** Sincronizzazione completamente automatica
**Contro:** Richiede modifica dello script

---

### Soluzione 3: Configurare Cartella nel Setup (Consigliato)

1. Esegui: `npm run setup:folders`
2. Quando chiede le cartelle, seleziona `1ls1k_CHyTEakoOlv3OozJa1tQ94Ho5zm`
3. Il file verrà incluso nel prossimo sync

**Pro:** Mantiene il flusso di sincronizzazione automatica
**Contro:** Richiede ancora export di Google Sheets

---

## 🔧 Prossimi Passi Consigliati

### Azione Immediata (Entro 24h)

1. ✅ Esporta il file a .xlsx (Soluzione 1)
2. ✅ Caricalo nel repository
3. ✅ Testa la sincronizzazione successiva

### Implementazione a Lungo Termine

1. 🔄 Modifica `sync_drive_3days.js` per supportare export automatico (Soluzione 2)
2. 🔄 Aggiungi Google Sheets all'elenco di tipi di file sincronizzabili
3. 🔄 Testa con tutti i file della cartella "CREAZIONE NUOVO BRAND"

---

## 📝 Monitoraggio

**Data Diagnosi:** 19 Dicembre 2025, 18:00 CET
**Status:** ⚠️ IN ATTESA DI RISOLUZIONE
**Cartella Drive:** `1ls1k_CHyTEakoOlv3OozJa1tQ94Ho5zm`
**Repository:** `https://github.com/emidiomancini-afk/AVOLTA_2026`

---

## 🎓 Lezioni Apprese

✅ Google Sheets nativi richiedono export esplicito
✅ I file cloud-native non si sincronizzano direttamente con Git
✅ La sincronizzazione bidirezionale funziona meglio con file standard (.xlsx, .csv, .pdf)
✅ Documentare il formato file nei workflow di sincronizzazione

