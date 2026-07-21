import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await register(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-graphite-900 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-2 h-1 w-16 hazard-edge rounded" />
          <h1 className="font-display text-3xl uppercase tracking-wide text-graphite-50">
            Ironclad <span className="text-amber-400">Motors</span>
          </h1>
          <p className="mt-1 text-sm text-graphite-300">Create your account</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-graphite-700 bg-graphite-800 p-6 shadow-lg"
        >
          <div className="mb-4">
            <label className="mb-1 block text-[10px] uppercase tracking-widest text-graphite-500">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded border border-graphite-600 bg-graphite-900 px-3 py-2 text-sm text-graphite-50 focus:border-amber-500"
            />
          </div>
          <div className="mb-4">
            <label className="mb-1 block text-[10px] uppercase tracking-widest text-graphite-500">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded border border-graphite-600 bg-graphite-900 px-3 py-2 text-sm text-graphite-50 focus:border-amber-500"
            />
          </div>
          <div className="mb-4">
            <label className="mb-1 block text-[10px] uppercase tracking-widest text-graphite-500">
              Confirm password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded border border-graphite-600 bg-graphite-900 px-3 py-2 text-sm text-graphite-50 focus:border-amber-500"
            />
          </div>

          {error && <p className="mb-4 text-sm text-crimson-400">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded bg-amber-500 py-2 text-sm font-semibold uppercase tracking-wide text-graphite-950 hover:bg-amber-400 disabled:opacity-60"
          >
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-graphite-300">
          Already have an account?{' '}
          <Link to="/login" className="text-amber-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
