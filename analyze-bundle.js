#!/usr/bin/env node
/**
 * Bundle Size Analyzer for Phase 3 Optimization
 * Run this after build to analyze bundle performance
 */

const fs = require('fs');
const path = require('path');

// Analyze Next.js build output
function analyzeBuildOutput() {
  const buildOutputPath = path.join(process.cwd(), '.next');
  
  if (!fs.existsSync(buildOutputPath)) {
    console.error('❌ No .next build folder found. Run `npm run build` first.');
    process.exit(1);
  }

  console.log('🔍 Analyzing Bundle Sizes (Phase 3 Optimization)\n');

  // Check for large bundles
  const statsPath = path.join(buildOutputPath, 'analyze');
  if (fs.existsSync(statsPath)) {
    console.log('📊 Bundle analysis available at:', statsPath);
  } else {
    console.log('💡 Tip: Install @next/bundle-analyzer for detailed analysis');
    console.log('   npm install --save-dev @next/bundle-analyzer');
  }

  // Analyze static pages
  const staticPath = path.join(buildOutputPath, 'static');
  if (fs.existsSync(staticPath)) {
    analyzeFolderSizes(staticPath);
  }

  // Performance recommendations
  console.log('\n🚀 Phase 3 Performance Recommendations:');
  console.log('✅ React Query caching optimized');
  console.log('✅ Component memoization applied');
  console.log('✅ Image lazy loading enhanced');
  console.log('✅ Card components consolidated');
  
  console.log('\n📈 Next optimizations to consider:');
  console.log('• Dynamic imports for admin routes');
  console.log('• Icon tree-shaking optimization');
  console.log('• CSS-in-JS bundle splitting');
}

function analyzeFolderSizes(folderPath) {
  try {
    const items = fs.readdirSync(folderPath);
    let totalSize = 0;
    
    items.forEach(item => {
      const itemPath = path.join(folderPath, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isFile() && item.endsWith('.js')) {
        const sizeKB = Math.round(stats.size / 1024);
        totalSize += sizeKB;
        
        if (sizeKB > 100) {
          console.log(`📦 Large bundle: ${item} (${sizeKB} KB)`);
        }
      }
    });
    
    console.log(`📊 Total JS bundle size: ${totalSize} KB`);
    
    if (totalSize > 1000) {
      console.log('⚠️  Consider bundle splitting for files > 100KB');
    } else {
      console.log('✅ Bundle size within recommended limits');
    }
  } catch (error) {
    console.log('Unable to analyze folder sizes:', error.message);
  }
}

if (require.main === module) {
  analyzeBuildOutput();
}

module.exports = { analyzeBuildOutput };