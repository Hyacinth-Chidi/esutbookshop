# ESUT Bookshop - Project Audit & Security Review

## 1. Unique Selling Points (Standout Features)
This project goes beyond a standard CRUD application by implementing advanced, production-grade features:

- **Comprehensive Audit Trail System**: Every action taken by an admin (creating, updating, or deleting materials) is strictly logged in the `AuditLog` table with a JSON payload tracking the exact old and new values. This guarantees total accountability and system transparency.
- **Dedicated Inventory Tracking**: The system decouples "Inventory Adjustments" from "Material Details." Adding or removing stock creates a dedicated `InventoryLog` capturing the exact change (+50, -5) and the reason (e.g., "Damaged Goods", "New Delivery"), preventing invisible stock manipulation.
- **Advanced Data Table with TanStack Query**: The admin dashboard utilizes React Query for state management. This enables powerful features like instantaneous search, column sorting, pagination without page-reloads, and background data syncing (Stale-While-Revalidate).
- **Responsive Dynamic UI**: Designed meticulously with Tailwind CSS and Shadcn UI. The interface is highly interactive with loaders, toast notifications, skeleton screens during data fetches, and mobile-first responsive layouts.
- **Role-Based Routing Protection**: The system differentiates between `admin` and `sub-admin`. Sub-admins are programmatically blocked at both the UI layer (sidebar links hidden) and the API layer (API rejects unauthorized requests) from accessing sensitive logs and settings.

## 2. Security Practices Implemented
Security was a top priority throughout the development lifecycle, adhering to OWASP best practices.

### Authentication & Authorization
- **HTTP-Only Cookies**: Instead of storing JWTs or session tokens in `localStorage` (which is highly vulnerable to Cross-Site Scripting (XSS) attacks), the system uses HTTP-only, secure cookies. This means malicious JavaScript cannot access the session token.
- **Strict Password Hashing**: Passwords are never stored in plain text. They are salted and hashed using bcrypt before being saved to the database.
- **API Endpoint Protection**: Every secure API route validates the user's session before processing the request. If a user attempts to bypass the frontend and hit the API directly via tools like Postman, the system will reject the request if the secure cookie is missing or invalid.
- **Role Validation**: For highly sensitive endpoints (like the Activity Logs API or Settings API), the server explicitly checks if the authenticated user's role is `admin`. If a `sub-admin` tries to access it, a `403 Forbidden` error is returned.

### Data Protection & Input Validation
- **SQL Injection Prevention**: By utilizing Prisma ORM, all database queries are parameterized automatically. This makes the system immune to traditional SQL injection attacks.
- **Form Validation**: The frontend ensures that required fields and specific formats are met before submission. The backend also validates payloads to ensure data integrity.
- **UUIDs for Primary Keys**: Instead of sequential integers (1, 2, 3), the database uses UUIDs. This prevents Insecure Direct Object Reference (IDOR) attacks, ensuring malicious users cannot simply guess the ID of another record.

## 3. Performance Optimizations
- **Database Indexing**: The PostgreSQL database schema has been heavily optimized with compound and single-column indexes on highly queried fields (`courseCode`, `title`, `facultyId`, `categoryId`, etc.). This ensures database queries complete in milliseconds even with massive datasets.
- **Optimistic UI Updates**: Leveraging TanStack Query, certain actions instantly update the UI (providing immediate feedback to the user) while the actual request completes in the background.
- **Image Optimization**: Cloudinary handles dynamic image resizing and format conversion. Large book cover uploads are compressed and served in the WebP format, drastically reducing bandwidth consumption and improving page load speeds.
- **Pagination Strategy**: Data lists are paginated on the backend. Rather than fetching 10,000 records and paginating them on the client, the API only fetches and returns the specific 20 records requested for the current page, ensuring O(1) memory usage on the client regardless of database size.
