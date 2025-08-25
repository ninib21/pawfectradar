const fs = require('fs');
const path = require('path');

// Common icon imports needed
const commonIcons = [
  'ArrowRight', 'Heart', 'Star', 'MapPin', 'DollarSign', 'Clock', 'Calendar',
  'Filter', 'Plus', 'X', 'Shield', 'Award', 'AlertCircle', 'CreditCard',
  'PawPrint', 'Bell', 'Download', 'Smartphone', 'Apple', 'PlayCircle',
  'Users', 'Gallery', 'Edit', 'MessageCircle', 'Review', 'User', 'UserIcon'
];

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Check if file uses any of the common icons
    const usedIcons = commonIcons.filter(icon => content.includes(`<${icon}`));
    
    if (usedIcons.length > 0) {
      // Check if lucide-react import exists
      const hasLucideImport = content.includes("from 'lucide-react'");
      
      if (hasLucideImport) {
        // Add missing icons to existing import
        const importMatch = content.match(/import\s*{([^}]+)}\s*from\s*['"]lucide-react['"]/);
        if (importMatch) {
          const existingImports = importMatch[1].split(',').map(i => i.trim());
          const allImports = [...new Set([...existingImports, ...usedIcons])];
          const newImport = `import { ${allImports.join(', ')} } from 'lucide-react'`;
          content = content.replace(importMatch[0], newImport);
          modified = true;
        }
      } else {
        // Create new lucide-react import
        const newImport = `import { ${usedIcons.join(', ')} } from 'lucide-react'`;
        // Add after the first import statement
        const firstImportIndex = content.indexOf('import');
        if (firstImportIndex !== -1) {
          const nextLineIndex = content.indexOf('\n', firstImportIndex);
          content = content.slice(0, nextLineIndex + 1) + newImport + '\n' + content.slice(nextLineIndex + 1);
          modified = true;
        }
      }
    }

    // Fix React import if needed
    if (content.includes('React.') || content.includes('createElement')) {
      if (!content.includes("import React from 'react'")) {
        const newImport = "import React from 'react'";
        const firstImportIndex = content.indexOf('import');
        if (firstImportIndex !== -1) {
          const nextLineIndex = content.indexOf('\n', firstImportIndex);
          content = content.slice(0, nextLineIndex + 1) + newImport + '\n' + content.slice(nextLineIndex + 1);
          modified = true;
        }
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed imports: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      walkDir(filePath);
    } else if (file.endsWith('.jsx') || file.endsWith('.tsx')) {
      fixFile(filePath);
    }
  });
}

console.log('🔧 Starting import fixes...');
walkDir('.');
console.log('✅ Import fixes completed!');
