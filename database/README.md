# Acadex Database Setup

This folder contains the essential database setup files for the Acadex learning management system.

## Files Overview

### 🗄️ **database-schema-v3-current.sql**
- **Purpose**: Complete, production-ready database schema
- **Status**: ✅ Current and up-to-date
- **Contains**: All tables, indexes, triggers, RLS policies, and sample data
- **Usage**: Run this to set up a new database instance
- **Features**: 
  - Complete quiz system with reading support
  - Advanced analytics and question tracking
  - Gamification (badges, leaderboards)
  - E-commerce and certificate system
  - AI content review capabilities
  - Learning paths and templates

### 👤 **create-admin-user.sql**
- **Purpose**: Creates a development admin user
- **Status**: ✅ Active for development
- **Usage**: Run after schema setup for development/testing
- **Credentials**: admin@acadex.com (development only)

### 📁 **storage-setup.sql**
- **Purpose**: Configures Supabase storage buckets
- **Status**: ✅ Required for file uploads
- **Usage**: Run in Supabase SQL Editor
- **Buckets**: course-images, quiz-images, user-avatars, lesson-resources

## Setup Instructions

1. **Database Setup**: Run `database-schema-v3-current.sql` in your PostgreSQL/Supabase instance
2. **Storage Setup**: Run `storage-setup.sql` in Supabase SQL Editor
3. **Development**: Optionally run `create-admin-user.sql` for testing

## Removed Files

The following files were removed during cleanup (functionality integrated into v3 schema):
- ❌ `database-schema-v2.sql` - Outdated schema
- ❌ `add-quiz-constraints.sql` - Already included in v3
- ❌ `add-reading-quiz-support.sql` - Already included in v3
- ❌ `unified-category-migration.sql` - Already included in v3

## Database Features

Your current database supports:
- ✅ 45+ tables with full LMS functionality
- ✅ Reading quiz support with passage fields
- ✅ Advanced question types (multiple choice, essay, matching, etc.)
- ✅ Gamification system (badges, leaderboards, stats)
- ✅ E-commerce capabilities (courses, payments, certificates)
- ✅ AI-powered content review system
- ✅ Learning paths and structured progression
- ✅ Comprehensive analytics and reporting
- ✅ Group collaboration features
- ✅ Adaptive quiz settings
- ✅ Performance-optimized indexes

## Version History
- **v3 (Current)**: Complete feature set matching production database
- **v2**: Basic LMS with quiz system (deprecated)
- **v1**: Initial schema (deprecated)