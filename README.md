# TCT OptiBid - Tender Management System

TCT OptiBid is a modern, high-performance Tender Management System designed to streamline the procurement process. It bridges the gap between administrators, procurement agents, and external vendors, providing a secure, auditable, and intuitive platform for publishing tenders and managing bids.

## Features

- **Role-Based Access Control (RBAC):** Four distinct roles (Superadmin, Admin, Agent, Vendor) with strict permission boundaries.
- **Secure Dual-Admin Unlock:** Critical bids remain locked in a vault until two authorized administrators unlock them, ensuring fairness and compliance.
- **Vendor Group Management:** Dynamically group vendors and broadcast new tender opportunities to targeted groups via email.
- **Automated Email Notifications:** Vendors are instantly notified of new tenders, bid status updates, and password resets via integrated SMTP.
- **Real-Time Notification Bell:** In-app dropdown notifications keep users informed of the latest updates seamlessly.
- **Comprehensive Audit Logging:** System-wide activity tracking ensures strict compliance with procurement regulations.

## Technology Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, shadcn/ui, Lucide Icons
- **Backend:** Node.js, Hono, tRPC, Zod
- **Database:** MySQL, Drizzle ORM
- **Email:** Nodemailer (SMTP compatible)

## Local Development

### Prerequisites
- Node.js (v18+)
- MySQL (v8.0+)
- npm or yarn

### Setup Instructions

1. **Clone the repository and install dependencies:**
   ```bash
   cd app
   npm install
   ```

2. **Configure Environment Variables:**
   Create a `.env` file in the `app` directory based on the `.env.example`:
   ```env
   DATABASE_URL=mysql://root:root@127.0.0.1:3306/protender
   JWT_SECRET=your_super_secret_jwt_key
   SUPERADMIN_PROVISION_SECRET=your_provisioning_secret
   SMTP_HOST=smtp.yourprovider.com
   SMTP_PORT=587
   SMTP_USER=notifications@yourdomain.com
   SMTP_PASS=your_app_password
   ```

3. **Initialize the Database:**
   ```bash
   npm run db:push
   npm run seed
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```

The application will be accessible at `http://localhost:5173`.

## Architecture & Production Deployment
For details on system architecture and how to deploy TCT OptiBid to a production environment, please refer to the [DEPLOYMENT.md](./DEPLOYMENT.md) guide.
