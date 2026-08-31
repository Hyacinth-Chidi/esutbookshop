# ESUT Bookshop - Requirements, Features & Future Scope

## 1. Problem Statement
Traditional university bookshops often rely on manual ledger systems for inventory management. This leads to issues such as:
- Difficulty in tracking real-time stock levels of textbooks, handouts, and past questions.
- Lack of transparency and accountability regarding who added or removed stock, leading to potential inventory shrinkage.
- Inefficiency for students who must physically visit the bookshop just to check if a specific departmental material is in stock or to check its price.
- Inability to quickly generate customized price lists and sales templates for specific faculties or departments.

## 2. Proposed Solution & Objectives
The ESUT Bookshop Management System was developed to digitize this entire workflow. 
**Core Objectives:**
1. Provide a public-facing portal where students can search, filter, and verify the availability and pricing of academic materials in real-time.
2. Provide a secure, role-based administrative dashboard for bookshop staff to manage inventory.
3. Automate the generation of printable material lists and sales templates.
4. Establish absolute accountability through automated system-level audit trails and inventory logs.

## 3. User Roles & Use Cases

### A. The Public / Students (Unauthenticated)
- **Browse & Search**: Can search for materials by title or course code.
- **Advanced Filtering**: Can filter materials strictly by Faculty, Department, Level, Semester, and Session.
- **Generate Lists**: Can generate and print out a formatted PDF list of materials and prices for their specific department.

### B. Sub-Admin (Staff)
- **Inventory Management**: Can add new materials, edit details, and update stock quantities.
- **View Dashboard**: Can see high-level metrics (Total Materials, Out of Stock alerts).
- **Restricted Access**: Cannot view system audit logs or manage other admin accounts.

### C. Main Admin (Manager/Director)
- **Full System Access**: Has all Sub-Admin privileges.
- **Activity Monitoring**: Exclusive access to the **Activity Logs**, which are divided into:
  - *Inventory Logs*: Tracks every single addition/deduction of physical stock.
  - *Audit Logs*: Tracks digital system changes (who edited a book's price, who deleted a category).
- **User Management**: Can create, edit, or revoke access for Sub-Admins.
- **System Settings**: Can update the global active Academic Session and Semester.

## 4. Key Functional Features (The "Wow" Factors)
- **Dynamic Print Templates**: The system dynamically generates styled, printable documents (e.g., Departmental Material Lists, Sales Templates) directly from the browser using custom print-specific CSS (`@media print`).
- **Composite Materials (Manuals)**: The system supports complex inventory relationships, such as a Textbook that comes with an optional standalone Workbook/Manual, calculating distinct prices for both.
- **Soft Deletion & Cascade Management**: When a department or category is deleted, the system intelligently updates associated materials using `SetNull` to prevent data loss, while using `Cascade` deletion for safe hierarchical data removal.

## 5. Future Scope & Scalability
The database schema has already been pre-architected to support phase two of the project: **E-Commerce & Online Payments**.
- **Student Authentication**: The `Student` model exists in the database to allow students to create accounts and log in.
- **Online Checkout**: The `Purchase` model is ready to track cart checkouts and link a Student to a Material.
- **Payment Gateway Integration**: The schema includes a `paystackRef` field, showing architectural foresight for integrating the Paystack API for seamless digital payments in the future.
