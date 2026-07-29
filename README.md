# 🐾 Zoomies - Pet Booking & E-Commerce Web Application

**Zoomies** is a premium Next.js pet booking and e-commerce application. It includes a user-friendly pet-catalog storefront, an interactive checkout with geographic maps, a specialized store operations portal for employees, and a complete admin management interface.

---

## 🚀 Core Features

### 🛒 1. Customer Storefront
* **Dynamic Product Catalog**: Curated categories for [Dogs](file:///d:/MyDownloads/zoomies/src/app/items/dogs/page.js) and [Cats](file:///d:/MyDownloads/zoomies/src/app/items/cats/page.js).
* **Detailed Product View**: Deep-dive details on pet items and supplies.
* **Persistent Shopping Cart**: React Context-driven sidebar drawer for easy cart edits.
* **Geographic Checkout**: Integrated [Leaflet Map Picker](file:///d:/MyDownloads/zoomies/src/components/FreeMapPicker.js) supporting drag-and-drop location selection and latitude/longitude lookup.
* **Auth Profiles**: Firebase Authentication with profile configuration.

### 👨‍💼 2. Employee Operations Portal (`/employee`)
* **Credential-Based Login**: Secured lookup via custom Firestore credentials.
* **Assigned Store Dashboards**: Filtered list displaying orders assigned to the employee's active store.
* **Status Controls**: Update checkout workflow state (e.g., *Pending* ➔ *Preparing* ➔ *Dispatched* / *Ready* ➔ *Delivered* / *Picked Up*).
* **Delivery Routing**: View client coordinates and get turn-by-turn map directions.

### 👑 3. Central Administration Panel (`/admin`)
* **Items CRUD**: Create, edit, and delete products with automatic **Firebase Storage** image uploads and file previews.
* **Stores CRUD**: Manage store branches, addresses, contact details, and geolocation coordinates.
* **Order Management**: Monitor all incoming checkouts, customer details, and delivery preferences.
* **Employee Management**: Create and configure employee profiles, roles, active statuses, and store assignments.

---

## 🛠️ Technical Stack

| Component | Technology | Detail |
|---|---|---|
| **Framework** | Next.js 16 (App Router) | High-performance Server & Client rendering |
| **Runtime** | React 19 & React DOM 19 | Context API state management |
| **Styling** | Tailwind CSS 4 & Vanilla CSS | Sleek, modern responsive design |
| **Component Kit** | HeroUI & Radix UI | Accessible interaction layouts |
| **Icons** | Lucide React | Clean, scalable vector iconography |
| **Database** | Google Cloud Firestore | Real-time NoSQL data storage |
| **Storage** | Firebase Storage | Automated high-speed product image hosting |
| **Authentication**| Firebase Auth | Secure client-side sign-up and authentication |
| **Maps & Location**| Leaflet | Open-source interactive map components |

---

## 📁 Project Architecture

```text
zoomies/
├── public/                  # Static assets and public images (logos, product defaults)
└── src/
    ├── api/                 # Local API utilities
    ├── app/                 # Next.js App Router Page layouts
    │   ├── admin/           # Admin section (employees, items, orders, stores CRUD)
    │   ├── checkout/        # Checkout flow with Map Picker
    │   ├── employee/        # Employee Portal (login & dashboard)
    │   ├── items/           # Shopping sections for Dogs & Cats
    │   ├── login/           # Customer login & signup
    │   ├── order-placed/    # Order confirmation landing screen
    │   ├── pet-details/     # Product/pet details route
    │   └── profile/         # Customer account options
    ├── components/          # Shared components
    │   ├── cart/            # CartSidebar, CartButton
    │   └── ui/              # Custom Spinners, Input structures
    ├── lib/                 # Configuration & hooks
    │   ├── contexts/        # State providers (AuthContext, CartContext, EmployeeContext)
    │   ├── hooks/           # User schema fetches (useUserProfile, useUserDoc)
    │   ├── types/           # JSDoc definition schema models
    │   └── firebase.js      # Firebase SDK Initialization
    └── utils/               # Formatting and path helpers
```

---

## ⚙️ Setup & Installation

### 1. Environment Variables Configuration
Create a `.env.local` file in the root directory and define the following variables pointing to your Firebase project:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 2. Local Launch
Install dependencies and run the Next.js local development server:

```bash
# Install dependencies
npm install

# Start Next.js development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 🗄️ Firestore Database Schema

The application relies on the following Collections in Firestore:

### `users`
* Used for customer user profiles.
* Set `"role": "admin"` to allow a customer account to access the **/admin** panel.

### `employees`
* Stores employee login credentials and status.
* Schema: `{ email, password, name, storeId, role: "employee"|"manager", isActive: true|false, createdAt, updatedAt }`.

### `stores`
* Stores store locations.
* Schema: `{ name, address, phone, coordinates: { lat: number, lng: number } }`.

### `items`
* Contains catalog items.
* Schema: `{ name, price, description, category: "cat"|"dog", image: "storage_url" }`.

### `checkouts` (Orders)
* Tracks store pickup and delivery orders.
* Schema: `{ items, total, customerId, storeId, status: "pending"|..., deliveryOption: "store"|"delivery", coordinates }`.

---

## 📘 Reference Guides

Check out these files in the root folder for step-by-step setups:
* [Employee Firebase Configuration Guide](file:///d:/MyDownloads/zoomies/EMPLOYEE_FIREBASE_SETUP.md) — Detailed steps on structuring database collections.
* [Employee System Architecture Design](file:///d:/MyDownloads/zoomies/EMPLOYEE_SYSTEM_GUIDE.md) — Under-the-hood look at context providers, login flow redirects, and hooks.
* [Admin Upload & Login Setup](file:///d:/MyDownloads/zoomies/EMPLOYEE_LOGIN_AND_IMAGE_UPLOAD_GUIDE.md) — Step-by-step instructions on setting up demo credentials and performing image uploads.

---

## 🔒 Security Notice

> [!WARNING]
> This application uses a simplified authentication flow for employees (plain text passwords stored in Firestore `employees` collection) to facilitate quick demo configuration.
> **For production deployment**:
> 1. Migrate employee login to secure **Firebase Authentication** or hash all passwords using a strong library like `bcrypt`.
> 2. Use secure HTTP-only cookies or short-lived JSON Web Tokens (JWT) instead of storing sessions in browser `localStorage`.
