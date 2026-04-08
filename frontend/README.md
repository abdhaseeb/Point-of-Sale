# POS Frontend

A minimalist React + Vite + Tailwind frontend for the POS backend system.

## Tech Stack

- **React 18** + **Vite 5** — fast dev server with HMR
- **Tailwind CSS 3** — utility-first styling
- **React Router v6** — client-side routing
- **DM Sans + DM Mono** — clean, modern typography

## Project Structure

```
src/
├── lib/
│   └── api.js              # All API calls (auth, products, cart, orders)
├── context/
│   ├── AuthContext.jsx     # JWT auth state, login/logout, token decode
│   └── CartContext.jsx     # Cart state, add/remove/clear helpers
├── hooks/
│   └── useToast.js         # Toast notification hook
├── components/
│   ├── ui/
│   │   └── index.jsx       # Spinner, Toast, Modal, StatusBadge, StatCard…
│   └── layout/
│       ├── AppLayout.jsx   # Sidebar + main content shell
│       ├── Sidebar.jsx     # Nav with cart count badge + role display
│       └── ProtectedRoute.jsx
├── pages/
│   ├── LoginPage.jsx       # POST /api/auth/login
│   ├── RegisterPage.jsx    # POST /api/auth/register
│   ├── DashboardPage.jsx   # Stats overview, recent orders, inventory
│   ├── ProductsPage.jsx    # GET /api/products, POST (admin only)
│   ├── CartPage.jsx        # Full cart + checkout with idempotency key
│   └── OrdersPage.jsx      # My orders + all orders (admin), pay action
├── App.jsx                 # Route tree
└── main.jsx                # React root
```

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure backend URL

The Vite dev server proxies `/api` → `http://localhost:5000`.
If your backend runs on a different port, update `vite.config.js`:

```js
proxy: {
  '/api': {
    target: 'http://localhost:YOUR_PORT',
    changeOrigin: true,
  }
}
```

### 3. Start the dev server

```bash
npm run dev
```

Open `http://localhost:5173`

### 4. Build for production

```bash
npm run build
```

---

## API Mapping

| Page | Method | Endpoint | Auth | Role |
|------|--------|----------|------|------|
| Login | POST | `/api/auth/login` | No | — |
| Register | POST | `/api/auth/register` | No | — |
| Products list | GET | `/api/products` | No | — |
| Create product | POST | `/api/products` | Bearer | admin |
| Get cart | GET | `/api/cart` | Bearer | any |
| Add to cart | POST | `/api/cart/add` | Bearer | cashier, admin |
| Remove from cart | POST | `/api/cart/remove` | Bearer | cashier, admin |
| Clear cart | POST | `/api/cart/clear` | Bearer | cashier, admin |
| Checkout | POST | `/api/orders/checkout` | Bearer + Idempotency-Key | cashier, admin |
| My orders | GET | `/api/orders/my-orders` | Bearer | cashier, admin |
| All orders | GET | `/api/orders` | Bearer | cashier, admin |
| Pay order | POST | `/api/orders/:id/pay` | Bearer + Idempotency-Key | any |

## Auth Flow

- JWT token stored in `localStorage` under `pos_token`
- Token is decoded client-side to extract `id`, `name`, `email`, `role`
- Expired tokens are cleared automatically on page load
- `Authorization: Bearer <token>` header sent on all protected requests

## Idempotency

- **Checkout**: generates `checkout-{timestamp}-{random}` key per attempt
- **Payment**: generates `pay-{orderId}-{timestamp}` key per attempt
- Keys are sent via `Idempotency-Key` request header, matching your backend

## Role-Based UI

| Feature | Admin | Cashier |
|---------|-------|---------|
| Browse products | ✅ | ✅ |
| Add to cart | ✅ | ✅ |
| Checkout | ✅ | ✅ |
| Create products | ✅ | ❌ |
| View all orders | ✅ | ❌ (own only) |
