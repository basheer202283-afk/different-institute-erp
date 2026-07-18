# Different Institute ERP Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.0-3ecf8e)](https://supabase.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-336791)](https://www.postgresql.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8)](https://tailwindcss.com/)

## Overview

Different Institute ERP is a production-ready, enterprise-grade Multi-Tenant ERP platform built specifically for training institutes. It provides comprehensive management capabilities including student management, academic management, finance, attendance tracking, and much more.

## Key Features

### 🏢 Multi-Tenant Architecture
- Complete tenant isolation using Row Level Security (RLS)
- Organization → Tenant hierarchy
- Per-tenant configuration and customization

### 🔐 Enterprise Security
- Role-Based Access Control (RBAC)
- Row Level Security on all tables
- Complete audit trail
- Service role bypass for admin operations

### 📚 Core Modules
- **Student Management**: Enrollment, documents, notes
- **Academic Management**: Programs, courses, classes, schedules
- **Finance**: Invoicing, payments, scholarships, discounts
- **Attendance**: Real-time tracking, policies, summaries
- **Communication**: Messaging, announcements, notifications
- **Tasks & Documents**: Task management, document storage
- **Calendar**: Event management, scheduling
- **Reports**: Customizable reports and dashboards
- **Library**: Resource management
- **CRM & Marketing**: Lead and campaign management

### 🛠️ Technology Stack
- **Frontend**: Next.js 14, React 18, TypeScript 5.5
- **UI**: TailwindCSS, Radix UI, shadcn/ui
- **Backend**: Supabase (PostgreSQL 17, Auth, Storage, Realtime)
- **State Management**: Zustand, React Query
- **Forms**: React Hook Form, Zod validation

## Project Structure

```
different-institute-erp/
├── docs/                          # Documentation
│   ├── ARCHITECTURE.md           # Architecture documentation
│   ├── DATABASE.md               # Database documentation
│   ├── ER_DIAGRAM.md            # Entity Relationship diagram
│   ├── PERMISSIONS_MATRIX.md    # Permissions matrix
│   ├── DEPLOYMENT.md            # Deployment guide
│   └── API.md                   # API documentation
├── public/                        # Static assets
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # API routes
│   │   ├── auth/                 # Authentication pages
│   │   ├── dashboard/            # Dashboard
│   │   ├── students/             # Student management
│   │   ├── academics/            # Academic management
│   │   ├── finance/              # Finance management
│   │   ├── attendance/           # Attendance tracking
│   │   ├── certificates/         # Certificate management
│   │   ├── reports/              # Reports & analytics
│   │   ├── library/              # Library management
│   │   ├── crm/                  # CRM
│   │   ├── marketing/            # Marketing
│   │   ├── tasks/                # Task management
│   │   ├── documents/            # Document management
│   │   ├── calendar/             # Calendar
│   │   ├── announcements/        # Announcements
│   │   ├── messaging/            # Messaging
│   │   ├── notifications/        # Notifications
│   │   ├── settings/             # System settings
│   │   ├── users/                # User management
│   │   ├── roles/                # Role management
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Landing page
│   │   └── globals.css           # Global styles
│   ├── components/               # React components
│   │   ├── ui/                   # UI components
│   │   ├── layout/               # Layout components
│   │   ├── common/               # Shared components
│   │   ├── modules/              # Module-specific components
│   │   └── providers/            # Context providers
│   ├── lib/                      # Library code
│   │   ├── supabase/             # Supabase client
│   │   ├── types/                # TypeScript types
│   │   ├── hooks/                # Custom hooks
│   │   ├── utils/                # Utility functions
│   │   └── constants/            # Constants
│   ├── middleware.ts             # Next.js middleware
│   └── styles/                   # Additional styles
├── supabase/
│   ├── migrations/               # Database migrations
│   │   ├── 0001_extensions.sql
│   │   ├── 0002_enums.sql
│   │   ├── 0003_core_platform.sql
│   │   ├── 0004_security.sql
│   │   ├── 0005_student_management.sql
│   │   ├── 0006_academic_management.sql
│   │   ├── 0007_finance.sql
│   │   └── 0008_attendance.sql
│   ├── seed.sql                  # Seed data
│   └── config.toml               # Supabase configuration
├── .env.example                  # Environment variables template
├── .gitignore                    # Git ignore rules
├── package.json                  # Package configuration
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.ts            # Tailwind configuration
├── next.config.js                # Next.js configuration
└── README.md                     # This file
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn or pnpm
- Supabase account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/different-institute-erp.git
   cd different-institute-erp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your Supabase credentials.

4. **Set up Supabase**
   ```bash
   # Install Supabase CLI
   npm install -g supabase

   # Login to Supabase
   supabase login

   # Link to your project
   supabase link --project-ref your-project-id

   # Run migrations
   supabase db push

   # Seed the database
   supabase db seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Local Development with Supabase

