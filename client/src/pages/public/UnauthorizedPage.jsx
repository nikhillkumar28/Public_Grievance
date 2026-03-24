import { Link } from "react-router-dom";

export default function UnauthorizedPage() {
  return (
    <main className="mx-auto max-w-md px-6 py-16 text-center">
      <h1 className="text-2xl font-bold text-civic-navy">Unauthorized</h1>
      <p className="mt-2 text-slate-600">You do not have permission to access this page.</p>
      <Link to="/" className="mt-6 inline-block rounded-md bg-civic-blue px-4 py-2 text-sm font-semibold text-white">
        Back to Home
      </Link>
    </main>
  );
}
