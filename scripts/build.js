const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'src', 'fu-bookkeeping.html');
const distDir = path.join(__dirname, '..', 'dist');
fs.mkdirSync(distDir, { recursive: true });

let html = fs.readFileSync(src, 'utf8');

const inject = `
<!-- FU-Bookkeeping Mobile Bridge (Capacitor) -->
<script>
(function(){
  const isCap = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
  window.FU_MOBILE = {
    isNative: () => isCap,
    openWorkspace: async () => {
      if(!isCap) { alert('Open workspace is available in the mobile app only.'); return; }
      const p = window.Capacitor.Plugins.WorkspaceFile;
      return await p.openFile();
    },
    saveWorkspace: async (jsonString) => {
      if(!isCap) { alert('Save workspace is available in the mobile app only.'); return; }
      const p = window.Capacitor.Plugins.WorkspaceFile;
      return await p.saveFile({ json: jsonString });
    },
    saveWorkspaceAs: async (jsonString) => {
      if(!isCap) { alert('Save As is available in the mobile app only.'); return; }
      const p = window.Capacitor.Plugins.WorkspaceFile;
      return await p.saveAs({ json: jsonString });
    }
  };
})();
</script>
`;

if (html.includes('</head>')) {
  html = html.replace('</head>', inject + '\n</head>');
} else {
  html = inject + '\n' + html;
}

fs.writeFileSync(path.join(distDir, 'index.html'), html, 'utf8');
console.log('Built dist/index.html');
