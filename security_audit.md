# Security Audit Report

**Date:** June 26, 2026
**Scope:** Client-side data exposure, console logging, API route return payloads, and environment variables.

## Executive Summary
The ESUT Bookshop application demonstrates a robust security posture regarding data exposure. Client-side code does not leak sensitive information via console logs or local storage. API routes consistently utilize Server-Side JWT verification and strictly map return objects to prevent password hashes from being transmitted over the network. One minor data exposure issue regarding temporary passwords was identified and successfully patched.

---

## 1. Environment & Secrets Management
**Status: Secure**

*   **Server-only Secrets:** Sensitive credentials such as `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `RESEND_API_KEY`, and `CLOUDINARY_API_SECRET` are correctly configured as server-only environment variables (lacking the `NEXT_PUBLIC_` prefix). This ensures they are never bundled into the client-side JavaScript.
*   **Git Ignored:** The `.env.local` file is properly included in `.gitignore`, preventing accidental commits of live secrets to the source code repository.

## 2. Console Logs & Debugging
**Status: Secure**

*   **Frontend Logging:** A thorough scan of the frontend `components` and `app` directories revealed no sensitive data (such as passwords, tokens, or raw user objects) being logged to the browser console. The only active `console.log` is a benign image compression size readout in `BookForm.tsx` used for performance debugging.
*   **Backend Logging:** `console.error` statements in the API routes correctly log error messages string outputs for server-side debugging without dumping request payloads or raw database results.

## 3. API Data Payloads & Database Queries
**Status: Secure**

*   **Authentication Routes (`/api/auth/me`, `/api/auth/login`):** Database queries use Prisma's `select` capability to explicitly map user objects. Only `id`, `username`, `email`, and `role` are returned. **Hashed passwords are never transmitted in API responses.**
*   **User Management Routes (`/api/admin/sub-admins`):** GET requests strictly filter returns to omit password hashes. 
*   **Client Storage:** JWT tokens are securely stored in `httpOnly` cookies, making them inaccessible to Cross-Site Scripting (XSS) attacks. No sensitive authentication data is stored in `localStorage` or `sessionStorage`.

## 4. Password Reset Architecture
**Status: Secure**

*   **Token Hashing:** The system implements best practices by generating a raw cryptographic token, emailing it to the user, but only storing a `sha256` hash of that token in the database. A database compromise would not allow an attacker to use the stored reset tokens.
*   **Enumeration Prevention:** The reset request endpoint gracefully exits without an error if an email is not found, preventing attackers from using the endpoint to verify which emails are registered in the system.

---

## Patched Vulnerabilities

### Sub-Admin Creation Temporary Password Leak
**Status: Patched during audit**

*   **Issue:** When a Super Admin created a new Sub-Admin account, the system generated a random temporary password and emailed it to the new user. However, the `admin.service.ts` logic also bundled this plain-text password into the `createSubAdmin` return object, causing the API to transmit the plain-text password back to the Super Admin's browser in the JSON response.
*   **Risk Level:** Low. The route is protected by a Super Admin role requirement, meaning the password was only exposed to the authorized creator of the account. Furthermore, the UI did not display the payload. However, the data was visible in the browser's network inspector.
*   **Resolution:** Modified `lib/services/admin.service.ts` to omit the `temporaryPassword` from the return object. The password now strictly lives in the server's memory just long enough to be dispatched via the Resend email service, ensuring zero network exposure.
