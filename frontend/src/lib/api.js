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

    const res  = await fetch(`${BASE_URL}${path}`, options)
    const data = await res.json()

    if (!res.ok) throw new Error(data.error || 'Request failed')
    return data
}

export const authApi = {
    register: (name, email, password, role) =>
        request('POST', '/auth/register', { name, email, password, role }, false),
    login: (email, password) =>
        request('POST', '/auth/login', { email, password }, false),
}

export const productApi = {
    getAll:  ()     => request('GET',    '/products'),
    getById: (id)   => request('GET',    `/products/${id}`),
    create:  (data) => request('POST',   '/products', data),
    delete:  (id)   => request('DELETE', `/products/${id}`),
}

export const cartApi = {
    get:    ()                     => request('GET',  '/cart'),
    add:    (productId, quantity)  => request('POST', '/cart/add',    { productId, quantity }),
    remove: (productId)            => request('POST', '/cart/remove', { productId }),
    clear:  ()                     => request('POST', '/cart/clear'),
}

export const orderApi = {
    // PHASE 1 CHANGE: checkout now accepts an options object so the caller can
    // pass deliveryType, deliveryAddress, and paymentMethod alongside the key.
    checkout: (idempotencyKey, options = {}) =>
        request('POST', '/orders/checkout', options, true, { 'idempotency-key': idempotencyKey }),

    getAll:        ()              => request('GET',  '/orders'),
    getMyOrders:   ()              => request('GET',  '/orders/my-orders'),
    getDeliveries: ()              => request('GET',  '/orders/delivery'),
    pay:           (orderId, key)  => request('POST', `/orders/${orderId}/pay`, null, true, { 'idempotency-key': key }),

    // PHASE 1 CHANGE: New API call that tells the backend to move a delivery
    // order to its next status (PENDING->CONFIRMED->OUT_FOR_DELIVERY->DELIVERED)
    advance: (orderId) => request('POST', `/orders/${orderId}/advance`),
}
