import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Order } from '../types';
import * as orderApi from '../api/orders';

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const dateFormat = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export default function Orders() {
  const { user, isAdmin, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = showAll && isAdmin ? await orderApi.listAllOrders() : await orderApi.listMyOrders();
        setOrders(data);
      } catch (err: any) {
        setError(err?.response?.data?.error ?? 'Failed to load orders.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [showAll, isAdmin]);

  const total = orders.reduce((sum, o) => sum + o.price_at_purchase * o.quantity, 0);

  return (
    <div className="min-h-screen bg-graphite-900">
      <header className="border-b border-graphite-700 bg-graphite-800/60">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="h-6 w-1.5 hazard-edge rounded" />
            <div>
              <h1 className="font-display text-xl uppercase tracking-wide text-graphite-50">
                Ironclad <span className="text-amber-400">Motors</span>
              </h1>
              <p className="text-xs text-graphite-400">
                {showAll ? 'All Purchase Orders' : 'My Purchase History'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="rounded border border-graphite-600 px-3 py-1.5 text-sm text-graphite-300 hover:bg-graphite-700"
            >
              ← Dashboard
            </Link>
            <div className="text-right text-sm">
              <div className="text-graphite-50">{user?.email}</div>
              <div className="font-mono-num text-[10px] uppercase tracking-widest text-amber-400">
                {user?.role}
              </div>
            </div>
            <button
              onClick={logout}
              className="rounded border border-graphite-600 px-3 py-1.5 text-sm text-graphite-300 hover:bg-graphite-700"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6">
        {isAdmin && (
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setShowAll(false)}
              className={`rounded px-3 py-1.5 text-sm font-semibold uppercase tracking-wide ${
                !showAll ? 'bg-amber-500 text-graphite-950' : 'border border-graphite-600 text-graphite-300'
              }`}
            >
              My orders
            </button>
            <button
              onClick={() => setShowAll(true)}
              className={`rounded px-3 py-1.5 text-sm font-semibold uppercase tracking-wide ${
                showAll ? 'bg-amber-500 text-graphite-950' : 'border border-graphite-600 text-graphite-300'
              }`}
            >
              All customer orders
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded border border-crimson-500 bg-crimson-500/10 px-4 py-3 text-sm text-crimson-400">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-graphite-400">Loading order history…</p>
        ) : orders.length === 0 ? (
          <div className="rounded-lg border border-dashed border-graphite-600 bg-graphite-800/40 p-12 text-center">
            <p className="text-graphite-300">No purchases yet.</p>
            <Link to="/" className="mt-2 inline-block text-amber-400 hover:underline">
              Browse the inventory →
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-lg border border-graphite-700">
              <table className="w-full text-left text-sm">
                <thead className="bg-graphite-800 text-[10px] uppercase tracking-widest text-graphite-500">
                  <tr>
                    <th className="px-4 py-3">Vehicle</th>
                    <th className="px-4 py-3">Qty</th>
                    <th className="px-4 py-3">Price each</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-graphite-700 bg-graphite-800/40">
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-4 py-3 text-graphite-50">
                        {order.make} {order.model}
                      </td>
                      <td className="px-4 py-3 font-mono-num text-graphite-300">{order.quantity}</td>
                      <td className="px-4 py-3 font-mono-num text-graphite-300">
                        {currency.format(order.price_at_purchase)}
                      </td>
                      <td className="px-4 py-3 font-mono-num text-amber-400">
                        {currency.format(order.price_at_purchase * order.quantity)}
                      </td>
                      <td className="px-4 py-3 text-graphite-400">
                        {dateFormat.format(new Date(order.created_at))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-end">
              <div className="rounded-lg border border-graphite-700 bg-graphite-800 px-4 py-3">
                <span className="mr-3 text-[10px] uppercase tracking-widest text-graphite-500">
                  Total spent
                </span>
                <span className="font-mono-num text-lg text-amber-400">{currency.format(total)}</span>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
