import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authApi } from '../lib/api'
import { Spinner } from '../components/ui'

export default function RegisterPage() {
    const navigate = useNavigate()
    const [form,    setForm]    = useState({ name: '', email: '', password: '', role: 'cashier' })
    const [error,   setError]   = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            // PHASE 1 CHANGE: Pass the selected role to the API.
            // The backend will only accept "cashier" or "customer" from this endpoint.
            await authApi.register(form.name, form.email, form.password, form.role)
            navigate('/login')
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-surface flex items-center justify-center px-4">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
            <div className="w-full max-w-sm relative">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center mb-4 shadow-glow">
                        <span className="text-white font-bold text-xl">P</span>
                    </div>
                    <h1 className="text-xl font-semibold text-white">Create account</h1>
                    <p className="text-muted text-sm mt-1">Get started with your POS account</p>
                </div>

                <div className="card p-6">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <label className="text-xs text-muted mb-1.5 block">Full name</label>
                            <input type="text" className="input" placeholder="Jane Smith"
                                value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                        </div>
                        <div>
                            <label className="text-xs text-muted mb-1.5 block">Email</label>
                            <input type="email" className="input" placeholder="you@example.com"
                                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                        </div>
                        <div>
                            <label className="text-xs text-muted mb-1.5 block">Password</label>
                            <input type="password" className="input" placeholder="••••••••"
                                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
                        </div>

                        {/* PHASE 1 CHANGE: Role selector.
                            A store employee registers as cashier.
                            A remote customer registers as customer.
                            Admin cannot be self-registered. */}
                        <div>
                            <label className="text-xs text-muted mb-1.5 block">I am registering as</label>
                            <div className="flex rounded-lg overflow-hidden border border-border">
                                {[
                                    { value: 'cashier',  label: 'Store staff' },
                                    { value: 'customer', label: 'Customer'    },
                                ].map(opt => (
                                    <button
                                        type="button"
                                        key={opt.value}
                                        onClick={() => setForm(f => ({ ...f, role: opt.value }))}
                                        className={`flex-1 py-2 text-xs font-medium transition-colors ${
                                            form.role === opt.value
                                                ? 'bg-accent text-white'
                                                : 'text-muted hover:text-white'
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {error && (
                            <div className="text-danger text-xs bg-danger/5 border border-danger/20 rounded-lg px-3 py-2">
                                {error}
                            </div>
                        )}

                        <button type="submit" disabled={loading} className="btn-primary flex items-center justify-center gap-2 py-2.5 mt-1">
                            {loading ? <Spinner size="sm" /> : null}
                            {loading ? 'Creating account…' : 'Create account'}
                        </button>
                    </form>
                </div>

                <p className="text-center text-muted text-xs mt-4">
                    Already have an account?{' '}
                    <Link to="/login" className="text-accent hover:text-accent-hover transition-colors">Sign in</Link>
                </p>
            </div>
        </div>
    )
}
