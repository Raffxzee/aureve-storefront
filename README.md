# AUREVÉ

AUREVÉ is a React storefront with a local Express API and SQLite persistence.

## Development

Run `npm run dev` to start Vite and the API together. The API listens on port 3001; Vite proxies `/api` requests to it. The SQLite database is created at `data/aureve.sqlite` by default. Set `DATABASE_PATH` to use a different file, or `API_PORT` to change the API port.

## Docker

Copy `.env.example` to `.env` and set a unique `ADMIN_PASSWORD` before starting the production containers. Run `docker compose up --build -d`; the storefront is available at `http://localhost:8081` by default (`FRONTEND_PORT` changes the host port). Nginx proxies `/api` to the backend, and a named Docker volume persists SQLite data across container recreation. Keep `.env` private; it is excluded from Git and the Docker build context.

## Accounts and orders

The API supports account registration, login, logout, session restore, sandbox checkout, and order history. Passwords are hashed with bcrypt. Sessions use an HTTP-only cookie. The database stores users, sessions, orders, order items, shipping addresses, and payment/shipping statuses.

The storefront targets Indonesia and displays prices in IDR. Existing USD product prices are converted once at a fixed demo rate of Rp16,000 per USD when the database first migrates; this is not a live exchange rate. Checkout currently uses demo payment only: orders are saved with `sandbox_pending`, and no payment is collected. Standard shipping costs Rp240,000 or is complimentary for orders of Rp8,000,000 or more; express shipping costs Rp400,000. These are estimates, not carrier rates, and no shipment booking or tracking is created. Historical orders remain marked USD.

## Content management

Open `/admin` directly to reach the separate CMS sign-in screen; no CMS link is displayed in the storefront. In local development, sign in with `admin@aureve.local` / `AureveDemo2026!`. This account is created only outside production. CMS authentication uses its own HTTP-only cookie and a separate, rate-limited login endpoint; customer login cannot access admin APIs. The `/admin` path is not a substitute for authentication: the CMS UI requires an admin session and every admin API verifies that separate session. The CMS supports adding, editing, and publishing/hiding products; assigning products to Men, Women, or Unisex; drafting, editing, and publishing Journal stories; updating order fulfillment status; and editing the storefront footer contact details. Product and article changes are stored in SQLite and immediately feed the storefront. CMS image fields accept file uploads (JPEG, PNG, WEBP, or GIF, up to 8 MB each); up to five product images can be uploaded. Uploaded images are stored under the persistent data volume and served by the API. Existing public `http` or `https` image URLs continue to work.

The Contact tab controls the footer email, WhatsApp number, Instagram profile, and phone number. Development defaults use dummy `aureve.example` contact details; replace them with real channels in the CMS before launch.

For production, set `ADMIN_EMAIL` and `ADMIN_PASSWORD` (12 or more characters) before starting the API. Development admin privileges are not provisioned in production. Public customer registration always creates a customer role; the CMS API rejects non-admin accounts.

## Before production

Choose a payment provider and configure its server-side secret/webhook credentials. Choose the shipping countries and carrier/service, then replace the demo fees with live rate quotes and shipment creation. Do not collect or store card numbers in this app; use the provider's hosted checkout or tokenized payment fields. Add production HTTPS, rate limiting, email verification/password reset, and operational database backups before accepting customers.
