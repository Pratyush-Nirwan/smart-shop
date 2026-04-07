import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950">
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <p className="text-sm font-extrabold text-slate-50">SmartShop</p>
            <p className="mt-2 text-sm text-slate-400">
              Shop curated picks for home, tech, beauty, and everyday essentials.
            </p>
          </div>

          <div className="grid gap-2 text-sm">
            <Link to="/products" className="text-slate-300 hover:text-slate-50">
              Shop
            </Link>
            <Link to="/profile" className="text-slate-300 hover:text-slate-50">
              My Account
            </Link>
            <Link to="/cart" className="text-slate-300 hover:text-slate-50">
              Cart
            </Link>
          </div>

          <div className="grid gap-2 text-sm">
            <a className="text-slate-300 hover:text-slate-50" href="#">
              Shipping & Returns
            </a>
            <a className="text-slate-300 hover:text-slate-50" href="#">
              Terms of Service
            </a>
            <a className="text-slate-300 hover:text-slate-50" href="#">
              Contact
            </a>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6 text-xs text-slate-500">
          Copyright {new Date().getFullYear()} SmartShop. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
