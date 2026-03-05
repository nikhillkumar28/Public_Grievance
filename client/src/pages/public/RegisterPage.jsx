import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", ward: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register({ ...form, role: "citizen" });
      navigate("/citizen");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <main className="mx-auto max-w-md px-6 py-12">
      <h1 className="text-2xl font-bold text-civic-navy">Register</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-civic">
        <input
          className="w-full rounded-md border border-slate-300 px-3 py-2"
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          className="w-full rounded-md border border-slate-300 px-3 py-2"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          className="w-full rounded-md border border-slate-300 px-3 py-2"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <input
          className="w-full rounded-md border border-slate-300 px-3 py-2"
          type="text"
          placeholder="Ward"
          value={form.ward}
          onChange={(e) => setForm({ ...form, ward: e.target.value })}
        />
        {error && <p className="text-sm text-civic-red">{error}</p>}
        <button className="w-full rounded-md bg-civic-blue px-4 py-2 font-semibold text-white">Create Account</button>
        <p className="text-sm text-slate-600">
          Already have an account? <Link className="text-civic-blue" to="/login">Login</Link>
        </p>
      </form>
    </main>
  );
}
