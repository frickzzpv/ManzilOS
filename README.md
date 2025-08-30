# 🏢 Manzilos - Property Management SaaS

Manzilos is a modern, production-ready Property Management SaaS application designed to streamline operations for landlords, tenants, and vendors.

## ✨ Features

This application provides a robust set of features for end-to-end property management:

### Tenant Portal (`/tenant`)
- **Dashboard:** View lease information, payment status, and submit maintenance requests.
- **Payments:** Securely pay rent using Stripe.
- **Maintenance:** Create and track maintenance requests, with support for image uploads.
- **Communication:** Receive real-time notifications and messages.

### Landlord Portal (`/landlord`)
- **Dashboard:** Get a high-level overview of your portfolio with key stats on properties, occupancy, revenue, and maintenance.
- **Property Management:** Add and manage properties and their individual units.
- **Tenant Management:** Onboard new tenants and manage their records.
- **Lease Management:** Create and manage lease agreements, send renewal offers, and prepare for e-signatures.
- **Maintenance Workflow:** View all maintenance requests, assign them to vendors, and track their status.

### Vendor Portal (`/vendor`)
- **Job Dashboard:** View and manage all assigned maintenance jobs.
- **Job Actions:** Accept and complete jobs, updating the status in real-time.

### Core Platform Features
- **Authentication:** Secure authentication using `httpOnly` cookies and OTP (One-Time Password) verification.
- **Real-time Notifications:** A WebSocket-based system for instant notifications.
- **Real-time Messaging:** A two-way communication hub for all users.
- **Role-Based Access Control (RBAC):** Granular permissions to ensure users can only access what they are authorized to.
- **Testing:** A testing suite using Vitest and React Testing Library is set up for reliability.
- **Structured Logging:** Pino is integrated for structured, production-ready logging.

---

## 🚀 Getting Started (Development)

### 1. Prerequisites
- Node.js (v18 or later)
- npm or yarn

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone <repository-url>
cd <repository-name>
npm install
```

### 3. Environment Variables
Create a `.env` file in the root of the project by copying the example file:
```bash
cp .env.example .env
```
Now, fill in the values in your new `.env` file. For local development, the defaults for `DATABASE_URL`, `JWT_SECRET`, and `CRON_SECRET` are sufficient. You will need to add your own test keys from Stripe.

```env
# The connection string for your database.
# For local development with SQLite (as it is currently configured):
DATABASE_URL="file:./dev.db"

# A secret key for signing JWT tokens.
JWT_SECRET="super-secret-jwt-token-for-development"

# A secret to protect the simulated cron job endpoints.
CRON_SECRET="a-very-secret-cron-token"

# Your Stripe API keys.
# The public key needs to be prefixed with NEXT_PUBLIC_
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_YOUR_PUBLISHABLE_KEY"
STRIPE_SECRET_KEY="sk_test_YOUR_SECRET_KEY"
STRIPE_WEBHOOK_SECRET="whsec_YOUR_WEBHOOK_SECRET"

# (Optional) API keys for third-party communication services.
# SENDGRID_API_KEY="YOUR_SENDGRID_KEY"
# TWILIO_ACCOUNT_SID="YOUR_TWILIO_SID"
# TWILIO_AUTH_TOKEN="YOUR_TWILIO_TOKEN"
# TWILIO_PHONE_NUMBER="YOUR_TWILIO_NUMBER"
```

### 4. Set up the Database
Push the Prisma schema to your database. This will create the necessary tables for the SQLite database.
```bash
npx prisma db push
```

### 5. Running the Application
```bash
# Start development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see your application running.

---

## 🧪 Running Tests

This project uses Vitest for testing. To run the test suite:
```bash
npm run test
```

---

## 🚢 Deployment to Production

Deploying the application to a production environment requires a few additional steps.

### Production Checklist

1.  **Database:**
    -   Update the `provider` in `prisma/schema.prisma` from `sqlite` to `postgresql`.
    -   Provide a production-grade PostgreSQL `DATABASE_URL` in your environment variables.
    -   Run `npx prisma migrate deploy` to apply all migrations to your production database.

2.  **API Keys:**
    -   Ensure all environment variables in your production environment are set to their **live** (not test) values, especially for `JWT_SECRET`, `CRON_SECRET`, and all `STRIPE_*` keys.

3.  **Build & Start:**
    -   Build the application: `npm run build`
    -   Start the server: `npm start`

### Cron Job
The application includes a simulated cron job for handling lease renewals at `/api/cron/check-lease-renewals`. In production, you should use a scheduling service (like Vercel Cron Jobs, GitHub Actions, or an external scheduler) to send a `GET` request to this endpoint on a regular basis (e.g., once a day).

Remember to include the `Authorization: Bearer <CRON_SECRET>` header in your scheduled request.
