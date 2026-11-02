// Wraps src/app.html (the page body) into a full index.html with PWA metadata.
// Builds two copies:
//   public/  the real app served by server.js (Docker)
//   docs/    a view-only showcase with sample data, published on GitHub Pages
// Usage: node build.js   (then: docker compose up -d --build)
const fs = require('fs');
const path = require('path');

const body = fs.readFileSync(path.join(__dirname, 'src', 'app.html'), 'utf8');
const head = extra => `<!doctype html>
<html lang="ms">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#146B44">
<meta name="description" content="Rancang perbelanjaan bulanan: bil wajib dan boleh tangguh.">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="icon-192.png">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Belanja">
<style>body{margin:0}body::before{content:"";position:fixed;top:0;left:0;right:0;height:env(safe-area-inset-top,0px);background:#146B44;z-index:100;pointer-events:none}img{max-width:100%}[hidden]{display:none!important}</style>
${extra}</head>
<body>
`;
const page = extra => head(extra) + body + '\n</body>\n</html>\n';

fs.writeFileSync(path.join(__dirname, 'public', 'index.html'), page(''));
console.log('Built public/index.html');

const docs = path.join(__dirname, 'docs');
fs.mkdirSync(docs, { recursive: true });
fs.writeFileSync(path.join(docs, 'index.html'), page('<script>window.RB_VIEW_ONLY = true;</script>\n'));
for (const f of ['icon.svg', 'icon-192.png', 'icon-512.png']) fs.copyFileSync(path.join(__dirname, 'public', f), path.join(docs, f));
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'public', 'manifest.webmanifest'), 'utf8'));
Object.assign(manifest, { name: 'Rancang Belanja (Demo)', short_name: 'Belanja Demo', start_url: './', scope: './' });
fs.writeFileSync(path.join(docs, 'manifest.webmanifest'), JSON.stringify(manifest, null, 2) + '\n');
fs.writeFileSync(path.join(docs, '.nojekyll'), '');
console.log('Built docs/ (view-only showcase)');
