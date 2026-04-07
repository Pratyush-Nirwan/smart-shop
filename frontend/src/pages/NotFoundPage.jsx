import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-14 text-center">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-10 shadow-card">
        <h1 className="text-3xl font-extrabold text-white">Page not found</h1>
        <p className="mt-3 text-slate-300">The page you’re looking for doesn’t exist.</p>
        <Link to="/" className="mt-6 inline-block rounded-xl bg-brand-600 px-5 py-3 font-bold text-white hover:bg-brand-500">
          Back to Home
        </Link>
      </div>
    </div>
  )
}

