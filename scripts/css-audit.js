#!/usr/bin/env node

/**
 * CSS Conflict Detector for Acadex
 * Finds duplicate classes, conflicting styles, and optimization opportunities
 */

const fs = require('fs');
const path = require('path');

class CSSAuditor {
  constructor() {
    this.duplicateClasses = new Set();
    this.zIndexUsage = [];
    this.importantUsage = [];
    this.componentClasses = new Map();
  }

  async auditGlobalCSS() {
    const globalsPath = path.join(process.cwd(), 'src/app/globals.css');
    const content = fs.readFileSync(globalsPath, 'utf8');
    
    console.log('🔍 CSS Audit Report for Acadex\n');
    console.log('===============================\n');
    
    // Find duplicate class definitions
    this.findDuplicateClasses(content);
    
    // Find z-index usage
    this.findZIndexUsage(content);
    
    // Find !important usage
    this.findImportantUsage(content);
    
    // Analyze file size
    this.analyzeFileSize(content);
    
    this.generateReport();
  }

  findDuplicateClasses(content) {
    const classRegex = /\.([a-zA-Z][a-zA-Z0-9_-]*)/g;
    const classes = new Map();
    let match;
    
    while ((match = classRegex.exec(content)) !== null) {
      const className = match[1];
      if (classes.has(className)) {
        classes.set(className, classes.get(className) + 1);
      } else {
        classes.set(className, 1);
      }
    }
    
    // Find duplicates
    for (const [className, count] of classes) {
      if (count > 1) {
        this.duplicateClasses.add(className);
      }
    }
  }

  findZIndexUsage(content) {
    const zIndexRegex = /z-(?:index:\s*(\d+)|(\d+))/g;
    let match;
    
    while ((match = zIndexRegex.exec(content)) !== null) {
      const value = match[1] || match[2];
      this.zIndexUsage.push(parseInt(value));
    }
  }

  findImportantUsage(content) {
    const importantMatches = content.match(/!important/g);
    this.importantUsage = importantMatches ? importantMatches.length : 0;
  }

  analyzeFileSize(content) {
    this.fileSize = content.length;
    this.lineCount = content.split('\n').length;
  }

  generateReport() {
    console.log(`📊 File Statistics:`);
    console.log(`   Size: ${(this.fileSize / 1024).toFixed(2)}KB`);
    console.log(`   Lines: ${this.lineCount}`);
    console.log('');
    
    console.log(`🔄 Duplicate Classes (${this.duplicateClasses.size}):`);
    if (this.duplicateClasses.size > 0) {
      const duplicates = Array.from(this.duplicateClasses).slice(0, 10);
      duplicates.forEach(className => {
        console.log(`   .${className}`);
      });
      if (this.duplicateClasses.size > 10) {
        console.log(`   ... and ${this.duplicateClasses.size - 10} more`);
      }
    } else {
      console.log('   ✅ No duplicate classes found!');
    }
    console.log('');
    
    console.log(`📏 Z-Index Usage (${this.zIndexUsage.length} instances):`);
    if (this.zIndexUsage.length > 0) {
      const uniqueZIndex = [...new Set(this.zIndexUsage)].sort((a, b) => a - b);
      console.log(`   Values: ${uniqueZIndex.join(', ')}`);
      console.log(`   ⚠️  Consider using CSS custom properties for z-index management`);
    }
    console.log('');
    
    console.log(`⚠️  !important Usage: ${this.importantUsage} instances`);
    if (this.importantUsage > 0) {
      console.log(`   🚨 High !important usage indicates specificity issues`);
    }
    console.log('');
    
    console.log('🚀 Recommendations:');
    console.log('   1. Consolidate duplicate classes');
    console.log('   2. Implement z-index scale with CSS custom properties');
    console.log('   3. Reduce !important usage by improving specificity');
    console.log('   4. Split large CSS file into logical modules');
    console.log('   5. Use CSS layers for better cascade management');
  }
}

// Run the audit
const auditor = new CSSAuditor();
auditor.auditGlobalCSS().catch(console.error);