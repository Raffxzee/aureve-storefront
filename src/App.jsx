import { Fragment, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  Check,
  ChevronRight,
  Heart,
  Menu,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  User,
  X,
} from 'lucide-react'

const initialProductCatalog = [
  {
    id: 1,
    name: 'Sculpted Wool Blazer',
    price: 6720000,
    category: 'Outerwear',
    color: 'Ivory',
    material: 'Wool blend',
    sizes: ['XS', 'S', 'M', 'L'],
    gallery: [
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    id: 2,
    name: 'Relaxed Leather Trench',
    price: 8960000,
    category: 'Outerwear',
    color: 'Stone',
    material: 'Italian leather',
    sizes: ['S', 'M', 'L', 'XL'],
    gallery: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    id: 3,
    name: 'Tailored Pleat Trousers',
    price: 3840000,
    category: 'Tailoring',
    color: 'Black',
    material: 'Stretch twill',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    gallery: [
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    id: 4,
    name: 'Monochrome Knit Polo',
    price: 2880000,
    category: 'Knitwear',
    color: 'Ash',
    material: 'Cotton knit',
    sizes: ['S', 'M', 'L'],
    gallery: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    id: 5,
    name: 'Woven Cotton Shirt',
    price: 3360000,
    category: 'Shirts',
    color: 'Bone',
    material: 'Cotton poplin',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    gallery: [
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    id: 6,
    name: 'Double Face Wool Coat',
    price: 10240000,
    category: 'Outerwear',
    color: 'Black',
    material: 'Double-faced wool',
    sizes: ['S', 'M', 'L'],
    gallery: [
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    id: 7,
    name: 'Soft Tailored Dress',
    price: 5120000,
    category: 'Dresses',
    color: 'Ecru',
    material: 'Silk blend',
    sizes: ['XS', 'S', 'M', 'L'],
    gallery: [
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    id: 8,
    name: 'Structured Leather Tote',
    price: 4160000,
    category: 'Accessories',
    color: 'Black',
    material: 'Full grain leather',
    sizes: ['One Size'],
    gallery: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    id: 9,
    name: 'Minimal Day Backpack',
    price: 5440000,
    category: 'Accessories',
    color: 'Navy',
    material: 'Technical canvas',
    sizes: ['One Size'],
    gallery: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    id: 10,
    name: 'Woven Cashmere Scarf',
    price: 2480000,
    category: 'Accessories',
    color: 'Charcoal',
    material: 'Cashmere blend',
    sizes: ['One Size'],
    gallery: [
      'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    id: 11,
    name: 'Sculptural Silver Cuff',
    price: 3040000,
    category: 'Accessories',
    color: 'Silver',
    material: 'Sterling silver',
    sizes: ['One Size'],
    gallery: [
      'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    id: 12,
    name: 'Minimal Acetate Sunglasses',
    price: 2240000,
    category: 'Accessories',
    color: 'Black',
    material: 'Acetate',
    sizes: ['One Size'],
    gallery: [
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=80',
    ],
  },
]

const navItems = ['New In', 'Women', 'Men', 'Accessories', 'Journal']
const nextFulfillmentStatuses = {
  processing: ['packed', 'cancelled'],
  packed: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
}
const initialContactDetails = {
  email: 'clientcare@aureve.example',
  whatsapp: '+62 000 0000 0000',
  instagram: 'https://www.instagram.com/aureve.example/',
  phone: '+62 000 0000 0000',
}
const sizeOptions = ['XS', 'S', 'M', 'L', 'XL']
const initialArticles = [
  { id: 'seed-wool', category: 'Materials', title: 'The quiet character of wool', image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=900&q=80', alt: 'Textured wool garments', excerpt: 'A closer look at the natural texture and lasting character of wool.', body: 'The best materials reveal themselves slowly. Wool holds warmth without weight, texture without noise, and a shape that softens with time. We select fibres for how they feel in the hand and how they become part of a daily wardrobe.' },
  { id: 'seed-between', category: 'Perspective', title: 'Dressing for the in-between', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80', alt: 'Contemporary fashion styling', excerpt: 'Thoughtful layers for the days that never fit one forecast.', body: 'An open collar, a light knit, a coat with room to move. Dressing for changing weather is an exercise in balance: pieces that can be added or left behind without losing their point of view.' },
  { id: 'seed-atelier', category: 'Atelier', title: 'A closer look at the details', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=80', alt: 'Thoughtfully styled clothing', excerpt: 'Small decisions in cut, finish and construction shape a garment.', body: 'A considered garment is built through many quiet decisions. We look closely at the line of a shoulder, the weight of a button and the way a seam sits against the body. These details are meant to be lived with, not simply noticed.' },
  { id: 'seed-edit', category: 'The edit', title: 'Pieces to return to', image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80', alt: 'A timeless fashion look', excerpt: 'A small wardrobe of pieces that earns its place over time.', body: 'The pieces we return to most are often the simplest: a clean shirt, a reliable coat, trousers with the right ease. Choosing fewer, better things lets personal style become clearer with every wear.' },
]

const formatPrice = (price, currency = 'IDR') =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price)

const createCheckoutIdempotencyKey = () => {
  if (typeof globalThis.crypto.randomUUID === 'function') return globalThis.crypto.randomUUID()
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(16))
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  return [...bytes].map((byte, index) => `${[4, 6, 8, 10].includes(index) ? '-' : ''}${byte.toString(16).padStart(2, '0')}`).join('')
}

async function requestJSON(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  })
  const contentType = response.headers.get('content-type')
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('Server returned an invalid response.')
  }
  const result = await response.json()
  if (!response.ok) throw new Error(result.error || 'The request could not be completed.')
  return result
}

function ZoomableImage({ src, alt, containerClassName }) {
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - bounds.left) / bounds.width) * 100
    const y = ((event.clientY - bounds.top) / bounds.height) * 100
    setZoomPos({ x, y })
  }

  return (
    <div
      className={`${containerClassName} relative overflow-hidden cursor-crosshair`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-200 ease-out"
        style={{
          transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
          transform: isHovered ? 'scale(2.2)' : 'scale(1)',
        }}
      />
    </div>
  )
}

function App() {
  const [currentView, setCurrentViewState] = useState(() => window.location.pathname === '/admin' ? 'admin' : 'home')
  const setCurrentView = (view) => {
    const nextView = typeof view === 'function' ? view(currentView) : view
    setCurrentViewState(nextView)
  }
  const [collectionMode, setCollectionMode] = useState('new')
  const [productCatalog, setProductCatalog] = useState(() => initialProductCatalog.map((product) => ({ ...product, audience: [2, 3, 4, 5, 6, 12].includes(product.id) ? 'men' : [8, 9, 10, 11].includes(product.id) ? 'unisex' : 'women', isActive: true, stockBySize: Object.fromEntries(product.sizes.map((size) => [size, 0])) })))
  const [articles, setArticles] = useState(initialArticles)
  const [selectedProductId, setSelectedProductId] = useState(1)
  const [selectedArticle, setSelectedArticle] = useState(null)
  const [selectedSize, setSelectedSize] = useState('M')
  const [bag, setBag] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [headerSolid, setHeaderSolid] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState('All')
  const [priceFilter, setPriceFilter] = useState('all')
  const [sortOrder, setSortOrder] = useState('recommended')
  const [checkoutStep, setCheckoutStep] = useState(0)
  const [error, setError] = useState('')
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)
  const [openAccordion, setOpenAccordion] = useState('composition')
  const [user, setUser] = useState(null)
  const [authMode, setAuthMode] = useState('login')
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' })
  const [authError, setAuthError] = useState('')
  const [authNotice, setAuthNotice] = useState('')
  const [resetToken, setResetToken] = useState('')
  const authLinkHandledRef = useRef(false)
  const [authBusy, setAuthBusy] = useState(false)
  const [adminLoginForm, setAdminLoginForm] = useState({ email: '', password: '' })
  const [adminLoginError, setAdminLoginError] = useState('')
  const [adminLoginBusy, setAdminLoginBusy] = useState(false)
  const [checkoutForm, setCheckoutForm] = useState({ firstName: '', lastName: '', email: '', phone: '', address: '', city: '', postalCode: '', country: 'Indonesia' })
  const [checkoutError, setCheckoutError] = useState('')
  const [checkoutBusy, setCheckoutBusy] = useState(false)
  const [checkoutIdempotencyKey, setCheckoutIdempotencyKey] = useState(createCheckoutIdempotencyKey)
  const [shippingMethod, setShippingMethod] = useState('standard')
  const [orderNumber, setOrderNumber] = useState('')
  const [completedOrder, setCompletedOrder] = useState(null)
  const [customerOrders, setCustomerOrders] = useState([])
  const [orderHistoryLoading, setOrderHistoryLoading] = useState(false)
  const [orderHistoryError, setOrderHistoryError] = useState('')
  const [adminTab, setAdminTab] = useState('products')
  const [adminProducts, setAdminProducts] = useState([])
  const [inventoryDrafts, setInventoryDrafts] = useState({})
  const [adminArticles, setAdminArticles] = useState([])
  const [adminOrders, setAdminOrders] = useState([])
  const [adminAuditLogs, setAdminAuditLogs] = useState([])
  const [adminAuditError, setAdminAuditError] = useState('')
  const [shipmentDrafts, setShipmentDrafts] = useState({})
  const [expandedOrderId, setExpandedOrderId] = useState(null)
  const [cmsLoading, setCmsLoading] = useState(false)
  const [cmsSaving, setCmsSaving] = useState(false)
  const [imageUploadBusy, setImageUploadBusy] = useState(false)
  const [cmsError, setCmsError] = useState('')
  const [cmsNotice, setCmsNotice] = useState('')
  const [editingProductId, setEditingProductId] = useState(null)
  const [editingArticleId, setEditingArticleId] = useState(null)
  const [productDraft, setProductDraft] = useState({ name: '', price: '', category: 'Outerwear', color: '', material: '', audience: 'women', sizes: 'XS, S, M, L', gallery: '', description: '' })
  const [articleDraft, setArticleDraft] = useState({ category: '', title: '', image: '', alt: '', excerpt: '', body: '', status: 'draft' })
  const productFormRef = useRef(null)
  const articleFormRef = useRef(null)
  const [contactDetails, setContactDetails] = useState(initialContactDetails)
  const [contactDraft, setContactDraft] = useState(initialContactDetails)

  useEffect(() => {
    const handleScroll = () => setHeaderSolid(window.scrollY > 12)
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (authLinkHandledRef.current) return
    authLinkHandledRef.current = true
    const url = new URL(window.location.href)
    const verificationToken = url.searchParams.get('verifyEmail')
    const passwordToken = url.searchParams.get('resetPassword')
    if (!verificationToken && !passwordToken) return

    url.searchParams.delete('verifyEmail')
    url.searchParams.delete('resetPassword')
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
    setAuthOpen(true)
    setAuthError('')
    setAuthNotice('')
    if (passwordToken) {
      setResetToken(passwordToken)
      setAuthMode('reset')
      return
    }

    setAuthMode('login')
    fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: verificationToken }),
    })
      .then(async (response) => {
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Unable to verify your email.')
        setAuthNotice(result.message)
      })
      .catch((requestError) => setAuthError(requestError.message))
  }, [])

  useEffect(() => {
    const handlePopState = () => setCurrentViewState(window.location.pathname === '/admin' ? 'admin' : 'home')
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [currentView, collectionMode, selectedProductId, selectedArticle])
  
  useEffect(() => {
    const canonicalPath = currentView === 'admin' ? '/admin' : '/'
    if (window.location.pathname !== canonicalPath) window.history.pushState({}, '', canonicalPath)
  }, [currentView])

  useEffect(() => {
    fetch('/api/auth/me')
      .then((response) => response.json())
      .then(({ user: currentUser }) => {
        if (currentUser) {
          setUser(currentUser)
          setCheckoutForm((form) => ({ ...form, email: currentUser.email, firstName: currentUser.name.split(' ')[0], lastName: currentUser.name.split(' ').slice(1).join(' ') }))
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    requestJSON('/api/products').then(({ products }) => setProductCatalog(products)).catch(() => {})
    requestJSON('/api/journal').then(({ articles: publishedArticles }) => setArticles(publishedArticles)).catch(() => {})
    requestJSON('/api/settings/contact').then(({ contact }) => {
      setContactDetails(contact)
      setContactDraft(contact)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (currentView !== 'orders' || !user) return
    let cancelled = false
    setOrderHistoryLoading(true)
    requestJSON('/api/orders')
      .then(({ orders }) => {
        if (!cancelled) {
          setCustomerOrders(orders)
          setOrderHistoryError('')
        }
      })
      .catch((requestError) => {
        if (!cancelled) setOrderHistoryError(requestError.message)
      })
      .finally(() => {
        if (!cancelled) setOrderHistoryLoading(false)
      })
    return () => { cancelled = true }
  }, [currentView, user])

  useEffect(() => {
    if (currentView !== 'admin' || user?.role !== 'admin' || adminTab !== 'activity') return
    requestJSON('/api/admin/audit-logs')
      .then(({ logs }) => {
        setAdminAuditLogs(logs)
        setAdminAuditError('')
      })
      .catch((requestError) => setAdminAuditError(requestError.message))
  }, [currentView, user, adminTab])

  useEffect(() => {
    if (currentView !== 'admin' || user?.role !== 'admin') return
    let cancelled = false
    setCmsLoading(true)
    Promise.all([
      requestJSON('/api/admin/products'),
      requestJSON('/api/admin/articles'),
      requestJSON('/api/admin/orders'),
    ])
      .then(([{ products }, { articles: cmsArticles }, { orders }]) => {
        if (cancelled) return
        setAdminProducts(products)
        setAdminArticles(cmsArticles)
        setAdminOrders(orders)
        setCmsError('')
      })
      .catch((requestError) => {
        if (!cancelled) setCmsError(requestError.message)
      })
      .finally(() => {
        if (!cancelled) setCmsLoading(false)
      })
    return () => { cancelled = true }
  }, [currentView, user])

  const activeCatalog = collectionMode === 'men'
    ? productCatalog.filter((product) => product.audience === 'men')
    : collectionMode === 'women'
      ? productCatalog.filter((product) => product.audience === 'women')
      : collectionMode === 'accessories'
      ? productCatalog.filter((product) => product.category === 'Accessories')
      : productCatalog
  const selectedProduct = activeCatalog.find((item) => item.id === selectedProductId) || activeCatalog[0]

  const activeFilterOptions = ['All', ...new Set(activeCatalog.map((product) => product.category))]
  const filteredProducts = activeCatalog
    .filter((product) => selectedFilter === 'All' || product.category === selectedFilter)
    .filter((product) => {
      if (priceFilter === 'under-3m') return product.price < 3000000
      if (priceFilter === '3m-6m') return product.price >= 3000000 && product.price < 6000000
      if (priceFilter === '6m-9m') return product.price >= 6000000 && product.price <= 9000000
      if (priceFilter === 'over-9m') return product.price > 9000000
      return true
    })
    .sort((first, second) => {
      if (sortOrder === 'price-low') return first.price - second.price
      if (sortOrder === 'price-high') return second.price - first.price
      if (sortOrder === 'name') return first.name.localeCompare(second.name)
      return first.id - second.id
    })
  const normalizedSearchQuery = searchQuery.trim().toLocaleLowerCase()
  const searchProducts = productCatalog.filter((product) => {
    const searchableText = [product.name, product.category, product.color, product.material, product.description]
      .filter(Boolean)
      .join(' ')
      .toLocaleLowerCase()
    return !normalizedSearchQuery || searchableText.includes(normalizedSearchQuery)
  }).slice(0, normalizedSearchQuery ? 6 : 4)
  const searchArticles = normalizedSearchQuery
    ? articles.filter((article) => [article.title, article.category, article.excerpt, article.body]
      .filter(Boolean)
      .join(' ')
      .toLocaleLowerCase()
      .includes(normalizedSearchQuery))
      .slice(0, 3)
    : []
  const bestSellingProducts = [...productCatalog]
    .filter((product) => product.unitsSold > 0)
    .sort((first, second) => second.unitsSold - first.unitsSold || first.id - second.id)
    .slice(0, 4)
  const featuredHomeProducts = bestSellingProducts.length ? bestSellingProducts : productCatalog.slice(0, 4)
  const homeCollections = [
    { mode: 'women', label: 'Women', detail: 'Soft structure, considered layers', product: productCatalog.find((product) => product.audience === 'women') },
    { mode: 'men', label: 'Men', detail: 'Modern form, everyday ease', product: productCatalog.find((product) => product.audience === 'men') },
    { mode: 'accessories', label: 'Accessories', detail: 'The finishing details', product: productCatalog.find((product) => product.category === 'Accessories') },
  ].filter((collection) => collection.product)

  const openCollection = (mode = 'new') => {
    setCollectionMode(mode)
    setSelectedFilter('All')
    setPriceFilter('all')
    setSortOrder('recommended')
    setCurrentView('plp')
  }

  const navigateHome = () => {
    setCurrentView('home')
    setMobileMenuOpen(false)
  }

  const openProduct = (product) => {
    setSelectedProductId(product.id)
    setSelectedImageIndex(0)
    setSelectedSize(product.sizes.find((size) => (product.stockBySize?.[size] || 0) > 0) || '')
    setError('')
    setCurrentView('pdp')
  }

  const subtotal = bag.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const bagItemCount = bag.reduce((count, item) => count + item.quantity, 0)
  const checkoutItemCount = showSuccess ? completedOrder?.itemCount || 0 : bagItemCount
  const shipping = shippingMethod === 'express' ? 400000 : subtotal >= 8000000 ? 0 : 240000
  const total = subtotal + shipping

  const handleAuthSubmit = async (event) => {
    event.preventDefault()
    setAuthError('')
    setAuthNotice('')
    setAuthBusy(true)
    try {
      const endpoint = authMode === 'register' ? 'register'
        : authMode === 'forgot' ? 'forgot-password'
          : authMode === 'reset' ? 'reset-password'
            : 'login'
      const body = authMode === 'forgot'
        ? { email: authForm.email }
        : authMode === 'reset'
          ? { token: resetToken, password: authForm.password }
          : authForm
      const response = await fetch(`/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to sign in.')
      if (authMode !== 'login') {
        setAuthNotice(result.message)
        setAuthMode('login')
        setAuthForm({ name: '', email: authForm.email, password: '' })
        setResetToken('')
        return
      }
      setUser(result.user)
      setCheckoutForm((form) => ({ ...form, firstName: result.user.name.split(' ')[0], lastName: result.user.name.split(' ').slice(1).join(' '), email: result.user.email }))
      setAuthOpen(false)
      setAuthForm({ name: '', email: '', password: '' })
    } catch (requestError) {
      setAuthError(requestError.message)
    } finally {
      setAuthBusy(false)
    }
  }

  const handleResendVerification = async () => {
    setAuthError('')
    setAuthNotice('')
    setAuthBusy(true)
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authForm.email }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to send verification email.')
      setAuthNotice(result.message)
    } catch (requestError) {
      setAuthError(requestError.message)
    } finally {
      setAuthBusy(false)
    }
  }

  const handleAdminLogin = async (event) => {
    event.preventDefault()
    setAdminLoginError('')
    setAdminLoginBusy(true)
    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminLoginForm),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to sign in to the CMS.')
      setUser(result.user)
      setAdminLoginForm({ email: '', password: '' })
    } catch (requestError) {
      setAdminLoginError(requestError.message)
    } finally {
      setAdminLoginBusy(false)
    }
  }

  const handleLogout = async () => {
    await fetch(user?.role === 'admin' ? '/api/admin/auth/logout' : '/api/auth/logout', { method: 'POST' })
    setUser(null)
    setAuthOpen(false)
  }

  const addProductToBag = (product, size) => {
    setBag((current) => {
      const existing = current.find((item) => item.id === product.id && item.size === size)
      if (existing) {
        return current.map((item) => item.id === product.id && item.size === size ? { ...item, quantity: item.quantity + 1 } : item)
      }
      return [...current, { id: product.id, name: product.name, price: product.price, size, quantity: 1 }]
    })
  }

  const handleAddToBag = () => {
    const cartQuantity = bag.find((item) => item.id === selectedProduct.id && item.size === selectedSize)?.quantity || 0
    if (!selectedSize || (selectedProduct.stockBySize?.[selectedSize] || 0) <= cartQuantity) {
      setError(selectedSize ? 'This size is out of stock.' : 'Please select an in-stock size before adding to bag.')
      return
    }

    addProductToBag(selectedProduct, selectedSize)
    setCartOpen(true)
    setError('')
    setSelectedSize(selectedProduct.sizes.find((size) => (selectedProduct.stockBySize?.[size] || 0) > 0) || '')
  }

  const handleQuickAdd = (product) => {
    const size = product.sizes.find((availableSize) => {
      const cartQuantity = bag.find((item) => item.id === product.id && item.size === availableSize)?.quantity || 0
      return (product.stockBySize?.[availableSize] || 0) > cartQuantity
    })
    if (!size) return
    addProductToBag(product, size)
    setCartOpen(true)
  }

  const canQuickAdd = (product) => product.sizes.some((size) => {
    const cartQuantity = bag.find((item) => item.id === product.id && item.size === size)?.quantity || 0
    return (product.stockBySize?.[size] || 0) > cartQuantity
  })

  const saveInventory = async (product) => {
    setCmsSaving(true)
    setCmsError('')
    setCmsNotice('')
    try {
      const stockBySize = Object.fromEntries(product.sizes.map((size) => [
        size,
        Number(inventoryDrafts[product.id]?.[size] ?? product.stockBySize?.[size] ?? 0),
      ]))
      const { product: updatedProduct } = await requestJSON(`/api/admin/products/${product.id}/inventory`, {
        method: 'PATCH',
        body: JSON.stringify({ stockBySize }),
      })
      setAdminProducts((current) => current.map((item) => item.id === product.id ? updatedProduct : item))
      setProductCatalog((current) => current.map((item) => item.id === product.id ? updatedProduct : item))
      setInventoryDrafts((current) => {
        const next = { ...current }
        delete next[product.id]
        return next
      })
      setCmsNotice(`Stock updated for ${product.name}.`)
    } catch (requestError) {
      setCmsError(requestError.message)
    } finally {
      setCmsSaving(false)
    }
  }

  const advanceCheckout = () => {
    if (checkoutStep === 0) {
      if (!checkoutForm.firstName.trim()) {
        setCheckoutError('First name is required')
        return
      }
      if (!checkoutForm.lastName.trim()) {
        setCheckoutError('Last name is required')
        return
      }
      if (!checkoutForm.email.trim()) {
        setCheckoutError('Email is required')
        return
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(checkoutForm.email)) {
        setCheckoutError('Please enter a valid email address')
        return
      }
      if (!checkoutForm.phone.trim()) {
        setCheckoutError('Phone is required')
        return
      }
    } else if (checkoutStep === 1) {
      if (!checkoutForm.address.trim()) {
        setCheckoutError('Address is required')
        return
      }
      if (!checkoutForm.city.trim()) {
        setCheckoutError('City is required')
        return
      }
      if (!checkoutForm.postalCode.trim()) {
        setCheckoutError('Postal code is required')
        return
      }
      if (!checkoutForm.country.trim()) {
        setCheckoutError('Country is required')
        return
      }
    }
    setCheckoutError('')
    setCheckoutStep((step) => Math.min(step + 1, 2))
  }

  const handlePlaceOrder = async () => {
    setCheckoutBusy(true)
    setCheckoutError('')
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': checkoutIdempotencyKey },
        body: JSON.stringify({
          items: bag.map(({ id, size, quantity }) => ({ id, size, quantity })),
          address: {
            name: `${checkoutForm.firstName} ${checkoutForm.lastName}`.trim(),
            email: checkoutForm.email,
            phone: checkoutForm.phone,
            address: checkoutForm.address,
            city: checkoutForm.city,
            postalCode: checkoutForm.postalCode,
            country: checkoutForm.country,
          },
          shippingMethod,
          paymentMethod: 'sandbox',
        }),
      })
      const result = await response.json()
      if (!response.ok) {
        const requestError = new Error(result.error || 'Unable to create your order.')
        requestError.status = response.status
        throw requestError
      }
      setProductCatalog((current) => current.map((product) => {
        const stockUpdates = result.remainingStock.filter((item) => item.productId === product.id)
        if (stockUpdates.length === 0) return product
        return {
          ...product,
          stockBySize: { ...product.stockBySize, ...Object.fromEntries(stockUpdates.map((item) => [item.size, item.quantity])) },
        }
      }))
      setOrderNumber(result.order.orderNumber)
      setCompletedOrder({ ...result.order, itemCount: bag.reduce((count, item) => count + item.quantity, 0) })
      setShowSuccess(true)
      setBag([])
      setCheckoutIdempotencyKey(createCheckoutIdempotencyKey())
    } catch (requestError) {
      if ([400, 409].includes(requestError.status)) setCheckoutIdempotencyKey(createCheckoutIdempotencyKey())
      setCheckoutError(requestError.message)
    } finally {
      setCheckoutBusy(false)
    }
  }

  const editProduct = (product) => {
    setEditingProductId(product.id)
    setProductDraft({
      name: product.name,
      price: String(product.price),
      category: product.category,
      color: product.color,
      material: product.material,
      audience: product.audience,
      sizes: product.sizes.join(', '),
      gallery: product.gallery.join('\n'),
      description: product.description || '',
    })
    setCmsError('')
    setCmsNotice('')
  }

  const resetProductDraft = () => {
    setEditingProductId(null)
    setProductDraft({ name: '', price: '', category: 'Outerwear', color: '', material: '', audience: 'women', sizes: 'XS, S, M, L', gallery: '', description: '' })
  }

  const saveProduct = async (event) => {
    event.preventDefault()
    setCmsSaving(true)
    setCmsError('')
    setCmsNotice('')
    const payload = {
      ...productDraft,
      price: Number(productDraft.price),
      sizes: productDraft.sizes.split(',').map((size) => size.trim()).filter(Boolean),
      gallery: productDraft.gallery.split(/\r?\n/).map((image) => image.trim()).filter(Boolean),
    }
    try {
      const result = await requestJSON(editingProductId ? `/api/admin/products/${editingProductId}` : '/api/admin/products', {
        method: editingProductId ? 'PATCH' : 'POST',
        body: JSON.stringify(payload),
      })
      setAdminProducts((current) => editingProductId
        ? current.map((product) => product.id === editingProductId ? result.product : product)
        : [result.product, ...current])
      const { products } = await requestJSON('/api/products')
      setProductCatalog(products)
      setCmsNotice(editingProductId ? 'Product changes saved.' : 'Product added to the storefront.')
      resetProductDraft()
    } catch (requestError) {
      setCmsError(requestError.message)
    } finally {
      setCmsSaving(false)
    }
  }

  const toggleProductActive = async (product) => {
    setCmsError('')
    try {
      const { product: updatedProduct } = await requestJSON(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !product.isActive }),
      })
      setAdminProducts((current) => current.map((item) => item.id === product.id ? updatedProduct : item))
      const { products } = await requestJSON('/api/products')
      setProductCatalog(products)
    } catch (requestError) {
      setCmsError(requestError.message)
    }
  }

  const editArticle = (article) => {
    setEditingArticleId(article.id)
    setArticleDraft({ category: article.category, title: article.title, image: article.image, alt: article.alt, excerpt: article.excerpt, body: article.body, status: article.status })
    setCmsError('')
    setCmsNotice('')
  }

  const resetArticleDraft = () => {
    setEditingArticleId(null)
    setArticleDraft({ category: '', title: '', image: '', alt: '', excerpt: '', body: '', status: 'draft' })
  }

  const saveArticle = async (event) => {
    event.preventDefault()
    setCmsSaving(true)
    setCmsError('')
    setCmsNotice('')
    try {
      const result = await requestJSON(editingArticleId ? `/api/admin/articles/${editingArticleId}` : '/api/admin/articles', {
        method: editingArticleId ? 'PATCH' : 'POST',
        body: JSON.stringify(articleDraft),
      })
      setAdminArticles((current) => editingArticleId
        ? current.map((article) => article.id === editingArticleId ? result.article : article)
        : [result.article, ...current])
      const { articles: publishedArticles } = await requestJSON('/api/journal')
      setArticles(publishedArticles)
      setCmsNotice(editingArticleId ? 'Article changes saved.' : 'Article saved.')
      resetArticleDraft()
    } catch (requestError) {
      setCmsError(requestError.message)
    } finally {
      setCmsSaving(false)
    }
  }

  const saveContactDetails = async (event) => {
    event.preventDefault()
    setCmsSaving(true)
    setCmsError('')
    setCmsNotice('')
    try {
      const { contact } = await requestJSON('/api/admin/settings/contact', {
        method: 'PATCH',
        body: JSON.stringify(contactDraft),
      })
      setContactDetails(contact)
      setContactDraft(contact)
      setCmsNotice('Footer contact details saved.')
    } catch (requestError) {
      setCmsError(requestError.message)
    } finally {
      setCmsSaving(false)
    }
  }

  const updateOrderStatus = async (orderId, fulfillmentStatus) => {
    setCmsError('')
    try {
      await requestJSON(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        body: JSON.stringify({ fulfillmentStatus }),
      })
      setAdminOrders((current) => current.map((order) => order.id === orderId ? { ...order, fulfillmentStatus } : order))
    } catch (requestError) {
      setCmsError(requestError.message)
    }
  }

  const saveShipmentTracking = async (order) => {
    const draft = shipmentDrafts[order.id] || {}
    setCmsSaving(true)
    setCmsError('')
    setCmsNotice('')
    try {
      const shipment = {
        carrier: draft.carrier ?? order.shippingCarrier ?? '',
        trackingNumber: draft.trackingNumber ?? order.trackingNumber ?? '',
        trackingUrl: draft.trackingUrl ?? order.trackingUrl ?? '',
      }
      await requestJSON(`/api/admin/orders/${order.id}/shipment`, {
        method: 'PATCH',
        body: JSON.stringify(shipment),
      })
      setAdminOrders((current) => current.map((item) => item.id === order.id ? {
        ...item,
        shippingCarrier: shipment.carrier || null,
        trackingNumber: shipment.trackingNumber || null,
        trackingUrl: shipment.trackingUrl || null,
      } : item))
      setShipmentDrafts((current) => {
        const next = { ...current }
        delete next[order.id]
        return next
      })
      setCmsNotice(`Shipment details saved for ${order.orderNumber}.`)
    } catch (requestError) {
      setCmsError(requestError.message)
    } finally {
      setCmsSaving(false)
    }
  }

  const setProductValue = (field, value) => setProductDraft((draft) => ({ ...draft, [field]: value }))
  const setArticleValue = (field, value) => setArticleDraft((draft) => ({ ...draft, [field]: value }))

  const uploadCmsImages = async (files) => {
    const formData = new FormData()
    files.forEach((file) => formData.append('images', file))
    const response = await fetch('/api/admin/uploads', { method: 'POST', body: formData })
    const result = await response.json()
    if (!response.ok) throw new Error(result.error || 'Unable to upload image.')
    return result.images.map((image) => image.url)
  }

  const handleProductImageChange = async (event) => {
    const files = Array.from(event.target.files || [])
    event.target.value = ''
    if (!files.length) return
    const existingImages = productDraft.gallery.split(/\r?\n/).map((image) => image.trim()).filter(Boolean)
    if (existingImages.length + files.length > 5) {
      setCmsError('Products can have up to 5 images.')
      return
    }

    setImageUploadBusy(true)
    setCmsError('')
    try {
      const uploadedImages = await uploadCmsImages(files)
      setProductDraft((draft) => ({ ...draft, gallery: [...draft.gallery.split(/\r?\n/).map((image) => image.trim()).filter(Boolean), ...uploadedImages].join('\n') }))
    } catch (requestError) {
      setCmsError(requestError.message)
    } finally {
      setImageUploadBusy(false)
    }
  }

  const handleArticleImageChange = async (event) => {
    const [file] = Array.from(event.target.files || [])
    event.target.value = ''
    if (!file) return

    setImageUploadBusy(true)
    setCmsError('')
    try {
      const [image] = await uploadCmsImages([file])
      setArticleValue('image', image)
    } catch (requestError) {
      setCmsError(requestError.message)
    } finally {
      setImageUploadBusy(false)
    }
  }

  const renderView = () => {
    if (currentView === 'orders') {
      if (!user) {
        return (
          <section className="mx-auto max-w-2xl px-4 pb-20 pt-36 text-center">
            <p className="nav-label text-[#8A8A86]">Your account</p>
            <h1 className="mt-3 font-display text-5xl">Sign in to view your orders</h1>
            <button type="button" className="mt-6 border border-black bg-black px-6 py-4 text-[10px] uppercase tracking-[0.24em] text-white" onClick={() => { setAuthMode('login'); setAuthOpen(true); }}>
              Sign in
            </button>
          </section>
        )
      }

      return (
        <motion.div key="orders" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.35, ease: 'easeOut' }}>
          <section className="mx-auto max-w-[1100px] px-4 pb-20 pt-28 md:px-8">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-[#D8D8D4] pb-6">
              <div>
                <p className="nav-label text-[#8A8A86]">Account · {user.email}</p>
                <h1 className="font-display text-6xl md:text-7xl">Order history</h1>
              </div>
              <button type="button" className="border border-[#D8D8D4] bg-white px-5 py-3 text-[10px] uppercase tracking-[0.24em]" onClick={() => setCurrentView('home')}>
                Continue shopping
              </button>
            </div>

            {orderHistoryLoading ? (
              <p className="py-12 text-sm text-[#8A8A86]">Loading orders…</p>
            ) : orderHistoryError ? (
              <p role="alert" className="border border-[#B3261E]/30 bg-white px-4 py-3 text-sm text-[#B3261E]">{orderHistoryError}</p>
            ) : customerOrders.length === 0 ? (
              <div className="border-y border-[#D8D8D4] py-16 text-center">
                <p className="font-display text-4xl">No orders yet</p>
                <p className="mt-2 text-sm text-[#8A8A86]">Your purchases and delivery updates will appear here.</p>
                <button type="button" className="mt-6 border border-black bg-black px-6 py-4 text-[10px] uppercase tracking-[0.24em] text-white" onClick={() => openCollection()}>
                  Explore the collection
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[#D8D8D4]">
                {customerOrders.map((order) => {
                  const paymentLabel = order.paymentStatus === 'sandbox_pending'
                    ? 'Pending · demo payment, no charge'
                    : order.paymentStatus === 'paid' ? 'Paid' : order.paymentStatus
                  const fulfillmentLabel = {
                    processing: 'Processing',
                    packed: 'Packed',
                    shipped: 'Shipped',
                    delivered: 'Delivered',
                    cancelled: 'Cancelled',
                  }[order.fulfillmentStatus] || order.fulfillmentStatus
                  return (
                    <article key={order.id} className="py-7">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium">{order.orderNumber}</p>
                          <p className="mt-1 text-xs text-[#8A8A86]">{new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} · {order.items.reduce((count, item) => count + item.quantity, 0)} items</p>
                        </div>
                        <p className="font-medium">{formatPrice(order.total, order.currencyCode)}</p>
                      </div>
                      <div className="mt-5 grid gap-4 border-y border-[#D8D8D4] py-4 text-sm sm:grid-cols-2">
                        <div><p className="nav-label text-[#8A8A86]">Payment</p><p className="mt-1">{paymentLabel}</p></div>
                        <div><p className="nav-label text-[#8A8A86]">Delivery status</p><p className="mt-1">{fulfillmentLabel} · {order.shippingMethod === 'express' ? 'Express' : 'Standard'}</p></div>
                      </div>
                      {order.trackingNumber && order.trackingUrl && (
                        <div className="border-b border-[#D8D8D4] py-4 text-sm">
                          <p className="nav-label text-[#8A8A86]">Shipment tracking</p>
                          <p className="mt-1">{order.shippingCarrier} · {order.trackingNumber}</p>
                          <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block underline underline-offset-4">Track this shipment</a>
                        </div>
                      )}
                      <div className="divide-y divide-[#E9E9E6]">
                        {order.items.map((item, index) => (
                          <div key={`${item.name}-${item.size}-${index}`} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                            <p>{item.name} <span className="text-xs text-[#8A8A86]">· Size {item.size} · Qty {item.quantity}</span></p>
                            <p>{formatPrice(item.unitPrice * item.quantity, order.currencyCode)}</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 flex justify-between text-sm text-[#686864]">
                        <span>Shipping</span>
                        <span>{order.shipping === 0 ? 'Free' : formatPrice(order.shipping, order.currencyCode)}</span>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </section>
        </motion.div>
      )
    }

    if (currentView === 'plp') {
      return (
        <motion.div key="plp" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} transition={{ duration: 0.45, ease: 'easeOut' }}>
          <section className="mx-auto max-w-[1400px] px-4 pb-16 pt-28 md:px-8">
            {collectionMode === 'men' && (
              <div className="relative mb-8 h-[320px] overflow-hidden bg-[#E6E4DF] md:h-[460px]">
                <img src="https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=1800&q=85" alt="AUREVÉ menswear autumn campaign" className="h-full w-full object-cover object-center" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-10">
                  <p className="nav-label mb-3 text-white/75">Autumn / Winter 26 · Menswear</p>
                  <h2 className="max-w-xl font-display text-5xl leading-none md:text-7xl">Form with purpose.</h2>
                </div>
              </div>
            )}
            {collectionMode === 'accessories' && (
              <div className="relative mb-8 h-[320px] overflow-hidden bg-[#DAD7D1] md:h-[460px]">
                <img src="https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1800&q=85" alt="AUREVÉ acetate sunglasses" className="h-full w-full object-cover object-center" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-10">
                  <p className="nav-label mb-3 text-white/75">AUREVÉ · Objects of intention</p>
                  <h2 className="max-w-xl font-display text-5xl leading-none md:text-7xl">The finishing touch.</h2>
                </div>
              </div>
            )}
            <div className="mb-8 flex items-end justify-between gap-4 border-b border-[#D8D8D4] pb-5">
              <div>
                <p className="nav-label text-[#8A8A86]">{collectionMode === 'men' ? 'AUREVÉ Menswear' : collectionMode === 'women' ? 'AUREVÉ Womenswear' : collectionMode === 'accessories' ? 'AUREVÉ Accessories' : 'Collection'}</p>
                <h1 className="font-display text-5xl md:text-7xl">{collectionMode === 'men' ? "The Men's Collection" : collectionMode === 'women' ? "The Women's Collection" : collectionMode === 'accessories' ? 'Objects of Intention' : 'Autumn / Winter 26'}</h1>
              </div>
              <div className="hidden items-center gap-3 md:flex">
                <button className="nav-button border border-[#D8D8D4] px-4 py-3 text-[11px] uppercase tracking-[0.28em]" onClick={() => setFiltersOpen(true)}>
                  Filters
                </button>
                <label className="sr-only" htmlFor="desktop-sort">Sort products</label>
                <select id="desktop-sort" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} className="border border-[#D8D8D4] bg-white px-4 py-3 text-[11px] uppercase tracking-[0.18em] focus-ring">
                  <option value="recommended">Sort: Recommended</option>
                  <option value="price-low">Price: Low to high</option>
                  <option value="price-high">Price: High to low</option>
                  <option value="name">Name: A to Z</option>
                </select>
              </div>
            </div>
            <div className="mb-8 flex gap-3 overflow-x-auto pb-2 md:hidden">
              {activeFilterOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`whitespace-nowrap border px-4 py-3 text-[10px] uppercase tracking-[0.24em] ${
                    selectedFilter === option ? 'border-black bg-black text-white' : 'border-[#D8D8D4] bg-transparent text-black'
                  }`}
                  onClick={() => setSelectedFilter(option)}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="mb-6 grid grid-cols-2 gap-3 md:hidden">
              <label className="block">
                <span className="nav-label mb-2 block text-[#686864]">Price</span>
                <select value={priceFilter} onChange={(event) => setPriceFilter(event.target.value)} className="w-full border border-[#D8D8D4] bg-white px-3 py-3 text-xs focus-ring">
                  <option value="all">All prices</option>
                  <option value="under-3m">Under Rp3.000.000</option>
                  <option value="3m-6m">Rp3.000.000–Rp5.999.999</option>
                  <option value="6m-9m">Rp6.000.000–Rp9.000.000</option>
                  <option value="over-9m">Over Rp9.000.000</option>
                </select>
              </label>
              <label className="block">
                <span className="nav-label mb-2 block text-[#686864]">Sort</span>
                <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} className="w-full border border-[#D8D8D4] bg-white px-3 py-3 text-xs focus-ring">
                  <option value="recommended">Recommended</option>
                  <option value="price-low">Price: Low to high</option>
                  <option value="price-high">Price: High to low</option>
                  <option value="name">Name: A to Z</option>
                </select>
              </label>
            </div>
            <p className="mb-3 text-xs text-[#686864]" aria-live="polite">{filteredProducts.length} {filteredProducts.length === 1 ? 'piece' : 'pieces'}</p>
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  canQuickAdd={canQuickAdd(product)}
                  onClick={() => openProduct(product)}
                  onQuickAdd={() => handleQuickAdd(product)}
                />
              ))}
              </div>
            ) : (
              <div className="border-y border-[#D8D8D4] py-16 text-center">
                <p className="font-display text-3xl">No pieces match these filters.</p>
                <button type="button" className="mt-4 text-xs uppercase tracking-[0.18em] underline underline-offset-4" onClick={() => { setSelectedFilter('All'); setPriceFilter('all'); }}>
                  Clear filters
                </button>
              </div>
            )}
          </section>
        </motion.div>
      )
    }

    if (currentView === 'pdp') {
      return (
        <motion.div key="pdp" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} transition={{ duration: 0.45, ease: 'easeOut' }}>
          <section className="mx-auto max-w-[1440px] px-4 pb-20 pt-28 md:px-8">
            <div className="mb-6 flex items-center gap-2 text-[10px] uppercase tracking-[0.26em] text-[#8A8A86]">
              <button type="button" className="inline-flex items-center gap-2 hover:text-black" onClick={() => setCurrentView('plp')}>
                <ChevronRight className="h-3 w-3 rotate-180" />
                Back to collection
              </button>
            </div>
            <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-4 md:col-span-1">
                  {selectedProduct.gallery.map((image, index) => (
                    <button
                      key={image}
                      type="button"
                      className={`relative block h-28 w-full overflow-hidden border transition-colors ${
                        selectedImageIndex === index ? 'border-black' : 'border-[#D8D8D4]'
                      }`}
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      <img src={image} alt={selectedProduct.name} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
                <div className="md:col-span-2">
                  <ZoomableImage src={selectedProduct.gallery[selectedImageIndex]} alt={selectedProduct.name} containerClassName="h-[540px] w-full md:h-[760px]" />
                </div>
              </div>

              <aside className="lg:sticky lg:top-28 lg:h-fit">
                <div className="space-y-6 border border-[#D8D8D4] bg-white p-6 md:p-8">
                  <div className="space-y-3">
                    <p className="nav-label text-[#8A8A86]">{selectedProduct.category}</p>
                    <h1 className="font-display text-5xl leading-none">{selectedProduct.name}</h1>
                    <div className="flex items-center justify-between">
                      <p className="text-xl">{formatPrice(selectedProduct.price)}</p>
                      <span className="text-[10px] uppercase tracking-[0.16em] text-[#686864]">Reviews not available</span>
                    </div>
                    <dl className="grid grid-cols-2 gap-4 border-y border-[#D8D8D4] py-4 text-sm">
                      <div><dt className="text-xs text-[#686864]">Color</dt><dd className="mt-1">{selectedProduct.color}</dd></div>
                      <div><dt className="text-xs text-[#686864]">Material</dt><dd className="mt-1">{selectedProduct.material}</dd></div>
                    </dl>
                    {selectedProduct.description && <p className="text-sm leading-relaxed text-[#30302E]">{selectedProduct.description}</p>}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="nav-label text-[#686864]">Select size</p>
                      <span className="text-xs text-[#686864]">{selectedProduct.sizes.filter((size) => (selectedProduct.stockBySize?.[size] || 0) > 0).length} in stock</span>
                    </div>
                    <div className={`grid gap-2 ${selectedProduct.sizes.includes('One Size') ? 'grid-cols-1' : 'grid-cols-4'}`}>
                      {(selectedProduct.sizes.includes('One Size') ? selectedProduct.sizes : sizeOptions).map((size) => {
                        const isDisabled = !selectedProduct.sizes.includes(size) || !(selectedProduct.stockBySize?.[size] > 0)
                        const active = selectedSize === size
                        return (
                          <button
                            key={size}
                            type="button"
                            disabled={isDisabled}
                            className={`flex h-12 items-center justify-center border text-[11px] uppercase tracking-[0.18em] transition-all ${
                              active
                                ? 'border-black bg-black text-white'
                                : isDisabled
                                  ? 'border-[#E9E9E6] bg-[#F7F7F5] text-[#8A8A86]'
                                  : 'border-[#D8D8D4] bg-white text-black hover:border-black'
                            } ${error ? 'animate-[shake_0.35s_ease-in-out]' : ''}`}
                            onClick={() => {
                              setSelectedSize(size)
                              setError('')
                            }}
                          >
                            {size}
                          </button>
                        )
                      })}
                    </div>
                    {error && <p className="text-sm text-[#B3261E]">{error}</p>}
                  </div>

                  <button
                    type="button"
                    disabled={!selectedProduct.sizes.some((size) => (selectedProduct.stockBySize?.[size] || 0) > 0)}
                    className="w-full border border-black bg-black px-6 py-4 text-[11px] uppercase tracking-[0.26em] text-white transition-colors hover:bg-[#30302E] focus-ring disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={handleAddToBag}
                  >
                    {selectedProduct.sizes.some((size) => (selectedProduct.stockBySize?.[size] || 0) > 0) ? 'Add to bag' : 'Out of stock'}
                  </button>

                  <div className="space-y-3 border-t border-[#D8D8D4] pt-4">
                    {[
                      { key: 'size', label: 'Size & fit', content: `Available sizes: ${selectedProduct.sizes.join(', ')}. Detailed garment measurements and fit notes are not available for this item yet.` },
                      { key: 'composition', label: 'Composition', content: selectedProduct.material },
                      { key: 'care', label: 'Care', content: 'Care instructions are not available for this item yet.' },
                      { key: 'shipping', label: 'Shipping', content: 'Demo estimate: standard delivery takes 3–5 business days; express takes 1–2 business days. Standard shipping is complimentary on orders above Rp8.000.000. No live carrier is connected.' },
                      { key: 'returns', label: 'Returns', content: 'A returns policy has not been configured for this demo store.' },
                    ].map((item) => (
                      <AccordionItem
                        key={item.key}
                        title={item.label}
                        content={item.content}
                        isOpen={openAccordion === item.key}
                        onToggle={() => setOpenAccordion(openAccordion === item.key ? '' : item.key)}
                      />
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          </section>
        </motion.div>
      )
    }

    if (currentView === 'journal') {
      return (
        <motion.div key="journal" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} transition={{ duration: 0.45, ease: 'easeOut' }}>
          <section className="mx-auto max-w-[1440px] px-4 pb-20 pt-28 md:px-8">
            <div className="mb-8 border-b border-[#D8D8D4] pb-6">
              <p className="nav-label text-[#8A8A86]">Notes on modern living</p>
              <h1 className="font-display text-6xl md:text-8xl">The Journal</h1>
            </div>

            <button type="button" className="group relative block w-full overflow-hidden text-left" onClick={() => openCollection()}>
              <img src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1800&q=85" alt="Autumn fashion editorial" className="h-[440px] w-full object-cover transition-transform duration-700 group-hover:scale-[1.02] md:h-[660px]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-12">
                <p className="nav-label mb-3 text-white/75">Autumn / Winter 26 · The edit</p>
                <h2 className="max-w-3xl font-display text-5xl leading-[0.95] md:text-7xl">A study in considered layers</h2>
                <span className="mt-5 inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.26em]">Explore the collection <ArrowRight className="h-4 w-4" /></span>
              </div>
            </button>

            <div className="mt-16 grid gap-10 md:grid-cols-[0.7fr_1.3fr]">
              <div>
                <p className="nav-label text-[#8A8A86]">From the journal</p>
                <h2 className="mt-3 font-display text-5xl leading-none md:text-6xl">Objects, people, places.</h2>
              </div>
              <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2">
                {articles.map((story) => (
                  <button key={story.id} type="button" className="group text-left" onClick={() => { setSelectedArticle(story); setCurrentView('article'); }}>
                    <img src={story.image} alt={story.alt} className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-[1.01]" />
                    <p className="nav-label mt-4 text-[#8A8A86]">{story.category}</p>
                    <h3 className="mt-2 font-display text-3xl leading-tight">{story.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#8A8A86]">{story.excerpt}</p>
                  </button>
                ))}
              </div>
            </div>
          </section>
        </motion.div>
      )
    }

    if (currentView === 'article' && selectedArticle) {
      return (
        <motion.article key={`article-${selectedArticle.id}`} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} transition={{ duration: 0.45, ease: 'easeOut' }} className="mx-auto max-w-[1100px] px-4 pb-20 pt-28 md:px-8">
          <button type="button" className="mb-8 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-[#8A8A86] hover:text-black" onClick={() => setCurrentView('journal')}>
            <ChevronRight className="h-3 w-3 rotate-180" /> Back to Journal
          </button>
          <img src={selectedArticle.image} alt={selectedArticle.alt} className="max-h-[680px] w-full object-cover" />
          <div className="mx-auto max-w-[720px] py-10">
            <p className="nav-label text-[#8A8A86]">{selectedArticle.category}</p>
            <h1 className="mt-3 font-display text-5xl leading-[0.95] md:text-7xl">{selectedArticle.title}</h1>
            <p className="mt-5 border-b border-[#D8D8D4] pb-6 text-lg leading-relaxed text-[#686864]">{selectedArticle.excerpt}</p>
            <div className="whitespace-pre-line py-8 text-base leading-8 text-[#30302E]">{selectedArticle.body}</div>
          </div>
        </motion.article>
      )
    }

    if (currentView === 'admin') {
      if (user?.role !== 'admin') {
        return (
          <motion.section key="admin-login" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="mx-auto max-w-xl px-4 pb-24 pt-36">
            <div className="border border-[#D8D8D4] bg-white p-6 md:p-9">
              <p className="nav-label text-[#686864]">Restricted area</p>
              <h1 className="mt-3 font-display text-5xl">CMS sign in</h1>
              <p className="mt-3 text-sm leading-relaxed text-[#686864]">Administrator access is separate from customer accounts.</p>
              <form className="mt-8 space-y-5" onSubmit={handleAdminLogin}>
                <InputField label="Admin email" type="email" value={adminLoginForm.email} onChange={(value) => setAdminLoginForm((form) => ({ ...form, email: value }))} required autoComplete="username" />
                <InputField label="Admin password" type="password" value={adminLoginForm.password} onChange={(value) => setAdminLoginForm((form) => ({ ...form, password: value }))} required autoComplete="current-password" />
                {adminLoginError && <p role="alert" className="text-sm text-[#B3261E]">{adminLoginError}</p>}
                <button type="submit" disabled={adminLoginBusy} className="w-full border border-black bg-black px-5 py-4 text-[10px] uppercase tracking-[0.22em] text-white disabled:opacity-50">
                  {adminLoginBusy ? 'Signing in' : 'Sign in to CMS'}
                </button>
              </form>
              <button type="button" className="mt-5 text-xs uppercase tracking-[0.18em] text-[#686864] underline underline-offset-4" onClick={navigateHome}>Return to storefront</button>
            </div>
          </motion.section>
        )
      }

      return (
        <motion.div key="admin" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.35, ease: 'easeOut' }}>
          <section className="mx-auto max-w-[1440px] px-4 pb-20 pt-28 md:px-8">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-5 border-b border-[#D8D8D4] pb-6">
              <div>
                <p className="nav-label text-[#8A8A86]">AUREVÉ · Administration</p>
                <h1 className="font-display text-6xl md:text-7xl">Content studio</h1>
              </div>
              <button type="button" className="border border-[#D8D8D4] bg-white px-5 py-3 text-[10px] uppercase tracking-[0.24em]" onClick={() => setCurrentView('home')}>
                View storefront
              </button>
            </div>

            <div role="tablist" aria-label="CMS sections" className="mb-8 flex overflow-x-auto border-b border-[#D8D8D4]">
              {[
                { id: 'products', label: `Products (${adminProducts.length})` },
                { id: 'articles', label: `Journal (${adminArticles.length})` },
                { id: 'orders', label: `Orders (${adminOrders.length})` },
                { id: 'contact', label: 'Contact' },
                { id: 'activity', label: 'Activity log' },
              ].map((tab) => (
                <button key={tab.id} type="button" role="tab" aria-selected={adminTab === tab.id} className={`whitespace-nowrap border-b-2 px-5 py-4 text-[10px] uppercase tracking-[0.22em] ${adminTab === tab.id ? 'border-black text-black' : 'border-transparent text-[#8A8A86]'}`} onClick={() => { setAdminTab(tab.id); setCmsError(''); setCmsNotice(''); }}>
                  {tab.label}
                </button>
              ))}
            </div>

            {cmsError && <p role="alert" className="mb-5 border border-[#B3261E]/30 bg-white px-4 py-3 text-sm text-[#B3261E]">{cmsError}</p>}
            {cmsNotice && <p role="status" className="mb-5 border border-[#D8D8D4] bg-white px-4 py-3 text-sm">{cmsNotice}</p>}
            {cmsLoading ? (
              <p className="py-12 text-sm text-[#8A8A86]">Loading content…</p>
            ) : (
              <>
                {adminTab === 'products' && (
                  <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
                    <section aria-label="Product list">
                      <div className="mb-4 flex items-end justify-between border-b border-[#D8D8D4] pb-3">
                        <div>
                          <p className="nav-label text-[#8A8A86]">Catalog</p>
                          <h2 className="font-display text-4xl">Products</h2>
                        </div>
                        <button type="button" className="border border-black bg-black px-4 py-3 text-[10px] uppercase tracking-[0.2em] text-white" onClick={() => { resetProductDraft(); setCmsNotice('Product editor is ready for a new listing.'); productFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>
                          Add product
                        </button>
                      </div>
                      <div className="divide-y divide-[#D8D8D4]">
                        {adminProducts.map((product) => (
                          <div key={product.id} className="flex flex-wrap items-center gap-4 py-4">
                            <img src={product.gallery[0]} alt={product.name} className="h-20 w-16 border border-[#D8D8D4] object-cover" />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium">{product.name}</p>
                              <p className="mt-1 text-xs text-[#8A8A86]">{product.category} · {product.audience} · {formatPrice(product.price)}</p>
                              <p className="mt-1 text-[10px] uppercase tracking-[0.18em]">{product.isActive ? 'Live' : 'Hidden'}</p>
                            </div>
                            <div className="flex gap-2">
                              <button type="button" className="border border-[#D8D8D4] bg-white px-3 py-2 text-[10px] uppercase tracking-[0.15em]" onClick={() => { editProduct(product); productFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>Edit</button>
                              <button type="button" className="border border-[#D8D8D4] bg-white px-3 py-2 text-[10px] uppercase tracking-[0.15em]" onClick={() => toggleProductActive(product)}>{product.isActive ? 'Hide' : 'Publish'}</button>
                            </div>
                            <div className="w-full border-t border-[#E9E9E6] pt-3">
                              <p className="mb-2 text-[10px] uppercase tracking-[0.16em] text-[#686864]">Stock by size · starts at zero</p>
                              <div className="flex flex-wrap items-end gap-2">
                                {product.sizes.map((size) => (
                                  <label key={size} className="block">
                                    <span className="mb-1 block text-[10px] uppercase tracking-[0.12em] text-[#686864]">{size}</span>
                                    <input
                                      type="number"
                                      min="0"
                                      max="100000"
                                      step="1"
                                      aria-label={`Stock quantity for ${product.name} size ${size}`}
                                      value={inventoryDrafts[product.id]?.[size] ?? product.stockBySize?.[size] ?? 0}
                                      onChange={(event) => setInventoryDrafts((current) => ({
                                        ...current,
                                        [product.id]: { ...current[product.id], [size]: event.target.value },
                                      }))}
                                      className="w-20 border border-[#D8D8D4] bg-white px-2 py-2 text-sm"
                                    />
                                  </label>
                                ))}
                                <button type="button" disabled={cmsSaving} className="border border-black bg-black px-4 py-2 text-[10px] uppercase tracking-[0.15em] text-white disabled:opacity-50" onClick={() => saveInventory(product)}>
                                  Save stock
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>

                    <form ref={productFormRef} className="scroll-mt-24 space-y-4 border border-[#D8D8D4] bg-white p-5 md:p-6" onSubmit={saveProduct}>
                      <div className="flex items-start justify-between gap-4 border-b border-[#D8D8D4] pb-4">
                        <div>
                          <p className="nav-label text-[#8A8A86]">{editingProductId ? 'Edit listing' : 'New listing'}</p>
                          <h2 className="font-display text-3xl">{editingProductId ? 'Product details' : 'Add product'}</h2>
                        </div>
                        {editingProductId && <button type="button" className="text-[10px] uppercase tracking-[0.18em] text-[#8A8A86]" onClick={resetProductDraft}>Clear</button>}
                      </div>
                      <CmsField label="Product name" value={productDraft.name} onChange={(value) => setProductValue('name', value)} required />
                      <div className="grid gap-4 sm:grid-cols-2">
                        <CmsField label="Price (IDR)" type="number" value={productDraft.price} onChange={(value) => setProductValue('price', value)} required />
                        <CmsField label="Category" value={productDraft.category} onChange={(value) => setProductValue('category', value)} required />
                        <CmsField label="Color" value={productDraft.color} onChange={(value) => setProductValue('color', value)} required />
                        <CmsField label="Material" value={productDraft.material} onChange={(value) => setProductValue('material', value)} required />
                        <label className="block"><span className="mb-2 block text-[10px] uppercase tracking-[0.18em] text-[#8A8A86]">Audience</span><select value={productDraft.audience} onChange={(event) => setProductValue('audience', event.target.value)} className="w-full border-b border-[#D8D8D4] bg-transparent py-3 text-sm"><option value="women">Women</option><option value="men">Men</option><option value="unisex">Unisex</option></select></label>
                        <CmsField label="Sizes (comma separated)" value={productDraft.sizes} onChange={(value) => setProductValue('sizes', value)} required />
                      </div>
                      <CmsImagePicker
                        label="Product images"
                        images={productDraft.gallery.split(/\r?\n/).map((image) => image.trim()).filter(Boolean)}
                        onFilesSelected={handleProductImageChange}
                        onRemove={(index) => setProductValue('gallery', productDraft.gallery.split(/\r?\n/).filter((_image, imageIndex) => imageIndex !== index).join('\n'))}
                        busy={imageUploadBusy}
                        multiple
                        required={!productDraft.gallery.trim()}
                      />
                      <CmsField label="Description" type="textarea" rows={3} value={productDraft.description} onChange={(value) => setProductValue('description', value)} />
                      <button type="submit" disabled={cmsSaving || imageUploadBusy} className="w-full border border-black bg-black px-5 py-4 text-[10px] uppercase tracking-[0.22em] text-white disabled:opacity-50">{imageUploadBusy ? 'Uploading image' : cmsSaving ? 'Saving' : editingProductId ? 'Save product' : 'Create product'}</button>
                    </form>
                  </div>
                )}

                {adminTab === 'articles' && (
                  <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
                    <section aria-label="Journal article list">
                      <div className="mb-4 flex items-end justify-between border-b border-[#D8D8D4] pb-3">
                        <div><p className="nav-label text-[#8A8A86]">Editorial</p><h2 className="font-display text-4xl">Journal</h2></div>
                        <button type="button" className="border border-black bg-black px-4 py-3 text-[10px] uppercase tracking-[0.2em] text-white" onClick={() => { resetArticleDraft(); setCmsNotice('Article editor is ready for a new story.'); articleFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>New article</button>
                      </div>
                      <div className="divide-y divide-[#D8D8D4]">
                        {adminArticles.map((article) => (
                          <div key={article.id} className="flex items-center gap-4 py-4">
                            <img src={article.image} alt={article.alt} className="h-20 w-16 object-cover" />
                            <div className="min-w-0 flex-1"><p className="text-sm font-medium">{article.title}</p><p className="mt-1 text-xs text-[#8A8A86]">{article.category} · {article.status}</p></div>
                            <button type="button" className="border border-[#D8D8D4] bg-white px-3 py-2 text-[10px] uppercase tracking-[0.15em]" onClick={() => { editArticle(article); articleFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>Edit</button>
                          </div>
                        ))}
                      </div>
                    </section>

                    <form ref={articleFormRef} className="scroll-mt-24 space-y-4 border border-[#D8D8D4] bg-white p-5 md:p-6" onSubmit={saveArticle}>
                      <div className="border-b border-[#D8D8D4] pb-4"><p className="nav-label text-[#8A8A86]">{editingArticleId ? 'Edit story' : 'New story'}</p><h2 className="font-display text-3xl">Article details</h2></div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <CmsField label="Category" value={articleDraft.category} onChange={(value) => setArticleValue('category', value)} required />
                        <label className="block"><span className="mb-2 block text-[10px] uppercase tracking-[0.18em] text-[#8A8A86]">Status</span><select value={articleDraft.status} onChange={(event) => setArticleValue('status', event.target.value)} className="w-full border-b border-[#D8D8D4] bg-transparent py-3 text-sm"><option value="draft">Draft</option><option value="published">Published</option></select></label>
                      </div>
                      <CmsField label="Title" value={articleDraft.title} onChange={(value) => setArticleValue('title', value)} required />
                      <CmsImagePicker
                        label="Article cover image"
                        images={articleDraft.image ? [articleDraft.image] : []}
                        onFilesSelected={handleArticleImageChange}
                        onRemove={() => setArticleValue('image', '')}
                        busy={imageUploadBusy}
                        required={!articleDraft.image}
                      />
                      <CmsField label="Image alt text" value={articleDraft.alt} onChange={(value) => setArticleValue('alt', value)} required />
                      <CmsField label="Excerpt" type="textarea" rows={2} value={articleDraft.excerpt} onChange={(value) => setArticleValue('excerpt', value)} required />
                      <CmsField label="Article body" type="textarea" rows={8} value={articleDraft.body} onChange={(value) => setArticleValue('body', value)} required />
                      <button type="submit" disabled={cmsSaving || imageUploadBusy} className="w-full border border-black bg-black px-5 py-4 text-[10px] uppercase tracking-[0.22em] text-white disabled:opacity-50">{imageUploadBusy ? 'Uploading image' : cmsSaving ? 'Saving' : 'Save article'}</button>
                    </form>
                  </div>
                )}

                {adminTab === 'orders' && (
                  <section aria-label="Order management">
                    <div className="mb-4 border-b border-[#D8D8D4] pb-3"><p className="nav-label text-[#8A8A86]">Store operations</p><h2 className="font-display text-4xl">Orders</h2></div>
                    {adminOrders.length === 0 ? <p className="py-10 text-sm text-[#8A8A86]">No orders yet.</p> : (
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                          <thead><tr className="border-b border-[#D8D8D4] text-[10px] uppercase tracking-[0.18em] text-[#8A8A86]"><th className="py-3 pr-4">Order</th><th className="py-3 pr-4">Customer</th><th className="py-3 pr-4">Delivery</th><th className="py-3 pr-4">Total</th><th className="py-3">Status</th></tr></thead>
                          <tbody>{adminOrders.map((order) => (
                            <Fragment key={order.id}>
                              <tr key={order.id} className="border-b border-[#D8D8D4] align-top">
                                <td className="py-4 pr-4">
                                  <p>{order.orderNumber}</p>
                                  <p className="mt-1 text-xs text-[#8A8A86]">{order.itemCount} line items</p>
                                  <button type="button" aria-expanded={expandedOrderId === order.id} className="mt-2 text-[10px] uppercase tracking-[0.16em] underline underline-offset-4" onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}>
                                    {expandedOrderId === order.id ? 'Hide details' : 'View details'}
                                  </button>
                                </td>
                                <td className="py-4 pr-4"><p>{order.customerName}</p><p className="mt-1 text-xs text-[#8A8A86]">{order.customerEmail}</p></td>
                                <td className="py-4 pr-4"><p className="capitalize">{order.shippingMethod}</p><p className="mt-1 text-xs text-[#8A8A86]">{order.shippingAddress.city}, {order.shippingAddress.country}</p></td>
                                <td className="py-4 pr-4">{formatPrice(order.total, order.currencyCode || 'IDR')}</td>
                                <td className="py-4"><select aria-label={`Fulfillment status for ${order.orderNumber}`} value={order.fulfillmentStatus} onChange={(event) => updateOrderStatus(order.id, event.target.value)} className="border border-[#D8D8D4] bg-white px-2 py-2 text-xs">{[order.fulfillmentStatus, ...(nextFulfillmentStatuses[order.fulfillmentStatus] || [])].map((status) => <option key={status} value={status} disabled={status === 'shipped' && (!order.trackingNumber || !order.trackingUrl)}>{status[0].toUpperCase() + status.slice(1)}</option>)}</select></td>
                              </tr>
                              {expandedOrderId === order.id && (
                                <tr key={`${order.id}-details`} className="border-b border-[#D8D8D4]">
                                  <td colSpan={5} className="p-0">
                                    <div className="grid gap-6 bg-[#F7F7F5] p-5 md:grid-cols-3 md:p-6">
                                      <section aria-label="Customer and delivery details">
                                        <p className="nav-label mb-3 text-[#686864]">Customer & delivery</p>
                                        <p className="text-sm font-medium">{order.shippingAddress.name}</p>
                                        <p className="mt-1 text-sm">{order.shippingAddress.email}</p>
                                        <p className="mt-1 text-sm">{order.shippingAddress.phone}</p>
                                        <p className="mt-3 text-sm leading-relaxed text-[#686864]">{order.shippingAddress.address}<br />{order.shippingAddress.city}, {order.shippingAddress.postalCode}<br />{order.shippingAddress.country}</p>
                                        <p className="mt-3 text-xs text-[#686864]">Placed {new Date(order.createdAt).toLocaleString('id-ID')}</p>
                                      </section>
                                      <section aria-label="Order items">
                                        <p className="nav-label mb-3 text-[#686864]">Items</p>
                                        <div className="divide-y divide-[#D8D8D4]">
                                          {Array.isArray(order.items) && order.items.length > 0 ? order.items.map((item, index) => (
                                            <div key={`${item.productId}-${item.size}-${index}`} className="flex items-start justify-between gap-4 py-2 text-sm">
                                              <div><p>{item.name}</p><p className="mt-1 text-xs text-[#686864]">Size {item.size} · Qty {item.quantity}</p></div>
                                              <p className="shrink-0">{formatPrice(item.unitPrice * item.quantity, order.currencyCode || 'IDR')}</p>
                                            </div>
                                          )) : <p className="py-2 text-sm text-[#686864]">Order items are unavailable. Refresh the CMS and try again.</p>}
                                        </div>
                                      </section>
                                      <section aria-label="Payment and totals">
                                        <p className="nav-label mb-3 text-[#686864]">Payment & totals</p>
                                        <div className="space-y-2 text-sm">
                                          <div className="flex justify-between gap-4"><span className="text-[#686864]">Method</span><span className="capitalize">{order.paymentMethod}</span></div>
                                          <div className="flex justify-between gap-4"><span className="text-[#686864]">Payment status</span><span>{order.paymentStatus}</span></div>
                                          <div className="flex justify-between gap-4"><span className="text-[#686864]">Subtotal</span><span>{formatPrice(order.subtotal, order.currencyCode || 'IDR')}</span></div>
                                          <div className="flex justify-between gap-4"><span className="text-[#686864]">Shipping</span><span>{order.shipping === 0 ? 'Free' : formatPrice(order.shipping, order.currencyCode || 'IDR')}</span></div>
                                          <div className="flex justify-between gap-4 border-t border-[#D8D8D4] pt-2 font-medium"><span>Total</span><span>{formatPrice(order.total, order.currencyCode || 'IDR')}</span></div>
                                        </div>
                                      </section>
                                      <section aria-label="Shipment tracking details" className="border-t border-[#D8D8D4] pt-4 md:col-span-3">
                                        <p className="nav-label mb-3 text-[#686864]">Manual shipment tracking</p>
                                        <div className="grid gap-3 sm:grid-cols-3">
                                          <label className="block"><span className="mb-1 block text-[10px] uppercase tracking-[0.14em] text-[#686864]">Carrier</span><input value={shipmentDrafts[order.id]?.carrier ?? order.shippingCarrier ?? ''} onChange={(event) => setShipmentDrafts((current) => ({ ...current, [order.id]: { ...current[order.id], carrier: event.target.value } }))} className="w-full border border-[#D8D8D4] bg-white px-3 py-2 text-sm" placeholder="Courier name" /></label>
                                          <label className="block"><span className="mb-1 block text-[10px] uppercase tracking-[0.14em] text-[#686864]">Tracking number</span><input value={shipmentDrafts[order.id]?.trackingNumber ?? order.trackingNumber ?? ''} onChange={(event) => setShipmentDrafts((current) => ({ ...current, [order.id]: { ...current[order.id], trackingNumber: event.target.value } }))} className="w-full border border-[#D8D8D4] bg-white px-3 py-2 text-sm" placeholder="Tracking number" /></label>
                                          <label className="block"><span className="mb-1 block text-[10px] uppercase tracking-[0.14em] text-[#686864]">HTTPS tracking URL</span><input type="url" value={shipmentDrafts[order.id]?.trackingUrl ?? order.trackingUrl ?? ''} onChange={(event) => setShipmentDrafts((current) => ({ ...current, [order.id]: { ...current[order.id], trackingUrl: event.target.value } }))} className="w-full border border-[#D8D8D4] bg-white px-3 py-2 text-sm" placeholder="https://…" /></label>
                                        </div>
                                        <button type="button" disabled={cmsSaving} className="mt-3 border border-black bg-black px-4 py-3 text-[10px] uppercase tracking-[0.18em] text-white disabled:opacity-50" onClick={() => saveShipmentTracking(order)}>Save tracking details</button>
                                      </section>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </Fragment>
                          ))}</tbody>
                        </table>
                      </div>
                    )}
                  </section>
                )}

                {adminTab === 'contact' && (
                  <section className="max-w-3xl" aria-label="Store contact settings">
                    <form className="space-y-5 border border-[#D8D8D4] bg-white p-5 md:p-7" onSubmit={saveContactDetails}>
                      <div className="border-b border-[#D8D8D4] pb-4">
                        <p className="nav-label text-[#686864]">Storefront footer</p>
                        <h2 className="font-display text-4xl">Contact details</h2>
                        <p className="mt-2 text-sm text-[#686864]">These demo values appear in the storefront footer. Replace them with real channels before launch.</p>
                      </div>
                      <div className="grid gap-5 sm:grid-cols-2">
                        <CmsField label="Customer care email" type="email" value={contactDraft.email} onChange={(value) => setContactDraft((draft) => ({ ...draft, email: value }))} required />
                        <CmsField label="WhatsApp number (include country code)" value={contactDraft.whatsapp} onChange={(value) => setContactDraft((draft) => ({ ...draft, whatsapp: value }))} required />
                        <CmsField label="Instagram profile URL" type="url" value={contactDraft.instagram} onChange={(value) => setContactDraft((draft) => ({ ...draft, instagram: value }))} required />
                        <CmsField label="Phone number (include country code)" type="tel" value={contactDraft.phone} onChange={(value) => setContactDraft((draft) => ({ ...draft, phone: value }))} required />
                      </div>
                      <button type="submit" disabled={cmsSaving} className="w-full border border-black bg-black px-5 py-4 text-[10px] uppercase tracking-[0.22em] text-white disabled:opacity-50">
                        {cmsSaving ? 'Saving' : 'Save contact details'}
                      </button>
                    </form>
                  </section>
                )}

                {adminTab === 'activity' && (
                  <section aria-label="Administrator activity log">
                    <div className="mb-4 border-b border-[#D8D8D4] pb-3">
                      <p className="nav-label text-[#8A8A86]">Security & operations</p>
                      <h2 className="font-display text-4xl">Recent admin activity</h2>
                    </div>
                    {adminAuditError ? <p role="alert" className="text-sm text-[#B3261E]">{adminAuditError}</p> : adminAuditLogs.length === 0 ? (
                      <p className="py-8 text-sm text-[#8A8A86]">No activity has been recorded yet.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px] border-collapse text-left text-sm">
                          <thead><tr className="border-b border-[#D8D8D4] text-[10px] uppercase tracking-[0.18em] text-[#8A8A86]"><th className="py-3 pr-4">When</th><th className="py-3 pr-4">Administrator</th><th className="py-3 pr-4">Action</th><th className="py-3 pr-4">Record</th><th className="py-3">Details</th></tr></thead>
                          <tbody>{adminAuditLogs.map((log) => (
                            <tr key={log.id} className="border-b border-[#D8D8D4] align-top">
                              <td className="py-3 pr-4 whitespace-nowrap">{new Date(`${log.createdAt}Z`).toLocaleString('id-ID')}</td>
                              <td className="py-3 pr-4">{log.actorEmail}</td>
                              <td className="py-3 pr-4 capitalize">{log.action.replaceAll('_', ' ')}</td>
                              <td className="py-3 pr-4 capitalize">{log.entityType}{log.entityId ? ` · ${log.entityId}` : ''}</td>
                              <td className="py-3 text-xs text-[#686864]">{Object.entries(log.details).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`).join(' · ') || '—'}</td>
                            </tr>
                          ))}</tbody>
                        </table>
                      </div>
                    )}
                  </section>
                )}
              </>
            )}
          </section>
        </motion.div>
      )
    }

    if (currentView === 'checkout') {
      return (
        <motion.div key="checkout" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} transition={{ duration: 0.45, ease: 'easeOut' }}>
          <section className="mx-auto max-w-[1440px] px-4 pb-20 pt-28 md:px-8">
            <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
              <div className="space-y-8">
                <div className="flex items-center justify-between border-b border-[#D8D8D4] pb-5">
                  <div>
                    <p className="nav-label text-[#8A8A86]">Checkout</p>
                    <h1 className="font-display text-5xl">AUREVÉ</h1>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-[#8A8A86]">
                    {['Information', 'Shipping', 'Payment', 'Complete'].map((label, index) => (
                      <div key={label} className="flex items-center gap-2">
                        <div className={`flex h-6 w-6 items-center justify-center border ${checkoutStep >= index ? 'border-black bg-black text-white' : 'border-[#D8D8D4] bg-white text-[#8A8A86]'}`}>
                          {index + 1}
                        </div>
                        {index < 3 && <span className="hidden md:inline">{label}</span>}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-none border border-[#D8D8D4] bg-white p-6 md:p-8">
                  {showSuccess ? (
                    <div className="space-y-8 py-8 text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center border border-black bg-black text-white">
                        <Check className="h-7 w-7" />
                      </div>
                      <div>
                        <p className="nav-label text-[#8A8A86]">Order complete</p>
                        <h2 className="font-display text-5xl">Your order is recorded.</h2>
                      </div>
                      <p className="mx-auto max-w-lg text-sm text-[#8A8A86]">
                        Order {orderNumber} is saved in demo mode. No payment was taken. A live payment provider and shipping carrier are not connected yet.
                      </p>
                      <button type="button" className="border border-black bg-black px-6 py-4 text-[11px] uppercase tracking-[0.28em] text-white hover:bg-[#30302E]" onClick={() => { setCurrentView('home'); setShowSuccess(false); setCheckoutStep(0); }}>
                        Continue shopping
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {checkoutStep === 0 && (
                        <div className="space-y-6">
                          <div>
                            <p className="nav-label text-[#686864]">{user ? 'Your account' : 'Guest checkout'}</p>
                            <h2 className="font-display text-4xl">Contact details</h2>
                            {!user && <p className="mt-2 text-sm text-[#686864]">No account is needed. We’ll use these details for your order and delivery updates.</p>}
                          </div>
                          <div className="grid gap-5 md:grid-cols-2">
                            <InputField label="First name" value={checkoutForm.firstName} onChange={(value) => setCheckoutForm((form) => ({ ...form, firstName: value }))} required />
                            <InputField label="Last name" value={checkoutForm.lastName} onChange={(value) => setCheckoutForm((form) => ({ ...form, lastName: value }))} required />
                            <div className="md:col-span-2"><InputField label="Email address" type="email" value={checkoutForm.email} onChange={(value) => setCheckoutForm((form) => ({ ...form, email: value }))} required /></div>
                            <div className="md:col-span-2"><InputField label="Phone" type="tel" value={checkoutForm.phone} onChange={(value) => setCheckoutForm((form) => ({ ...form, phone: value }))} required /></div>
                          </div>
                        </div>
                      )}

                      {checkoutStep === 1 && (
                        <div className="space-y-6">
                          <div>
                            <p className="nav-label text-[#8A8A86]">Shipping</p>
                            <h2 className="font-display text-4xl">Delivery information</h2>
                          </div>
                          <div className="grid gap-5 md:grid-cols-2">
                            <div className="md:col-span-2"><InputField label="Address" value={checkoutForm.address} onChange={(value) => setCheckoutForm((form) => ({ ...form, address: value }))} required /></div>
                            <InputField label="City" value={checkoutForm.city} onChange={(value) => setCheckoutForm((form) => ({ ...form, city: value }))} required />
                            <InputField label="Postal code" value={checkoutForm.postalCode} onChange={(value) => setCheckoutForm((form) => ({ ...form, postalCode: value }))} required />
                            <div className="md:col-span-2"><InputField label="Country" value={checkoutForm.country} onChange={(value) => setCheckoutForm((form) => ({ ...form, country: value }))} required /></div>
                            <div className="space-y-3 md:col-span-2">
                              <p className="nav-label text-[#8A8A86]">Shipping method</p>
                              <div className="grid gap-3 sm:grid-cols-2">
                                {[
                                  { id: 'standard', label: 'Standard', timing: '3-5 business days', price: subtotal >= 8000000 ? 'Complimentary' : formatPrice(240000) },
                                  { id: 'express', label: 'Express', timing: '1-2 business days', price: formatPrice(400000) },
                                ].map((method) => (
                                  <button key={method.id} type="button" aria-pressed={shippingMethod === method.id} className={`border p-4 text-left ${shippingMethod === method.id ? 'border-black bg-[#F7F7F5]' : 'border-[#D8D8D4] bg-white'}`} onClick={() => setShippingMethod(method.id)}>
                                    <span className="flex items-center justify-between text-sm font-medium">{method.label}<span>{method.price}</span></span>
                                    <span className="mt-2 block text-xs text-[#8A8A86]">{method.timing}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {checkoutStep === 2 && (
                        <div className="space-y-6">
                          <div>
                            <p className="nav-label text-[#8A8A86]">Payment</p>
                            <h2 className="font-display text-4xl">Secure payment</h2>
                          </div>
                          <div className="border border-[#D8D8D4] bg-[#F7F7F5] p-5">
                            <p className="text-sm font-medium">Demo payment</p>
                            <p className="mt-2 text-sm text-[#8A8A86]">This creates an order with payment pending. No card details are collected and no money will be charged.</p>
                            <p className="mt-4 text-[10px] uppercase tracking-[0.2em]">Live payment gateway not connected</p>
                          </div>
                        </div>
                      )}

                      {checkoutError && <p role="alert" className="text-sm text-[#B3261E]">{checkoutError}</p>}

                      <div className="flex justify-between gap-4 pt-4">
                        <button type="button" className="border border-[#D8D8D4] px-5 py-3 text-[10px] uppercase tracking-[0.24em] disabled:opacity-30" disabled={checkoutStep === 0} onClick={() => setCheckoutStep((step) => step - 1)}>
                          Back
                        </button>
                        <button type="button" disabled={checkoutBusy} className="border border-black bg-black px-6 py-3 text-[10px] uppercase tracking-[0.24em] text-white hover:bg-[#30302E] disabled:opacity-50" onClick={checkoutStep === 2 ? handlePlaceOrder : advanceCheckout}>
                          {checkoutBusy ? 'Saving order' : checkoutStep === 2 ? 'Place demo order' : 'Continue'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <aside className="lg:sticky lg:top-28 lg:h-fit">
                <div className="border border-[#D8D8D4] bg-[#F7F7F5] p-6 md:p-8">
                  <div className="mb-6 flex items-center justify-between border-b border-[#D8D8D4] pb-4">
                    <p className="nav-label text-[#8A8A86]">Order summary</p>
                    <span className="text-sm text-black">{checkoutItemCount} {checkoutItemCount === 1 ? 'item' : 'items'}</span>
                  </div>
                  <div className="space-y-4">
                    {bag.map((item) => (
                      <div key={`${item.id}-${item.size}`} className="flex gap-4 border-b border-[#D8D8D4] pb-4">
                        <div className="h-20 w-16 overflow-hidden border border-[#D8D8D4] bg-white">
                          <img src={productCatalog.find((product) => product.id === item.id)?.gallery[0]} alt={item.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="flex w-full flex-col justify-between">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-medium">{item.name}</p>
                              <p className="text-[10px] uppercase tracking-[0.18em] text-[#8A8A86]">Size {item.size}</p>
                            </div>
                            <p className="text-sm">{formatPrice(item.price * item.quantity)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 space-y-3 text-sm">
                    <div className="flex items-center justify-between"><span>Subtotal</span><span>{formatPrice(showSuccess ? completedOrder?.subtotal || 0 : subtotal)}</span></div>
                    <div className="flex items-center justify-between"><span>Shipping</span><span>{(showSuccess ? completedOrder?.shipping : shipping) === 0 ? 'Free' : formatPrice(showSuccess ? completedOrder?.shipping || 0 : shipping)}</span></div>
                    <div className="flex items-center justify-between border-t border-[#D8D8D4] pt-3 text-base font-medium"><span>Total</span><span>{formatPrice(showSuccess ? completedOrder?.total || 0 : total)}</span></div>
                  </div>
                </div>
              </aside>
            </div>
          </section>
        </motion.div>
      )
    }

    return (
      <motion.div key="home" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.45, ease: 'easeOut' }}>
        <section className="relative h-[92vh] min-h-[680px] overflow-hidden">
          <img src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1600&q=80" alt="AUREVÉ editorial hero" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/10 to-black/30" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-12">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }} className="max-w-xl">
              <p className="nav-label mb-4 text-white/70">Autumn / Winter 26</p>
              <h1 className="font-display text-6xl leading-[0.9] md:text-[7rem]">Quiet luxury in motion.</h1>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button type="button" className="inline-flex items-center gap-3 border border-white bg-white px-6 py-4 text-[11px] uppercase tracking-[0.26em] text-black transition-colors hover:bg-[#F7F7F5] focus-ring" onClick={() => openCollection('women')}>
                  Explore women <ArrowRight className="h-4 w-4" />
                </button>
                <button type="button" className="border border-white/70 bg-transparent px-6 py-4 text-[11px] uppercase tracking-[0.26em] text-white focus-ring" onClick={() => openCollection('men')}>
                  Explore men
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="mx-auto max-w-[1400px] px-4 py-20 md:px-8">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="nav-label text-[#686864]">{bestSellingProducts.length ? 'Most purchased' : 'A considered selection'}</p>
              <h2 className="font-display text-5xl md:text-6xl">{bestSellingProducts.length ? 'Best sellers' : 'The AUREVÉ edit'}</h2>
            </div>
            <button type="button" className="hidden border border-[#D8D8D4] px-5 py-3 text-[10px] uppercase tracking-[0.24em] md:inline-flex" onClick={() => openCollection()}>
              Shop collection
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {featuredHomeProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                canQuickAdd={canQuickAdd(product)}
                onClick={() => openProduct(product)}
                onQuickAdd={() => handleQuickAdd(product)}
              />
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[1400px] px-4 pb-20 md:px-8">
          <div className="mb-8 max-w-xl">
            <p className="nav-label text-[#686864]">Explore AUREVÉ</p>
            <h2 className="mt-3 font-display text-5xl md:text-6xl">Find your point of view.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {homeCollections.map((collection) => (
              <button key={collection.mode} type="button" className="group relative aspect-[4/5] overflow-hidden bg-[#E9E7E2] text-left text-white" onClick={() => openCollection(collection.mode)}>
                <img src={collection.product.gallery[0]} alt={`${collection.label} collection`} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <span className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />
                <span className="absolute inset-x-0 bottom-0 p-5 md:p-7">
                  <span className="nav-label text-white/80">Collection</span>
                  <span className="mt-2 block font-display text-4xl md:text-5xl">{collection.label}</span>
                  <span className="mt-2 block text-sm text-white/85">{collection.detail}</span>
                  <span className="mt-4 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em]">Discover <ArrowRight className="h-3 w-3" /></span>
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="relative overflow-hidden border-t border-[#D8D8D4]">
          <img src="https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=1800&q=80" alt="AUREVÉ editorial campaign" className="h-[480px] w-full object-cover md:h-[780px]" />
          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-5 bg-gradient-to-t from-black/40 to-transparent p-6 text-white md:p-12">
            <p className="nav-label text-white/70">Editorial</p>
            <h2 className="font-display text-5xl md:text-7xl">Material memory.</h2>
            <button type="button" className="inline-flex w-fit items-center gap-3 border border-white bg-white px-6 py-4 text-[11px] uppercase tracking-[0.26em] text-black focus-ring" onClick={() => openCollection()}>
              Discover the story <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      </motion.div>
    )
  }

  const isHeaderSolid = headerSolid || currentView !== 'home'
  const whatsappLink = `https://wa.me/${contactDetails.whatsapp.replace(/\D/g, '')}`
  const phoneLink = `tel:${contactDetails.phone.replace(/[^\d+]/g, '')}`

  return (
    <div className="min-h-screen bg-[#F7F7F5] text-black">
      <header className={`fixed inset-x-0 top-0 z-50 border-b border-transparent transition-all duration-300 ${isHeaderSolid ? 'border-[#D8D8D4] bg-white/95 text-black shadow-[0_10px_30px_rgba(0,0,0,0.04)] backdrop-blur-sm' : 'bg-transparent text-white'}`}>
        <div className="mx-auto flex h-20 max-w-[1440px] items-center gap-4 px-4 md:px-8">
          <button type="button" className="flex h-10 w-10 items-center justify-center border border-transparent md:hidden" onClick={() => setMobileMenuOpen(true)} aria-label="Open mobile navigation">
            <Menu className="h-5 w-5" />
          </button>

          <button type="button" className="font-display text-3xl leading-none md:hidden" onClick={navigateHome} aria-label="AUREVÉ home">
            AUREVÉ
          </button>

          <button type="button" className="hidden items-center gap-2 md:flex" onClick={navigateHome} aria-label="AUREVÉ home">
            <span className="font-display text-4xl leading-none">AUREVÉ</span>
          </button>

          <nav className="ml-auto hidden items-center justify-end gap-8 md:flex">
            {navItems.map((item) => (
              <button
                key={item}
                type="button"
                className={`text-[12px] font-semibold uppercase tracking-[0.2em] transition-colors ${isHeaderSolid ? 'text-black hover:text-[#686864]' : 'text-white hover:text-white/80'}`}
                onClick={() => { if (item === 'Journal') setCurrentView('journal'); else if (item === 'New In' || item === 'Women' || item === 'Men' || item === 'Accessories') openCollection(item === 'Men' ? 'men' : item === 'Women' ? 'women' : item === 'Accessories' ? 'accessories' : 'new'); else setCurrentView('home'); }}
              >
                {item}
              </button>
            ))}
          </nav>

          <div className="ml-1 flex items-center gap-3">
            <button type="button" className={`flex h-10 w-10 items-center justify-center border ${isHeaderSolid ? 'border-[#D8D8D4] bg-transparent text-black' : 'border-white/40 bg-transparent text-white'} focus-ring`} aria-label="Search" onClick={() => { setSearchQuery(''); setSearchOpen(true); }}>
              <Search className="h-4 w-4" />
            </button>
            <button type="button" className={`hidden h-10 w-10 items-center justify-center border md:flex ${isHeaderSolid ? 'border-[#D8D8D4] bg-transparent text-black' : 'border-white/40 bg-transparent text-white'} focus-ring`} aria-label={user ? `Account for ${user.name}` : 'Account'} onClick={() => { setAuthError(''); setAuthOpen(true); }}>
              <User className="h-4 w-4" />
            </button>
            <button type="button" className={`relative flex h-10 w-10 items-center justify-center border ${isHeaderSolid ? 'border-[#D8D8D4] bg-transparent text-black' : 'border-white/40 bg-transparent text-white'} focus-ring`} aria-label="Shopping bag" onClick={() => setCartOpen(true)}>
              <ShoppingBag className="h-4 w-4" />
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center bg-black px-1 text-[9px] text-white">{bagItemCount}</span>
            </button>
          </div>
        </div>
      </header>

      <main>{renderView()}</main>

      <footer className="border-t border-[#D8D8D4] bg-white">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-12 md:grid-cols-[1fr_0.7fr_1fr] md:px-8 md:py-16">
          <div>
            <p className="nav-label text-[#686864]">AUREVÉ</p>
            <p className="mt-3 max-w-sm font-display text-3xl leading-tight">Considered pieces for modern living.</p>
          </div>
          <nav aria-label="Footer navigation">
            <p className="nav-label mb-4 text-[#686864]">Explore</p>
            <div className="flex flex-col items-start gap-3 text-sm">
              <button type="button" className="hover:text-[#686864]" onClick={() => openCollection()}>New In</button>
              <button type="button" className="hover:text-[#686864]" onClick={() => openCollection('women')}>Women</button>
              <button type="button" className="hover:text-[#686864]" onClick={() => setCurrentView('journal')}>Journal</button>
              <button type="button" className="hover:text-[#686864]" onClick={() => openCollection('accessories')}>Accessories</button>
            </div>
          </nav>
          <div>
            <p className="nav-label mb-4 text-[#686864]">Contact</p>
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <a className="underline decoration-[#D8D8D4] underline-offset-4 hover:text-[#686864]" href={`mailto:${contactDetails.email}`}>Email · {contactDetails.email}</a>
              <a className="underline decoration-[#D8D8D4] underline-offset-4 hover:text-[#686864]" href={whatsappLink} target="_blank" rel="noreferrer">WhatsApp · {contactDetails.whatsapp}</a>
              <a className="underline decoration-[#D8D8D4] underline-offset-4 hover:text-[#686864]" href={contactDetails.instagram} target="_blank" rel="noreferrer">Instagram</a>
              <a className="underline decoration-[#D8D8D4] underline-offset-4 hover:text-[#686864]" href={phoneLink}>Phone · {contactDetails.phone}</a>
            </div>
            <p className="mt-4 text-[10px] uppercase tracking-[0.16em] text-[#8A8A86]">Demo contact details · update in CMS before launch</p>
          </div>
        </div>
        <div className="border-t border-[#D8D8D4]">
          <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-4 px-4 py-5 text-xs text-[#686864] sm:flex-row md:px-8">
            <span>Indonesia · IDR</span>
            <button type="button" className="font-display text-2xl text-black" onClick={navigateHome} aria-label="AUREVÉ home">AUREVÉ</button>
            <span>© AUREVÉ 2026</span>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[140] bg-black/40 px-4 py-6 backdrop-blur-[2px]"
            onMouseDown={(event) => { if (event.target === event.currentTarget) setSearchOpen(false); }}
          >
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-labelledby="search-title"
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              onKeyDown={(event) => { if (event.key === 'Escape') setSearchOpen(false); }}
              className="mx-auto mt-10 max-h-[calc(100vh-5rem)] w-full max-w-3xl overflow-hidden border border-[#D8D8D4] bg-[#F7F7F5]"
            >
              <div className="flex items-center gap-4 border-b border-[#D8D8D4] px-5 py-4 md:px-7">
                <Search className="h-5 w-5 shrink-0 text-[#686864]" />
                <label id="search-title" htmlFor="store-search" className="sr-only">Search products and journal</label>
                <input
                  id="store-search"
                  type="search"
                  autoFocus
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search products, materials, journal..."
                  className="min-w-0 flex-1 bg-transparent py-2 text-base text-black outline-none placeholder:text-[#8A8A86] md:text-lg"
                />
                <button type="button" className="flex h-9 w-9 shrink-0 items-center justify-center border border-[#D8D8D4] bg-white" aria-label="Close search" onClick={() => setSearchOpen(false)}>
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="max-h-[calc(100vh-11rem)] space-y-6 overflow-y-auto p-5 md:p-7">
                {searchProducts.length > 0 && (
                  <section aria-label="Product search results">
                    <p className="nav-label mb-3 text-[#686864]">Products</p>
                    <div className="divide-y divide-[#D8D8D4]">
                      {searchProducts.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          className="flex w-full items-center gap-4 py-3 text-left hover:bg-white"
                          onClick={() => { openProduct(product); setSearchOpen(false); }}
                        >
                          <img src={product.gallery[0]} alt="" className="h-16 w-12 shrink-0 object-cover" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium">{product.name}</span>
                            <span className="mt-1 block text-xs text-[#686864]">{product.category} · {product.color}</span>
                          </span>
                          <span className="shrink-0 text-xs">{formatPrice(product.price)}</span>
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                {searchArticles.length > 0 && (
                  <section aria-label="Journal search results">
                    <p className="nav-label mb-3 text-[#686864]">Journal</p>
                    <div className="divide-y divide-[#D8D8D4]">
                      {searchArticles.map((article) => (
                        <button
                          key={article.id}
                          type="button"
                          className="flex w-full items-center gap-4 py-3 text-left hover:bg-white"
                          onClick={() => { setSelectedArticle(article); setCurrentView('article'); setSearchOpen(false); }}
                        >
                          <img src={article.image} alt="" className="h-16 w-12 shrink-0 object-cover" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium">{article.title}</span>
                            <span className="mt-1 block text-xs text-[#686864]">{article.category}</span>
                          </span>
                          <ArrowRight className="h-4 w-4 shrink-0" />
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                {normalizedSearchQuery && searchProducts.length === 0 && searchArticles.length === 0 && (
                  <p role="status" className="py-8 text-center text-sm text-[#686864]">No results found for “{searchQuery.trim()}”.</p>
                )}
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-[#F7F7F5] md:hidden">
            <div className="flex items-center justify-between border-b border-[#D8D8D4] px-4 py-5">
              <button type="button" className="font-display text-3xl" onClick={navigateHome} aria-label="AUREVÉ home">AUREVÉ</button>
              <button type="button" className="flex h-10 w-10 items-center justify-center border border-[#D8D8D4]" onClick={() => setMobileMenuOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex h-[calc(100%-80px)] flex-col justify-between p-6">
              <div className="space-y-5">
                {navItems.map((item) => (
                  <button key={item} type="button" className="block w-full border-b border-[#D8D8D4] py-4 text-left text-2xl font-display" onClick={() => { if (item === 'Journal') setCurrentView('journal'); else if (item === 'New In' || item === 'Women' || item === 'Men' || item === 'Accessories') openCollection(item === 'Men' ? 'men' : item === 'Women' ? 'women' : item === 'Accessories' ? 'accessories' : 'new'); else setCurrentView('home'); setMobileMenuOpen(false); }}>
                    {item}
                  </button>
                ))}
              </div>
              <button type="button" className="border border-black bg-black px-5 py-4 text-[10px] uppercase tracking-[0.26em] text-white" onClick={() => { setAuthOpen(true); setMobileMenuOpen(false); }}>
                Login / Register
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {authOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] flex items-end justify-center bg-black/40 backdrop-blur-[2px] md:items-center md:p-4">
            <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }} transition={{ duration: 0.28, ease: 'easeOut' }} className="relative mx-auto max-h-[90vh] w-full max-w-[560px] overflow-y-auto border border-[#D8D8D4] bg-[#F7F7F5] p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="nav-label text-[#8A8A86]">Account</p>
                  <h3 className="font-display text-4xl">{user ? 'Your account' : authMode === 'register' ? 'Create account' : authMode === 'forgot' ? 'Reset password' : authMode === 'reset' ? 'Choose a new password' : 'Welcome back'}</h3>
                </div>
                <button type="button" className="flex h-10 w-10 items-center justify-center border border-[#D8D8D4] bg-white" onClick={() => setAuthOpen(false)}>
                  <X className="h-4 w-4" />
                </button>
              </div>
              {user ? (
                <div className="space-y-5">
                  <p className="text-sm">Signed in as <strong>{user.email}</strong></p>
                  <div className="flex flex-wrap gap-3">
                    {user.role === 'customer' && <button type="button" className="border border-[#D8D8D4] bg-white px-5 py-3 text-[10px] uppercase tracking-[0.24em]" onClick={() => { setCurrentView('orders'); setAuthOpen(false); }}>
                      Order history
                    </button>}
                  </div>
                  <button type="button" className="border border-black bg-black px-5 py-3 text-[10px] uppercase tracking-[0.24em] text-white" onClick={handleLogout}>
                    Sign out
                  </button>
                </div>
              ) : (
                <form className="space-y-5" onSubmit={handleAuthSubmit}>
                  {authNotice && <p role="status" className="border border-[#D8D8D4] bg-white px-4 py-3 text-sm">{authNotice}</p>}
                  <div className="space-y-4">
                    {authMode === 'register' && (
                      <InputField label="Full name" value={authForm.name} onChange={(value) => setAuthForm((form) => ({ ...form, name: value }))} required autoComplete="name" />
                    )}
                    {authMode !== 'reset' && <InputField label="Email address" type="email" value={authForm.email} onChange={(value) => setAuthForm((form) => ({ ...form, email: value }))} required autoComplete="email" />}
                    {authMode !== 'forgot' && <InputField label={authMode === 'reset' ? 'New password' : 'Password'} type="password" value={authForm.password} onChange={(value) => setAuthForm((form) => ({ ...form, password: value }))} required autoComplete={authMode === 'register' || authMode === 'reset' ? 'new-password' : 'current-password'} />}
                  </div>
                  {authError && <p role="alert" className="text-sm text-[#B3261E]">{authError}</p>}
                  <button type="submit" disabled={authBusy} className="w-full border border-black bg-black px-5 py-4 text-[10px] uppercase tracking-[0.24em] text-white disabled:opacity-50">
                    {authBusy ? 'Please wait' : authMode === 'register' ? 'Create account' : authMode === 'forgot' ? 'Send reset link' : authMode === 'reset' ? 'Update password' : 'Sign in'}
                  </button>
                  {authMode === 'login' && (
                    <>
                      <button type="button" className="w-full py-2 text-[10px] uppercase tracking-[0.2em] text-[#8A8A86]" onClick={() => { setAuthMode('forgot'); setAuthError(''); setAuthNotice(''); }}>
                        Forgot your password?
                      </button>
                      <button type="button" disabled={authBusy} className="w-full py-2 text-[10px] uppercase tracking-[0.2em] text-[#8A8A86] disabled:opacity-50" onClick={handleResendVerification}>
                        Resend verification email
                      </button>
                    </>
                  )}
                  <button type="button" className="w-full py-2 text-[10px] uppercase tracking-[0.2em] text-[#8A8A86]" onClick={() => {
                    setAuthMode(authMode === 'register' ? 'login' : 'register')
                    setAuthError('')
                    setAuthNotice('')
                    setAuthForm((form) => ({ ...form, password: '' }))
                  }}>
                    {authMode === 'register' ? 'Already have an account? Sign in' : authMode === 'login' ? 'New to AUREVÉ? Create an account' : 'Back to sign in'}
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {filtersOpen && (
          <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.32, ease: 'easeOut' }} className="fixed right-0 top-0 z-[120] flex h-screen w-full max-w-md flex-col overflow-y-auto border-l border-[#D8D8D4] bg-[#F7F7F5] p-6">
            <div className="mb-6 flex items-center justify-between border-b border-[#D8D8D4] pb-4">
              <div>
                <p className="nav-label text-[#8A8A86]">Refine</p>
                <h3 className="font-display text-4xl">Filters</h3>
              </div>
              <button type="button" className="flex h-10 w-10 items-center justify-center border border-[#D8D8D4] bg-white" onClick={() => setFiltersOpen(false)}>
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <p className="nav-label text-[#8A8A86]">Category</p>
                <div className="mt-3 space-y-2">
                  {activeFilterOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setSelectedFilter(option)}
                      className={`flex w-full items-center justify-between border px-4 py-3 text-left text-sm ${selectedFilter === option ? 'border-black bg-black text-white' : 'border-[#D8D8D4] bg-white text-black'}`}
                    >
                      <span>{option}</span>
                      {selectedFilter === option && <Check className="h-4 w-4" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="nav-label text-[#8A8A86]">Price</p>
                <select value={priceFilter} onChange={(event) => setPriceFilter(event.target.value)} className="mt-3 w-full border border-[#D8D8D4] bg-white px-4 py-3 text-sm focus-ring">
                  <option value="all">All prices</option>
                  <option value="under-3m">Under Rp3.000.000</option>
                  <option value="3m-6m">Rp3.000.000–Rp5.999.999</option>
                  <option value="6m-9m">Rp6.000.000–Rp9.000.000</option>
                  <option value="over-9m">Over Rp9.000.000</option>
                </select>
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-[#D8D8D4] pt-5">
                <button type="button" className="text-xs uppercase tracking-[0.18em] underline underline-offset-4" onClick={() => { setSelectedFilter('All'); setPriceFilter('all'); }}>
                  Clear filters
                </button>
                <button type="button" className="border border-black bg-black px-5 py-3 text-[10px] uppercase tracking-[0.2em] text-white" onClick={() => setFiltersOpen(false)}>
                  Show {filteredProducts.length} {filteredProducts.length === 1 ? 'piece' : 'pieces'}
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {cartOpen && (
          <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.32, ease: 'easeOut' }} className="fixed right-0 top-0 z-[130] flex h-[100dvh] w-[min(88vw,24rem)] flex-col overflow-hidden border-l border-[#D8D8D4] bg-[#F7F7F5] p-5 sm:p-6 md:w-full">
            <div className="mb-6 flex items-center justify-between border-b border-[#D8D8D4] pb-4">
              <div>
                <p className="nav-label text-[#8A8A86]">Your bag</p>
                <h3 className="font-display text-4xl">{bagItemCount} {bagItemCount === 1 ? 'item' : 'items'}</h3>
              </div>
              <button type="button" className="flex h-10 w-10 items-center justify-center border border-[#D8D8D4] bg-white" onClick={() => setCartOpen(false)}>
                <X className="h-4 w-4" />
              </button>
            </div>

            {bag.length === 0 ? (
              <div className="flex h-[calc(100%-90px)] flex-col items-center justify-center gap-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center border border-[#D8D8D4] bg-white">
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-display text-4xl">Your bag is empty</p>
                  <p className="mt-2 text-sm text-[#8A8A86]">Curate a look from the latest collection.</p>
                </div>
                <button type="button" className="border border-black bg-black px-6 py-4 text-[10px] uppercase tracking-[0.26em] text-white" onClick={() => { setCartOpen(false); openCollection(); }}>
                  Continue shopping
                </button>
              </div>
            ) : (
              <div className="flex h-[calc(100%-90px)] flex-col justify-between">
                <div className="space-y-4 overflow-y-auto pr-1">
                  {bag.map((item) => (
                    <div key={`${item.id}-${item.size}`} className="flex gap-4 border-b border-[#D8D8D4] pb-4">
                      <div className="h-28 w-24 overflow-hidden border border-[#D8D8D4] bg-white">
                        <img src={productCatalog.find((product) => product.id === item.id)?.gallery[0] || '/placeholder.png'} alt={item.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex w-full flex-col justify-between gap-2">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium">{item.name}</p>
                            <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#8A8A86]">Size {item.size}</p>
                          </div>
                          <button type="button" className="text-[10px] uppercase tracking-[0.18em] text-[#686864] underline underline-offset-4 hover:text-black" aria-label={`Remove ${item.name} from bag`} onClick={() => setBag((current) => current.filter((bagItem) => !(bagItem.id === item.id && bagItem.size === item.size)))}>Remove</button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 border border-[#D8D8D4] bg-white">
                            <button type="button" className="flex h-8 w-8 items-center justify-center" aria-label={`Decrease quantity of ${item.name}`} onClick={() => setBag((current) => current.flatMap((bagItem) => {
                              if (bagItem.id !== item.id || bagItem.size !== item.size) return [bagItem]
                              return bagItem.quantity > 1 ? [{ ...bagItem, quantity: bagItem.quantity - 1 }] : []
                            }))}>
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="min-w-6 text-center text-xs">{item.quantity}</span>
                            <button
                              type="button"
                              disabled={item.quantity >= (productCatalog.find((product) => product.id === item.id)?.stockBySize?.[item.size] || 0)}
                              className="flex h-8 w-8 items-center justify-center disabled:cursor-not-allowed disabled:opacity-40"
                              aria-label={`Increase quantity of ${item.name}`}
                              onClick={() => setBag((current) => current.map((bagItem) => bagItem.id === item.id && bagItem.size === item.size ? { ...bagItem, quantity: bagItem.quantity + 1 } : bagItem))}
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <p className="text-sm">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[#D8D8D4] pt-4">
                  <div className="mb-4 flex items-center justify-between text-sm"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                  <button type="button" className="w-full border border-black bg-black px-6 py-4 text-[10px] uppercase tracking-[0.24em] text-white" onClick={() => { setCartOpen(false); setCurrentView('checkout'); }}>
                    Checkout
                  </button>
                </div>
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  )
}

function ProductCard({ product, canQuickAdd, onClick, onQuickAdd }) {
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <div className="group relative overflow-hidden border border-[#D8D8D4] bg-[#F7F7F5]">
      <div className="relative overflow-hidden bg-[#F7F7F5]">
        {!imageLoaded && <div className="absolute inset-0 animate-pulse bg-[#F7F7F5]" />}
        <button type="button" onClick={onClick} className="block w-full overflow-hidden text-left">
          <img src={product.gallery[0]} alt={product.name} className={`h-[360px] w-full object-cover transition duration-700 ease-out group-hover:scale-110 group-hover:brightness-[0.98] ${imageLoaded ? 'opacity-100' : 'opacity-0'}`} onLoad={() => setImageLoaded(true)} />
        </button>
        <div className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-center bg-black/40 p-3 text-white opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 md:group-hover:flex">
          <button
            type="button"
            disabled={!canQuickAdd}
            className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] disabled:cursor-not-allowed"
            onClick={(event) => { event.preventDefault(); event.stopPropagation(); onQuickAdd(); }}
          >
            {canQuickAdd ? <>Quick add <ArrowRight className="h-3 w-3" /></> : 'Out of stock'}
          </button>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="nav-label text-[#8A8A86]">{product.category}</p>
            <button type="button" onClick={onClick} className="mt-1 block text-left text-xl font-medium leading-none hover:text-[#8A8A86]">
              {product.name}
            </button>
          </div>
          <button type="button" className="flex h-9 w-9 shrink-0 items-center justify-center border border-[#D8D8D4] bg-white" aria-label={`Save ${product.name}`}>
            <Heart className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">{formatPrice(product.price)}</span>
          <span className="text-[10px] uppercase tracking-[0.18em] text-[#8A8A86]">{product.color}</span>
        </div>
      </div>
    </div>
  )
}

function AccordionItem({ title, content, isOpen, onToggle }) {
  return (
    <div className="border-t border-[#D8D8D4] pt-3">
      <button type="button" className="flex w-full items-center justify-between py-1 text-left" onClick={onToggle}>
        <span className="text-sm uppercase tracking-[0.18em] text-black">{title}</span>
        <span className="flex h-7 w-7 items-center justify-center border border-[#D8D8D4] bg-white">
          {isOpen ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22, ease: 'easeOut' }} className="overflow-hidden">
            <p className="pb-2 pt-3 text-sm leading-relaxed text-[#8A8A86]">{content}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function InputField({ label, type = 'text', value, onChange, required = false, autoComplete }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] uppercase tracking-[0.18em] text-[#8A8A86]">{label}</span>
      <input type={type} value={value} onChange={(event) => onChange?.(event.target.value)} required={required} autoComplete={autoComplete} className="w-full border-b border-[#D8D8D4] bg-transparent px-0 py-3 text-sm text-black outline-none placeholder:text-[#8A8A86] focus:border-black" placeholder="" />
    </label>
  )
}

function CmsImagePicker({ label, images, onFilesSelected, onRemove, busy, multiple = false, required = false }) {
  return (
    <div className="space-y-3">
      <label className="block">
        <span className="mb-2 block text-[10px] uppercase tracking-[0.18em] text-[#686864]">{label}</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple={multiple}
          required={required}
          disabled={busy}
          onChange={onFilesSelected}
          className="block w-full border border-[#D8D8D4] bg-[#F7F7F5] text-sm file:mr-4 file:border-0 file:bg-black file:px-4 file:py-3 file:text-[10px] file:uppercase file:tracking-[0.16em] file:text-white disabled:opacity-50"
        />
      </label>
      <p className="text-xs leading-relaxed text-[#686864]">
        JPG, PNG, WEBP, or GIF. Maximum 8 MB per file{multiple ? '; up to 5 images.' : '.'}
      </p>
      {busy && <p role="status" className="text-xs text-[#686864]">Uploading image…</p>}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {images.map((image, index) => (
            <div key={`${image}-${index}`} className="relative aspect-square overflow-hidden border border-[#D8D8D4] bg-[#F7F7F5]">
              <img src={image} alt={`${label} preview ${index + 1}`} className="h-full w-full object-cover" />
              <button type="button" className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center bg-black text-white" aria-label={`Remove image ${index + 1}`} onClick={() => onRemove(index)}>
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CmsField({ label, value, onChange, type = 'text', required = false, rows = 4 }) {
  const fieldClassName = 'w-full border border-[#D8D8D4] bg-[#F7F7F5] px-3 py-3 text-sm text-black outline-none focus:border-black'
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] uppercase tracking-[0.18em] text-[#8A8A86]">{label}</span>
      {type === 'textarea' ? (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} required={required} rows={rows} className={`${fieldClassName} resize-y`} />
      ) : (
        <input type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} min={type === 'number' ? 1 : undefined} className={fieldClassName} />
      )}
    </label>
  )
}

export default App
