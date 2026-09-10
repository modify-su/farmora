// sync_root.js - Syncs HTML files from frontend/html/ to root for Vercel and local hosting
const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const frontendHtmlDir = path.join(rootDir, 'frontend', 'html');
const pages = ['index.html', 'about.html', 'news.html', 'products.html'];

console.log('🔄 Syncing HTML files from frontend/html/ to root...');

pages.forEach(file => {
  const srcPath = path.join(frontendHtmlDir, file);
  const destPath = path.join(rootDir, file);

  if (fs.existsSync(srcPath)) {
    let content = fs.readFileSync(srcPath, 'utf8');

    // Replace relative paths so root files work seamlessly both locally (file://) and on server/Vercel
    content = content
      .replace(/href="\.\.\/css\//g, 'href="frontend/css/')
      .replace(/src="\.\.\/images\//g, 'src="frontend/images/')
      .replace(/src="\.\.\/js\//g, 'src="frontend/js/')
      .replace(/href="\.\.\/\.\.\/backend\/index\.html"/g, 'href="backend/index.html"')
      .replace(/href="\.\.\/fonts\//g, 'href="frontend/fonts/');

    fs.writeFileSync(destPath, content, 'utf8');
    console.log(`  ✓ Synced frontend/html/${file} -> ${file}`);
  } else {
    console.warn(`  ⚠️ File not found: ${srcPath}`);
  }
});

// Sync JS files from frontend/js/ to root js/
const frontendJsDir = path.join(rootDir, 'frontend', 'js');
const rootJsDir = path.join(rootDir, 'js');
if (!fs.existsSync(rootJsDir)) fs.mkdirSync(rootJsDir, { recursive: true });
if (fs.existsSync(frontendJsDir)) {
  fs.readdirSync(frontendJsDir).forEach(f => {
    if (f.endsWith('.js')) {
      fs.copyFileSync(path.join(frontendJsDir, f), path.join(rootJsDir, f));
      console.log(`  ✓ Synced js: ${f}`);
    }
  });
}

console.log('✅ HTML & JS sync complete!');
