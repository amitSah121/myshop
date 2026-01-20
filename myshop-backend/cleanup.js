const fs = require('fs');
const path = require('path');

console.log('🧹 Starting Production Cleanup...\n');

// Files to remove
const filesToRemove = [
  'testEmail.js',
  'debugEmail.js',
  'verifyEnv.js',
  'generate-docs.js',
  'cleanup.js',
  '.env.example',
  '.DS_Store',
  'Thumbs.db'
];

// Folders to remove
const foldersToRemove = [
  'test',
  'tests',
  '__tests__',
  '.vscode',
  '.idea'
];

let removedCount = 0;

// Remove files
filesToRemove.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`✅ Removed: ${file}`);
    removedCount++;
  }
});

// Remove folders
foldersToRemove.forEach(folder => {
  const folderPath = path.join(__dirname, folder);
  if (fs.existsSync(folderPath)) {
    fs.rmSync(folderPath, { recursive: true, force: true });
    console.log(`✅ Removed folder: ${folder}`);
    removedCount++;
  }
});

// Remove console.log from all JS files (optional)
function removeConsoleLogs(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && file !== 'node_modules') {
      removeConsoleLogs(filePath);
    } else if (file.endsWith('.js') && !file.includes('cleanup')) {
      let content = fs.readFileSync(filePath, 'utf8');
      const originalLength = content.length;
      
      // Remove console.log statements (but keep error logging)
      content = content.replace(/console\.log\([^)]*\);?\n?/g, '');
      
      if (content.length !== originalLength) {
        fs.writeFileSync(filePath, content);
        console.log(`📝 Cleaned console.logs from: ${file}`);
        removedCount++;
      }
    }
  });
}

console.log('\n🔍 Removing development console.logs...');
// Uncomment to remove console.logs:
// removeConsoleLogs(__dirname);

console.log(`\n✅ Cleanup complete! Removed ${removedCount} items.`);
console.log('\n📋 Next Steps:');
console.log('   1. Review PROJECT_DOCUMENTATION.md');
console.log('   2. Update .gitignore');
console.log('   3. Run: npm audit fix');
console.log('   4. Run: npm run build (if applicable)');
console.log('   5. Test thoroughly before deployment');
