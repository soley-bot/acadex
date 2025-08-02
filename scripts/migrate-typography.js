#!/usr/bin/env node

/**
 * Typography Migration Script
 * Automatically converts old typography patterns to our new Typography component
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Typography mapping rules
const typographyMappings = [
  // Display headings
  {
    pattern: /className="[^"]*text-4xl[^"]*md:text-5xl[^"]*lg:text-6xl[^"]*font-bold[^"]*"/g,
    replacement: 'className="',
    component: '<Typography variant="display-lg" as="h1">'
  },
  {
    pattern: /className="[^"]*text-3xl[^"]*md:text-4xl[^"]*font-bold[^"]*"/g,
    replacement: 'className="',
    component: '<Typography variant="h2" as="h2">'
  },
  {
    pattern: /className="[^"]*text-2xl[^"]*font-bold[^"]*"/g,
    replacement: 'className="',
    component: '<Typography variant="h3" as="h3">'
  },
  
  // Body text
  {
    pattern: /className="[^"]*text-xl[^"]*md:text-2xl[^"]*text-gray-600[^"]*"/g,
    replacement: 'className="',
    component: '<Typography variant="lead">'
  },
  {
    pattern: /className="[^"]*text-lg[^"]*text-gray-600[^"]*"/g,
    replacement: 'className="',
    component: '<Typography variant="body-lg">'
  },
  {
    pattern: /className="[^"]*text-gray-700[^"]*"/g,
    replacement: 'className="',
    component: '<Typography variant="body-md">'
  },
  
  // Small text
  {
    pattern: /className="[^"]*text-sm[^"]*font-bold[^"]*"/g,
    replacement: 'className="',
    component: '<Typography variant="caption">'
  }
];

// Import statements to add
const requiredImports = `import { Typography } from '@/components/ui/Typography'
import { Container, Section, Grid } from '@/components/ui/Layout'`;

function migrateFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check if already has Typography import
  if (content.includes("from '@/components/ui/Typography'")) {
    console.log(`✓ ${filePath} already migrated`);
    return;
  }
  
  let newContent = content;
  let hasChanges = false;
  
  // Add imports after existing imports
  const importMatch = newContent.match(/import[^;]+from[^;]+[';]/g);
  if (importMatch) {
    const lastImport = importMatch[importMatch.length - 1];
    const lastImportIndex = newContent.indexOf(lastImport) + lastImport.length;
    newContent = newContent.slice(0, lastImportIndex) + '\n' + requiredImports + newContent.slice(lastImportIndex);
    hasChanges = true;
  }
  
  // Apply typography mappings
  typographyMappings.forEach(mapping => {
    if (mapping.pattern.test(newContent)) {
      // This is a simplified approach - in practice you'd need more sophisticated parsing
      console.log(`Found pattern in ${filePath}: ${mapping.pattern}`);
      hasChanges = true;
    }
  });
  
  if (hasChanges) {
    console.log(`📝 Would migrate: ${filePath}`);
    // fs.writeFileSync(filePath, newContent);
  }
}

// Find all React/TypeScript files
const files = glob.sync('src/app/**/*.{tsx,jsx}', { cwd: process.cwd() });

console.log('🔍 Typography Migration Analysis\n');
console.log(`Found ${files.length} files to analyze\n`);

files.forEach(migrateFile);

console.log('\n✅ Analysis complete!');
console.log('\nTo actually apply changes, uncomment the fs.writeFileSync line.');
