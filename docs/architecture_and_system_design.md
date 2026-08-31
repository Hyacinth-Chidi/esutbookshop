# ESUT Bookshop - Architecture & System Design

## 1. System Architecture Overview
The ESUT Bookshop system is built on a modern **Full-Stack JavaScript/TypeScript Architecture**. It leverages a decoupled frontend and backend approach, while keeping both tightly integrated within a single monolithic repository using **Next.js**.

The architecture follows a standard 3-tier model:
- **Presentation Layer (Client)**: React.js components rendered via Next.js.
- **Application Layer (Server)**: Next.js API Routes acting as the backend RESTful API.
- **Data Layer (Database)**: PostgreSQL database managed via Prisma ORM.

## 2. Technology Stack
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **State Management & Data Fetching**: TanStack Query (React Query)
- **Styling**: Tailwind CSS & Shadcn UI Components
- **Database ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: Custom JWT/Session based authentication using HTTP-only cookies
- **Image Hosting**: Cloudinary (for book covers and assets)

## 3. Rendering Strategy
The application utilizes a hybrid rendering strategy for optimal performance and SEO:
- **Server-Side Rendering (SSR) & Static Site Generation (SSG)**: Used for public-facing pages (like the homepage and public material browsing) to ensure extremely fast initial load times and high SEO rankings.
- **Client-Side Rendering (CSR)**: Used extensively in the Admin Dashboard. Because the dashboard is highly interactive and behind an authentication wall (where SEO is irrelevant), CSR combined with TanStack Query provides a fast, app-like experience with real-time data invalidation and caching.

## 4. API Design & Data Flow
The system uses Next.js Route Handlers (`app/api/...`) to expose a secure REST API.
1. **Client Request**: The client triggers a request using `axios` wrapped in TanStack Query hooks.
2. **Middleware & Auth**: The request hits the Next.js API route where authentication is verified (checking for valid session cookies/tokens).
3. **Controller/Service**: The request is passed to dedicated service functions (e.g., `lib/services/book.service.ts`) which contain the core business logic.
4. **Database Execution**: The service executes database queries via Prisma Client.
5. **Response**: Data is returned to the client as JSON, where TanStack Query caches the result and triggers a UI update.

## 5. Caching and Performance Optimization
- **TanStack Query Caching**: By utilizing React Query on the frontend, identical API requests are deduped, and stale data is served instantly from memory while fresh data is fetched in the background (Stale-While-Revalidate pattern).
- **Pagination**: All major data lists (Materials, Logs) are paginated at the database level using `skip` and `take` in Prisma. This ensures the system remains lightning fast even when scaling to tens of thousands of books.
- **Image Optimization**: The `next/image` component is used alongside Cloudinary to automatically serve images in modern formats (like WebP) and appropriately resized based on the user's device screen.

## 6. Authentication & Authorization
- **Role-Based Access Control (RBAC)**: The system differentiates between `Main Admin` and `Sub-Admins`. Sub-admins can manage inventory but are restricted from sensitive operations like viewing Audit Logs, managing system settings, or creating other admins.
- **Secure Sessions**: User sessions are maintained via secure, HTTP-only cookies, protecting the system against Cross-Site Scripting (XSS) attacks that typically target LocalStorage.

## 7. Cloudinary Media Architecture
Instead of storing heavy images directly on the server or database, the system integrates with Cloudinary.
- **Upload Flow**: Images are converted to Base64/Buffers on the server, piped to the Cloudinary API, and the resulting secure URL is saved in the PostgreSQL database.
- **Deletion Flow**: When a book is deleted, the system automatically calls the Cloudinary API to permanently delete the associated image assets, preventing orphaned files and saving storage space.
