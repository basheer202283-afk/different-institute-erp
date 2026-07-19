# Different Female Training Institute ERP

نظام إدارة معهد المختلفة للتدريب النسائي

## Tech Stack

- Next.js 14 (App Router)
- React 18
- TypeScript
- TailwindCSS
- Supabase (PostgreSQL 17)
- React Hook Form + Zod

## Features

- Arabic RTL-first design
- Role-based access (Owner, Manager, Reception, Accountant, Trainer)
- Authentication (Login, Register, Forgot Password)
- Dashboard with statistics
- Student Management
- Trainer Management
- Course Management
- Attendance Tracking
- Finance Management
- Reports

## Getting Started

```bash
npm install
cp .env.example .env.local
# Configure Supabase credentials
npm run dev
```

## Roles

| Role | Arabic | Access |
|------|--------|--------|
| Owner | المالك | Full access |
| Institute Manager | مدير المعهد | Management access |
| Reception | الاستقبال | Student & attendance |
| Accountant | المحاسب | Finance access |
| Trainer | المدرب | Course & attendance |

## License

MIT
