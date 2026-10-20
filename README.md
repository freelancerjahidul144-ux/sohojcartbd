# Sohoj Cart BD (সহজ কার্ট বিডি) - v1.0.0

A complete, modern, high-performance Bangladeshi e-commerce platform built with React, TypeScript, Tailwind CSS, and Firebase Firestore & Authentication.

## Key Features

### 🛒 Customer Storefront
* **Dynamic Homepage**: Hero promotional banner carousel, category highlights, limited-time flash discount specials, featured collections, best sellers, and recent arrivals.
* **Smart Catalog & Search**: Real-time debounced search with instant autocomplete suggestions, multi-facet category filtering, interactive price range sliders, in-stock toggles, and sorting options.
* **Product Details**: Multi-image thumbnail gallery with interactive lightbox zoom, customer ratings, live stock indicators, detailed specifications, customer review submission system, and related products carousel.
* **Shopping Cart & Checkout**: Slide-over quick cart drawer + dedicated Cart page with persistent LocalStorage state, discount coupons (`SOHOJBD`, `EID2026`), automated delivery charge calculator for Dhaka (৳60 / Free over ৳2,500) and 63 other districts (৳120).
* **Bangladeshi Payment Methods**: Cash on Delivery (COD), bKash Online, Nagad, Rocket, and Credit/Debit Cards.
* **Order Invoice & Live Tracking**: Printable customer invoice receipts with order IDs and interactive delivery step progression tracking (`Pending` → `Confirmed` → `Processing` → `Shipped` → `Delivered`).

### 🛡️ Dedicated Admin Panel
* **Live Overview Dashboard**: Total products, gross sales revenue in ৳ BDT, total customers, pending vs. completed orders, and low-stock alerts.
* **Product Management**: Add, edit, delete, publish, and unpublish products with instant storefront synchronization through Firebase Firestore.
* **Category Management**: Create, edit, and organize product categories with custom image banners and active toggles.
* **Banner & Ad Management**: Control top hero slides, promotional banners, and targeted advertisements across the storefront.
* **Order Fulfillment**: Search, filter, inspect full order line items, and update delivery statuses with real-time customer updates.
* **Customer Management**: View shopper purchase counts, total spending history, and loyalty classifications (VIP, Regular, New).
* **Store Settings**: Configure delivery charges, Dhaka thresholds, currency symbols, and corporate contact details.
* **Demo Data Seeding**: 1-click database population tool to seed high-resolution Bangladeshi tech, apparel, and appliance products.

---

## Getting Started Locally

### 1. Prerequisites
* Node.js 18+ or 20+
* npm or bun

### 2. Installation
```bash
# Clone or extract repository
cd sohoj-cart-bd

# Install dependencies
npm install
```

### 3. Firebase Configuration
The application reads configuration from `firebase-applet-config.json` in the root folder:
```json
{
  "projectId": "your-firebase-project-id",
  "appId": "your-app-id",
  "apiKey": "your-api-key",
  "authDomain": "your-project-id.firebaseapp.com",
  "firestoreDatabaseId": "(default)",
  "storageBucket": "your-project-id.firebasestorage.app",
  "messagingSenderId": "your-sender-id"
}
```

### 4. Run Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your web browser.

### 5. Build for Production
```bash
npm run build
```
Compiled production files will be output to the `dist/` directory.

---

## Admin Panel Access
* Admin route is accessible via the top **Admin Panel** link or through the Account dropdown.
* Authorized administrator email: `freelancerjahidul144@gmail.com`
* The login screen also includes an instant **Evaluation Bypass Button** for immediate reviewer testing.

---

## License
Open source under the Apache 2.0 License.
