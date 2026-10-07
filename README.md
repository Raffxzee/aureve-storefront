# AUREVÉ

AUREVÉ is a React storefront with a local Express API and SQLite persistence.

## Development

Run `npm run dev` to start Vite and the API together. The API listens on port 3001; Vite proxies `/api` requests to it. The SQLite database is created at `data/aureve.sqlite` by default. Set `DATABASE_PATH` to use a different file, or `API_PORT` to change the API port.

## Docker

Copy `.env.example` to `.env` and replace every example value before starting production containers. Run `docker compose up --build -d`; the frontend listens on port 8081 by default (`FRONTEND_PORT` changes the host port). Nginx proxies `/api` to the backend, and named Docker volumes persist SQLite data and backups across container recreation. The included Nginx configuration is HTTP-only; put a trusted HTTPS reverse proxy/load balancer in front of it and point `APP_BASE_URL` at that HTTPS origin. Direct HTTP use is for local development only. Keep `.env` private; it is excluded from Git and the Docker build context.

## Accounts and orders

The API supports account registration, email verification, login, logout, password reset, session restore, sandbox checkout, and order history. Checkout requests require a UUID `Idempotency-Key`: retries with the same key and order details return the existing order, while reusing a key with different details returns a conflict. Passwords are hashed with bcrypt. Verification and reset tokens are stored as hashes, expire after 24 hours and one hour respectively, and are single-use. Sessions use an HTTP-only cookie; password reset revokes existing sessions. Customer login, registration, and email actions are rate-limited. In development, verification/reset links are printed to the API console. Configure SMTP variables to send email instead.

Production startup requires `ADMIN_EMAIL`, an `ADMIN_PASSWORD` of at least 12 characters, authenticated SMTP settings, `MAIL_FROM`, and an HTTPS `APP_BASE_URL`. The CMS Activity log records product, article, image upload, contact-setting, and order-status changes.

Create and verify a SQLite backup with `npm run backup`. In Docker, run `docker compose exec backend node scripts/backup-database.js`. The script keeps the newest `BACKUP_RETENTION` files (14 by default); schedule it from the host with a daily cron entry such as `0 2 * * * docker compose -f /path/to/aureve-storefront/docker-compose.yml exec -T backend node scripts/backup-database.js`. Backups are stored in a separate named volume by default; copy them to storage outside the server/host regularly for disaster recovery. Before restoring, stop the backend and preserve its current database files. Restore a verified backup while the backend is stopped, restart it, and test restores periodically. The script uses SQLite's online backup API and checks the resulting database.

The storefront targets Indonesia and displays prices in IDR. Existing USD product prices are converted once at a fixed demo rate of Rp16,000 per USD when the database first migrates; this is not a live exchange rate. Checkout collects an Indonesia-ready address with province, city/regency, district/kecamatan, postal code, and phone. Shipping is calculated through a server-side flat-rate adapter so a carrier adapter can be introduced later without changing checkout. Checkout calculates subtotal, shipping, and total on the server using integer IDR amounts; client-submitted totals are ignored. Checkout currently uses demo payment only: orders are saved with `sandbox_pending`, and no payment is collected. Standard shipping costs Rp240,000 or is complimentary for orders of Rp8,000,000 or more; express shipping costs Rp400,000. These are estimates, not carrier rates; the CMS supports manually saving a carrier and HTTPS tracking link, but does not book shipments or fetch live rates. Historical orders remain marked USD.

## Content management

Open `/admin` directly to reach the separate CMS sign-in screen; no CMS link is displayed in the storefront. In local development, sign in with `admin@aureve.local` / `AureveDemo2026!`. This account is created only outside production. CMS authentication uses its own HTTP-only cookie and a separate, rate-limited login endpoint; customer login cannot access admin APIs. The `/admin` path is not a substitute for authentication: the CMS UI requires an admin session and every admin API verifies that separate session. The CMS supports adding, editing, and publishing/hiding products; setting available stock by size; assigning products to Men, Women, or Unisex; drafting, editing, and publishing Journal stories; updating order fulfillment and manual shipment tracking; editing storefront contact details; and viewing the admin activity log. Product and article changes are stored in SQLite and immediately feed the storefront. CMS image fields accept file uploads (JPEG, PNG, WEBP, or GIF, up to 8 MB each); up to five product images can be uploaded. Uploaded images are stored under the persistent data volume and served by the API. Existing public `http` or `https` image URLs continue to work.

The Contact tab controls the footer email, WhatsApp number, Instagram profile, and phone number. Development defaults use dummy `aureve.example` contact details; replace them with real channels in the CMS before launch.

Development admin privileges are not provisioned in production. Set `SEED_DEV_ADMIN=true` explicitly for the local demo admin; production always disables that flag and uses the configured `ADMIN_EMAIL` and `ADMIN_PASSWORD`. Public customer registration always creates a customer role; the CMS API rejects non-admin accounts.

The Vite build includes basic `robots.txt` and `sitemap.xml` files plus dynamic page titles. Replace the placeholder host in `public/sitemap.xml` with the real public HTTPS domain before launch.

## Before production

Checkout remains in sandbox mode: orders are saved as `sandbox_pending`, and no payment is collected. Reservations expire after `ORDER_RESERVATION_MINUTES` (45 by default), after which unpaid orders are cancelled and stock is restored. Choose a payment provider later and configure server-side secrets/webhook credentials. Do not collect or store card numbers in this app; use the provider's hosted checkout or tokenized payment fields.

Shipping remains a demo estimate. Choose supported countries and a carrier/service before enabling live rates and shipment creation. Inventory is tracked by product size. Existing and newly added sizes start with zero available stock; administrators must enter verified quantities in the Products tab before those variants can be purchased. Checkout reserves stock atomically, and cancelling an order restores it. Orders remain in sandbox payment status and reserved units remain held until the order is cancelled. Database backups are not automatic: schedule the backup command and keep an off-host copy.
