# FU-Bookkeeping Mobile (Capacitor wrapper)

This wraps your `fu-bookkeeping.html` into a mobile app and adds a native file picker to:
- Open a workspace JSON from Files (iCloud Drive / Google Drive / etc)
- Save back to the same file (autosave-ready)
- Save As

## Quick start (iOS)
```bash
cd FUBookkeepingMobile
npm install
npm run build
npx cap init "FU-Bookkeeping" "se.innovatiobrutalis.fubookkeeping" --web-dir=dist
npm run cap:add:ios
npm run cap:sync
npm run cap:open:ios
```

## Bridge available inside the app
The build injects `window.FU_MOBILE`:
- `FU_MOBILE.openWorkspace()` -> `{ json, name }`
- `FU_MOBILE.saveWorkspace(jsonString)`
- `FU_MOBILE.saveWorkspaceAs(jsonString)`

Wire these into your existing “Välj datafil / Spara” UI in the HTML.
On desktop web they just alert.

## iOS plugin template
See `ios_plugin_template/` for the Swift plugin that uses UIDocumentPicker and remembers the chosen file via a security-scoped bookmark.
