import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Spinner from '../components/ui/Spinner'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { createRazorpayOrder, verifyRazorpayPayment } from '../services/orderService'
import { formatInr } from '../utils/currency'

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

function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject(new Error('Browser environment required'))
    }

    const scriptId = 'razorpay-checkout'
    const existing = document.getElementById(scriptId)

    if (existing) {
      return resolve(true)
    }

    const script = document.createElement('script')
    script.id = scriptId
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => reject(new Error('Unable to load Razorpay checkout script'))
    document.body.appendChild(script)
  })
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, totals, clearCart } = useCart()
  const { token, user } = useAuth()
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

  function selectPaymentMethod(nextMethod) {
    setPaymentMethod(nextMethod)
  }

  async function onPlaceOrder() {
    if (isEmpty || placing || !canContinue) return
    if (!token) {
      pushToast({ title: 'Login required', message: 'Please sign in to pay.', type: 'error' })
      return
    }

    setPlacing(true)
    try {
      await loadRazorpayScript()

      const razorpayOrder = await createRazorpayOrder({
        orderInput: {
          address,
          shippingMethod,
          paymentMethod,
          paymentDetails: {},
          totals,
        },
        token,
      })

      const razorpayOptions = {
        key: razorpayOrder.keyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Smart Shop',
        description: 'Demo checkout payment',
        order_id: razorpayOrder.id,
        prefill: {
          name: address.fullName,
          email: user?.email ?? '',
          contact: address.phone,
        },
        theme: { color: '#10b981' },
        handler: async (response) => {
          try {
            await verifyRazorpayPayment({
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
              orderInput: {
                address,
                shippingMethod,
                paymentMethod,
                paymentDetails: {},
                totals,
              },
              token,
            })

            pushToast({ title: 'Payment successful', message: 'Your order has been placed.', type: 'success' })
            clearCart()
            navigate('/profile')
          } catch (error) {
            pushToast({ title: 'Payment verification failed', message: 'Please try again.', type: 'error' })
          } finally {
            setPlacing(false)
          }
        },
        modal: {
          ondismiss: () => {
            setPlacing(false)
          },
        },
      }

      const rzp = new window.Razorpay(razorpayOptions)
      rzp.open()
    } catch (error) {
      pushToast({ title: 'Payment failed', message: error?.message || 'Please try again.', type: 'error' })
      setPlacing(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Checkout</h1>
          <p className="mt-2 text-sm text-slate-300">Confirm delivery details, choose shipping, and place your order.</p>
        </div>
        {isEmpty ? (
          <Button variant="secondary" onClick={() => navigate('/products')}>
            Continue shopping
          </Button>
        ) : null}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-card">
          <div className="flex items-center justify-between gap-3 overflow-x-auto">
            {stepTitles.map((title, index) => {
              const active = index === step
              const done = index < step
              return (
                <div key={title} className="flex items-center gap-2">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-2xl border text-sm font-extrabold ${active ? 'border-brand-400/70 bg-brand-600/20 text-white' : done ? 'border-white/10 bg-white/10 text-white' : 'border-white/10 bg-white/5 text-slate-400'}`}>
                    {done ? 'OK' : index + 1}
                  </div>
                  <div className={`hidden text-sm font-bold sm:block ${active ? 'text-slate-50' : 'text-slate-400'}`}>
                    {title}
                  </div>
                  {index < stepTitles.length - 1 ? <div className="hidden h-px w-6 bg-white/10 sm:block" /> : null}
                </div>
              )
            })}
          </div>

          <div className="mt-6">
            {step === 0 ? (
              <div className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Full name" value={address.fullName} onChange={(e) => setAddress((prev) => ({ ...prev, fullName: e.target.value }))} placeholder="e.g. Alex Johnson" />
                  <Input label="Phone" value={address.phone} onChange={(e) => setAddress((prev) => ({ ...prev, phone: e.target.value }))} placeholder="e.g. +91 98765 43210" />
                </div>
                <Input
                  label="Address"
                  value={address.addressLine1}
                  onChange={(e) => setAddress((prev) => ({ ...prev, addressLine1: e.target.value }))}
                  placeholder="House no, street, locality"
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="City" value={address.city} onChange={(e) => setAddress((prev) => ({ ...prev, city: e.target.value }))} placeholder="City" />
                  <Input
                    label="Postal code"
                    value={address.postalCode}
                    onChange={(e) => setAddress((prev) => ({ ...prev, postalCode: e.target.value }))}
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
                  Shipping cost is shown in your order summary before you place the order.
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="grid gap-3">
                <RadioCard
                  checked={paymentMethod === 'Card'}
                  onChange={selectPaymentMethod}
                  value="Card"
                  title="Card"
                  subtitle="Credit or debit card"
                />
                <RadioCard
                  checked={paymentMethod === 'UPI'}
                  onChange={selectPaymentMethod}
                  value="UPI"
                  title="UPI"
                  subtitle="Pay with your preferred UPI app"
                />
                <RadioCard
                  checked={paymentMethod === 'Wallet'}
                  onChange={selectPaymentMethod}
                  value="Wallet"
                  title="Wallet"
                  subtitle="Use your saved wallet balance"
                />

                <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4 text-sm text-slate-300">
                  You will enter your card/UPI/wallet details securely in Razorpay on the next step.
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <Button variant="secondary" disabled={step === 0 || placing} onClick={() => setStep((current) => Math.max(0, current - 1))}>
              Back
            </Button>
            {step < 2 ? (
              <Button size="lg" disabled={!canContinue} onClick={() => setStep((current) => current + 1)}>
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
            {items.slice(0, 5).map((item) => (
              <div key={item.cartKey} className="flex items-start justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/20 px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-xs font-extrabold text-white">{item.name}</p>
                  <p className="mt-1 text-[11px] text-slate-400">Qty {item.quantity}</p>
                </div>
                <p className="text-xs font-extrabold text-white">{formatInr(item.price * item.quantity)}</p>
              </div>
            ))}
            {items.length > 5 ? <p className="text-xs text-slate-400">+ {items.length - 5} more item(s)</p> : null}

            <div className="border-t border-white/10 pt-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300">Subtotal</span>
                <span className="font-extrabold text-white">{formatInr(totals.subtotal)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-slate-300">Discount</span>
                <span className="font-extrabold text-white">-{formatInr(totals.discount)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-slate-300">Shipping</span>
                <span className="font-extrabold text-white">
                  {totals.shipping === 0 ? 'Free' : formatInr(totals.shipping)}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
                <span className="font-semibold text-slate-300">Total</span>
                <span className="text-lg font-extrabold text-white">{formatInr(totals.total)}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
