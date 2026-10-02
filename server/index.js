import { randomBytes, createHash } from 'node:crypto'
import { mkdirSync } from 'node:fs'
import { unlink, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import bcrypt from 'bcryptjs'
import cookieParser from 'cookie-parser'
import Database from 'better-sqlite3'
import express from 'express'
import rateLimit from 'express-rate-limit'
import multer from 'multer'

const serverDirectory = dirname(fileURLToPath(import.meta.url))
const databasePath = resolve(process.env.DATABASE_PATH || `${serverDirectory}/../data/aureve.sqlite`)
const uploadDirectory = resolve(dirname(databasePath), 'uploads')
mkdirSync(uploadDirectory, { recursive: true })
const defaultContactDetails = {
  email: 'clientcare@aureve.example',
  whatsapp: '+62 000 0000 0000',
  instagram: 'https://www.instagram.com/aureve.example/',
  phone: '+62 000 0000 0000',
}

const database = new Database(databasePath)
database.pragma('journal_mode = WAL')
database.pragma('foreign_keys = ON')
database.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'customer',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number TEXT NOT NULL UNIQUE,
    user_id INTEGER REFERENCES users(id),
    subtotal INTEGER NOT NULL,
    shipping INTEGER NOT NULL,
    total INTEGER NOT NULL,
    shipping_method TEXT NOT NULL,
    shipping_address TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    payment_status TEXT NOT NULL,
    fulfillment_status TEXT NOT NULL DEFAULT 'processing',
    currency_code TEXT NOT NULL DEFAULT 'IDR',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    unit_price INTEGER NOT NULL,
    size TEXT NOT NULL,
    quantity INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price INTEGER NOT NULL,
    currency_code TEXT NOT NULL DEFAULT 'IDR',
    category TEXT NOT NULL,
    color TEXT NOT NULL,
    material TEXT NOT NULL,
    audience TEXT NOT NULL DEFAULT 'unisex',
    sizes TEXT NOT NULL,
    gallery TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    image TEXT NOT NULL,
    alt TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    body TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS site_settings (
    setting_key TEXT PRIMARY KEY,
    setting_value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions(expires_at);
  CREATE INDEX IF NOT EXISTS orders_user_idx ON orders(user_id, created_at DESC);
`)
database.prepare('INSERT OR IGNORE INTO site_settings (setting_key, setting_value) VALUES (?, ?)')
  .run('contact', JSON.stringify(defaultContactDetails))

const userColumns = database.pragma('table_info(users)')
if (!userColumns.some((column) => column.name === 'role')) {
  database.exec("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'customer'")
}

const productColumns = database.pragma('table_info(products)')
if (!productColumns.some((column) => column.name === 'currency_code')) {
  database.transaction(() => {
    database.exec("ALTER TABLE products ADD COLUMN currency_code TEXT NOT NULL DEFAULT 'USD'")
    database.exec("UPDATE products SET price = price * 16000, currency_code = 'IDR'")
  })()
}

const orderColumns = database.pragma('table_info(orders)')
if (!orderColumns.some((column) => column.name === 'currency_code')) {
  database.exec("ALTER TABLE orders ADD COLUMN currency_code TEXT NOT NULL DEFAULT 'USD'")
}
const orderUserColumn = database.pragma('table_info(orders)').find((column) => column.name === 'user_id')
if (orderUserColumn?.notnull) {
  database.pragma('foreign_keys = OFF')
  try {
    database.transaction(() => {
      database.exec(`
        CREATE TABLE orders_guest_checkout (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_number TEXT NOT NULL UNIQUE,
          user_id INTEGER REFERENCES users(id),
          subtotal INTEGER NOT NULL,
          shipping INTEGER NOT NULL,
          total INTEGER NOT NULL,
          shipping_method TEXT NOT NULL,
          shipping_address TEXT NOT NULL,
          payment_method TEXT NOT NULL,
          payment_status TEXT NOT NULL,
          fulfillment_status TEXT NOT NULL DEFAULT 'processing',
          currency_code TEXT NOT NULL DEFAULT 'IDR',
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        INSERT INTO orders_guest_checkout (
          id, order_number, user_id, subtotal, shipping, total, shipping_method,
          shipping_address, payment_method, payment_status, fulfillment_status, currency_code, created_at
        )
        SELECT id, order_number, user_id, subtotal, shipping, total, shipping_method,
          shipping_address, payment_method, payment_status, fulfillment_status, currency_code, created_at
        FROM orders;
        DROP TABLE orders;
        ALTER TABLE orders_guest_checkout RENAME TO orders;
        CREATE INDEX IF NOT EXISTS orders_user_idx ON orders(user_id, created_at DESC);
      `)
    })()
  } finally {
    database.pragma('foreign_keys = ON')
  }
}

const seedProducts = [
  { id: 1, name: 'Sculpted Wool Blazer', price: 6720000, category: 'Outerwear', color: 'Ivory', material: 'Wool blend', audience: 'women', sizes: ['XS', 'S', 'M', 'L'], gallery: ['https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80'] },
  { id: 2, name: 'Relaxed Leather Trench', price: 8960000, category: 'Outerwear', color: 'Stone', material: 'Italian leather', audience: 'men', sizes: ['S', 'M', 'L', 'XL'], gallery: ['https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80'] },
  { id: 3, name: 'Tailored Pleat Trousers', price: 3840000, category: 'Tailoring', color: 'Black', material: 'Stretch twill', audience: 'men', sizes: ['XS', 'S', 'M', 'L', 'XL'], gallery: ['https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80'] },
  { id: 4, name: 'Monochrome Knit Polo', price: 2880000, category: 'Knitwear', color: 'Ash', material: 'Cotton knit', audience: 'men', sizes: ['S', 'M', 'L'], gallery: ['https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=900&q=80'] },
  { id: 5, name: 'Woven Cotton Shirt', price: 3360000, category: 'Shirts', color: 'Bone', material: 'Cotton poplin', audience: 'men', sizes: ['XS', 'S', 'M', 'L', 'XL'], gallery: ['https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=900&q=80'] },
  { id: 6, name: 'Double Face Wool Coat', price: 10240000, category: 'Outerwear', color: 'Black', material: 'Double-faced wool', audience: 'men', sizes: ['S', 'M', 'L'], gallery: ['https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80'] },
  { id: 7, name: 'Soft Tailored Dress', price: 5120000, category: 'Dresses', color: 'Ecru', material: 'Silk blend', audience: 'women', sizes: ['XS', 'S', 'M', 'L'], gallery: ['https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80'] },
  { id: 8, name: 'Structured Leather Tote', price: 4160000, category: 'Accessories', color: 'Black', material: 'Full grain leather', audience: 'unisex', sizes: ['One Size'], gallery: ['https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80'] },
  { id: 9, name: 'Minimal Day Backpack', price: 5440000, category: 'Accessories', color: 'Navy', material: 'Technical canvas', audience: 'unisex', sizes: ['One Size'], gallery: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80'] },
  { id: 10, name: 'Woven Cashmere Scarf', price: 2480000, category: 'Accessories', color: 'Charcoal', material: 'Cashmere blend', audience: 'unisex', sizes: ['One Size'], gallery: ['https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=900&q=80'] },
  { id: 11, name: 'Sculptural Silver Cuff', price: 3040000, category: 'Accessories', color: 'Silver', material: 'Sterling silver', audience: 'unisex', sizes: ['One Size'], gallery: ['https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=900&q=80'] },
  { id: 12, name: 'Minimal Acetate Sunglasses', price: 2240000, category: 'Accessories', color: 'Black', material: 'Acetate', audience: 'unisex', sizes: ['One Size'], gallery: ['https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=80'] },
]

const insertSeedProduct = database.prepare(`
  INSERT OR IGNORE INTO products (id, name, price, currency_code, category, color, material, audience, sizes, gallery)
  VALUES (@id, @name, @price, 'IDR', @category, @color, @material, @audience, @sizes, @gallery)
`)
for (const product of seedProducts) {
  insertSeedProduct.run({ ...product, sizes: JSON.stringify(product.sizes), gallery: JSON.stringify(product.gallery) })
}
database.prepare(`
  UPDATE products SET name = @name, color = @color, material = @material, audience = @audience,
    gallery = @gallery, updated_at = CURRENT_TIMESTAMP
  WHERE id = 12 AND name = 'Minimal Leather Belt' AND gallery LIKE '%photo-1624222247344%'
`).run({
  name: 'Minimal Acetate Sunglasses',
  color: 'Black',
  material: 'Acetate',
  audience: 'unisex',
  gallery: JSON.stringify(['https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=900&q=80']),
})
database.prepare(`
  UPDATE products SET name = 'Minimal Day Backpack', color = 'Navy', material = 'Technical canvas',
    gallery = @gallery, updated_at = CURRENT_TIMESTAMP
  WHERE id = 9 AND name = 'Soft Leather Crossbody' AND gallery LIKE '%photo-1548036328%'
`).run({ gallery: JSON.stringify(['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80']) })
database.prepare(`
  UPDATE products SET gallery = @gallery, updated_at = CURRENT_TIMESTAMP
  WHERE id = 12 AND name = 'Minimal Acetate Sunglasses' AND gallery LIKE '%photo-1508296695146%'
`).run({ gallery: JSON.stringify(['https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=80']) })

const seedArticles = [
  { category: 'Materials', title: 'The quiet character of wool', image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=900&q=80', alt: 'Textured wool garments', excerpt: 'A closer look at the natural texture and lasting character of wool.', body: 'The best materials reveal themselves slowly. Wool holds warmth without weight, texture without noise, and a shape that softens with time. We select fibres for how they feel in the hand and how they become part of a daily wardrobe.' },
  { category: 'Perspective', title: 'Dressing for the in-between', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80', alt: 'Contemporary fashion styling', excerpt: 'Thoughtful layers for the days that never fit one forecast.', body: 'An open collar, a light knit, a coat with room to move. Dressing for changing weather is an exercise in balance: pieces that can be added or left behind without losing their point of view.' },
  { category: 'Atelier', title: 'A closer look at the details', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=80', alt: 'Thoughtfully styled clothing', excerpt: 'Small decisions in cut, finish and construction shape a garment.', body: 'A considered garment is built through many quiet decisions. We look closely at the line of a shoulder, the weight of a button and the way a seam sits against the body. These details are meant to be lived with, not simply noticed.' },
  { category: 'The edit', title: 'Pieces to return to', image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80', alt: 'A timeless fashion look', excerpt: 'A small wardrobe of pieces that earns its place over time.', body: 'The pieces we return to most are often the simplest: a clean shirt, a reliable coat, trousers with the right ease. Choosing fewer, better things lets personal style become clearer with every wear.' },
]
const insertSeedArticle = database.prepare(`
  INSERT INTO articles (category, title, image, alt, excerpt, body, status)
  VALUES (@category, @title, @image, @alt, @excerpt, @body, 'published')
`)
if (!database.prepare('SELECT 1 FROM articles LIMIT 1').get()) {
  for (const article of seedArticles) insertSeedArticle.run(article)
}

const developmentAdminEmail = process.env.NODE_ENV === 'production' ? '' : 'admin@aureve.local'
const adminEmail = (process.env.ADMIN_EMAIL || developmentAdminEmail).trim().toLowerCase()
const adminPassword = process.env.ADMIN_PASSWORD || (process.env.NODE_ENV === 'production' ? '' : 'AureveDemo2026!')
const production = process.env.NODE_ENV === 'production'
if (production) database.prepare("UPDATE users SET role = 'customer' WHERE role = 'admin'").run()
if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail) && adminPassword.length >= 12) {
  const adminHash = bcrypt.hashSync(adminPassword, 12)
  database.prepare(`
    INSERT INTO users (name, email, password_hash, role) VALUES ('AUREVÉ Admin', ?, ?, 'admin')
    ON CONFLICT(email) DO UPDATE SET name = 'AUREVÉ Admin', password_hash = excluded.password_hash, role = 'admin'
  `).run(adminEmail, adminHash)
} else if (production) {
  console.warn('CMS admin is not seeded. Set ADMIN_EMAIL and ADMIN_PASSWORD (12+ characters).')
}

const app = express()
const sessionDuration = 7 * 24 * 60 * 60 * 1000
const sessionCookie = 'aureve_session'
const adminSessionCookie = 'aureve_admin_session'
app.set('trust proxy', process.env.NODE_ENV === 'production' ? 1 : false)
app.use(express.json({ limit: '32kb' }))
app.use(cookieParser())
app.use('/api/uploads', express.static(uploadDirectory, { maxAge: '1y', immutable: true }))

const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many admin sign-in attempts. Try again later.' },
})

const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 5 },
  fileFilter: (_request, file, callback) => {
    if (allowedImageTypes.has(file.mimetype)) return callback(null, true)
    const error = new Error('Choose a JPG, PNG, WEBP, or GIF image.')
    error.status = 400
    callback(error)
  },
})

const hashToken = (token) => createHash('sha256').update(token).digest('hex')
const cleanExpiredSessions = database.prepare('DELETE FROM sessions WHERE expires_at <= ?')
const getUserForSession = database.prepare(`
  SELECT users.id, users.name, users.email, users.role
  FROM sessions JOIN users ON users.id = sessions.user_id
  WHERE sessions.token_hash = ? AND sessions.expires_at > ?
`)

function issueSession(response, userId, cookieName = sessionCookie) {
  const token = randomBytes(32).toString('hex')
  const expiresAt = Date.now() + sessionDuration
  database.prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)')
    .run(hashToken(token), userId, expiresAt)
  response.cookie(cookieName, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: sessionDuration,
    path: '/',
  })
}

function requireUser(request, response, next) {
  const token = request.cookies[sessionCookie]
  if (!token) return response.status(401).json({ error: 'Please sign in to continue.' })

  const user = getUserForSession.get(hashToken(token), Date.now())
  if (!user) return response.status(401).json({ error: 'Your session has expired. Please sign in again.' })
  if (user.role !== 'customer') return response.status(403).json({ error: 'This session cannot access customer features.' })
  request.user = user
  next()
}

function requireAdmin(request, response, next) {
  const token = request.cookies[adminSessionCookie]
  if (!token) return response.status(401).json({ error: 'Administrator sign-in is required.' })
  const user = getUserForSession.get(hashToken(token), Date.now())
  if (!user || user.role !== 'admin') return response.status(401).json({ error: 'Administrator sign-in is required.' })
  request.user = user
  next()
}

function detectImageFormat(buffer) {
  if (buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) return { mimeType: 'image/jpeg', extension: 'jpg' }
  if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return { mimeType: 'image/png', extension: 'png' }
  if (buffer.subarray(0, 6).toString('ascii').match(/^GIF8[79]a$/)) return { mimeType: 'image/gif', extension: 'gif' }
  if (buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP') return { mimeType: 'image/webp', extension: 'webp' }
  return null
}

function isValidImageReference(image) {
  if (typeof image !== 'string' || image.length > 1000) return false
  if (/^\/api\/uploads\/[a-f0-9]{32}\.(?:jpg|png|webp|gif)$/.test(image)) return true
  try {
    return ['http:', 'https:'].includes(new URL(image).protocol)
  } catch {
    return false
  }
}

app.post('/api/admin/uploads', requireAdmin, imageUpload.array('images', 5), async (request, response, next) => {
  const files = request.files || []
  if (!files.length) return response.status(400).json({ error: 'Select at least one image to upload.' })

  const normalizedFiles = files.map((file) => ({ file, format: detectImageFormat(file.buffer) }))
  if (normalizedFiles.some(({ file, format }) => !format || format.mimeType !== file.mimetype)) {
    return response.status(400).json({ error: 'One or more files are not valid images.' })
  }

  const savedFiles = normalizedFiles.map(({ file, format }) => ({
    file,
    filename: `${randomBytes(16).toString('hex')}.${format.extension}`,
  }))
  try {
    await Promise.all(savedFiles.map(({ file, filename }) => writeFile(resolve(uploadDirectory, filename), file.buffer, { flag: 'wx' })))
  } catch (error) {
    await Promise.all(savedFiles.map(({ filename }) => unlink(resolve(uploadDirectory, filename)).catch(() => {})))
    return next(error)
  }

  response.status(201).json({ images: savedFiles.map(({ filename, file }) => ({ url: `/api/uploads/${filename}`, size: file.size })) })
})

function presentProduct(row) {
  return {
    ...row,
    currencyCode: row.currency_code,
    unitsSold: row.units_sold || 0,
    sizes: JSON.parse(row.sizes),
    gallery: JSON.parse(row.gallery),
    isActive: Boolean(row.is_active),
    currency_code: undefined,
    units_sold: undefined,
    is_active: undefined,
    created_at: undefined,
    updated_at: undefined,
  }
}

function validateProduct(input) {
  const name = typeof input.name === 'string' ? input.name.trim() : ''
  const category = typeof input.category === 'string' ? input.category.trim() : ''
  const color = typeof input.color === 'string' ? input.color.trim() : ''
  const material = typeof input.material === 'string' ? input.material.trim() : ''
  const description = typeof input.description === 'string' ? input.description.trim() : ''
  const price = Number(input.price)
  const audience = input.audience
  const sizes = Array.isArray(input.sizes) ? input.sizes : []
  const gallery = Array.isArray(input.gallery) ? input.gallery : []
  const validImages = gallery.length > 0 && gallery.length <= 5 && gallery.every(isValidImageReference)

  if (name.length < 2 || name.length > 120) return { error: 'Product name must be between 2 and 120 characters.' }
  if (!Number.isInteger(price) || price < 1 || price > 100000000) return { error: 'Enter a valid product price in IDR.' }
  if (!category || category.length > 60 || !color || color.length > 60 || !material || material.length > 100) return { error: 'Complete the product category, color, and material.' }
  if (!['men', 'women', 'unisex'].includes(audience)) return { error: 'Choose a valid product audience.' }
  if (!sizes.length || sizes.length > 12 || sizes.some((size) => typeof size !== 'string' || !size.trim() || size.length > 24)) return { error: 'Add between 1 and 12 valid sizes.' }
  if (!validImages) return { error: 'Add between 1 and 5 valid image files or http(s) image URLs.' }
  if (description.length > 2000) return { error: 'Product description must be 2000 characters or less.' }
  return { value: { name, price, category, color, material, audience, sizes, gallery, description } }
}

function validateArticle(input) {
  const fields = ['category', 'title', 'image', 'alt', 'excerpt', 'body']
  const article = Object.fromEntries(fields.map((field) => [field, typeof input[field] === 'string' ? input[field].trim() : '']))
  if (article.category.length < 2 || article.category.length > 60) return { error: 'Enter an article category.' }
  if (article.title.length < 3 || article.title.length > 160) return { error: 'Article title must be between 3 and 160 characters.' }
  if (article.alt.length < 2 || article.alt.length > 200) return { error: 'Enter descriptive image alt text.' }
  if (article.excerpt.length < 10 || article.excerpt.length > 500) return { error: 'Article excerpt must be between 10 and 500 characters.' }
  if (article.body.length < 20 || article.body.length > 20000) return { error: 'Article body must be between 20 and 20000 characters.' }
  if (!isValidImageReference(article.image)) return { error: 'Upload a valid cover image or enter a valid http(s) image URL.' }
  if (!['draft', 'published'].includes(input.status)) return { error: 'Choose draft or published status.' }
  return { value: { ...article, status: input.status } }
}

function validateContactDetails(input) {
  const email = typeof input.email === 'string' ? input.email.trim() : ''
  const whatsapp = typeof input.whatsapp === 'string' ? input.whatsapp.trim() : ''
  const instagram = typeof input.instagram === 'string' ? input.instagram.trim() : ''
  const phone = typeof input.phone === 'string' ? input.phone.trim() : ''
  const validPhone = (value) => value.length <= 32 && /^\+\d[\d\s().-]{6,30}$/.test(value)

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return { error: 'Enter a valid customer care email.' }
  if (!validPhone(whatsapp)) return { error: 'Enter a WhatsApp number with its country code.' }
  if (!validPhone(phone)) return { error: 'Enter a phone number with its country code.' }
  try {
    const instagramUrl = new URL(instagram)
    if (instagramUrl.protocol !== 'https:' || !['instagram.com', 'www.instagram.com'].includes(instagramUrl.hostname) || instagramUrl.pathname === '/') {
      return { error: 'Enter a valid Instagram profile URL.' }
    }
  } catch {
    return { error: 'Enter a valid Instagram profile URL.' }
  }
  return { value: { email, whatsapp, instagram, phone } }
}

app.get('/api/health', (_request, response) => response.json({ status: 'ok' }))

app.get('/api/settings/contact', (_request, response) => {
  const row = database.prepare('SELECT setting_value FROM site_settings WHERE setting_key = ?').get('contact')
  response.json({ contact: JSON.parse(row.setting_value) })
})

app.patch('/api/admin/settings/contact', requireAdmin, (request, response) => {
  const result = validateContactDetails(request.body)
  if (result.error) return response.status(400).json({ error: result.error })
  database.prepare(`
    INSERT INTO site_settings (setting_key, setting_value, updated_at)
    VALUES ('contact', ?, CURRENT_TIMESTAMP)
    ON CONFLICT(setting_key) DO UPDATE SET setting_value = excluded.setting_value, updated_at = CURRENT_TIMESTAMP
  `).run(JSON.stringify(result.value))
  response.json({ contact: result.value })
})

app.get('/api/products', (_request, response) => {
  const rows = database.prepare(`
    SELECT products.*,
      COALESCE((SELECT SUM(order_items.quantity) FROM order_items WHERE order_items.product_id = products.id), 0) AS units_sold
    FROM products WHERE products.is_active = 1 ORDER BY products.id
  `).all()
  response.json({ products: rows.map(presentProduct) })
})

app.get('/api/journal', (_request, response) => {
  const articles = database.prepare(`
    SELECT id, category, title, image, alt, excerpt, body, created_at AS createdAt
    FROM articles WHERE status = 'published' ORDER BY created_at DESC
  `).all()
  response.json({ articles })
})

app.get('/api/auth/me', (request, response) => {
  cleanExpiredSessions.run(Date.now())
  const adminToken = request.cookies[adminSessionCookie]
  const adminUser = adminToken ? getUserForSession.get(hashToken(adminToken), Date.now()) : null
  const customerToken = request.cookies[sessionCookie]
  const customerUser = customerToken ? getUserForSession.get(hashToken(customerToken), Date.now()) : null
  const user = adminUser?.role === 'admin' ? adminUser : customerUser?.role === 'customer' ? customerUser : null
  response.json({ user: user || null })
})

app.post('/api/auth/register', async (request, response, next) => {
  try {
    const name = typeof request.body.name === 'string' ? request.body.name.trim() : ''
    const email = typeof request.body.email === 'string' ? request.body.email.trim().toLowerCase() : ''
    const password = typeof request.body.password === 'string' ? request.body.password : ''
    if (name.length < 2 || name.length > 80) return response.status(400).json({ error: 'Enter a name between 2 and 80 characters.' })
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return response.status(400).json({ error: 'Enter a valid email address.' })
    if (password.length < 8 || password.length > 128) return response.status(400).json({ error: 'Password must be at least 8 characters.' })

    const passwordHash = await bcrypt.hash(password, 12)
    const result = database.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)')
      .run(name, email, passwordHash)
    issueSession(response, result.lastInsertRowid)
    response.status(201).json({ user: { id: result.lastInsertRowid, name, email, role: 'customer' } })
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') return response.status(409).json({ error: 'An account with this email already exists.' })
    next(error)
  }
})

app.post('/api/auth/login', async (request, response, next) => {
  try {
    const email = typeof request.body.email === 'string' ? request.body.email.trim().toLowerCase() : ''
    const password = typeof request.body.password === 'string' ? request.body.password : ''
    const user = database.prepare('SELECT id, name, email, password_hash, role FROM users WHERE email = ?').get(email)
    if (!user || user.role !== 'customer' || !(await bcrypt.compare(password, user.password_hash))) {
      return response.status(401).json({ error: 'Email or password is incorrect.' })
    }

    issueSession(response, user.id)
    response.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } })
  } catch (error) {
    next(error)
  }
})

app.post('/api/admin/auth/login', adminLoginLimiter, async (request, response, next) => {
  try {
    const email = typeof request.body.email === 'string' ? request.body.email.trim().toLowerCase() : ''
    const password = typeof request.body.password === 'string' ? request.body.password : ''
    const user = database.prepare('SELECT id, name, email, password_hash, role FROM users WHERE email = ?').get(email)
    if (!user || user.role !== 'admin' || !(await bcrypt.compare(password, user.password_hash))) {
      return response.status(401).json({ error: 'Email or password is incorrect.' })
    }

    issueSession(response, user.id, adminSessionCookie)
    response.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } })
  } catch (error) {
    next(error)
  }
})

app.post('/api/auth/logout', (request, response) => {
  const token = request.cookies[sessionCookie]
  if (token) database.prepare('DELETE FROM sessions WHERE token_hash = ?').run(hashToken(token))
  response.clearCookie(sessionCookie, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/' })
  response.json({ success: true })
})

app.post('/api/admin/auth/logout', (request, response) => {
  const token = request.cookies[adminSessionCookie]
  if (token) database.prepare('DELETE FROM sessions WHERE token_hash = ?').run(hashToken(token))
  response.clearCookie(adminSessionCookie, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/' })
  response.json({ success: true })
})

app.post('/api/checkout', (request, response) => {
  const token = request.cookies[sessionCookie]
  const sessionUser = token ? getUserForSession.get(hashToken(token), Date.now()) : null
  const checkoutUser = sessionUser?.role === 'customer' ? sessionUser : null
  const { items, address, shippingMethod, paymentMethod } = request.body
  const addressFields = ['name', 'email', 'phone', 'address', 'city', 'postalCode', 'country']
  if (!address || addressFields.some((field) => typeof address[field] !== 'string' || !address[field].trim())) {
    return response.status(400).json({ error: 'Complete all contact and delivery details.' })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email) || address.email.length > 254) {
    return response.status(400).json({ error: 'Enter a valid email address.' })
  }
  if (!Array.isArray(items) || items.length === 0 || items.length > 20) {
    return response.status(400).json({ error: 'Your bag is empty or contains too many items.' })
  }
  if (!['standard', 'express'].includes(shippingMethod)) return response.status(400).json({ error: 'Choose a valid shipping method.' })
  if (paymentMethod !== 'sandbox') return response.status(400).json({ error: 'Only sandbox payment is currently available.' })

  const normalizedItems = []
  for (const item of items) {
    const productRow = database.prepare('SELECT * FROM products WHERE id = ? AND is_active = 1').get(Number(item.id))
    const quantity = Number(item.quantity)
    if (!productRow || !Number.isInteger(quantity) || quantity < 1 || quantity > 10 || !JSON.parse(productRow.sizes).includes(item.size)) {
      return response.status(400).json({ error: 'One or more items in your bag are invalid.' })
    }
    normalizedItems.push({ id: Number(item.id), product: productRow, size: item.size, quantity })
  }

  const subtotal = normalizedItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const shipping = shippingMethod === 'standard' && subtotal >= 8000000 ? 0 : shippingMethod === 'express' ? 400000 : 240000
  const total = subtotal + shipping
  const orderNumber = `AUR-${randomBytes(4).toString('hex').toUpperCase()}`
  const createOrder = database.transaction(() => {
    const result = database.prepare(`
      INSERT INTO orders (order_number, user_id, subtotal, shipping, total, shipping_method, shipping_address, payment_method, payment_status, currency_code)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'IDR')
    `).run(orderNumber, checkoutUser?.id ?? null, subtotal, shipping, total, shippingMethod, JSON.stringify(address), paymentMethod, 'sandbox_pending')
    const insertItem = database.prepare(`
      INSERT INTO order_items (order_id, product_id, product_name, unit_price, size, quantity)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    for (const item of normalizedItems) {
      insertItem.run(result.lastInsertRowid, item.id, item.product.name, item.product.price, item.size, item.quantity)
    }
    return result.lastInsertRowid
  })

  const orderId = createOrder()
  response.status(201).json({
    order: { id: orderId, orderNumber, subtotal, shipping, total, currencyCode: 'IDR', paymentStatus: 'sandbox_pending', shippingMethod },
    payment: { mode: 'sandbox', charged: false },
  })
})

