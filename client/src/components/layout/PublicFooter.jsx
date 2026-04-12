import { Link } from "react-router-dom";

export default function PublicFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-6 text-sm text-slate-600">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <p>© 2026 Smart Civic Grievance Platform. All rights reserved.</p>
            <p>Built by Nikhilkumar</p>
            <p className="max-w-2xl text-slate-500">
              Empowering citizens through technology for transparent, efficient, and accountable public service.
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-2 font-semibold text-slate-700">
            <Link to="/about" className="hover:text-slate-900">
              About
            </Link>
            <span className="text-slate-400" aria-hidden="true">
              •
            </span>
            <span>Contact</span>
            <span className="text-slate-400" aria-hidden="true">
              •
            </span>
            <span>Privacy Policy</span>
            <span className="text-slate-400" aria-hidden="true">
              •
            </span>
            <span>Terms</span>
          </nav>
        </div>
      </div>
    </footer>
  );
}
