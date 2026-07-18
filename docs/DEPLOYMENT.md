# Deployment Guide

## Different Institute ERP Platform

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Supabase Setup](#supabase-setup)
4. [Local Development](#local-development)
5. [Production Deployment](#production-deployment)
6. [Docker Deployment](#docker-deployment)
7. [Vercel Deployment](#vercel-deployment)
8. [Database Migration](#database-migration)
9. [Monitoring](#monitoring)
10. [Backup & Recovery](#backup--recovery)
11. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| Node.js | 18+ | Runtime environment |
| npm/yarn/pnpm | Latest | Package manager |
| Git | Latest | Version control |
| Supabase CLI | Latest | Database management |

### Required Accounts

- [Supabase](https://supabase.com/) - Backend as a Service
- [Vercel](https://vercel.com/) (optional) - Hosting
- [GitHub](https://github.com/) (optional) - Code repository

---

## Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-org/different-institute-erp.git
cd different-institute-erp
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Different Institute ERP
```

---

## Supabase Setup

### Option 1: Cloud (Recommended for Production)

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose organization and region
   - Set database password
   - Wait for project creation

2. **Get Credentials**
   - Go to Project Settings → API
   - Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - Copy `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copy `service_role secret` key → `SUPABASE_SERVICE_ROLE_KEY`

3. **Link CLI to Project**
   ```bash
   supabase login
   supabase link --project-ref your-project-id
   ```

4. **Run Migrations**
   ```bash
   supabase db push
   ```

5. **Seed Database**
   ```bash
   supabase db seed
   ```

### Option 2: Local Development

1. **Install Docker**
   - [Docker Desktop](https://www.docker.com/products/docker-desktop/)

2. **Start Supabase Locally**
   ```bash
   supabase start
   ```

   This starts:
   - API: http://localhost:54321
   - Studio: http://localhost:54323
   - Database: localhost:54322
   - Inbucket: http://localhost:54324

3. **Run Migrations**
   ```bash
   supabase db reset
   ```

4. **Update Environment**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<from supabase status>
   ```

---

## Local Development

### Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript checker |
| `npm run format` | Format code with Prettier |
| `npm run db:migrate` | Push database migrations |
| `npm run db:reset` | Reset database |
| `npm run db:seed` | Seed database |
| `npm run db:generate-types` | Generate TypeScript types |

---

## Production Deployment

### Build Application

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=https://erp.yourdomain.com
NODE_ENV=production
```

---

## Docker Deployment

### Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
    restart: unless-stopped
```

### Build and Run

```bash
# Build image
docker build -t different-institute-erp .

# Run container
docker run -p 3000:3000 --env-file .env.local different-institute-erp

# Or use docker-compose
docker-compose up -d
```

---

## Vercel Deployment

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: `.next`

### 3. Add Environment Variables

In Vercel project settings → Environment Variables:

| Key | Value |
|-----|-------|
| NEXT_PUBLIC_SUPABASE_URL | https://your-project.supabase.co |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | your-anon-key |
| SUPABASE_SERVICE_ROLE_KEY | your-service-role-key |
| NEXT_PUBLIC_APP_URL | https://your-domain.vercel.app |

### 4. Deploy

Click "Deploy" or push to trigger automatic deployment.

### Custom Domain

1. Go to Project Settings → Domains
2. Add your domain
3. Configure DNS records as instructed

---

## Database Migration

### Running Migrations

```bash
# Push migrations to remote database
supabase db push

# Reset local database (re-runs all migrations)
supabase db reset

# Create new migration
supabase migration new migration_name
```

### Migration Files

```
supabase/migrations/
├── 0001_extensions.sql
├── 0002_enums.sql
├── 0003_core_platform.sql
├── 0004_security.sql
├── 0005_student_management.sql
├── 0006_academic_management.sql
├── 0007_finance.sql
└── 0008_attendance.sql
```

### Seeding Database

```bash
# Run seed file
supabase db seed

# Or manually via SQL editor in Supabase Studio
```

### Generating Types

```bash
# Generate TypeScript types from database schema
supabase gen types typescript --local > src/lib/types/database.ts
```

---

## Monitoring

### Supabase Dashboard

Monitor your application through Supabase Dashboard:

1. **Database**: Query performance, connections, storage
2. **Authentication**: User activity, sessions
3. **Storage**: File uploads, bandwidth
4. **Logs**: API logs, database logs, auth logs
5. **Reports**: Usage statistics

### Health Check Endpoint

Create `/api/health` endpoint:

```typescript
// src/app/api/health/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('tenants').select('id').limit(1);
    
    if (error) throw error;
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
```

### Error Tracking

Consider integrating:
- [Sentry](https://sentry.io/) - Error tracking
- [LogRocket](https://logrocket.com/) - Session replay
- [Datadog](https://www.datadoghq.com/) - APM

---

## Backup & Recovery

### Supabase Automatic Backups

Supabase Pro plan includes:
- Daily automated backups
- 7-day retention (Pro), 30-day (Team)
- Point-in-time recovery

### Manual Backup

```bash
# Using pg_dump
pg_dump -h db.your-project.supabase.co -U postgres -d postgres > backup.sql

# Using Supabase CLI
supabase db dump > backup.sql
```

### Restore

```bash
# Restore from backup
psql -h db.your-project.supabase.co -U postgres -d postgres < backup.sql
```

---

## Troubleshooting

### Common Issues

#### 1. Supabase Connection Error

```
Error: Invalid API key
```

**Solution**: Verify your environment variables are correct.

#### 2. RLS Policy Error

```
Error: new row violates row-level security policy
```

**Solution**: Ensure the user has the correct permissions and tenant assignment.

#### 3. Migration Error

```
Error: relation "table_name" already exists
```

**Solution**: Reset the database or check for duplicate migrations.

#### 4. Build Error

```
Type error: Property 'x' does not exist on type 'y'
```

**Solution**: Regenerate types with `npm run db:generate-types`.

### Getting Help

1. Check [Supabase Documentation](https://supabase.com/docs)
2. Check [Next.js Documentation](https://nextjs.org/docs)
3. Search [GitHub Issues](https://github.com/your-org/different-institute-erp/issues)
4. Contact support@differentinstitute.com

---

## Performance Optimization

### Database

1. **Indexes**: Ensure proper indexes on frequently queried columns
2. **Connection Pooling**: Use Supabase connection pooler for serverless
3. **Query Optimization**: Use `select()` to fetch only needed columns
4. **Pagination**: Use range queries for large datasets

### Application

1. **Caching**: Implement React Query for client-side caching
2. **Code Splitting**: Use dynamic imports for heavy components
3. **Image Optimization**: Use Next.js Image component
4. **CDN**: Serve static assets through CDN

### Supabase

1. **Read Replicas**: Enable for read-heavy workloads
2. **Connection Pooling**: Use PgBouncer for connection management
3. **Edge Functions**: Use for server-side logic close to users

---

## Security Checklist

- [ ] Enable RLS on all tables
- [ ] Configure proper RLS policies
- [ ] Use service role only for admin operations
- [ ] Rotate API keys regularly
- [ ] Enable 2FA for admin accounts
- [ ] Set up proper CORS policies
- [ ] Configure rate limiting
- [ ] Enable audit logging
- [ ] Regular security updates
- [ ] Monitor for suspicious activity

---

## Updates

### Updating Dependencies

```bash
# Check for updates
npm outdated

# Update all dependencies
npm update

# Update specific package
npm update package-name
```

### Updating Migrations

1. Create new migration file
2. Test locally with `supabase db reset`
3. Push to production with `supabase db push`

---

## Support

- 📧 Email: support@differentinstitute.com
- 📖 Documentation: [docs/](docs/)
- 🐛 Issues: [GitHub Issues](https://github.com/your-org/different-institute-erp/issues)
