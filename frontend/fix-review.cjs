const fs = require('fs');
const path = require('path');

const file = 'src/components/sitters/EnhancedSitterProfile.jsx';

if (!fs.existsSync(file)) {
  console.error(`File not found: ${file}`);
  process.exit(1);
}

console.log(`🔧 Fixing Review import conflict in ${file}...`);

let code = fs.readFileSync(file, 'utf8');

// 1) Fix the lucide-react import line - alias Review to ReviewIcon
code = code.replace(
  /import\s*{([^}]*Review[^}]*)}\s*from\s*['"]lucide-react['"]/g,
  (match, imports) => {
    // Replace 'Review' with 'Review as ReviewIcon' in the import list
    const newImports = imports.replace(/\bReview\b/g, 'Review as ReviewIcon');
    return `import {${newImports}} from 'lucide-react'`;
  }
);

// 2) Update JSX usage: <Review ...> -> <ReviewIcon ...> and </Review> -> </ReviewIcon>
code = code.replace(/<\s*Review(\b|[\s>])/g, '<ReviewIcon$1');
code = code.replace(/<\/\s*Review\s*>/g, '</ReviewIcon>');

// 3) Save the file
fs.writeFileSync(file, code, 'utf8');

console.log('✅ Fixed lucide Review import conflict!');
console.log('\nNow restart your dev server:');
console.log('  npm run dev');
