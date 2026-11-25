# Deploying Organization Database to Vercel + Neon

## 0. Before you start
- Rotate secrets you pasted in chat: Neon dashboard > Settings > reset the database password, regenerate the AI gateway token. Update `.env`.
- Run `npx prisma migrate dev --name ratelimit` locally (adds the rate-limit table), then test login once.
- In `package.json` scripts add: `"postinstall": "prisma generate"` (so Vercel builds a fresh Prisma client).
- Check `.gitignore` contains `.env*`. Never commit `.env`.

## 1. Neon (database)
- Keep your current branch as **production**. Create a second branch called **dev** (Neon > Branches) and use the dev connection strings in your local `.env`. Test data stays out of production.
- Copy the production strings: pooled (host has `-pooler`) and direct (no `-pooler`). Remove `&channel_binding=require` from both.
- Apply tables to production (from your PC, with the production strings in `.env`):
  `npx prisma migrate deploy` then `npx prisma db seed`
  Use a strong SEED_ADMIN_PASSWORD, then change it in Settings after first login.

## 2. GitHub
- Push the project. If your Git repository root is the OUTER `pgcc` folder, you must set Root Directory to the inner `pgcc` in Vercel (step 3).

## 3. Vercel
1. Import the repo (vercel.com > Add New > Project).
2. Root Directory: the folder that contains `package.json` (inner `pgcc` if needed). Framework: Next.js (auto).
3. Environment variables (Production):
   | Name | Value |
   |---|---|
   | DATABASE_URL | Neon pooled string |
   | DIRECT_URL | Neon direct string |
   | AUTH_SECRET | output of `npx auth secret` (a new one, not your local one) |
4. Deploy. Settings > Functions > Region: Washington D.C. (iad1), closest to Neon us-east-2.
5. Open the URL, go to /login, sign in as the super admin.

## 4. Smoke test (online)
- Landing page, /apply submission, /verify with a real reg no.
- Admin: approve application, create org, edit details, add admin user.
- Portal: login with the temporary password (banner appears), change password, add members, upload CSV, add a photo.
- Duplicates: add the same phone in two groups and check /admin/duplicates.
- Certificate: scan the QR code from a phone. It must open the live /verify page.
- Phone test on mobile data (Nigerian networks), not only Wi-Fi.

## 5. Before real member data goes in
- Custom domain: Vercel > Domains. Print certificates only AFTER the final domain is set (the QR code uses the domain it was opened on).
- Vercel's free Hobby plan is limited to non-commercial use. Check Vercel's terms for your situation, or move to Pro, before the public launch.
- Backups: Neon keeps a restore window on the free plan. Also export CSVs regularly (Export CSV buttons).
- Photos are stored in the database. Plan a move to file storage (Vercel Blob or Cloudflare R2) before thousands of members.
- Add admin 2FA and CAPTCHA on /apply (planned).
- NDPA 2023: keep the member-consent checkbox, restrict admin accounts, review the audit log.

## 6. Known limits
- SMS/email are not automatic yet: admins pass on temporary passwords by hand.
- Rate limits: login 8 tries / 15 min per account; /apply and /forgot-password 5 per hour per IP.
