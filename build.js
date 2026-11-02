// Wraps src/app.html (the page body) into a full index.html with PWA metadata.
// Builds two copies:
//   public/  the real app served by server.js (Docker)
//   docs/    a view-only showcase with sample data, published on GitHub Pages
// Usage: node make-icons.js && node build.js   (then: docker compose up -d --build)
const fs = require('fs');
const path = require('path');

const body = fs.readFileSync(path.join(__dirname, 'src', 'app.html'), 'utf8');
const head = (extra, title) => `<!doctype html>
<html lang="ms">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#146B44">
<meta name="description" content="Rancang perbelanjaan bulanan: bil wajib dan boleh tangguh.">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="${title}">
<style>body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>
${extra}</head>
<body>
`;
const page = (extra, title) => head(extra, title) + body + '\n</body>\n</html>\n';

fs.writeFileSync(path.join(__dirname, 'public', 'index.html'), page('', 'Belanja'));
console.log('Built public/index.html');

// The demo has its own violet icons (written into docs/ by make-icons.js) so it is easy to tell apart.
const docs = path.join(__dirname, 'docs');
fs.mkdirSync(docs, { recursive: true });
fs.writeFileSync(path.join(docs, 'index.html'), page('<script>window.RB_VIEW_ONLY = true;</script>\n', 'Belanja Demo'));
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'public', 'manifest.webmanifest'), 'utf8'));
Object.assign(manifest, { name: 'Rancang Belanja (Demo)', short_name: 'Belanja Demo', start_url: './', scope: './', theme_color: '#3B3A9E' });
fs.writeFileSync(path.join(docs, 'manifest.webmanifest'), JSON.stringify(manifest, null, 2) + '\n');
fs.writeFileSync(path.join(docs, '.nojekyll'), '');
console.log('Built docs/ (view-only showcase)');
