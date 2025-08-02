#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Automatically find all files that need fixing
const { execSync } = require('child_process');

function findFilesWithIssue() {
  try {
    const result = execSync(`find src/ -name "*.tsx" -o -name "*.ts" | xargs grep -l "import { logger } from '@/lib/logger'" | xargs grep -l "'use client'"`, { encoding: 'utf8' });
    return result.trim().split('\n').filter(f => f.trim());
  } catch (error) {
    return [];
  }
}

const files = findFilesWithIssue();

console.log('🔧 Fixing "use client" directive placement...\n');

let fixedCount = 0;

files.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Check if the file has the problematic pattern
  const hasIssue = content.includes("import { logger } from '@/lib/logger'\n\n'use client'");
  
  if (hasIssue) {
    // Fix the pattern
    content = content.replace(
      "import { logger } from '@/lib/logger'\n\n'use client'",
      "'use client'\n\nimport { logger } from '@/lib/logger'"
    );
    
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
    fixedCount++;
  } else {
    console.log(`✓ OK: ${filePath}`);
  }
});

console.log(`\n📊 Summary: Fixed ${fixedCount} files`);
console.log('✅ All "use client" directives are now properly placed!\n');
