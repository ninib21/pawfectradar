
const fs = require('fs');
const path = require('path');

// Common unused imports to remove
const unusedImports = [
  'React',
  'useState',
  'useEffect',
  'useCallback',
  'useMemo',
  'useRef',
  'useContext',
  'createContext',
  'Button',
  'Card',
  'CardContent',
  'CardHeader',
  'CardTitle',
  'Input',
  'Label',
  'Badge',
  'Select',
  'SelectContent',
  'SelectItem',
  'SelectTrigger',
  'SelectValue',
  'User',
  'Star',
  'MapPin',
  'DollarSign',
  'Heart',
  'Clock',
  'Calendar',
  'Filter',
  'Plus',
  'X',
  'Shield',
  'Award',
  'AlertCircle',
  'CreditCard',
  'PawPrint',
  'ArrowRight',
  'Bell',
  'Download',
  'Smartphone',
  'Apple',
  'PlayCircle',
  'Users',
  'Gallery',
  'Edit',
  'MessageCircle',
  'Review',
  'Dimensions',
  'Platform'
];

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Remove unused React imports
    if (content.includes("import React from 'react'") && !content.includes('React.')) {
      content = content.replace("import React from 'react'", '');
      modified = true;
    }

    // Remove unused imports from lucide-react
    const lucideImports = content.match(/import\s*{([^}]+)}\s*from\s*['"]lucide-react['"]/g);
    if (lucideImports) {
      lucideImports.forEach(importStatement => {
        const imports = importStatement.match(/import\s*{([^}]+)}\s*from\s*['"]lucide-react['"]/)[1];
        const importList = imports.split(',').map(i => i.trim());
        const usedImports = importList.filter(imp => {
          const cleanImp = imp.replace(/\s+as\s+\w+/, '').trim();
          return content.includes(cleanImp) && !unusedImports.includes(cleanImp);
        });
        
        if (usedImports.length === 0) {
          content = content.replace(importStatement, '');
          modified = true;
        } else if (usedImports.length !== importList.length) {
          const newImport = `import { ${usedImports.join(', ')} } from 'lucide-react'`;
          content = content.replace(importStatement, newImport);
          modified = true;
        }
      });
    }

    // Remove unused variables (simple cases)
    const unusedVarPatterns = [
      /const\s+(\w+)\s*=\s*useState\([^)]*\);\s*\/\/\s*unused/,
      /const\s+(\w+)\s*=\s*[^;]+;\s*\/\/\s*unused/,
      /const\s+(\w+)\s*=\s*[^;]+;\s*\/\/\s*never used/
    ];

    unusedVarPatterns.forEach(pattern => {
      content = content.replace(pattern, '');
      modified = true;
    });

    // Fix useEffect dependencies
    const useEffectPattern = /useEffect\(\(\)\s*=>\s*{([^}]*)},\s*\[\]\)/g;
    content = content.replace(useEffectPattern, (match, body) => {
      // Extract function calls from useEffect body
      const functionCalls = body.match(/\b(\w+)\s*\(/g);
      if (functionCalls) {
        const deps = functionCalls
          .map(call => call.replace('(', ''))
          .filter(dep => !['console', 'setTimeout', 'setInterval'].includes(dep));
        if (deps.length > 0) {
          return `useEffect(() => {${body}}, [${deps.join(', ')}])`;
        }
      }
      return match;
    });

    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed: ${filePath}`);
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
    } else if (file.endsWith('.jsx') || file.endsWith('.tsx') || file.endsWith('.js')) {
      fixFile(filePath);
    }
  });
}

console.log('🔧 Starting ESLint warning fixes...');
walkDir('.');
console.log('✅ ESLint warning fixes completed!');
