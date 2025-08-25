const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing naming collisions in frontend files...');

// Files that need fixing based on the error messages
const filesToFix = [
  'src/pages/Bookings.jsx',
  'src/pages/Profile.jsx'
];

const iconMap = {
  'User': 'UserIcon',
  'Review': 'ReviewIcon',
  'Calendar': 'CalendarIcon',
  'Shield': 'ShieldIcon',
  'Star': 'StarIcon',
  'Settings': 'SettingsIcon'
};

filesToFix.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  console.log(`🔧 Fixing: ${filePath}`);
  let code = fs.readFileSync(filePath, 'utf8');
  let originalCode = code;

  // Fix lucide-react imports by aliasing conflicting names
  Object.keys(iconMap).forEach(iconName => {
    const aliasName = iconMap[iconName];
    
    // Fix import statements: { User, Review } -> { User as UserIcon, Review as ReviewIcon }
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

    // Fix JSX usage: <User> -> <UserIcon>
    code = code.replace(
      new RegExp(`<\\s*${iconName}(\\b|[\\s>])`, 'g'),
      `<${aliasName}$1`
    );
    code = code.replace(
      new RegExp(`</\\s*${iconName}\\s*>`, 'g'),
      `</${aliasName}>`
    );
  });

  // Remove duplicate React imports if both "* as React" and "React" exist
  const hasStarImport = code.includes('import * as React from');
  const hasDefaultImport = code.includes('import React from');
  
  if (hasStarImport && hasDefaultImport) {
    code = code.replace(/import\s+React\s+from\s+['"]react['"]\s*;?\s*\n?/g, '');
  }

  if (code !== originalCode) {
    fs.writeFileSync(filePath, code, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
  } else {
    console.log(`ℹ️  No changes needed: ${filePath}`);
  }
});

console.log('\n🎉 Collision fixes complete!');
console.log('Now restart your dev server: npm run dev');