```bash
# Start local Supabase services
supabase start

# This will start:
# - API server on port 54321
# - Database on port 54322
# - Studio on port 54323
# - Inbucket (email testing) on port 54324
# - Analytics on port 54327

# Run migrations
supabase db reset

# Generate TypeScript types
supabase gen types typescript --local > src/lib/types/database.ts
```

## Database Schema

### Tables Overview

| Module | Tables | Description |
|--------|--------|-------------|
| Core Platform | 21 | Organizations, tenants, users, roles, permissions |
| Student Management | 4 | Students, enrollments, documents, notes |
| Academic Management | 9 | Academic years, semesters, departments, programs, courses, classes |
| Finance | 8 | Fee structures, invoices, payments, transactions, scholarships |
| Attendance | 4 | Attendance records, summaries, policies, excuses |

### Key Features
- UUID primary keys on all tables
- Soft delete support (deleted_at column)
- Audit columns (created_at, updated_at, created_by, updated_by)
- Tenant isolation (tenant_id on all tables)
- Foreign key constraints
- Proper indexes for performance
- CHECK constraints for data integrity

## Security

### Row Level Security (RLS)

All tables have RLS enabled with the following policies:

1. **Tenant Isolation**: Users can only access data within their tenant
2. **Role-Based Access**: Different roles have different access levels
3. **Owner Access**: Users can access their own data
4. **Admin Override**: Tenant admins and super admins have elevated access

### Role Hierarchy

```
Super Admin (100)
  └── Tenant Admin (90)
        └── Manager (70)
              └── Accountant (60)
                    └── Instructor (50)
                          └── Staff (40)
                                └── Librarian (40)
                                      └── CRM Agent (40)
                                            └── Marketing Agent (40)
                                                  └── Student (10)
                                                        └── Viewer (5)
```

## API Architecture

### Supabase Auto-Generated API

Supabase automatically generates REST and GraphQL APIs for all tables:

```
GET    /rest/v1/{table}          # List records
GET    /rest/v1/{table}?id=eq.1  # Filter records
POST   /rest/v1/{table}          # Create record
PATCH  /rest/v1/{table}?id=eq.1  # Update record
DELETE /rest/v1/{table}?id=eq.1  # Delete record
```

### Custom API Routes

```
/api/auth/*          # Authentication endpoints
/api/students/*      # Student management
/api/academics/*     # Academic management
/api/finance/*       # Finance operations
/api/attendance/*    # Attendance management
/api/reports/*       # Report generation
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Docker

```bash
# Build the image
docker build -t different-institute-erp .

# Run the container
docker run -p 3000:3000 different-institute-erp
```

### Manual Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📧 Email: support@differentinstitute.com
- 📖 Documentation: [docs/](docs/)
- 🐛 Issues: [GitHub Issues](https://github.com/your-org/different-institute-erp/issues)

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [shadcn/ui](https://ui.shadcn.com/)
