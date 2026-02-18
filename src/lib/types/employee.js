/**
 * Employee data model (Firestore document).
 * @typedef {Object} Employee
 * @property {string} email
 * @property {string} password   - Plain text in demo; use bcrypt in production
 * @property {string} name
 * @property {string} storeId   - Links to stores collection
 * @property {'employee'|'manager'|'admin'} role
 * @property {boolean} isActive
 * @property {import('firebase/firestore').Timestamp} [createdAt]
 * @property {import('firebase/firestore').Timestamp} [updatedAt]
 */

/**
 * Login payload.
 * @typedef {{ email: string, password: string }} EmployeeLogin
 */

/**
 * Session after login (no password). Stored in localStorage.
 * @typedef {{ id: string, email: string, name: string, storeId: string, role: string }} EmployeeSession
 */

export {};