app.get('/api/orders', requireUser, (request, response) => {
  const orders = database.prepare(`
    SELECT id, order_number AS orderNumber, subtotal, shipping, total, currency_code AS currencyCode, shipping_method AS shippingMethod,
      payment_status AS paymentStatus, fulfillment_status AS fulfillmentStatus, created_at AS createdAt
    FROM orders WHERE user_id = ? ORDER BY created_at DESC
  `).all(request.user.id)
  const getItems = database.prepare(`
    SELECT product_name AS name, unit_price AS unitPrice, size, quantity
    FROM order_items WHERE order_id = ? ORDER BY id
  `)
  response.json({ orders: orders.map((order) => ({ ...order, items: getItems.all(order.id) })) })
})

app.get('/api/admin/products', requireAdmin, (_request, response) => {
  const rows = database.prepare('SELECT * FROM products ORDER BY updated_at DESC, id DESC').all()
  response.json({ products: rows.map(presentProduct) })
})

app.post('/api/admin/products', requireAdmin, (request, response) => {
  const result = validateProduct(request.body)
  if (result.error) return response.status(400).json({ error: result.error })
  const product = result.value
  const insert = database.prepare(`
    INSERT INTO products (name, price, currency_code, category, color, material, audience, sizes, gallery, description)
    VALUES (@name, @price, 'IDR', @category, @color, @material, @audience, @sizes, @gallery, @description)
  `).run({ ...product, sizes: JSON.stringify(product.sizes), gallery: JSON.stringify(product.gallery) })
  const created = database.prepare('SELECT * FROM products WHERE id = ?').get(insert.lastInsertRowid)
  response.status(201).json({ product: presentProduct(created) })
})

