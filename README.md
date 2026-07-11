# Node.js Hello World — Azure Windows Web App

A minimal Node.js app to reproduce and fix the **Node.js version upgrade issue** (v22 → v24) on Azure App Service (Windows).

---

## Project Structure

```
nodejs-azure-app/
├── server.js       # Main application entry point
├── package.json    # Node dependencies & engine requirements
├── web.config      # IIS / iisnode configuration for Azure Windows
└── README.md       # This file
```

---

## The Problem — Why Node v24 Upgrade Doesn't Take Effect

On **Azure Windows Web App**, Node.js is managed by **iisnode** (an IIS module). Simply changing the version in the Azure Portal → Configuration → General Settings may not work because:

1. **App setting `WEBSITE_NODE_DEFAULT_VERSION` is stale or missing** — Azure uses this to tell iisnode which node.exe to use.
2. **`~24` alias is not supported yet** — Azure's "tilde" shortcuts (`~22`) may not have a `~24` mapping available on the Windows stack.
3. **Old app setting takes precedence** — If `WEBSITE_NODE_DEFAULT_VERSION` is still set to `~22` in Application Settings, it overrides the General Settings UI.
4. **iisnode uses a cached/hardcoded path** — The `nodeProcessCommandLine` in `web.config` may point to a specific node.exe path that ignores the version setting.
5. **Missing runtime on the instance** — Node 24 may not be pre-installed on the App Service Windows image yet; you must use a custom deployment approach.

---

## Step-by-Step Fix

### Step 1 — Check Available Node Versions on Your App Service

Open **Kudu console** (Advanced Tools):
```
https://<your-app-name>.scm.azurewebsites.net/DebugConsole
```
Run:
```cmd
dir "C:\Program Files\nodejs"
```
or
```cmd
where node
node --version
```
This tells you which versions are actually installed on the instance.

---

### Step 2 — Update the App Setting (Primary Fix)

Go to: **Azure Portal → Your App → Configuration → Application Settings**

Add or update:
```
Name:  WEBSITE_NODE_DEFAULT_VERSION
Value: ~24
```
> ⚠️ If `~24` is not available, use the **exact version** e.g. `24.0.0`.  
> Check available versions at: https://github.com/nicolo-ribaudo/node-mirror/releases or via Kudu.

Click **Save** → **Restart** the app.

---

### Step 3 — Verify via General Settings (Secondary)

**Azure Portal → Your App → Configuration → General Settings**

Set:
```
Stack:         Node
Major version: 24 LTS  (or latest available)
Minor version: 24.x.x
```
Click **Save**.

> ⚠️ On Windows, General Settings may not reflect the actual version used — the **App Setting always wins**.

---

### Step 4 — If Node 24 Is Not Listed — Use Custom Deployment

If Node 24 is not available in the portal dropdown:

**Option A: Deploy Node.js via App Service Extension**
1. Go to: **Azure Portal → Your App → Extensions**
2. Add extension: search for `Node`
3. Select the Node 24 extension if available

**Option B: Bundle Node 24 with your app (most reliable)**
1. Download the Node 24 Windows x64 binary:
   ```
   https://nodejs.org/dist/latest-v24.x/node-v24.x.x-win-x64.zip
   ```
2. Extract to your repo under `./node_runtime/`
3. Update `web.config` to use this bundled binary:
   ```xml
   <iisnode nodeProcessCommandLine="D:\home\site\wwwroot\node_runtime\node.exe" />
   ```
4. Deploy your app — the bundled Node 24 exe is used regardless of what's installed.

---

### Step 5 — Validate the Fix

After restarting, open your app in the browser. The **Node.js Version** row in the table should show `v24.x.x`.

Or check via Kudu console:
```cmd
node --version
```

---

### Step 6 — Common Gotchas Checklist

| Issue | Fix |
|---|---|
| Portal shows v24 but app still runs v22 | App Setting `WEBSITE_NODE_DEFAULT_VERSION` is overriding — update it |
| `~24` not recognized | Use exact version string e.g. `24.0.0` |
| App crashes after upgrade | Check iisnode logs: `https://<app>.scm.azurewebsites.net/api/vfs/LogFiles/` |
| `web.config` has hardcoded node path | Remove or update `nodeProcessCommandLine` in `web.config` |
| Multiple slots (staging/prod) | Each slot has its own app settings — update all slots |

---

## Local Testing

```bash
node --version      # should be v22+ or v24+
npm install
npm start
# Visit http://localhost:8080
```

---

## Deploy to Azure

```bash
# Via Azure CLI
az webapp up --name <your-app-name> --resource-group <rg> --runtime "NODE:24-lts" --os-type Windows

# Or via ZIP deploy
zip -r app.zip . --exclude "*.git*"
az webapp deployment source config-zip --src app.zip --name <app> --resource-group <rg>
```
