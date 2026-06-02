const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      content = content.replace(/style=\{\{\s*fontFamily:\s*"Outfit, sans-serif"\s*\}\}/g, '');
      content = content.replace(/style=\{\{\s*fontFamily:\s*"Outfit"\s*\}\}/g, '');
      content = content.replace(/fontFamily:\s*"Outfit, sans-serif",?/g, '');
      content = content.replace(/fontFamily:\s*"Outfit",?/g, '');
      content = content.replace(/style=\{\{\s*\}\}/g, '');
      fs.writeFileSync(fullPath, content);
    }
  }
}

processDir(path.join(process.cwd(), 'src'));
console.log('Done!');
