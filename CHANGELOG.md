# Changelog

All notable changes to **Sohoj Cart BD** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [v1.0.0] - 2026-09-26

### Initial Production Release
* **Customer Storefront**:
  - Fully responsive, high-performance UI tailored for Bangladeshi shoppers.
  - Interactive hero carousel with automatic slide rotations and custom CTA buttons.
  - Curated category navigation showcasing live product counts.
  - Flash Sale and discount deal badges with percentage savings calculation.
  - Search engine with live autocomplete suggestions and multi-attribute filters.
  - Comprehensive Product Details page with multi-image gallery, lightbox zoom, technical specifications, and real customer review submissions.
  - Real-time persistent shopping cart drawer and dedicated Cart page.
  - Express Checkout with Bangladeshi district delivery calculation and payment methods (Cash on Delivery, bKash, Nagad, Rocket, Cards).
  - Printable order invoices and live 5-step delivery tracking.

* **Firebase Backend & Security**:
  - Integrated Cloud Firestore with real-time reactive snapshot listeners.
  - Secure Attribute-Based Access Control (ABAC) in `firestore.rules` protecting admin modifications.
  - Error handling adhering to `FirestoreErrorInfo` specification.

* **Admin Panel**:
  - Live metric dashboard (Total Products, Orders, Revenue in ৳ BDT, Customers, Stock Alerts).
  - Product management with instant publishing sync to customer storefront.
  - Category, Banner, and Advertisement campaign management tools.
  - Order fulfillment workflow with real-time status transitions.
  - Customer lifetime value and frequency monitoring.
  - 1-click database seeding tool.

---

## Planned Future Releases

### [v1.1.0] - Upcoming
* SMS OTP verification for Bangladeshi mobile numbers via Greenweb / SSLWireless.
* Steadicash bKash Merchant API direct popup checkout.
* Multi-vendor seller onboarding portal.

### [v1.2.0] - Planned
* Automated Pathao / RedX / Steadfast courier API consignment booking.
* Customer loyalty points and referral rewards system.

### [v2.0.0] - Long Term
* Native mobile Android/iOS APK builds via Capacitor.
* Bengali (বাংলা) language localized full interface toggle.
