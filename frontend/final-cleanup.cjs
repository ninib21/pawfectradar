const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Remove duplicate React imports
    const reactImports = content.match(/import\s+React\s+from\s+['"]react['"]/g);
    if (reactImports && reactImports.length > 1) {
      content = content.replace(/import\s+React\s+from\s+['"]react['"]/g, '');
      content = "import React from 'react';\n" + content;
      modified = true;
    }

    // Remove duplicate lucide-react imports
    const lucideImports = content.match(/import\s*{([^}]+)}\s*from\s*['"]lucide-react['"]/g);
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

    // Remove unused React imports (if React is not used)
    if (content.includes("import React from 'react'") && !content.includes('React.') && !content.includes('createElement')) {
      content = content.replace("import React from 'react'", '');
      modified = true;
    }

    // Remove unused variables (simple cases)
    const unusedVarPatterns = [
      /const\s+(\w+)\s*=\s*useState\([^)]*\);\s*\/\/\s*unused/,
      /const\s+(\w+)\s*=\s*[^;]+;\s*\/\/\s*never used/,
      /const\s+(\w+)\s*=\s*[^;]+;\s*\/\/\s*unused/
    ];

    unusedVarPatterns.forEach(pattern => {
      content = content.replace(pattern, '');
      modified = true;
    });

    // Fix useEffect dependencies by adding useCallback
    const useEffectPattern = /const\s+(\w+)\s*=\s*async\s*\(\)\s*=>\s*{([^}]*)}\s*;?\s*\n\s*useEffect\(\(\)\s*=>\s*{\s*\1\(\)\s*},\s*\[\]\)/g;
    content = content.replace(useEffectPattern, (match, funcName, funcBody) => {
      return `const ${funcName} = useCallback(async () => {${funcBody}}, []);\n  useEffect(() => {\n    ${funcName}();\n  }, [${funcName}])`;
    });

    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Cleaned: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error cleaning ${filePath}:`, error.message);
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

console.log('🔧 Starting final cleanup...');
walkDir('.');
console.log('✅ Final cleanup completed!');
