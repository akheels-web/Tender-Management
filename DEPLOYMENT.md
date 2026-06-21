# TCT OptiBid - Production Deployment Architecture & Guide

This document outlines the architecture design and step-by-step installation process for deploying TCT OptiBid to a production environment. 

**Target Hardware Profile:** 1 Machine | 4 CPUs | 8GB RAM | 200GB SSD

This hardware profile is incredibly robust for a Node.js + MySQL stack. You will comfortably handle thousands of concurrent users. 8GB of RAM allows us to allocate generous memory pools for the database and Node application, while the 4 CPUs easily handle concurrent requests.

---

## 1. Architectural Design

Given the single-machine constraint, a **Monolithic Deployment via Docker Compose** is the most efficient, secure, and maintainable architectural pattern.

### System Components

1. **Nginx (Reverse Proxy & Web Server)**
   - Sits at the edge of the machine (Ports 80/443).
   - Terminates SSL via Let's Encrypt / Certbot.
   - Serves the compiled React frontend static files directly from disk (extreme performance).
   - Proxies API requests (`/api/*`) and tRPC requests to the Node.js backend.

2. **Node.js (Application Server)**
   - Runs the Hono/tRPC backend.
   - Handles authentication, business logic, file uploads, and SMTP dispatching.
   - Communicates internally with MySQL.

3. **MySQL 8.0 (Relational Database)**
   - Stores all application data.
   - Bound only to internal Docker network or `localhost` (Port 3306) for security; never exposed directly to the public internet.

4. **File Storage**
   - The 200GB SSD is utilized for the OS, database volumes, and the `uploads/` directory containing the PDF proposals.

### Resource Allocation Strategy (8GB RAM)
- **OS & Overheads:** ~1GB RAM
- **MySQL `innodb_buffer_pool_size`:** ~3GB RAM (Optimizes database query performance)
- **Node.js:** ~2GB RAM (Handled via PM2 cluster mode or Docker replication)
- **Nginx & File System Cache:** ~2GB RAM

---

## 2. Installation Guide

This guide uses Ubuntu 22.04/24.04 LTS as the base OS. 

### Step 2.1: Initial Server Setup
1. Update your system and install fundamental dependencies:
   ```bash
   sudo apt update && sudo apt upgrade -y
   sudo apt install -y curl git ufw nginx certbot python3-certbot-nginx
   ```
2. Secure the firewall (UFW):
   ```bash
   sudo ufw allow OpenSSH
   sudo ufw allow 'Nginx Full'
   sudo ufw enable
   ```

### Step 2.2: Install Node.js & PM2
While Docker is great, for maximizing performance on a single box without overhead, a direct Node + PM2 setup combined with a native MySQL installation is the absolute fastest.
1. Install Node.js (v18+):
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs
   ```
2. Install PM2 (Process Manager) & Build Tools:
   ```bash
   sudo npm install -g pm2
   sudo npm install -g typescript ts-node
   ```

### Step 2.3: Install MySQL
1. Install MySQL Server:
   ```bash
   sudo apt install -y mysql-server
   sudo mysql_secure_installation
   ```
2. Create the Database and User:
   ```sql
   sudo mysql -u root

   CREATE DATABASE protender;
   CREATE USER 'optibid'@'localhost' IDENTIFIED BY 'StrongPassword123!';
   GRANT ALL PRIVILEGES ON protender.* TO 'optibid'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```

### Step 2.4: Prepare the Application
1. Clone the repository into `/opt/Tender-Management`:
   ```bash
   sudo mkdir -p /opt/Tender-Management
   sudo chown -R $USER:$USER /opt/Tender-Management
   git clone <your-repo-url> /opt/Tender-Management
   cd /opt/Tender-Management/app
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create the Production Environment File (`.env`):
   ```bash
   nano .env
   ```
   *Populate with:*
   ```env
   NODE_ENV=production
   DATABASE_URL=mysql://optibid:StrongPassword123!@127.0.0.1:3306/protender
   JWT_SECRET=generate_a_very_long_secure_random_string_here
   SUPERADMIN_PROVISION_SECRET=your_provision_secret
   SMTP_HOST=smtp.office365.com
   SMTP_PORT=587
   SMTP_USER=notifications@tctoptibid.com
   SMTP_PASS=your_app_password
   ```

### Step 2.5: Build and Initialize
1. Push the database schema:
   ```bash
   npm run db:push
   ```
2. Build the Vite React Frontend (This will generate static files into `app/dist`):
   ```bash
   npm run build
   ```
3. Build the Node Backend (If using TypeScript compiler):
   ```bash
   npx tsc -b
   ```

### Step 2.6: Start the Backend via PM2
Since we have 4 CPUs, we will leverage PM2's cluster mode to run 4 instances of the backend, maximizing throughput.
1. Start the API using PM2:
   ```bash
   # We use ts-node to run the server in this architecture, or compile it to JS first.
   # For production, compiled JS is preferred.
   pm2 start server.ts --interpreter ts-node --name "tct-api" -i max
   ```
   *(The `-i max` flag spawns a process for every CPU core).*
2. Save the PM2 list to auto-start on reboot:
   ```bash
   pm2 startup
   pm2 save
   ```

### Step 2.7: Configure Nginx & SSL
We will configure Nginx to serve the static frontend from `app/dist` and reverse proxy `/api` requests to PM2 (running on port 3000 by default).

1. Create a new Nginx configuration:
   ```bash
   sudo nano /etc/nginx/sites-available/tctoptibid
   ```
2. Add the following block (replace `yourdomain.com`):
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       root /opt/Tender-Management/app/dist;
       index index.html;

       # Gzip compression for speed
       gzip on;
       gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

       # Serve Frontend
       location / {
           try_files $uri $uri/ /index.html;
       }

       # Proxy Backend API
       location /api/ {
           proxy_pass http://127.0.0.1:3000/;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       }

       # Allow large PDF uploads (10MB)
       client_max_body_size 15M;
   }
   ```
3. Enable the site and restart Nginx:
   ```bash
   sudo ln -s /etc/nginx/sites-available/tctoptibid /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```
4. Generate SSL Certificates:
   ```bash
   sudo certbot --nginx -d yourdomain.com
   ```

## 3. Maintenance & Backup Strategy

With 200GB of SSD storage, your primary concern over time will be the PDF uploads (`/uploads` directory) and the database size.

- **Automated MySQL Backups:** Set up a simple cron job to dump the database nightly.
  ```bash
  0 2 * * * mysqldump -u optibid -p'StrongPassword123!' protender > /opt/backups/protender_$(date +\%F).sql
  ```
- **Uploads Backup:** Rsync the `/opt/Tender-Management/app/uploads` folder to a secure offsite location weekly.

The system is now fully deployed, incredibly fast, and secured!
