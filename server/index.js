import { randomBytes, createHash } from 'node:crypto'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import bcrypt from 'bcryptjs'
import cookieParser from 'cookie-parser'
import Database from 'better-sqlite3'
import express from 'express'

const serverDirectory = dirname(fileURLToPath(import.meta.url))
const databasePath = resolve(process.env.DATABASE_PATH || `${serverDirectory}/../data/aureve.sqlite`)
mkdirSync(dirname(databasePath), { recursive: true })

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
    user_id INTEGER NOT NULL REFERENCES users(id),
    subtotal INTEGER NOT NULL,
    shipping INTEGER NOT NULL,
    total INTEGER NOT NULL,
    shipping_method TEXT NOT NULL,
    shipping_address TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    payment_status TEXT NOT NULL,
    fulfillment_status TEXT NOT NULL DEFAULT 'processing',
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
  CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions(expires_at);
  CREATE INDEX IF NOT EXISTS orders_user_idx ON orders(user_id, created_at DESC);
`)

const userColumns = database.pragma('table_info(users)')
if (!userColumns.some((column) => column.name === 'role')) {
  database.exec("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'customer'")
}

const seedProducts = [
  { id: 1, name: 'Sculpted Wool Blazer', price: 420, category: 'Outerwear', color: 'Ivory', material: 'Wool blend', audience: 'women', sizes: ['XS', 'S', 'M', 'L'], gallery: ['https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80'] },
  { id: 2, name: 'Relaxed Leather Trench', price: 560, category: 'Outerwear', color: 'Stone', material: 'Italian leather', audience: 'men', sizes: ['S', 'M', 'L', 'XL'], gallery: ['https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80'] },
  { id: 3, name: 'Tailored Pleat Trousers', price: 240, category: 'Tailoring', color: 'Black', material: 'Stretch twill', audience: 'men', sizes: ['XS', 'S', 'M', 'L', 'XL'], gallery: ['https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80'] },
  { id: 4, name: 'Monochrome Knit Polo', price: 180, category: 'Knitwear', color: 'Ash', material: 'Cotton knit', audience: 'men', sizes: ['S', 'M', 'L'], gallery: ['https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=900&q=80'] },
  { id: 5, name: 'Woven Cotton Shirt', price: 210, category: 'Shirts', color: 'Bone', material: 'Cotton poplin', audience: 'men', sizes: ['XS', 'S', 'M', 'L', 'XL'], gallery: ['https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=900&q=80'] },
  { id: 6, name: 'Double Face Wool Coat', price: 640, category: 'Outerwear', color: 'Black', material: 'Double-faced wool', audience: 'men', sizes: ['S', 'M', 'L'], gallery: ['https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80'] },
  { id: 7, name: 'Soft Tailored Dress', price: 320, category: 'Dresses', color: 'Ecru', material: 'Silk blend', audience: 'women', sizes: ['XS', 'S', 'M', 'L'], gallery: ['https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80'] },
  { id: 8, name: 'Structured Leather Tote', price: 260, category: 'Accessories', color: 'Black', material: 'Full grain leather', audience: 'unisex', sizes: ['One Size'], gallery: ['https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80'] },
]

const insertSeedProduct = database.prepare(`
  INSERT OR IGNORE INTO products (id, name, price, category, color, material, audience, sizes, gallery)
  VALUES (@id, @name, @price, @category, @color, @material, @audience, @sizes, @gallery)
`)
for (const product of seedProducts) {
  insertSeedProduct.run({ ...product, sizes: JSON.stringify(product.sizes), gallery: JSON.stringify(product.gallery) })
}

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
app.use(express.json({ limit: '32kb' }))
app.use(cookieParser())

const hashToken = (token) => createHash('sha256').update(token).digest('hex')
const cleanExpiredSessions = database.prepare('DELETE FROM sessions WHERE expires_at <= ?')
const getUserForSession = database.prepare(`
  SELECT users.id, users.name, users.email, users.role
  FROM sessions JOIN users ON users.id = sessions.user_id
  WHERE sessions.token_hash = ? AND sessions.expires_at > ?
