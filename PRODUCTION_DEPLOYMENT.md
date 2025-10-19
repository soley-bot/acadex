# 🚀 Production Deployment Guide

## Pre-Deployment Checklist

### ✅ Security Audit
- [x] No secrets in committed code
- [x] `.env.local` is gitignored
- [x] Environment variables properly configured
- [x] Service role keys are server-side only
- [x] 0 npm security vulnerabilities

### ✅ Code Quality
- [x] ESLint passes with 0 errors
- [x] TypeScript compilation succeeds
- [x] Console.logs replaced with logger (development-only)
- [x] Production build removes console logs (except error/warn)

### ✅ Performance
- [x] Bundle analyzer configured (`npm run analyze`)
- [x] Image optimization enabled (WebP, AVIF)
- [x] Package imports optimized (lucide-react, radix-ui)
- [x] CSS optimization in place

---

## Environment Setup

### 1. Create Production Environment File

Copy `.env.production.example` to `.env.production.local`:

```bash
cp .env.production.example .env.production.local
```

### 2. Configure Production Variables

Edit `.env.production.local` with your production values:

```bash
# Required - Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Required - Site URL
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"

# Required - Database
DATABASE_URL="postgresql://postgres:password@db.project.supabase.co:5432/postgres"

# Optional - AI Features (only if using)
GOOGLE_AI_API_KEY="your-key"
ANTHROPIC_API_KEY="your-key"
OPENAI_API_KEY="your-key"

# Optional - Google Sheets Import (only if using)
GOOGLE_SERVICE_ACCOUNT_EMAIL="service@project.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

---

## Deployment Options

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **Configure Environment Variables in Vercel Dashboard**
   - Go to Project Settings → Environment Variables
   - Add all production variables from `.env.production.local`
   - Set scope to "Production"

5. **Configure Domain**
   - Go to Project Settings → Domains
   - Add your custom domain

### Option 2: Self-Hosted (Docker)

1. **Build Production Image**
   ```bash
   docker build -t acadex:latest .
   ```

2. **Run Container**
   ```bash
   docker run -p 3000:3000 --env-file .env.production.local acadex:latest
   ```

### Option 3: Other Platforms

The app is compatible with:
- **Netlify**: Use `next.config.js` as-is
- **Railway**: Connect GitHub repo and add env vars
- **AWS Amplify**: Use Next.js SSR hosting
- **DigitalOcean App Platform**: Deploy from GitHub

---

## Database Setup

### 1. Run Schema in Supabase

```sql
-- Execute in Supabase SQL Editor
-- File: database/database-schema-v3-current.sql
```

### 2. Create Admin User

```sql
-- Execute in Supabase SQL Editor
-- File: database/create-admin-user.sql
-- Update with your email before running
```

### 3. Setup Storage

```sql
-- Execute in Supabase SQL Editor
-- File: database/storage-setup.sql
```

### 4. Verify Schema

```sql
-- Optional: Verify everything is working
-- File: database/simple-verification.sql
```

---

## Production Build Verification

### 1. Test Build Locally

```bash
# Build production bundle
npm run build

# Start production server
npm start

# Visit http://localhost:3000
```

### 2. Check Bundle Size

```bash
# Analyze bundle
npm run analyze

# Look for:
# - Main bundle < 200KB
# - No duplicate dependencies
# - Proper code splitting
```

### 3. Performance Testing

- Run Lighthouse audit (target: 90+ score)
- Test Core Web Vitals
- Verify image loading (WebP/AVIF formats)
- Check API response times

---

## Post-Deployment Checklist

### Security
- [ ] HTTPS enabled
- [ ] Environment variables set in hosting platform
- [ ] No secrets exposed in browser network tab
- [ ] CORS configured properly in Supabase
- [ ] RLS policies enabled in Supabase

### Functionality
- [ ] User authentication works (sign up, login, logout)
- [ ] Admin dashboard accessible
- [ ] Course creation works
- [ ] Quiz creation works
- [ ] Student quiz taking works
- [ ] Progress tracking works
- [ ] Import from Google Sheets works (if configured)

### Performance
- [ ] Page load < 3 seconds
- [ ] Images load in WebP/AVIF
- [ ] No console errors in production
- [ ] API calls complete successfully

### Monitoring
- [ ] Setup error tracking (Sentry, LogRocket, etc.)
- [ ] Configure uptime monitoring
- [ ] Setup analytics (Google Analytics, Plausible, etc.)
- [ ] Monitor database performance in Supabase

---

## Environment Variables Reference

### Required for All Deployments

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | `eyJhbGc...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role (server-side) | `eyJhbGc...` |
| `NEXT_PUBLIC_SITE_URL` | Your production domain | `https://acadex.com` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://...` |

### Optional AI Features

| Variable | Description | Required For |
|----------|-------------|--------------|
| `GOOGLE_AI_API_KEY` | Google Gemini API | AI question enhancement (Gemini) |
| `ANTHROPIC_API_KEY` | Anthropic Claude API | AI question enhancement (Claude) |
| `OPENAI_API_KEY` | OpenAI API | Future AI features |

### Optional Import Features

| Variable | Description | Required For |
|----------|-------------|--------------|
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Google service account | Google Sheets import |
| `GOOGLE_PRIVATE_KEY` | Google service private key | Google Sheets import |

---

## Troubleshooting

### Build Fails

1. Clear Next.js cache:
   ```bash
   rm -rf .next
   npm run build
   ```

2. Check Node version (requires 18+):
   ```bash
   node --version
   ```

### Database Connection Issues

1. Verify DATABASE_URL in environment
2. Check Supabase project status
3. Verify network allows connections to Supabase
4. Test with Supabase SQL Editor

### Authentication Issues

1. Verify NEXT_PUBLIC_SUPABASE_URL is correct
2. Check NEXT_PUBLIC_SUPABASE_ANON_KEY is valid
3. Verify site URL matches deployment URL
4. Check Supabase Authentication settings

### Image Upload Issues

1. Run `database/storage-setup.sql`
2. Verify RLS policies in Supabase Storage
3. Check bucket permissions
4. Verify CORS settings in Supabase

---

## Rollback Plan

If deployment fails:

1. **Vercel**: Rollback to previous deployment
   ```bash
   vercel rollback
   ```

2. **Docker**: Run previous image
   ```bash
   docker run acadex:previous-tag
   ```

3. **Database**: Restore from Supabase backup
   - Supabase Dashboard → Database → Backups

---

## Support & Maintenance

### Regular Maintenance
- Update dependencies monthly: `npm update`
- Check security audits: `npm audit`
- Monitor Supabase usage and quotas
- Review error logs regularly

### Performance Monitoring
- Monitor Core Web Vitals in production
- Track database query performance
- Review bundle size after updates
- Optimize images periodically

### Scaling Considerations
- Supabase auto-scales (check quotas)
- Next.js edge functions for global performance
- Consider CDN for static assets
- Database read replicas if needed

---

## Additional Resources

- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [Web Vitals Guide](https://web.dev/vitals/)

---

**Last Updated**: 2025-01-19
**Version**: 1.0.1
