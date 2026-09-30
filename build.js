// Wraps src/app.html (the page body) into a full index.html with PWA metadata.
// Usage: node build.js   (then: docker compose up -d --build)
const fs = require('fs');
const path = require('path');

const body = fs.readFileSync(path.join(__dirname, 'src', 'app.html'), 'utf8');
const head = `<!doctype html>
<html lang="ms">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#F2F4F8">
<meta name="description" content="Rancang perbelanjaan bulanan: bil wajib dan boleh tangguh.">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="icon-192.png">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="Belanja">
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>
</head>
<body>
`;
fs.writeFileSync(path.join(__dirname, 'public', 'index.html'), head + body + '\n</body>\n</html>\n');
console.log('Built public/index.html');
