import { useState } from 'react';
import type { Vehicle } from '../types';
import { useAuth } from '../context/AuthContext';

interface Props {
  vehicle: Vehicle;
  onPurchase: (id: number) => Promise<void>;
  onRestock: (id: number) => Promise<void>;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (id: number) => Promise<void>;
}

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

function stockLabel(qty: number): { label: string; tone: string } {
  if (qty === 0) return { label: 'SOLD OUT', tone: 'text-crimson-400 border-crimson-500' };
  if (qty <= 2) return { label: 'LOW STOCK', tone: 'text-amber-400 border-amber-500' };
  return { label: 'IN STOCK', tone: 'text-teal-400 border-teal-500' };
}

export default function VehicleCard({ vehicle, onPurchase, onRestock, onEdit, onDelete }: Props) {
  const { isAdmin } = useAuth();
  const [busy, setBusy] = useState(false);
  const stock = stockLabel(vehicle.quantity);

  async function handlePurchase() {
    setBusy(true);
    try {
      await onPurchase(vehicle.id);
    } finally {
      setBusy(false);
    }
  }

  async function handleRestock() {
    setBusy(true);
    try {
      await onRestock(vehicle.id);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete ${vehicle.make} ${vehicle.model}? This cannot be undone.`)) return;
    setBusy(true);
    try {
      await onDelete(vehicle.id);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="group relative rounded-lg border border-graphite-700 bg-graphite-800 overflow-hidden transition-colors hover:border-amber-500/60">
      {/* top plate strip - signature element evoking a window sticker header */}
      <div className="flex items-center justify-between border-b border-graphite-700 bg-graphite-900/60 px-4 py-2">
        <span className="font-mono-num text-[11px] tracking-widest text-graphite-300">
          STOCK #{String(vehicle.id).padStart(4, '0')}
        </span>
        <span
          className={`rounded border px-2 py-0.5 font-mono-num text-[10px] tracking-widest ${stock.tone}`}
        >
          {stock.label}
        </span>
      </div>

      <div className="p-4">
        <h3 className="font-display text-xl uppercase tracking-wide text-graphite-50">
          {vehicle.make} <span className="text-amber-400">{vehicle.model}</span>
        </h3>
        <p className="mt-1 text-sm text-graphite-300">{vehicle.category}</p>

        <div className="mt-4 flex items-end justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-graphite-500">Price</div>
            <div className="font-mono-num text-2xl text-amber-400">
              {currency.format(vehicle.price)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-widest text-graphite-500">Qty</div>
            <div className="font-mono-num text-2xl text-graphite-50">{vehicle.quantity}</div>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={handlePurchase}
            disabled={vehicle.quantity === 0 || busy}
            className="flex-1 rounded bg-amber-500 py-2 text-sm font-semibold uppercase tracking-wide text-graphite-950 transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-graphite-700 disabled:text-graphite-500"
          >
            {vehicle.quantity === 0 ? 'Unavailable' : 'Purchase'}
          </button>

          {isAdmin && (
            <>
              <button
                onClick={handleRestock}
                disabled={busy}
                title="Restock +1"
                className="rounded border border-teal-500 px-3 py-2 text-sm text-teal-400 transition-colors hover:bg-teal-500/10"
              >
                +1
              </button>
              <button
                onClick={() => onEdit(vehicle)}
                disabled={busy}
                title="Edit vehicle"
                className="rounded border border-graphite-500 px-3 py-2 text-sm text-graphite-300 transition-colors hover:bg-graphite-700"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={busy}
                title="Delete vehicle"
                className="rounded border border-crimson-500 px-3 py-2 text-sm text-crimson-400 transition-colors hover:bg-crimson-500/10"
              >
                Del
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
