#!/usr/bin/env node
/**
 * Enhanced Bundle Size Analyzer for Week 2 Day 4 Optimization
 * Run this after build to analyze bundle performance and identify optimizations
 */

const fs = require('fs');
const path = require('path');

/**
 * Enhanced Bundle Analyzer with comprehensive analysis
 */
class EnhancedBundleAnalyzer {
  constructor() {
    this.buildOutputPath = path.join(process.cwd(), '.next');
    this.analysisResults = {
      totalSize: 0,
      pages: [],
      chunks: [],
      recommendations: []
    };
  }

  // Main analysis function
  async analyze() {
    console.log('🔍 Enhanced Bundle Analysis (Week 2 Day 4)\n');
    
    if (!fs.existsSync(this.buildOutputPath)) {
      console.error('❌ No .next build folder found. Run `npm run build` first.');
      process.exit(1);
    }

    // Analyze different aspects
    await this.analyzeStaticAssets();
    await this.analyzePages();
    await this.analyzeChunks();
    this.generateRecommendations();
    this.displayResults();
  }

  // Analyze static assets
  analyzeStaticAssets() {
    const staticPath = path.join(this.buildOutputPath, 'static');
    
    if (!fs.existsSync(staticPath)) {
      console.log('⚠️  No static folder found');
      return;
    }

    console.log('📊 Analyzing Static Assets:');
    
    const chunks = this.findJSFiles(staticPath);
    let totalSize = 0;
    
    chunks.forEach(chunk => {
      const sizeKB = Math.round(chunk.size / 1024);
      totalSize += sizeKB;
      
      this.analysisResults.chunks.push({
        name: chunk.name,
        size: sizeKB,
        path: chunk.path
      });
      
      if (sizeKB > 200) {
        console.log(`  🚨 Large chunk: ${chunk.name} (${sizeKB} KB)`);
      } else if (sizeKB > 100) {
        console.log(`  ⚠️  Medium chunk: ${chunk.name} (${sizeKB} KB)`);
      } else {
        console.log(`  ✅ Optimal chunk: ${chunk.name} (${sizeKB} KB)`);
      }
    });
    
    this.analysisResults.totalSize = totalSize;
    console.log(`\n📈 Total Static JS Size: ${totalSize} KB\n`);
  }

  // Analyze pages build info
  analyzePages() {
    const buildManifestPath = path.join(this.buildOutputPath, 'build-manifest.json');
    
    if (fs.existsSync(buildManifestPath)) {
      console.log('📄 Analyzing Pages:');
      
      try {
        const manifest = JSON.parse(fs.readFileSync(buildManifestPath, 'utf8'));
        
        Object.entries(manifest.pages || {}).forEach(([route, files]) => {
          const jsFiles = files.filter(file => file.endsWith('.js'));
          let routeSize = 0;
          
          jsFiles.forEach(file => {
            const filePath = path.join(this.buildOutputPath, 'static', file);
            if (fs.existsSync(filePath)) {
              const stats = fs.statSync(filePath);
              routeSize += Math.round(stats.size / 1024);
            }
          });
          
          this.analysisResults.pages.push({
            route,
            size: routeSize,
            files: jsFiles.length
          });
          
          if (routeSize > 500) {
            console.log(`  🚨 Heavy route: ${route} (${routeSize} KB, ${jsFiles.length} files)`);
          } else if (routeSize > 200) {
            console.log(`  ⚠️  Medium route: ${route} (${routeSize} KB, ${jsFiles.length} files)`);
          } else {
            console.log(`  ✅ Light route: ${route} (${routeSize} KB, ${jsFiles.length} files)`);
          }
        });
        
        console.log('');
      } catch (error) {
        console.log('  Unable to parse build manifest:', error.message);
      }
    }
  }

  // Analyze chunks for splitting opportunities
  analyzeChunks() {
    console.log('🧩 Chunk Analysis:');
    
    // Sort chunks by size
    const sortedChunks = this.analysisResults.chunks.sort((a, b) => b.size - a.size);
    
    console.log('\n  � Top 10 Largest Chunks:');
    sortedChunks.slice(0, 10).forEach((chunk, index) => {
      const emoji = index < 3 ? '🔥' : index < 6 ? '⚠️' : '📦';
      console.log(`    ${emoji} ${chunk.name}: ${chunk.size} KB`);
    });

    // Analyze vendor chunks
    const vendorChunks = sortedChunks.filter(chunk => 
      chunk.name.includes('vendor') || chunk.name.includes('framework')
    );
    
    if (vendorChunks.length > 0) {
      console.log('\n  📚 Vendor Chunks:');
      vendorChunks.forEach(chunk => {
        console.log(`    📦 ${chunk.name}: ${chunk.size} KB`);
      });
    }
  }