`)

function issueSession(response, userId) {
  const token = randomBytes(32).toString('hex')
  const expiresAt = Date.now() + sessionDuration
  database.prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)')
    .run(hashToken(token), userId, expiresAt)
  response.cookie(sessionCookie, token, {
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
  request.user = user
  next()
}

function requireAdmin(request, response, next) {
  requireUser(request, response, (error) => {
    if (error) return next(error)
    if (request.user.role !== 'admin') return response.status(403).json({ error: 'Administrator access is required.' })
    next()
  })
}

function presentProduct(row) {
  return {
    ...row,
    sizes: JSON.parse(row.sizes),
    gallery: JSON.parse(row.gallery),
    isActive: Boolean(row.is_active),
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
  const validImages = gallery.length > 0 && gallery.length <= 5 && gallery.every((image) => {
    if (typeof image !== 'string' || image.length > 1000) return false
    try {
      return ['http:', 'https:'].includes(new URL(image).protocol)
    } catch {
      return false
    }
  })

  if (name.length < 2 || name.length > 120) return { error: 'Product name must be between 2 and 120 characters.' }
  if (!Number.isInteger(price) || price < 1 || price > 1000000) return { error: 'Enter a valid product price.' }
  if (!category || category.length > 60 || !color || color.length > 60 || !material || material.length > 100) return { error: 'Complete the product category, color, and material.' }
  if (!['men', 'women', 'unisex'].includes(audience)) return { error: 'Choose a valid product audience.' }
  if (!sizes.length || sizes.length > 12 || sizes.some((size) => typeof size !== 'string' || !size.trim() || size.length > 24)) return { error: 'Add between 1 and 12 valid sizes.' }
  if (!validImages) return { error: 'Add between 1 and 5 valid http(s) image URLs.' }
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
  try {
    if (!['http:', 'https:'].includes(new URL(article.image).protocol)) throw new Error('Invalid protocol')
  } catch {
    return { error: 'Enter a valid http(s) image URL.' }
  }
  if (!['draft', 'published'].includes(input.status)) return { error: 'Choose draft or published status.' }
  return { value: { ...article, status: input.status } }
}

app.get('/api/health', (_request, response) => response.json({ status: 'ok' }))

app.get('/api/products', (_request, response) => {
  const rows = database.prepare('SELECT * FROM products WHERE is_active = 1 ORDER BY id').all()
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
  const token = request.cookies[sessionCookie]
  const user = token ? getUserForSession.get(hashToken(token), Date.now()) : null
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
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return response.status(401).json({ error: 'Email or password is incorrect.' })
    }

    issueSession(response, user.id)
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

app.post('/api/checkout', requireUser, (request, response) => {
  const { items, address, shippingMethod, paymentMethod } = request.body
  const addressFields = ['name', 'email', 'phone', 'address', 'city', 'postalCode', 'country']
  if (!address || addressFields.some((field) => typeof address[field] !== 'string' || !address[field].trim())) {
    return response.status(400).json({ error: 'Complete all contact and delivery details.' })
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
  const shipping = shippingMethod === 'standard' && subtotal >= 500 ? 0 : shippingMethod === 'express' ? 40 : 24
  const total = subtotal + shipping
  const orderNumber = `AUR-${randomBytes(4).toString('hex').toUpperCase()}`
  const createOrder = database.transaction(() => {
    const result = database.prepare(`
      INSERT INTO orders (order_number, user_id, subtotal, shipping, total, shipping_method, shipping_address, payment_method, payment_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(orderNumber, request.user.id, subtotal, shipping, total, shippingMethod, JSON.stringify(address), paymentMethod, 'sandbox_pending')
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
    order: { id: orderId, orderNumber, subtotal, shipping, total, paymentStatus: 'sandbox_pending', shippingMethod },
    payment: { mode: 'sandbox', charged: false },
  })
})

app.get('/api/orders', requireUser, (request, response) => {
  const orders = database.prepare(`
    SELECT id, order_number AS orderNumber, subtotal, shipping, total, shipping_method AS shippingMethod,
      payment_status AS paymentStatus, fulfillment_status AS fulfillmentStatus, created_at AS createdAt
    FROM orders WHERE user_id = ? ORDER BY created_at DESC
  `).all(request.user.id)
  response.json({ orders })
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
    INSERT INTO products (name, price, category, color, material, audience, sizes, gallery, description)
    VALUES (@name, @price, @category, @color, @material, @audience, @sizes, @gallery, @description)
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
      UPDATE products SET name = @name, price = @price, category = @category, color = @color,
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
  const orders = database.prepare(`
    SELECT orders.id, orders.order_number AS orderNumber, orders.subtotal, orders.shipping, orders.total,
      orders.shipping_method AS shippingMethod, orders.shipping_address AS shippingAddress,
      orders.payment_status AS paymentStatus, orders.fulfillment_status AS fulfillmentStatus,
      orders.created_at AS createdAt, users.name AS customerName, users.email AS customerEmail,
      (SELECT COUNT(*) FROM order_items WHERE order_items.order_id = orders.id) AS itemCount
    FROM orders JOIN users ON users.id = orders.user_id ORDER BY orders.created_at DESC
  `).all().map((order) => ({ ...order, shippingAddress: JSON.parse(order.shippingAddress) }))
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
  console.error(error)
  response.status(500).json({ error: 'Something went wrong. Please try again.' })
})

const port = Number(process.env.API_PORT || 3001)
app.listen(port, () => console.log(`AUREVÉ API listening on http://localhost:${port}`))