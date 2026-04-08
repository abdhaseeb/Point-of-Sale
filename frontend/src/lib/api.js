const BASE_URL = '/api'

function getHeaders(withAuth = false) {
  const headers = { 'Content-Type': 'application/json' }
  if (withAuth) {
    const token = localStorage.getItem('pos_token')
    if (token) headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

async function request(method, path, body = null, withAuth = true, extraHeaders = {}) {
  const options = {
    method,
    headers: { ...getHeaders(withAuth), ...extraHeaders },
  }
  if (body) options.body = JSON.stringify(body)

  const res = await fetch(`${BASE_URL}${path}`, options)
  const data = await res.json()

  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

// ── Auth ──────────────────────────────────────────────────
export const authApi = {
  register: (name, email, password) =>
    request('POST', '/auth/register', { name, email, password }, false),

  login: (email, password) =>
    request('POST', '/auth/login', { email, password }, false),
}

// ── Products ──────────────────────────────────────────────
export const productApi = {
  getAll: () =>
    request('GET', '/products'),

  getById: (id) =>
    request('GET', `/products/${id}`),

  create: (data) =>
    request('POST', '/products', data),

  delete: (id) =>
    request('DELETE', `/products/${id}`),
}

// ── Cart ──────────────────────────────────────────────────
export const cartApi = {
  get: () =>
    request('GET', '/cart'),

  add: (productId, quantity) =>
    request('POST', '/cart/add', { productId, quantity }),

  remove: (productId) =>
    request('POST', '/cart/remove', { productId }),

  clear: () =>
    request('POST', '/cart/clear'),
}

// ── Orders ────────────────────────────────────────────────
export const orderApi = {
  checkout: (idempotencyKey) =>
    request('POST', '/orders/checkout', null, true, { 'idempotency-key': idempotencyKey }),

  getAll: () =>
    request('GET', '/orders'),

  getMyOrders: () =>
    request('GET', '/orders/my-orders'),

  pay: (orderId, idempotencyKey) =>
    request('POST', `/orders/${orderId}/pay`, null, true, { 'idempotency-key': idempotencyKey }),
}
