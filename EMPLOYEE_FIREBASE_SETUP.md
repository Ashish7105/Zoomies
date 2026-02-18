# Employee System – Firebase Setup

## 1. Firestore: `employees` collection

Create a collection **`employees`** and add a document (e.g. auto-ID) with:

| Field       | Type    | Value |
|------------|---------|--------|
| `email`    | string  | `employee@zommies.com` |
| `password` | string  | `password123` |
| `name`     | string  | `Store Employee` |
| `storeId`  | string  | `store1` |
| `role`     | string  | `employee` |
| `isActive` | boolean | `true` |
| `createdAt`| timestamp | (e.g. now) |
| `updatedAt`| timestamp | (e.g. now) |

**Demo login:** `employee@zommies.com` / `password123`

## 2. Firestore: `stores` collection (optional)

For pickup location and “Get Directions” in the employee dashboard, create a collection **`stores`** and a document with ID **`store1`**:

| Field         | Type   | Value (example) |
|---------------|--------|-------------------|
| `name`        | string | `Zoomies Main Store` |
| `address`     | string | Your store address |
| `phone`       | string | Store phone |
| `coordinates` | map    | `{ lat: number, lng: number }` (optional, for directions) |

If `stores/store1` does not exist, the app still works; the dashboard will show a generic “Store” label.

## 3. Orders and `storeId`

- **Pickup orders** (`deliveryOption === "store"`) are stored with `storeId: "store1"` (or the selected store).
- **Delivery orders** are also assigned `storeId: "store1"` so they appear on the employee dashboard for that store.

Employees see all orders where `storeId` matches their `storeId` in the `employees` document.

## 4. Firestore: `items` collection (for catalog)

Admin creates items at **/admin → Items**. Create a collection **`items`** and add documents (or use the admin UI):

| Field        | Type   | Description |
|-------------|--------|-------------|
| `name`      | string | Product name |
| `price`     | number | Price |
| `image`     | string | Path e.g. `/products/serum.png` |
| `category`  | string | `"cat"` or `"dog"` (shown on /items/cats or /items/dogs) |
| `description` | string | Optional |

Users see these on **Items (Cats)** and **Items (Dogs)** and can add to cart.

## 5. Admin role (customer users)

To access **/admin** (Items, Stores, Orders, Employees), the user must be a **customer** (Firebase Auth) with admin role. In Firestore, set:

**`users/{uid}.role`** = **`"admin"`**

where `{uid}` is the Firebase Auth UID of the customer account. That user can then open **Admin** from the navbar and manage items, stores, orders, and employees.

## 6. Security note

Passwords are stored in plain text for this demo. For production, use Firebase Authentication or hash passwords (e.g. bcrypt) and never store plain-text passwords.
