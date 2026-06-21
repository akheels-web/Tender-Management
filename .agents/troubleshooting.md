# Troubleshooting Guide

## Authentication Issues

### Users receiving "Too many login attempts" (TOO_MANY_REQUESTS)
- **Cause:** The in-memory rate limiter has blocked the IP address due to too many failed login or password reset attempts (limit is 5 attempts per 15 minutes).
- **Resolution:** The user must wait 15 minutes for the rate limit window to expire. Since this is an in-memory rate limiter, restarting the Node.js server will immediately clear all active rate limit bans, though this is not recommended for production environments unless necessary.

### Superadmin login fails after code update
- **Cause:** The hardcoded `ceo@nationalfinance.co.om` login bypass was removed for security reasons.
- **Resolution:** The superadmin account must be properly created in the database. Run the database seed script (`npm run seed`) or use the secure provisioning route if implemented.
