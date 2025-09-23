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
    // Remove all comments first to avoid false positives from examples in comments
    const contentWithoutComments = content
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove /* */ comments
      .replace(/\/\/.*$/gm, ''); // Remove // comments
    
    // Better approach: find actual CSS class definitions by looking for full class blocks
    const classBlocks = [];
    const classRegex = /\.([a-zA-Z][a-zA-Z0-9_-]*)\s*\{/g;
    let match;
    
    while ((match = classRegex.exec(contentWithoutComments)) !== null) {
      const className = match[1];
      const startPos = match.index;
      
      // Find the matching closing brace for this class
      let braceCount = 0;
      let endPos = match.index + match[0].length;
      let foundProperties = false;
      
      for (let i = endPos; i < contentWithoutComments.length; i++) {
        const char = contentWithoutComments[i];
        if (char === '{') braceCount++;
        if (char === '}') {
          if (braceCount === 0) {
            endPos = i;
            break;
          }
          braceCount--;
        }
        
        // Check if this block contains actual CSS properties (not just other selectors)
        if (!foundProperties && char === ':' && !contentWithoutComments.substring(match.index, i).includes('{')) {
          foundProperties = true;
        }
      }
      
      // Only count as a class definition if it contains actual properties
      const blockContent = contentWithoutComments.substring(startPos, endPos + 1);
      const hasProperties = /[a-zA-Z-]+\s*:\s*[^;]+;/.test(blockContent);
      
      if (hasProperties) {
        classBlocks.push({ className, content: blockContent });
      }
    }
    
    // Count duplicates
    const classes = new Map();
    for (const block of classBlocks) {
      const count = classes.get(block.className) || 0;
      classes.set(block.className, count + 1);
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
    const importantRegex = /[^}]*!important[^}]*/g;
    let match;
    let count = 0;
    
    while ((match = importantRegex.exec(content)) !== null) {
      const context = match[0];
      
      // Skip !important usage in accessibility contexts
      const isAccessibilityRelated = 
        context.includes('prefers-contrast: high') ||
        context.includes('prefers-reduced-motion') ||
        context.includes('high-contrast') ||
        context.includes('screen-reader') ||
        context.includes('focus') ||
        context.includes('aria-');
      
      if (!isAccessibilityRelated) {
        count++;
      }
    }
    
    this.importantUsage = count;
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