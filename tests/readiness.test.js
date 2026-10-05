import assert from 'node:assert/strict'
import { spawn, spawnSync } from 'node:child_process'
import { createServer } from 'node:net'
import { existsSync } from 'node:fs'
import { mkdtemp, readdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'
import { after, before, test } from 'node:test'
import { fileURLToPath } from 'node:url'
import process from 'node:process'
import Database from 'better-sqlite3'

const projectDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const firstCheckoutKey = '00000000-0000-4000-8000-000000000001'
let testDirectory
let serverProcess
let apiUrl
let serverOutput = ''

async function getAvailablePort() {
  const listener = createServer()
  await new Promise((resolveListen, reject) => {
    listener.once('error', reject)
    listener.listen(0, '127.0.0.1', resolveListen)
  })
  const { port } = listener.address()
  await new Promise((resolveClose, reject) => listener.close((error) => error ? reject(error) : resolveClose()))
  return port
}

async function waitForApi() {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (serverProcess.exitCode !== null) throw new Error(`API exited during startup:\n${serverOutput}`)
    try {
      const response = await fetch(`${apiUrl}/api/health`)
      if (response.ok) return
    } catch {
      await delay(50)
    }
  }
  throw new Error(`API did not start in time:\n${serverOutput}`)
}

async function waitForOutput(pattern) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const match = serverOutput.match(pattern)
    if (match) return match
    await delay(25)
  }
  throw new Error(`Expected email link was not logged:\n${serverOutput}`)
}

async function request(path, options = {}) {
  const response = await fetch(`${apiUrl}${path}`, options)
  return { response, body: await response.json() }
}

