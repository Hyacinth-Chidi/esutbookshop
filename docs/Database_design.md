# ESUT Bookshop - Database Design

## Overview
The ESUT Bookshop system utilizes a relational database architecture powered by **PostgreSQL** and managed via **Prisma ORM**. The schema is designed for data integrity, rapid querying through strategic indexing, and scalability for future student-facing features.

## Core Entities & Relationships

### 1. Admin Model (`admins`)
Handles role-based access control (RBAC) for the bookshop staff.
- **Attributes**: `id` (UUID), `username`, `email`, `password` (hashed), `role` ("admin" or "sub-admin").
- **Security**: Includes `resetToken` and `resetTokenExpiry` for secure password recovery.
- **Relationships**: 
  - One-to-Many with `InventoryLog` (Tracks who adjusted stock).
  - One-to-Many with `AuditLog` (Tracks who made system changes).

### 2. Book / Material Model (`books`)
The central entity representing academic materials (Textbooks, Handouts, Past Questions).
- **Attributes**: `id` (UUID), `title`, `slug` (unique), `description`, `price`, `courseCode`, `level`, `semester`, `session`, `quantity`, `shelfLocation`.
- **Media**: Stores references to `frontCover` and `backCover` images (hosted via Cloudinary).
- **Manuals**: Supports composite materials through `hasManual`, `manualPrice`, and `manualFrontCover`.
- **Relationships**: 
  - Belongs to `Faculty`, `Department`, and `Category`.
  - One-to-Many with `InventoryLog` (Tracks history of stock changes).
- **Optimization**: Heavily indexed (`title`, `courseCode`, `facultyId`, `departmentId`, `categoryId`, `level`, `semester`, `session`) to ensure instant filtering on the frontend.

### 3. Academic Hierarchy Models
Ensures structured categorization of materials.
- **Faculty (`faculties`)**: `id`, `name` (unique).
- **Department (`departments`)**: `id`, `name`, `facultyId`.
  - Enforces a unique compound constraint on `[name, facultyId]` to prevent duplicates.
- **Category (`categories`)**: `id`, `name` (e.g., "Textbooks", "Handouts").

### 4. Logging & Auditing Models
Crucial for accountability and tracking within the system.
- **InventoryLog (`inventory_logs`)**: Tracks every addition or deduction of material stock, linking the exact `Book` and the `Admin` who made the change. Records the `change` (e.g., +50, -5) and the `reason`.
- **AuditLog (`audit_logs`)**: System-wide logging for creation, updates, and deletion of materials. Stores the specific `action`, the `entityId`, and a JSON payload of the `details` (old vs. new values).

### 5. System Settings (`system_settings`)
A singleton configuration table storing the `currentSession` and `currentSemester`. This allows the system to default to the active academic period without hardcoding.

### 6. Future-Proofing (Inactive Models)
- **Student (`students`)**: Designed to handle future student authentication.
- **Purchase (`purchases`)**: Designed to handle online payment tracking (e.g., Paystack integration), linking a `Student` to a `Book`.

## ERD (Entity Relationship Diagram) Summary
```text
Admin (1) -----> (M) InventoryLog (M) <----- (1) Book
Admin (1) -----> (M) AuditLog

Faculty (1) -----> (M) Department (1) -----> (M) Book
Category (1) ------------------------------> (M) Book
```

## Prisma Optimizations
- **Cascading Deletes**: Deleting a Faculty automatically deletes its Departments. Deleting a Book automatically cleans up its InventoryLogs.
- **SetNull Deletes**: Deleting a Department sets the `departmentId` on associated Books to Null rather than deleting the books, preserving inventory data.
- **UUIDs**: All primary keys use universally unique identifiers (`@db.Uuid`) for security against enumeration attacks.
