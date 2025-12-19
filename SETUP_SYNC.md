# 🚀 Sync Configuration - Next Steps

## ✅ Completed

### 1. Folder Mapping Configuration
- **File**: `folder-mapping.json`
- **Status**: ✅ Created and committed
- **Contents**: 
  - AVOLTA_Data folder mapping
  - CREAZIONE NUOVO BRAND folder mapping
  - All sync settings configured

### 2. GitHub Actions Workflow
- **File**: `.github/workflows/sync-3days.yml`
- **Status**: ✅ Created and committed
- **Features**:
  - Automated sync every 3 days (0 0 */3 * * UTC)
  - Manual trigger via `workflow_dispatch`
  - Automatic Node.js environment setup
  - Dependency installation

## ⚠️ Required Configuration (Next Steps)

To activate the automated sync, you need to configure GitHub Secrets:

### Step 1: Add GitHub Secrets

Go to: **Settings → Secrets and variables → Actions**

Add the following repository secrets:

#### `GOOGLE_KEY_JSON`
- **What**: Google Service Account JSON key (base64 encoded)
- **How to get**:
  1. Go to [Google Cloud Console](https://console.cloud.google.com/)
  2. Select your project
  3. Go to: Service Accounts → Create Service Account
  4. Create a key (JSON format)
  5. Download the JSON file
  6. Base64 encode the entire JSON content
  7. Paste in GitHub Secrets

#### `DRIVE_FOLDER_ID`
- **What**: The ID of your main Google Drive folder to sync
- **Current value**: `1xjsQKJYXq0WtazeemCOmbbsEGRXMD29T` (AVOLTA_Data)
- **How to find**:
  - Open the folder in Google Drive
  - The ID is in the URL: `drive.google.com/drive/folders/[ID]`

### Step 2: Share Drive Folder with Service Account

1. Get the Service Account email from the JSON key
2. Go to your Google Drive folder
3. Click "Share"
4. Add the Service Account email
5. Grant "Editor" permission

### Step 3: Enable Google Drive API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Search for "Google Drive API"
3. Click "Enable"

## 📋 Sync Configuration Details

### Current Schedule
- **Frequency**: Every 3 days at 00:00 UTC
- **Cron**: `0 0 */3 * *`
- **Location**: `.github/workflows/sync-3days.yml`

### Sync Targets
1. **AVOLTA_Data**
   - Source: `1xjsQKJYXq0WtazeemCOmbbsEGRXMD29T`
   - Destination: `drive_sync/AVOLTA_Data`
   - Mode: Mirror (overwrite existing)

2. **CREAZIONE NUOVO BRAND**
   - Source: `1ls1k_CHyTEakoOlv3OozJa1tQ94Ho5zm`
   - Destination: (configured in folder-mapping.json)
   - Includes Google Sheets export

## 🔄 Manual Sync Execution

To run sync manually before workflow activation:

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your credentials
# - GITHUB_TOKEN: your GitHub token
# - GOOGLE_KEY_FILE: path to service account JSON
# - DRIVE_FOLDER_ID: main folder ID

# Run sync
npm run sync:3days
```

## 📁 Files Involved

- **folder-mapping.json**: Folder configurations (auto-generated, don't edit manually)
- **sync-config-3days.json**: 3-day sync configuration
- **sync_drive_3days.js**: 3-day sync script
- **.github/workflows/sync-3days.yml**: GitHub Actions workflow
- **.env**: Local environment variables (not committed)

## ⚠️ Security Notes

- Never commit `.env` file
- Keep Service Account JSON secure
- GitHub Secrets are encrypted
- Only admins can view secrets

## 🆘 Troubleshooting

### Workflow not triggering?
- Check that secrets are properly configured
- Verify cron expression: `0 0 */3 * *` (every 3 days)
- Check Actions tab for error logs

### Sync fails with authentication error?
- Verify Service Account has access to Drive folders
- Check that folder is shared with Service Account email
- Confirm Google Drive API is enabled

### Sync not creating files?
- Check destination path permissions
- Verify folder-mapping.json is valid JSON
- Check repository branch is main

## 📚 Additional Resources

- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)
- [Google Service Account Setup](https://cloud.google.com/docs/authentication/getting-started)
- [Cron Expression Reference](https://crontab.guru/)
