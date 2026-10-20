# Sohoj Cart BD - Deployment Guide

This guide walks you through deploying Sohoj Cart BD to Firebase Hosting, Vercel, or custom Node.js servers.

---

## 1. Setting Up Your Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add Project** and give it a name (e.g., `sohoj-cart-bd-production`).
3. Enable **Cloud Firestore**:
   - Navigate to **Build > Firestore Database**.
   - Click **Create Database**.
   - Choose production mode and select your closest location (e.g. `asia-south1` Mumbai or `asia-southeast1` Singapore for fastest latency in Bangladesh).
4. Enable **Firebase Authentication**:
   - Navigate to **Build > Authentication**.
   - Enable **Google** and **Email/Password** sign-in providers.
   - Add authorized domains if custom domain is used.
5. Obtain Web App Credentials:
   - Go to **Project Settings > General > Your Apps**.
   - Click the Web icon (`</>`) to register a web app.
   - Copy the configuration object into `firebase-applet-config.json` in your project root.

---

## 2. Deploying Firestore Security Rules

Install the Firebase CLI if not already installed:
```bash
npm install -g firebase-tools
```

Log in and initialize:
```bash
firebase login
firebase init firestore
```

Deploy the hardened security rules in `firestore.rules`:
```bash
firebase deploy --only firestore:rules
```

---

## 3. Deploying to Firebase Hosting

1. Initialize Firebase Hosting:
```bash
firebase init hosting
```
   - What do you want to use as your public directory? `dist`
   - Configure as a single-page app (rewrite all urls to /index.html)? `Yes`
   - Set up automatic builds and deploys with GitHub? `No` (or as preferred)

2. Build and Deploy:
```bash
npm run build
firebase deploy --only hosting
```

Your Sohoj Cart BD web application will now be live on `https://<your-project-id>.web.app`.

---

## 4. Alternative Deployment: Vercel / Netlify

1. Push code to your GitHub repository.
2. Import repository in [Vercel](https://vercel.com).
3. Set Framework Preset: **Vite**.
4. Set Build Command: `npm run build`.
5. Set Output Directory: `dist`.
6. Ensure `firebase-applet-config.json` is present or set environment variables in Vercel project settings.
7. Click **Deploy**.

---

## 5. Seeding Demo Catalog in Production

1. Visit your deployed website.
2. Click **Admin Panel** in the top navigation bar.
3. Sign in or click **Enter Admin Panel Directly**.
4. In the left sidebar, click **Seed / Reset Demo Data**.
5. All categories, smartphones, apparel, appliances, banners, and advertisements will be written to your live Firestore database instantly!
