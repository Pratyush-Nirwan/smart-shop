import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Spinner from '../components/ui/Spinner'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { placeOrder } from '../services/orderService'

function RadioCard({ checked, onChange, title, subtitle, value }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10">
      <input type="radio" checked={checked} onChange={() => onChange(value)} className="mt-1 h-4 w-4 accent-brand-400" />
      <div>
        <p className="text-sm font-extrabold text-white">{title}</p>
        {subtitle ? <p className="mt-1 text-xs text-slate-400">{subtitle}</p> : null}
      </div>
    </label>
  )
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, totals, clearCart } = useCart()
  const { pushToast } = useToast()

  const isEmpty = items.length === 0

  const [step, setStep] = useState(0)
  const [placing, setPlacing] = useState(false)

  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    city: '',
    postalCode: '',
  })

  const [shippingMethod, setShippingMethod] = useState('Standard')
  const [paymentMethod, setPaymentMethod] = useState('Card')

  const stepTitles = ['Address', 'Shipping', 'Payment']

  const canContinue = useMemo(() => {
    if (isEmpty) return false
    if (step === 0) {
      return Boolean(address.fullName.trim() && address.phone.trim() && address.addressLine1.trim() && address.city.trim() && address.postalCode.trim())
    }
    return true
  }, [address, isEmpty, step])

  async function onPlaceOrder() {
    if (isEmpty || placing) return
    setPlacing(true)
    try {
      const res = await placeOrder({
        orderInput: {
          address,
          shippingMethod,
          paymentMethod,
          items: items.map((it) => ({
            productId: it.productId,
            quantity: it.quantity,
            variant: it.variant,
          })),
          totals,
        },
      })

      pushToast({ title: 'Order placed', message: `Order ID: ${res.orderId}`, type: 'success' })
      clearCart()
      navigate('/profile')
    } catch {
      pushToast({ title: 'Order failed', message: 'Please try again.', type: 'error' })
    } finally {
      setPlacing(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Checkout</h1>
          <p className="mt-2 text-sm text-slate-300">Multi-step checkout UI with order summary.</p>
        </div>
        {isEmpty ? (
          <Button variant="secondary" onClick={() => navigate('/products')}>
            Add items first
          </Button>
        ) : null}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-card">
          <div className="flex items-center justify-between gap-3 overflow-x-auto">
            {stepTitles.map((t, i) => {
              const active = i === step
              const done = i < step
              return (
                <div key={t} className="flex items-center gap-2">
                  <div className={`h-10 w-10 rounded-2xl border flex items-center justify-center text-sm font-extrabold ${active ? 'border-brand-400/70 bg-brand-600/20 text-white' : done ? 'border-white/10 bg-white/10 text-white' : 'border-white/10 bg-white/5 text-slate-400'}`}>
                    {done ? '✓' : i + 1}
                  </div>
                  <div className={`hidden sm:block ${active ? 'text-slate-50' : 'text-slate-400'} text-sm font-bold`}>
                    {t}
                  </div>
                  {i < stepTitles.length - 1 ? <div className="hidden sm:block h-px w-6 bg-white/10" /> : null}
                </div>
              )
            })}
          </div>

          <div className="mt-6">
            {step === 0 ? (
              <div className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Full name" value={address.fullName} onChange={(e) => setAddress((p) => ({ ...p, fullName: e.target.value }))} placeholder="e.g. Pratyush" />
                  <Input label="Phone" value={address.phone} onChange={(e) => setAddress((p) => ({ ...p, phone: e.target.value }))} placeholder="e.g. +91 98765 43210" />
                </div>
                <Input
                  label="Address"
                  value={address.addressLine1}
                  onChange={(e) => setAddress((p) => ({ ...p, addressLine1: e.target.value }))}
                  placeholder="House no, Street, Locality"
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="City" value={address.city} onChange={(e) => setAddress((p) => ({ ...p, city: e.target.value }))} placeholder="City" />
                  <Input
                    label="Postal code"
                    value={address.postalCode}
                    onChange={(e) => setAddress((p) => ({ ...p, postalCode: e.target.value }))}
                    placeholder="Postal code"
                  />
                </div>
              </div>
            ) : null}

            {step === 1 ? (
              <div className="grid gap-3">
                <RadioCard
                  checked={shippingMethod === 'Standard'}
                  onChange={setShippingMethod}
                  value="Standard"
                  title="Standard Shipping"
                  subtitle="3-5 business days"
                />
                <RadioCard
                  checked={shippingMethod === 'Express'}
                  onChange={setShippingMethod}
                  value="Express"
                  title="Express Shipping"
                  subtitle="1-2 business days"
                />
                <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4 text-sm text-slate-300">
                  Shipping fees are included in the UI totals (demo rules).
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="grid gap-3">
                <RadioCard
                  checked={paymentMethod === 'Card'}
                  onChange={setPaymentMethod}
                  value="Card"
                  title="Card"
                  subtitle="Credit/Debit UI"
                />
                <RadioCard
                  checked={paymentMethod === 'UPI'}
                  onChange={setPaymentMethod}
                  value="UPI"
                  title="UPI"
                  subtitle="Fast UPI checkout UI"
                />
                <RadioCard
                  checked={paymentMethod === 'Wallet'}
                  onChange={setPaymentMethod}
                  value="Wallet"
                  title="Wallet"
                  subtitle="Wallet payment UI"
                />

                <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
                  <p className="text-sm font-extrabold text-white">Payment details</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <Input
                      label={paymentMethod === 'Card' ? 'Card number' : paymentMethod === 'UPI' ? 'UPI ID' : 'Wallet ID'}
                      value=""
                      onChange={() => {}}
                      placeholder={paymentMethod === 'Card' ? '1234 5678 9012 3456' : paymentMethod === 'UPI' ? 'name@bank' : 'Your wallet'}
                      disabled
                    />
                    <Input
                      label={paymentMethod === 'Card' ? 'Expiry' : 'Reference'}
                      value=""
                      onChange={() => {}}
                      placeholder={paymentMethod === 'Card' ? 'MM/YY' : 'Optional'}
                      disabled
                    />
                  </div>
                  <p className="mt-3 text-xs text-slate-400">
                    UI-only payment method. No real processing in this demo.
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <Button
              variant="secondary"
              disabled={step === 0 || placing}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
            >
              Back
            </Button>
            {step < 2 ? (
              <Button size="lg" disabled={!canContinue} onClick={() => setStep((s) => s + 1)}>
                Continue
              </Button>
            ) : (
              <Button size="lg" disabled={!canContinue || placing} onClick={onPlaceOrder}>
                {placing ? <Spinner size="sm" /> : null}
                Place order
              </Button>
            )}
          </div>
        </section>

        <aside className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-card">
          <h2 className="text-sm font-extrabold text-white">Order Summary</h2>
          <div className="mt-4 grid gap-3">
            {items.slice(0, 5).map((it) => (
              <div key={it.cartKey} className="flex items-start justify-between gap-3 border border-white/10 rounded-2xl bg-slate-950/20 px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-xs font-extrabold text-white">{it.name}</p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Qty {it.quantity}
                  </p>
                </div>
                <p className="text-xs font-extrabold text-white">${(it.price * it.quantity).toFixed(2)}</p>
              </div>
            ))}
            {items.length > 5 ? (
              <p className="text-xs text-slate-400">+ {items.length - 5} more item(s)</p>
            ) : null}

            <div className="pt-3 border-t border-white/10">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300">Subtotal</span>
                <span className="font-extrabold text-white">${totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-slate-300">Discount</span>
                <span className="font-extrabold text-white">-${totals.discount.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-slate-300">Shipping</span>
                <span className="font-extrabold text-white">
                  {totals.shipping === 0 ? 'Free' : `$${totals.shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
                <span className="text-slate-300 font-semibold">Total</span>
                <span className="text-lg font-extrabold text-white">${totals.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
//connect the checkout page to orders, replace the submit logic
