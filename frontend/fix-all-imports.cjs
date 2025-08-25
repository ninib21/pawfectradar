const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing ALL remaining import issues...');

// All problematic patterns to fix
const fixes = [
  // Fix duplicate "as" in imports
  {
    pattern: /(\w+)\s+as\s+(\w+)\s+as\s+\2/g,
    replacement: '$1 as $2'
  },
  // Fix incomplete "as" statements
  {
    pattern: /(\w+)\s+as\s*([,}])/g,
    replacement: '$1$2'
  },
  // Fix duplicate React imports
  {
    pattern: /import\s+React\s+from\s+['"]react['"]\s*;?\s*\n?/g,
    replacement: ''
  },
  // Fix stray semicolons
  {
    pattern: /^\s*;\s*\n/gm,
    replacement: ''
  }
];

// Icon names that need aliasing
const iconMap = {
  'User': 'UserIcon',
  'Review': 'ReviewIcon', 
  'Calendar': 'CalendarIcon',
  'Settings': 'SettingsIcon',
  'Star': 'StarIcon',
  'Shield': 'ShieldIcon',
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
    let code = fs.readFileSync(filePath, 'utf8');
    let originalCode = code;
    let modified = false;

    // Apply all fixes
    fixes.forEach(fix => {
      const newCode = code.replace(fix.pattern, fix.replacement);
      if (newCode !== code) {
        code = newCode;
        modified = true;
      }
    });

    // Fix lucide-react imports and JSX usage
    Object.keys(iconMap).forEach(iconName => {
      const aliasName = iconMap[iconName];
      
      // Fix import statements
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

      // Fix JSX usage
      code = code.replace(
        new RegExp(`<\\s*${iconName}(\\b|[\\s>])`, 'g'),
        `<${aliasName}$1`
      );
      code = code.replace(
        new RegExp(`</\\s*${iconName}\\s*>`, 'g'),
        `</${aliasName}>`
      );
    });

    if (code !== originalCode) {
      fs.writeFileSync(filePath, code, 'utf8');
      console.log(`✅ Fixed: ${path.basename(filePath)}`);
      fixedCount++;
    }
  } catch (error) {
    console.log(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log(`\n🎉 Fixed ${fixedCount} files!`);
console.log('Now restart your dev server: npm run dev');
