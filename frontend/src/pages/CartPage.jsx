import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import RatingStars from '../components/product/RatingStars'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { IconCart } from '../components/common/Icons'

export default function CartPage() {
  const navigate = useNavigate()
  const { items, totals, updateQuantity, removeItem, applyCoupon, couponCode } = useCart()
  const { pushToast } = useToast()

  const [couponInput, setCouponInput] = useState(couponCode ?? '')

  const isEmpty = items.length === 0

  const canCheckout = !isEmpty

  const couponHint = useMemo(() => {
    const normalized = (couponInput ?? '').trim().toUpperCase()
    if (!normalized) return 'Try SMART10 or FIRST15'
    if (normalized === 'SMART10') return '10% off with SMART10'
    if (normalized === 'FIRST15') return '15% off with FIRST15'
    return 'Unknown code (demo) — still can apply for UI'
  }, [couponInput])

  function onApplyCoupon() {
    applyCoupon(couponInput)
    pushToast({
      title: 'Coupon applied',
      message: couponInput ? couponHint : 'Enter a coupon code.',
      type: 'success',
    })
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Your Cart</h1>
          <p className="mt-2 text-sm text-slate-300">Review items, apply a coupon, then checkout.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2">
          <IconCart className="h-5 w-5 text-slate-200" />
          <span className="text-sm font-bold text-slate-50">{items.length} items</span>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-card">
          {isEmpty ? (
            <div className="py-14 text-center">
              <p className="text-lg font-extrabold text-white">Cart is empty.</p>
              <p className="mt-2 text-sm text-slate-300">Add products to get started.</p>
              <Button variant="secondary" className="mt-6" onClick={() => navigate('/products')}>
                Browse products
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {items.map((it) => (
                <div key={it.cartKey} className="flex gap-4 rounded-2xl border border-white/10 bg-slate-950/20 p-3">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-white/10">
                    {it.image ? (
                      <img src={it.image} alt={it.name} className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-extrabold text-white">{it.name}</p>
                        {it.variant?.color || it.variant?.size ? (
                          <p className="mt-1 text-xs text-slate-400">
                            {it.variant.color ? it.variant.color : null}
                            {it.variant.color && it.variant.size ? ' · ' : null}
                            {it.variant.size ? it.variant.size : null}
                          </p>
                        ) : (
                          <p className="mt-1 text-xs text-slate-400">Default variant</p>
                        )}
                        <div className="mt-2 flex items-center gap-2">
                          <div className="text-sm font-extrabold text-white">${it.price.toFixed(2)}</div>
                          <RatingStars rating={4.4} />
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(it.cartKey)}
                      >
                        Remove
                      </Button>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateQuantity(it.cartKey, it.quantity - 1)}
                          className="h-10 w-10 rounded-xl border border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
                        >
                          -
                        </button>
                        <div className="w-16">
                          <input
                            type="number"
                            min="1"
                            value={it.quantity}
                            onChange={(e) => updateQuantity(it.cartKey, Number(e.target.value) || 1)}
                            className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-center text-slate-100 outline-none transition focus:border-brand-400/70 focus:ring-2 focus:ring-brand-400/20"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => updateQuantity(it.cartKey, it.quantity + 1)}
                          className="h-10 w-10 rounded-xl border border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-sm font-extrabold text-white">
                        Subtotal: ${(it.price * it.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <aside className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-card">
          <h2 className="text-sm font-extrabold text-white">Order Summary</h2>
          <div className="mt-3 grid gap-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">Subtotal</span>
              <span className="font-extrabold text-white">${totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">Discount</span>
              <span className="font-extrabold text-white">-${totals.discount.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">Shipping</span>
              <span className="font-extrabold text-white">
                {totals.shipping === 0 ? 'Free' : `$${totals.shipping.toFixed(2)}`}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-3">
              <span className="text-slate-300 font-semibold">Total</span>
              <span className="text-lg font-extrabold text-white">${totals.total.toFixed(2)}</span>
            </div>

            <div className="mt-3 border-t border-white/10 pt-4">
              <div className="text-sm font-extrabold text-white">Coupon</div>
              <div className="mt-3 grid gap-3">
                <Input
                  label="Coupon code"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="SMART10"
                />
                <p className="text-xs text-slate-400">{couponHint}</p>
                <Button variant="secondary" onClick={onApplyCoupon} disabled={isEmpty}>
                  Apply
                </Button>
              </div>
            </div>

            <Button
              size="lg"
              disabled={!canCheckout}
              onClick={() => navigate('/checkout')}
              className="mt-3"
            >
              Checkout
            </Button>
          </div>
        </aside>
      </div>
    </div>
  )
}

