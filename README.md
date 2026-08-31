# 📚 ESUT Bookshop Management & Inventory System

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?style=for-the-badge&logo=postgresql)](https://neon.tech/)

A comprehensive digital inventory management and student catalog platform engineered for the **Enugu State University of Science and Technology (ESUT) Bookshop**. 

The system transitions traditional manual ledger inventory workflows into a modern, real-time web platform with public book catalog search, role-based administration, automated inventory audit trails, dynamic browser-based print templates, and ready-to-scale payment infrastructure.

---

## 🚀 Key Features

### 🎓 Public Student Portal
- **Real-Time Material Lookup**: Search textbooks, laboratory manuals, handouts, and past questions by course title or course code.
- **Multi-Level Filtering**: Seamlessly filter materials by Faculty, Department, Level (100L - 600L), Semester, and Academic Session.
- **Stock & Pricing Transparency**: Instant visibility into item prices and stock availability status without needing to visit the physical store.
- **Departmental Print Templates**: Generate and print clean, formatted material and price lists for any faculty or department directly from the browser (`@media print` optimized).

### 🛠️ Role-Based Admin Dashboard
- **Granular Role Hierarchy**:
  - **Main Admin (Director/Manager)**: Full system access, audit trail logs, sub-admin user management, and global session/semester configuration.
  - **Sub-Admin (Staff)**: Inventory management, stock level adjustments, adding/editing materials and categories.
- **Two-Tier Activity Logging**:
  - **Inventory Logs**: Detailed ledger tracking every addition, deduction, or adjustment of physical material stock.
  - **Audit Logs**: Digital security audit tracking all CRUD actions (who modified prices, who deleted categories, timestamps, and IP/agents).
- **Composite Material Support**: Supports complex inventory setups, such as primary textbooks paired with optional standalone lab manuals/workbooks with independent pricing.
- **Image Optimization**: Cloudinary integration with automatic client-side compression before upload.
- **Security & Authentication**: HTTP-only cookie-based JWT authentication (Access & Refresh tokens), bcrypt password hashing, and secure password reset flows via Nodemailer.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Components & Route Handlers)
- **Frontend Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling & UI**: [Tailwind CSS](https://tailwindcss.com/), [Radix UI](https://www.radix-ui.com/), [Lucide Icons](https://lucide.dev/), [class-variance-authority](https://cva.style/)
- **State & Data Fetching**: [@tanstack/react-query](https://tanstack.com/query)
- **Database & ORM**: [PostgreSQL (Neon)](https://neon.tech/) with [Prisma ORM 7](https://www.prisma.io/)
- **Authentication**: JWT (`jsonwebtoken`) + `bcryptjs`
- **Media Hosting**: [Cloudinary](https://cloudinary.com/) + `browser-image-compression`
- **Email Service**: [Nodemailer](https://nodemailer.com/)

---

## 📁 Project Architecture

```plaintext
bookshop/
├── app/                          # Next.js App Router
│   ├── (public)/                 # Public-facing routes (Student Catalog, About, Print, Reports)
│   ├── admin/                    # Protected Admin Dashboard (Books, Logs, Sub-admins, Settings)
│   ├── api/                      # RESTful Route Handlers
│   │   ├── admin/                # Admin management, dashboard stats, audit/inventory logs
│   │   ├── auth/                 # Login, logout, refresh, forgot/reset password
│   │   ├── books/                # Book CRUD, filtering, reports
│   │   ├── categories/           # Category management
│   │   ├── faculties/            # Faculties & Departments
│   │   └── settings/             # Active session & semester settings
│   ├── auth/                     # Public auth pages (Password reset)
│   ├── payment/                  # Checkout & verification (Phase 2 ready)
│   └── globals.css               # Global styling and print media rules
├── components/                   # Reusable UI & Feature components
│   ├── admin/                    # Admin forms, stats, action menus
│   ├── books/                    # Book cards, search, filters, skeletons
│   ├── layout/                   # Navbar, Footer, AdminSidebar, AdminHeader
│   ├── print/                    # Formatted print headers and styles
│   └── ui/                       # Accessible Radix UI primitives
├── context/                      # React Context providers (Auth, Preferences)
├── docs/                         # Architecture, database design, and system docs
├── hooks/                        # Custom React Query hooks
├── lib/                          # Backend services, DB client, utilities & validators
│   ├── config/                   # Cloudinary, Database, Email configs
│   ├── services/                 # Business logic services (Admin, Book, Faculty, Password)
│   ├── utils/                    # JWT, Logger, Password, and Response helpers
│   └── validators/               # Zod validation schemas
├── prisma/                       # Prisma Schema and migrations
└── public/                       # Static public assets (ESUT logo, icons)
```

---

## 🏁 Getting Started

### 1. Prerequisites
Ensure you have the following installed on your machine:
- **Node.js**: `v18.18.0` or higher (Node.js 20+ recommended)
- **npm** or **yarn** / **pnpm**
- A **PostgreSQL** database (e.g. [Neon Database](https://neon.tech))

### 2. Clone the Repository
```bash
git clone https://github.com/Hyacinth-Chidi/esutbookshop.git
cd esutbookshop
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Create a `.env.local` file in the root directory and copy the contents from `.env.example`:

```bash
cp .env.example .env.local
```

Fill in your respective credentials:
```env
NEXT_PUBLIC_API_URL=/api
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# JWT Secrets
JWT_ACCESS_SECRET=your_jwt_access_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-specific-password"
EMAIL_FROM="ESUT Bookshop <noreply@esutbookshop.com>"
```

### 5. Database Setup & Migrations
Generate Prisma client and run database migrations:

```bash
npx prisma generate
npx prisma db push
```

*(Optional) Seed initial faculties and categories:*
```bash
node seed_faculties.js
node seedCategories.js
node seed_materials.js
```

### 6. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Next.js development server on `localhost:3000` |
| `npm run build` | Builds the production bundle |
| `npm run start` | Runs the built production server |
| `npm run lint` | Runs ESLint to check for code issues |
| `npx prisma studio` | Opens the interactive Prisma database GUI |

---

## 🔒 Security & Data Integrity

- **Environment Safeguards**: All secret tokens, database credentials, and API keys are strictly excluded from version control via `.gitignore`.
- **RBAC Middleware**: Next.js middleware guards `/admin/*` routes, validating token signatures and user roles before requests hit page components.
- **Relational Integrity**: Database schema implements smart cascade handling:
  - Deleting categories or departments sets associated material foreign keys to `NULL` to avoid orphaned records or accidental catalog loss.
  - Safe cascading on sub-resource hierarchies.

---

## 🔮 Future Roadmap (Phase 2)

The database schema and UI architecture are pre-configured to support future expansion:
- **E-Commerce & Online Orders**: Full student authentication and cart management.
- **Payment Gateway Integration**: Integrated Paystack API reference tracking for online checkout.
- **Digital Receipt Generation**: Automated downloadable PDF receipts for online purchases.

---

## 📄 License

This project is proprietary software developed for **Enugu State University of Science and Technology (ESUT)**.