before(async () => {
  testDirectory = await mkdtemp(resolve(tmpdir(), 'aureve-readiness-'))
  const port = await getAvailablePort()
  apiUrl = `http://127.0.0.1:${port}`
  serverProcess = spawn(process.execPath, ['server/index.js'], {
    cwd: projectDirectory,
    env: {
      ...process.env,
      NODE_ENV: 'test',
      DATABASE_PATH: resolve(testDirectory, 'app.sqlite'),
      API_PORT: String(port),
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  serverProcess.stdout.setEncoding('utf8').on('data', (chunk) => { serverOutput += chunk })
  serverProcess.stderr.setEncoding('utf8').on('data', (chunk) => { serverOutput += chunk })
  await waitForApi()
})

after(async () => {
  if (serverProcess && serverProcess.exitCode === null) {
    serverProcess.kill('SIGTERM')
    await Promise.race([
      new Promise((resolveExit) => serverProcess.once('exit', resolveExit)),
      delay(3000),
    ])
  }
  if (testDirectory) await rm(testDirectory, { recursive: true, force: true })
})

test('email verification, password reset, admin audit log, and database backup work', async () => {
  const email = 'readiness-check@example.com'
  const initialPassword = 'first-password-123'
  const register = await request('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Readiness Check', email, password: initialPassword }),
  })
  assert.equal(register.response.status, 201)
  assert.match(register.body.message, /verify/i)

  const unverifiedLogin = await request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: initialPassword }),
  })
  assert.equal(unverifiedLogin.response.status, 403)
  const verificationToken = (await waitForOutput(/http:\/\/localhost:5173\/\?verifyEmail=([a-f0-9]{64})/))[1]
  const verification = await request('/api/auth/verify-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: verificationToken }),
  })
  assert.equal(verification.response.status, 200)

  const verifiedLogin = await request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: initialPassword }),
  })
  assert.equal(verifiedLogin.response.status, 200)
  const oldSessionCookie = verifiedLogin.response.headers.get('set-cookie').split(';')[0]

  const forgotPassword = await request('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  assert.equal(forgotPassword.response.status, 200)
  const resetToken = (await waitForOutput(/http:\/\/localhost:5173\/\?resetPassword=([a-f0-9]{64})/))[1]
  const nextPassword = 'second-password-456'
  const resetPassword = await request('/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: resetToken, password: nextPassword }),
  })
  assert.equal(resetPassword.response.status, 200)

  const oldSession = await request('/api/orders', { headers: { Cookie: oldSessionCookie } })
  assert.equal(oldSession.response.status, 401)
  const oldPasswordLogin = await request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: initialPassword }),
  })
  assert.equal(oldPasswordLogin.response.status, 401)

  const adminLogin = await request('/api/admin/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@aureve.local', password: 'AureveDemo2026!' }),
  })
  assert.equal(adminLogin.response.status, 200)
  const adminCookie = adminLogin.response.headers.get('set-cookie').split(';')[0]
  const contactUpdate = await request('/api/admin/settings/contact', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
    body: JSON.stringify({
      email: 'support@example.com',
      whatsapp: '+62 812 3456 7890',
      instagram: 'https://www.instagram.com/aureve/',
      phone: '+62 812 3456 7890',
    }),
  })
  assert.equal(contactUpdate.response.status, 200)
  const audit = await request('/api/admin/audit-logs', { headers: { Cookie: adminCookie } })
  assert.equal(audit.response.status, 200)
  assert.equal(audit.body.logs[0].action, 'updated')
  assert.equal(audit.body.logs[0].entityType, 'site_settings')

  const initialInventory = await request('/api/admin/products', { headers: { Cookie: adminCookie } })
  const blazer = initialInventory.body.products.find((product) => product.id === 1)
  assert.equal(blazer.stockBySize.S, 0)
  const setInventory = await request('/api/admin/products/1/inventory', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
    body: JSON.stringify({ stockBySize: { XS: 0, S: 2, M: 0, L: 0 } }),
  })
  assert.equal(setInventory.response.status, 200)
  assert.equal(setInventory.body.product.stockBySize.S, 2)

  const checkoutBody = {
    items: [{ id: 1, size: 'S', quantity: 2 }],
    address: {
      name: 'Readiness Check',
      email,
      phone: '+62 812 3456 7890',
      address: '1 Example Street',
      city: 'Jakarta',
      postalCode: '12345',
      country: 'Indonesia',
    },
    shippingMethod: 'standard',
    paymentMethod: 'sandbox',
  }
  const missingIdempotencyKey = await request('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(checkoutBody),
  })
  assert.equal(missingIdempotencyKey.response.status, 400)
  const checkout = await request('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': firstCheckoutKey },
    body: JSON.stringify(checkoutBody),
  })
  assert.equal(checkout.response.status, 201)
  const checkoutRetry = await request('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': firstCheckoutKey },
    body: JSON.stringify(checkoutBody),
  })
  assert.equal(checkoutRetry.response.status, 201)
  assert.equal(checkoutRetry.body.order.orderNumber, checkout.body.order.orderNumber)
  assert.equal(checkoutRetry.body.remainingStock[0].quantity, 0)
  const reusedCheckoutKey = await request('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': firstCheckoutKey },
    body: JSON.stringify({ ...checkoutBody, address: { ...checkoutBody.address, city: 'Bandung' } }),
  })
  assert.equal(reusedCheckoutKey.response.status, 409)
  const oversell = await request('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': '00000000-0000-4000-8000-000000000002' },
    body: JSON.stringify({ ...checkoutBody, items: [{ id: 1, size: 'S', quantity: 1 }] }),
  })
  assert.equal(oversell.response.status, 409)
  const adminOrders = await request('/api/admin/orders', { headers: { Cookie: adminCookie } })
  const createdOrder = adminOrders.body.orders.find((order) => order.orderNumber === checkout.body.order.orderNumber)
  const cancelOrder = await request(`/api/admin/orders/${createdOrder.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
    body: JSON.stringify({ fulfillmentStatus: 'cancelled' }),
  })
  assert.equal(cancelOrder.response.status, 200)
  const restoredInventory = await request('/api/admin/products', { headers: { Cookie: adminCookie } })
  assert.equal(restoredInventory.body.products.find((product) => product.id === 1).stockBySize.S, 2)
  const invalidTransition = await request(`/api/admin/orders/${createdOrder.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
    body: JSON.stringify({ fulfillmentStatus: 'processing' }),
  })
  assert.equal(invalidTransition.response.status, 400)

  const customerLogin = await request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: nextPassword }),
  })
  assert.equal(customerLogin.response.status, 200)
  const customerCookie = customerLogin.response.headers.get('set-cookie').split(';')[0]
  const shipmentCheckout = await request('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: customerCookie, 'Idempotency-Key': '00000000-0000-4000-8000-000000000003' },
    body: JSON.stringify({ ...checkoutBody, items: [{ id: 1, size: 'S', quantity: 1 }] }),
  })
  assert.equal(shipmentCheckout.response.status, 201)
  const shipmentAdminOrders = await request('/api/admin/orders', { headers: { Cookie: adminCookie } })
  const shipmentOrder = shipmentAdminOrders.body.orders.find((order) => order.orderNumber === shipmentCheckout.body.order.orderNumber)
  const markPacked = await request(`/api/admin/orders/${shipmentOrder.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
    body: JSON.stringify({ fulfillmentStatus: 'packed' }),
  })
  assert.equal(markPacked.response.status, 200)
  const missingTracking = await request(`/api/admin/orders/${shipmentOrder.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
    body: JSON.stringify({ fulfillmentStatus: 'shipped' }),
  })
  assert.equal(missingTracking.response.status, 400)
  const unsafeTracking = await request(`/api/admin/orders/${shipmentOrder.id}/shipment`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
    body: JSON.stringify({ carrier: 'Example courier', trackingNumber: 'TRACK-123', trackingUrl: 'javascript:alert(1)' }),
  })
  assert.equal(unsafeTracking.response.status, 400)
  const saveTracking = await request(`/api/admin/orders/${shipmentOrder.id}/shipment`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
    body: JSON.stringify({ carrier: 'Example courier', trackingNumber: 'TRACK-123', trackingUrl: 'https://tracking.example/track/TRACK-123' }),
  })
  assert.equal(saveTracking.response.status, 200)
  const markShipped = await request(`/api/admin/orders/${shipmentOrder.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
    body: JSON.stringify({ fulfillmentStatus: 'shipped' }),
  })
  assert.equal(markShipped.response.status, 200)
  const markDelivered = await request(`/api/admin/orders/${shipmentOrder.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
    body: JSON.stringify({ fulfillmentStatus: 'delivered' }),
  })
  assert.equal(markDelivered.response.status, 200)
  const customerOrders = await request('/api/orders', { headers: { Cookie: customerCookie } })
  const trackedOrder = customerOrders.body.orders.find((order) => order.orderNumber === shipmentCheckout.body.order.orderNumber)
  assert.equal(trackedOrder.trackingNumber, 'TRACK-123')
  assert.equal(trackedOrder.trackingUrl, 'https://tracking.example/track/TRACK-123')
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const failedLogin = await request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'incorrect-password' }),
    })
    assert.equal(failedLogin.response.status, 401)
  }
  const limitedLogin = await request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'incorrect-password' }),
  })
  assert.equal(limitedLogin.response.status, 429)

  const backupSource = resolve(testDirectory, 'backup-source.sqlite')
  const sampleDatabase = new Database(backupSource)
  sampleDatabase.exec("CREATE TABLE backup_probe (value TEXT NOT NULL); INSERT INTO backup_probe VALUES ('intact');")
  sampleDatabase.close()
  const backupDirectory = resolve(testDirectory, 'backups')
  const backupProcess = spawnSync(process.execPath, ['scripts/backup-database.js'], {
    cwd: projectDirectory,
    env: { ...process.env, DATABASE_PATH: backupSource, BACKUP_DIRECTORY: backupDirectory },
    encoding: 'utf8',
  })
  assert.equal(backupProcess.status, 0, backupProcess.stderr || backupProcess.stdout)
  const backupFiles = await readdir(backupDirectory)
  assert.equal(backupFiles.length, 1)
  const checkedBackup = new Database(resolve(backupDirectory, backupFiles[0]), { readonly: true })
  assert.equal(checkedBackup.prepare('SELECT value FROM backup_probe').get().value, 'intact')
  checkedBackup.close()
})

test('production refuses to start without required deployment secrets before opening the database', () => {
  const databasePath = resolve(testDirectory, 'must-not-be-created.sqlite')
  const result = spawnSync(process.execPath, ['server/index.js'], {
    cwd: projectDirectory,
    env: {
      ...process.env,
      NODE_ENV: 'production',
      DATABASE_PATH: databasePath,
      API_PORT: '0',
      ADMIN_EMAIL: '',
      ADMIN_PASSWORD: '',
      SMTP_HOST: '',
      SMTP_PORT: '587',
      SMTP_USER: '',
      SMTP_PASSWORD: '',
      MAIL_FROM: '',
      APP_BASE_URL: '',
    },
    encoding: 'utf8',
  })
  assert.notEqual(result.status, 0)
  assert.match(result.stderr, /Production requires valid admin credentials/)
  assert.equal(existsSync(databasePath), false)
})
