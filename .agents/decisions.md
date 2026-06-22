# Architecture and Design Decisions

## Selective Tender Unlock (June 2026)
- **Granular Permissions:** Replaced the global admin unlock rule with a specific `canUnlockTenders` boolean flag on the User model. This ensures that if an admin leaves, their unlock permissions can be safely reassigned to a new admin without completely disrupting or deleting their past audit logs.

## Security Enhancements (June 2026)
- **Rate Limiting:** Implemented an in-memory rate limiter for authentication routes (`/login`, `/forgotPassword`) allowing 5 attempts per 15 minutes. Decided against a Redis dependency at this stage to keep the deployment simple for a single-node setup.
- **Input Validation:** Added strict length validations to Zod schemas (e.g., `email.max(255)`, `password.max(100)`) on both frontend and backend to mitigate DoS attacks caused by parsing or hashing excessively large string payloads.
- **Hardcoded Credentials:** Removed the hardcoded CEO login bypass logic. All users, including superadmins, must now be properly seeded into the database or provisioned via the secure provisioning route.
- **Token Generation:** Switched `forgotPassword` tokens from `Math.random()` to cryptographically secure `crypto.randomBytes()`.
