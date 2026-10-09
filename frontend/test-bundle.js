const fs = require('fs');
const path = require('path');

const bundleDir = path.join(__dirname, 'dist/frontend/browser');
const files = fs.readdirSync(bundleDir);
console.log('Files in bundle:', files);

const mainJsFile = files.find(f => f.startsWith('main-') && f.endsWith('.js'));
console.log('Main bundle file:', mainJsFile);

if (mainJsFile) {
  const content = fs.readFileSync(path.join(bundleDir, mainJsFile), 'utf8');
  console.log('Main bundle length:', content.length, 'bytes');
  console.log('First 200 chars of main bundle:', content.substring(0, 200));
}