  // Generate optimization recommendations
  generateRecommendations() {
    const { totalSize, chunks, pages } = this.analysisResults;
    
    // Size-based recommendations
    if (totalSize > 2000) {
      this.analysisResults.recommendations.push({
        type: 'critical',
        title: 'Bundle Size Critical',
        description: `Total bundle size (${totalSize} KB) exceeds recommended 2MB`,
        actions: ['Implement aggressive code splitting', 'Remove unused dependencies', 'Enable tree shaking']
      });
    } else if (totalSize > 1000) {
      this.analysisResults.recommendations.push({
        type: 'warning',
        title: 'Bundle Size Warning',
        description: `Bundle size (${totalSize} KB) approaching 1MB limit`,
        actions: ['Consider code splitting for large routes', 'Optimize vendor chunks']
      });
    }

    // Large chunk recommendations
    const largeChunks = chunks.filter(chunk => chunk.size > 200);
    if (largeChunks.length > 0) {
      this.analysisResults.recommendations.push({
        type: 'warning',
        title: 'Large Chunks Detected',
        description: `Found ${largeChunks.length} chunks over 200KB`,
        actions: [
          'Implement dynamic imports for heavy components',
          'Split vendor dependencies',
          'Use React.lazy() for route components'
        ]
      });
    }

    // Page-specific recommendations
    const heavyPages = pages.filter(page => page.size > 300);
    if (heavyPages.length > 0) {
      this.analysisResults.recommendations.push({
        type: 'info',
        title: 'Heavy Pages Found',
        description: `${heavyPages.length} pages over 300KB`,
        actions: [
          'Implement route-based code splitting',
          'Lazy load page components',
          'Optimize component imports'
        ]
      });
    }

    // Week 2 Day 4 specific recommendations
    this.analysisResults.recommendations.push({
      type: 'info',
      title: 'Week 2 Day 4 Next Steps',
      description: 'Ready for advanced optimization techniques',
      actions: [
        'Implement dynamic imports',
        'Setup route-based splitting',
        'Optimize Core Web Vitals',
        'Configure advanced bundling'
      ]
    });
  }

  // Display comprehensive results
  displayResults() {
    console.log('🎯 Optimization Recommendations:\n');
    
    this.analysisResults.recommendations.forEach(rec => {
      const emoji = rec.type === 'critical' ? '🚨' : rec.type === 'warning' ? '⚠️' : '💡';
      
      console.log(`${emoji} ${rec.title}`);
      console.log(`   ${rec.description}`);
      console.log('   Actions:');
      rec.actions.forEach(action => {
        console.log(`   • ${action}`);
      });
      console.log('');
    });

    // Summary
    console.log('📋 Summary:');
    console.log(`• Total Bundle Size: ${this.analysisResults.totalSize} KB`);
    console.log(`• Number of Chunks: ${this.analysisResults.chunks.length}`);
    console.log(`• Pages Analyzed: ${this.analysisResults.pages.length}`);
    console.log(`• Recommendations: ${this.analysisResults.recommendations.length}`);
    
    // Status
    if (this.analysisResults.totalSize < 1000) {
      console.log('\n✅ Bundle size is optimal for Week 2 Day 4 optimizations');
    } else {
      console.log('\n🚀 Ready to implement Week 2 Day 4 code splitting strategies');
    }
  }

  // Helper: Find all JS files recursively
  findJSFiles(dir) {
    const files = [];
    
    const scan = (directory) => {
      try {
        const items = fs.readdirSync(directory);
        
        items.forEach(item => {
          const itemPath = path.join(directory, item);
          const stats = fs.statSync(itemPath);
          
          if (stats.isDirectory()) {
            scan(itemPath);
          } else if (stats.isFile() && item.endsWith('.js')) {
            files.push({
              name: item,
              path: itemPath,
              size: stats.size
            });
          }
        });
      } catch (error) {
        // Ignore permission errors
      }
    };
    
    scan(dir);
    return files;
  }
}

// Legacy analyzer for backward compatibility
function analyzeBuildOutput() {
  const analyzer = new EnhancedBundleAnalyzer();
  analyzer.analyze();
}

function analyzeFolderSizes(folderPath) {
  // Deprecated - use EnhancedBundleAnalyzer instead
  console.log('Using enhanced analyzer...');
  analyzeBuildOutput();
}

// Main execution
if (require.main === module) {
  const analyzer = new EnhancedBundleAnalyzer();
  analyzer.analyze();
}

module.exports = { 
  analyzeBuildOutput, 
  EnhancedBundleAnalyzer 
};