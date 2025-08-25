const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Fix duplicate React imports
    const reactImports = content.match(/import\s+React[^;]+;/g);
    if (reactImports && reactImports.length > 1) {
      // Keep only the first React import
      const firstImport = reactImports[0];
      content = content.replace(/import\s+React[^;]+;/g, '');
      content = firstImport + '\n' + content;
      modified = true;
    }

    // Fix duplicate lucide-react imports
    const lucideImports = content.match(/import\s*{[^}]+}\s*from\s*['"]lucide-react['"]/g);
    if (lucideImports && lucideImports.length > 1) {
      // Collect all unique imports
      const allImports = new Set();
      lucideImports.forEach(importStatement => {
        const imports = importStatement.match(/import\s*{([^}]+)}\s*from\s*['"]lucide-react['"]/)[1];
        const importList = imports.split(',').map(i => i.trim());
        importList.forEach(imp => allImports.add(imp));
      });
      
      // Remove all lucide imports
      content = content.replace(/import\s*{[^}]+}\s*from\s*['"]lucide-react['"]/g, '');
      
      // Add single consolidated import
      if (allImports.size > 0) {
        const newImport = `import { ${Array.from(allImports).join(', ')} } from 'lucide-react'`;
        const firstImportIndex = content.indexOf('import');
        if (firstImportIndex !== -1) {
          const nextLineIndex = content.indexOf('\n', firstImportIndex);
          content = content.slice(0, nextLineIndex + 1) + newImport + '\n' + content.slice(nextLineIndex + 1);
        }
      }
      modified = true;
    }

    // Remove empty lines and semicolons
    content = content.replace(/;\s*\n\s*;/g, ';');
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed parsing errors: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
}

// Fix specific files with parsing errors
const filesToFix = [
  'src/components/sitters/EnhancedSitterProfile.jsx',
  'src/pages/Bookings.jsx',
  'src/pages/Profile.jsx',
  'src/pages/Layout.jsx',
  'src/hooks/use-mobile.jsx',
  'ui-kit/quantum-components.tsx'
];

console.log('🔧 Fixing parsing errors...');
filesToFix.forEach(file => {
  if (fs.existsSync(file)) {
    fixFile(file);
  }
});

// Also fix UI components
const uiDir = 'src/components/ui';
if (fs.existsSync(uiDir)) {
  const uiFiles = fs.readdirSync(uiDir).filter(f => f.endsWith('.jsx'));
  uiFiles.forEach(file => {
    fixFile(path.join(uiDir, file));
  });
}

console.log('✅ Parsing error fixes completed!');
