# Employee Login & Image Upload Guide

## ✅ What Was Fixed

### 1. Product Image Upload (Admin Panel)
- **Before**: Admins could only enter image URLs manually, all products showed "logo.png"
- **After**: Admins can now upload product images directly to Firebase Storage
  - Image preview shown before saving
  - Automatic upload to Firebase Storage
  - Unique URLs generated for each product image
  - Employees and users see the correct product images

### 2. Employee Login Error Handling
- **Before**: Vague error messages when login failed
- **After**: Detailed error messages explaining what might be wrong

---

## 🚀 How to Use Image Upload in Admin Panel

1. Go to Admin → Items
2. Click "Add item" or "Edit" on an existing item
3. Look for the **"Product Image"** field
4. Click the upload field and select an image file (JPG, PNG, etc.)
5. You'll see a small preview of the image
6. Click "Create" or "Update" to save
7. The image will be uploaded to Firebase Storage automatically
8. All users and employees will see the correct product image

---

## 🔧 Employee Login - Setup Required

### The Issue
Employees can't login because **employee accounts haven't been set up in Firestore yet**.

### How to Add Employee Accounts

#### Option A: Using Firebase Console (Easiest)

1. Go to Firebase Console → Your Project
2. Click **Firestore Database**
3. Create a new collection called **`employees`** (if it doesn't exist)
4. Click **"Add document"**
5. Set the document ID to auto-generate (or use a custom ID)
6. Add these fields:

| Field | Type | Value |
|-------|------|-------|
| `email` | string | `employee@zommies.com` |
| `password` | string | `password123` |
| `name` | string | `Store Employee` |
| `storeId` | string | `store1` |
| `role` | string | `employee` |
| `isActive` | boolean | `true` |
| `createdAt` | timestamp | Current date |
| `updatedAt` | timestamp | Current date |

7. Click **Save**

#### Option B: Using Admin Panel (Coming Soon)
- Currently you need to add employees manually via Firebase Console
- Future versions will have an Employee Management UI

#### Option C: Using the Code
In your app, you can use:
```javascript
import { createEmployee } from "@/lib/employees";

await createEmployee({
  email: "employee@zommies.com",
  password: "password123",
  name: "Store Employee",
  storeId: "store1",
  role: "employee"
});
```

### Demo Credentials
**Email:** `employee@zommies.com`  
**Password:** `password123`

⚠️ **Important**: Make sure:
- ✅ The email matches exactly (case doesn't matter)
- ✅ The password matches exactly
- ✅ `isActive` is set to `true`
- ✅ The document is in the **`employees`** collection (not elsewhere)

---

## 🐛 Troubleshooting Employee Login

If employees still can't login after setting up their account, check:

1. **Check the Firestore Console:**
   - Open Firebase → Firestore
   - Look for the `employees` collection
   - Verify the employee document exists with the exact email

2. **Check the Fields:**
   - All fields should match the table above
   - `isActive` must be `true` (not a string "true")
   - Email must be in the `email` field

3. **Browser Console:**
   - Open the browser Developer Tools (F12)
   - Go to Console tab
   - Check for any error messages
   - This will help debug the login issue

4. **Clear Browser Cache:**
   - Sometimes old login state is cached
   - Try logging out and clearing cache
   - Or use an Incognito/Private window

---

## 📸 Product Images for Employees

Employees viewing orders in the dashboard will now see:
- ✅ Actual product images (not just "logo.png")
- ✅ Product names and prices
- ✅ Order status and tracking
- ✅ Store location and directions

---

## 🔐 Security Note

⚠️ **For Demo/Development Only:**
- Passwords are stored as plain text in this demo
- For production, use:
  - Firebase Authentication (recommended)
  - Hash passwords with bcrypt
  - Never store plain-text passwords

---

## 💡 Next Steps

1. **Add your first employee** to Firestore using the instructions above
2. **Test employee login** with the demo credentials
3. **Upload product images** in the admin panel for cats and dogs
4. **View products** as an employee and verify images display correctly

---

For more details, see:
- [EMPLOYEE_FIREBASE_SETUP.md](./EMPLOYEE_FIREBASE_SETUP.md)
- [EMPLOYEE_SYSTEM_GUIDE.md](./EMPLOYEE_SYSTEM_GUIDE.md)
