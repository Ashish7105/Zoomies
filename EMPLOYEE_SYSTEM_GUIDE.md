# Employee Management System – Guide

This project uses the same employee management pattern as the reference project. Below is how it works and how to reuse it elsewhere.

---

## 1. Architecture Overview

| Component | Purpose |
|-----------|--------|
| Firestore `employees` collection | Store employee records (email, password, store, role) |
| `lib/employees.js` | Employee CRUD + login verification |
| `app/employee/login` | Employee login page |
| `app/employee/dashboard` | Order management for assigned store |
| `app/admin/employees` | Admin CRUD for employees (admin-only) |

---

## 2. Data Model

**Firestore collection: `employees`**

```json
{
  "email": "string",
  "password": "string",
  "name": "string",
  "storeId": "string",
  "role": "employee | manager | admin",
  "isActive": true,
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

- **Employee** – full document (with optional `id` when read).
- **EmployeeLogin** – `{ email, password }`.
- **EmployeeSession** – `{ id, email, name, storeId, role }` (no password), stored in **localStorage** under key `employeeSession`.

---

## 3. Files to Copy / Adapt

| File | Purpose |
|------|--------|
| `lib/employees.js` | `verifyEmployee`, `createEmployee`, `getEmployeeById`, `getStoreEmployees`, `getAllEmployees`, `updateEmployee`, `deleteEmployee` |
| `lib/types/employee.js` | JSDoc types for Employee, EmployeeLogin, EmployeeSession |
| `app/employee/login/page.js` | Login form → `verifyEmployee` → save session in **localStorage** |
| `app/employee/dashboard/page.js` | Read session from localStorage (via EmployeeContext), load store orders, update status |
| `app/admin/employees/page.js` | List / create / edit / delete employees (admin only) |
| `lib/contexts/EmployeeContext.js` | Provides `employee`, `login`, `logout`, `setSession`; uses **localStorage** key `employeeSession` |
| `lib/checkout.js` | `getStoreOrders(storeId)`, `getStoreDeliveryOrders(storeId)`, `updateCheckoutStatus(orderId, status)` |
| `lib/hooks/useUserProfile.js` | Fetches `users/{uid}` for admin check (`profile.role === 'admin'`) |

---

## 4. Flows

### Employee login

1. User submits email/password on `/employee/login`.
2. `verifyEmployee({ email, password })` checks Firestore `employees` (active, matching email, password).
3. On success, save `{ id, email, name, storeId, role }` in **localStorage** as `employeeSession`.
4. Redirect to `/employee/dashboard`.

### Employee dashboard

1. Read `employeeSession` from localStorage (via EmployeeContext).
2. If missing, redirect to `/employee/login`.
3. Load orders with `getStoreOrders(storeId)` (and optionally `getStoreDeliveryOrders(storeId)`).
4. Allow status updates via `updateCheckoutStatus(orderId, status)`.

### Admin management

1. User must be logged in (Firebase Auth) and have **Firestore** `users/{uid}.role === 'admin'`.
2. `useUserProfile(uid)` loads `users/{uid}`; admin pages check `profile?.role === 'admin'`.
3. Admin can use `createEmployee`, `updateEmployee`, `deleteEmployee`, `getAllEmployees` (and `getStoreEmployees(storeId)` if needed).

---

## 5. Dependencies

- Firebase / Firestore (same as this project).
- `lib/checkout.js`: `getStoreOrders`, `getStoreDeliveryOrders`, `updateCheckoutStatus` (same order system).
- Navbar: “Employee” link to `/employee/login` (or `/employee/dashboard` if already logged in); “Admin” link to `/admin/employees` when `profile?.role === 'admin'`.

---

## 6. Steps to Implement in Another Project

1. Add `lib/employees.js` and `lib/types/employee.js`.
2. Create Firestore collection **`employees`**.
3. Add `app/employee/login/page.js` and `app/employee/dashboard/page.js`.
4. Add `app/admin/employees/page.js` and protect with admin check (`getUserProfile(uid).role === 'admin'` or equivalent).
5. Add “Employee” link in navbar (e.g. to `/employee/login`).
6. Add “Admin” link when user is admin (e.g. to `/admin/employees`).
7. Seed at least one employee in Firestore (see **EMPLOYEE_FIREBASE_SETUP.md**).
8. To make a **customer user** an admin: in Firestore set `users/{uid}.role = 'admin'` for that Firebase Auth UID.

---

## 7. Redirect Note

`app/admin/employees/page.js` redirects to **`/login`** when the user is not logged in. If your app uses a different login route (e.g. `/`), change that redirect to your actual login path.

---

## 8. Production

- Replace plain password storage with **bcrypt** or **Firebase Auth** for employees.
- Use secure sessions (e.g. httpOnly cookies or short-lived tokens) instead of storing session in localStorage where appropriate.