app.patch('/api/admin/products/:id', requireAdmin, (request, response) => {
  const productId = Number(request.params.id)
  const existing = database.prepare('SELECT * FROM products WHERE id = ?').get(productId)
  if (!existing) return response.status(404).json({ error: 'Product not found.' })
  if (typeof request.body.isActive === 'boolean') {
    database.prepare('UPDATE products SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(Number(request.body.isActive), productId)
  } else {
    const result = validateProduct(request.body)
    if (result.error) return response.status(400).json({ error: result.error })
    const product = result.value
    database.prepare(`
      UPDATE products SET name = @name, price = @price, currency_code = 'IDR', category = @category, color = @color,
        material = @material, audience = @audience, sizes = @sizes, gallery = @gallery,
        description = @description, updated_at = CURRENT_TIMESTAMP WHERE id = @id
    `).run({ ...product, sizes: JSON.stringify(product.sizes), gallery: JSON.stringify(product.gallery), id: productId })
  }
  response.json({ product: presentProduct(database.prepare('SELECT * FROM products WHERE id = ?').get(productId)) })
})

app.get('/api/admin/articles', requireAdmin, (_request, response) => {
  const articles = database.prepare(`
    SELECT id, category, title, image, alt, excerpt, body, status,
      created_at AS createdAt, updated_at AS updatedAt
    FROM articles ORDER BY updated_at DESC, id DESC
  `).all()
  response.json({ articles })
})

app.post('/api/admin/articles', requireAdmin, (request, response) => {
  const result = validateArticle(request.body)
  if (result.error) return response.status(400).json({ error: result.error })
  const article = result.value
  const insert = database.prepare(`
    INSERT INTO articles (category, title, image, alt, excerpt, body, status)
    VALUES (@category, @title, @image, @alt, @excerpt, @body, @status)
  `).run(article)
  const created = database.prepare('SELECT id, category, title, image, alt, excerpt, body, status FROM articles WHERE id = ?').get(insert.lastInsertRowid)
  response.status(201).json({ article: created })
})

app.patch('/api/admin/articles/:id', requireAdmin, (request, response) => {
  const articleId = Number(request.params.id)
  if (!database.prepare('SELECT id FROM articles WHERE id = ?').get(articleId)) return response.status(404).json({ error: 'Article not found.' })
  const result = validateArticle(request.body)
  if (result.error) return response.status(400).json({ error: result.error })
  database.prepare(`
    UPDATE articles SET category = @category, title = @title, image = @image, alt = @alt,
      excerpt = @excerpt, body = @body, status = @status, updated_at = CURRENT_TIMESTAMP WHERE id = @id
  `).run({ ...result.value, id: articleId })
  response.json({ article: database.prepare('SELECT id, category, title, image, alt, excerpt, body, status FROM articles WHERE id = ?').get(articleId) })
})

app.get('/api/admin/orders', requireAdmin, (_request, response) => {
  const getOrderItems = database.prepare(`
    SELECT product_id AS productId, product_name AS name, unit_price AS unitPrice, size, quantity
    FROM order_items WHERE order_id = ? ORDER BY id
  `)
  const orders = database.prepare(`
    SELECT orders.id, orders.order_number AS orderNumber, orders.subtotal, orders.shipping, orders.total,
      orders.currency_code AS currencyCode,
      orders.shipping_method AS shippingMethod, orders.shipping_address AS shippingAddress,
      orders.payment_method AS paymentMethod, orders.payment_status AS paymentStatus, orders.fulfillment_status AS fulfillmentStatus,
      orders.created_at AS createdAt, users.name AS customerName, users.email AS customerEmail,
      (SELECT COUNT(*) FROM order_items WHERE order_items.order_id = orders.id) AS itemCount
    FROM orders LEFT JOIN users ON users.id = orders.user_id ORDER BY orders.created_at DESC
  `).all().map((order) => {
    const shippingAddress = JSON.parse(order.shippingAddress)
    return {
      ...order,
      customerName: order.customerName || shippingAddress.name,
      customerEmail: order.customerEmail || shippingAddress.email,
      shippingAddress,
      items: getOrderItems.all(order.id),
    }
  })
  response.json({ orders })
})

app.patch('/api/admin/orders/:id', requireAdmin, (request, response) => {
  const allowedStatuses = ['processing', 'packed', 'shipped', 'delivered', 'cancelled']
  const { fulfillmentStatus } = request.body
  if (!allowedStatuses.includes(fulfillmentStatus)) return response.status(400).json({ error: 'Choose a valid fulfillment status.' })
  const result = database.prepare('UPDATE orders SET fulfillment_status = ? WHERE id = ?').run(fulfillmentStatus, Number(request.params.id))
  if (!result.changes) return response.status(404).json({ error: 'Order not found.' })
  response.json({ success: true })
})

app.use((error, _request, response, next) => {
  if (response.headersSent) return next(error)
  if (error instanceof multer.MulterError) {
    const message = error.code === 'LIMIT_FILE_SIZE'
      ? 'Each image must be 8 MB or smaller.'
      : 'Upload up to 5 images at a time.'
    return response.status(400).json({ error: message })
  }
  if (error.status === 400) return response.status(400).json({ error: error.message })
  console.error(error)
  response.status(500).json({ error: 'Something went wrong. Please try again.' })
})

const port = Number(process.env.API_PORT || 3001)
app.listen(port, () => console.log(`AUREVÉ API listening on http://localhost:${port}`))