# Cyber WhatsApp Pro – Desktop App (Electron)

This is the **standalone desktop version** of Cyber WhatsApp Pro.  
The Chrome extension (`../chrome_Extenton`) is **not touched** — this is a completely separate product.

---

## Folder structure

```
electron_app/
├── main.js            ← Electron main process (window management, IPC, tray)
├── preload.js         ← Bridge between main process and renderer pages
├── chrome-shim.js     ← Fakes chrome.* APIs so extension JS runs unchanged
├── package.json       ← Dependencies + electron-builder config
├── renderer/
│   └── panel.html     ← The Pro panel UI (license gate + quick-actions)
└── assets/
    └── (icon files)   ← Place icon.ico / icon.icns / icon.png here
```

The app **reuses every JS and CSS file from `../chrome_Extenton`** directly — nothing is copied or duplicated.

---

## How it works

| Chrome Extension | Electron Desktop App |
|---|---|
| `probcg.js` (service worker) | `main.js` (Node.js main process) |
| `chrome.storage.local` | `electron-store` via `cwpBridge` IPC |
| Content scripts injected by Chrome | Scripts injected via `webContents.executeJavaScript` |
| Extension popup | `renderer/panel.html` in its own BrowserWindow |
| WhatsApp tab in browser | `BrowserView` inside the main window |
| System notifications | Electron `Notification` API |
| Background alarms | `setInterval` inside `chrome-shim.js` |

---

## Setup & development

```bash
cd electron_app
npm install
npm start          # launch in dev mode
```

### Build distributable

```bash
npm run build:win      # → dist/Cyber WhatsApp Pro Setup.exe
npm run build:mac      # → dist/Cyber WhatsApp Pro.dmg
npm run build:linux    # → dist/Cyber WhatsApp Pro.AppImage
```

> **Prerequisite:** Node.js ≥ 18 and npm must be installed.  
> Install from https://nodejs.org

---

## Icons (required for build)

Place the following files in the `assets/` folder before building:

| File | Size | Used for |
|---|---|---|
| `icon.ico` | 256×256 | Windows installer + taskbar |
| `icon.icns` | 512×512 | macOS dock |
| `icon.png` | 512×512 | Linux + fallback |

The app will use the extension's `logo/pro-large.png` as a fallback if no icon is found.

---

## License

Same license key works for both the Chrome extension and the desktop app.  
One purchase → two products.
