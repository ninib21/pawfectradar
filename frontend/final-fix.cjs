const fs = require('fs');
const path = require('path');

console.log('🔧 Final fix for all import collisions in frontend files...');

// Icon names that need to be aliased to avoid collisions
const collisionMap = {
  'User': 'UserIcon',
  'Review': 'ReviewIcon',
  'Calendar': 'CalendarIcon',
  'Shield': 'ShieldIcon',
  'Star': 'StarIcon',
  'Settings': 'SettingsIcon',
  'MapPin': 'MapPinIcon',
  'DollarSign': 'DollarSignIcon',
  'CheckCircle': 'CheckCircleIcon',
  'TrendingUp': 'TrendingUpIcon',
  'Bell': 'BellIcon',
  'Search': 'SearchIcon',
  'Heart': 'HeartIcon',
  'X': 'XIcon',
  'Plus': 'PlusIcon',
  'Minus': 'MinusIcon',
  'Edit': 'EditIcon',
  'Trash': 'TrashIcon',
  'Upload': 'UploadIcon',
  'Download': 'DownloadIcon'
};

// Find all JSX/TSX files in src directory
function findFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      files.push(...findFiles(fullPath));
    } else if (item.match(/\.(jsx|tsx|js|ts)$/)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

const files = findFiles('src');
let fixedCount = 0;

files.forEach(filePath => {
  try {
    console.log(`🔧 Processing: ${filePath}`);
    let code = fs.readFileSync(filePath, 'utf8');
    let originalCode = code;
    let modified = false;

    // 1. Remove duplicate React imports
    const hasStarImport = code.includes('import * as React from');
    const hasDefaultImport = code.includes('import React from');
    
    if (hasStarImport && hasDefaultImport) {
      code = code.replace(/import\s+React\s+from\s+['"]react['"]\s*;?\s*\n?/g, '');
      modified = true;
    }

    // 2. Fix lucide-react imports and JSX usage for all collision-prone icons
    Object.keys(collisionMap).forEach(iconName => {
      const aliasName = collisionMap[iconName];
      
      // Fix import statements - handle both single and multiple imports
      code = code.replace(
        new RegExp(`import\\s*{([^}]*\\b${iconName}\\b[^}]*)}\\s*from\\s*['"]lucide-react['"]`, 'g'),
        (match, imports) => {
          const newImports = imports.replace(
            new RegExp(`\\b${iconName}\\b`), 
            `${iconName} as ${aliasName}`
          );
          return `import {${newImports}} from 'lucide-react'`;
        }
      );

      // Fix JSX usage - opening tags
      code = code.replace(
        new RegExp(`<\\s*${iconName}(\\b|[\\s>])`, 'g'),
        `<${aliasName}$1`
      );
      
      // Fix JSX usage - closing tags
      code = code.replace(
        new RegExp(`</\\s*${iconName}\\s*>`, 'g'),
        `</${aliasName}>`
      );
    });

    // 3. Clean up any stray semicolons
    code = code.replace(/^\s*;\s*\n/gm, '');

    // 4. Clean up any incomplete "as" statements
    code = code.replace(/(\{[^}]*)\b([A-Za-z_]\w*)\s+as\s*([,}\r\n])/g, '$1$3');

    if (code !== originalCode) {
      fs.writeFileSync(filePath, code, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      fixedCount++;
    }
  } catch (error) {
    console.log(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log(`\n🎉 Fixed ${fixedCount} files!`);
console.log('Now restart your dev server: npm run dev');
