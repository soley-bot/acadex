#!/usr/bin/env node

/**
 * Migration script to replace console statements with logger
 * Usage: node scripts/migrate-console-to-logger.js
 */

const fs = require('fs')
const path = require('path')

// Files and directories to process
const SOURCE_DIRS = ['src/components', 'src/app', 'src/lib']
const FILE_EXTENSIONS = ['.tsx', '.ts', '.js', '.jsx']

// Files to exclude from migration (to avoid recursion)
const EXCLUDED_FILES = ['src/lib/logger.ts', 'src/lib/logger.js']

// Mapping of console methods to logger methods
const CONSOLE_TO_LOGGER = {
  'console.log': 'logger.debug',
  'console.info': 'logger.info',
  'console.warn': 'logger.warn',
  'console.error': 'logger.error',
  'console.debug': 'logger.debug'
}

/**
 * Get all files in a directory recursively
 */
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath)

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file)
    
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles)
    } else if (FILE_EXTENSIONS.includes(path.extname(file))) {
      // Skip excluded files to prevent recursion
      const relativePath = fullPath.replace(process.cwd() + '/', '')
      if (!EXCLUDED_FILES.includes(relativePath)) {
        arrayOfFiles.push(fullPath)
      }
    }
  })

  return arrayOfFiles
}

/**
 * Check if file already imports logger
 */
function hasLoggerImport(content) {
  return content.includes("import { logger }") || content.includes("from './logger'") || content.includes("from '@/lib/logger'")
}

/**
 * Add logger import to file
 */
function addLoggerImport(content) {
  // Find existing imports
  const importLines = []
  const otherLines = []
  const lines = content.split('\n')
  let inImportSection = true

  for (const line of lines) {
    if (inImportSection && (line.trim().startsWith('import') || line.trim() === '')) {
      importLines.push(line)
    } else {
      if (inImportSection) {
        inImportSection = false
        // Add logger import before first non-import line
        if (!hasLoggerImport(content)) {
          importLines.push("import { logger } from '@/lib/logger'")
          importLines.push('')
        }
      }
      otherLines.push(line)
    }
  }

  return [...importLines, ...otherLines].join('\n')
}

/**
 * Replace console statements with logger calls
 */
function replaceConsoleStatements(content) {
  let modifiedContent = content
  let replacements = 0

  for (const [consoleMethod, loggerMethod] of Object.entries(CONSOLE_TO_LOGGER)) {
    // Pattern to match console.method(...)
    const pattern = new RegExp(`\\b${consoleMethod.replace('.', '\\.')}\\(`, 'g')
    const matches = modifiedContent.match(pattern) || []
    
    if (matches.length > 0) {
      modifiedContent = modifiedContent.replace(pattern, `${loggerMethod}(`)
      replacements += matches.length
      console.log(`  Replaced ${matches.length} instances of ${consoleMethod} with ${loggerMethod}`)
    }
  }

  return { content: modifiedContent, replacements }
}

/**
 * Process a single file
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    
    // Skip if no console statements
    if (!content.includes('console.')) {
      return { processed: false, replacements: 0 }
    }

    console.log(`\nProcessing: ${filePath}`)
    
    // Replace console statements
    const { content: contentWithReplacements, replacements } = replaceConsoleStatements(content)
    
    if (replacements === 0) {
      return { processed: false, replacements: 0 }
    }

    // Add logger import if needed
    let finalContent = contentWithReplacements
    if (!hasLoggerImport(contentWithReplacements)) {
      finalContent = addLoggerImport(contentWithReplacements)
      console.log(`  Added logger import`)
    }

    // Write back to file
    fs.writeFileSync(filePath, finalContent, 'utf8')
    console.log(`  ✅ Updated file with ${replacements} replacements`)
    
    return { processed: true, replacements }
  } catch (error) {
    console.error(`  ❌ Error processing ${filePath}:`, error.message)
    return { processed: false, replacements: 0, error: error.message }
  }
}

/**
 * Main migration function
 */
function migrateConsoleToLogger() {
  console.log('🚀 Starting console-to-logger migration...\n')
  
  let totalFiles = 0
  let processedFiles = 0
  let totalReplacements = 0
  const errors = []

  // Get all files to process
  const allFiles = []
  for (const dir of SOURCE_DIRS) {
    if (fs.existsSync(dir)) {
      allFiles.push(...getAllFiles(dir))
    }
  }

  totalFiles = allFiles.length
  console.log(`Found ${totalFiles} files to check\n`)

  // Process each file
  for (const filePath of allFiles) {
    const result = processFile(filePath)
    
    if (result.processed) {
      processedFiles++
      totalReplacements += result.replacements
    }
    
    if (result.error) {
      errors.push({ file: filePath, error: result.error })
    }
  }

  // Summary
  console.log('\n📊 Migration Summary:')
  console.log(`  Files checked: ${totalFiles}`)
  console.log(`  Files modified: ${processedFiles}`)
  console.log(`  Total replacements: ${totalReplacements}`)
  
  if (errors.length > 0) {
    console.log(`  Errors: ${errors.length}`)
    errors.forEach(({ file, error }) => {
      console.log(`    ❌ ${file}: ${error}`)
    })
  }

  if (processedFiles > 0) {
    console.log('\n✅ Migration completed successfully!')
    console.log('\n📝 Next steps:')
    console.log('  1. Review the changes')
    console.log('  2. Test your application')
    console.log('  3. Commit the changes if everything works')
  } else {
    console.log('\n✨ No console statements found to migrate')
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateConsoleToLogger()
}

module.exports = { migrateConsoleToLogger, processFile }
