import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950">
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <p className="text-sm font-extrabold text-slate-50">SmartShop</p>
            <p className="mt-2 text-sm text-slate-400">
              Real-time inventory & payments-ready UI built for a modern e-commerce flow.
            </p>
          </div>
          <div className="grid gap-2 text-sm">
            <Link to="/products" className="text-slate-300 hover:text-slate-50">
              Shop
            </Link>
            <Link to="/profile" className="text-slate-300 hover:text-slate-50">
              Dashboard
            </Link>
            <Link to="/admin" className="text-slate-300 hover:text-slate-50">
              Admin
            </Link>
          </div>
          <div className="grid gap-2 text-sm">
            <a className="text-slate-300 hover:text-slate-50" href="#">
              Privacy Policy
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
          © {new Date().getFullYear()} SmartShop. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

