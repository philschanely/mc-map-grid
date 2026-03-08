# mc-map-grid

[![Netlify Status](https://api.netlify.com/api/v1/badges/90bf953f-97a2-4c51-a83e-ae397109e47d/deploy-status)](https://app.netlify.com/projects/mcmapgraid/deploys)

Map grid calculator for Minecraft.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Tech Stack

- [Next.js](https://nextjs.org) — React framework with App Router
- [TypeScript](https://www.typescriptlang.org) — Static type checking
- [Tailwind CSS](https://tailwindcss.com) — Utility-first CSS framework
- [Headless UI](https://headlessui.com) — Accessible, unstyled UI components
- [tailwind-variants](https://www.tailwind-variants.org) — Composable Tailwind component styles

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy the example env file and fill in your values:

```bash
cp .env.local.example .env.local
```

### 3. Configure Google OAuth

The app uses Google sign-in. Set up a OAuth 2.0 client:

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials**.
2. Click **Create Credentials** → **OAuth client ID**.
3. If prompted, configure the OAuth consent screen (external user type is fine for personal use).
4. Choose **Web application** as the application type.
5. Add **Authorized JavaScript origins**:
   - `http://localhost:3000` (for local dev)
   - Your production URL (e.g. `https://your-site.netlify.app`) when deploying
6. Add **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/callback/google` (for local dev)
   - `https://your-site.netlify.app/api/auth/callback/google` (when deploying)
7. Copy the **Client ID** and **Client secret** into your `.env.local` as `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

### 4. Configure MongoDB

The app stores worlds and logs in MongoDB. Set up a database:

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/) and create a free account if needed.
2. Create a new cluster (M0 free tier is sufficient).
3. Under **Database Access**, create a database user and note the password.
4. Under **Network Access**, add your IP (or `0.0.0.0/0` for development; restrict this for production).
5. Click **Connect** on your cluster → **Connect your application** → copy the connection string.
6. Replace `<password>` in the URI with your database user password.
7. Add the URI to `.env.local` as `MONGODB_URI` and set `MONGODB_DB` (e.g. `mc-map-grid`).

### 5. Generate NextAuth secret

```bash
openssl rand -base64 32
```

Add the output to `.env.local` as `NEXTAUTH_SECRET`.

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser. Sign in with Google to create worlds and log coordinates.

## Deployment (Netlify)

Set the same environment variables in your Netlify site settings. For `NEXTAUTH_URL`, use your production URL (e.g. `https://your-site.netlify.app`). Ensure your Google OAuth client includes the production callback URL in Authorized redirect URIs.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
