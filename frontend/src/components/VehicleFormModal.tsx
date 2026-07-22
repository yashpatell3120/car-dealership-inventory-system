import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import type { Vehicle } from '../types';
import type { VehicleInput } from '../api/vehicles';

interface Props {
  initial?: Vehicle | null;
  onSubmit: (data: VehicleInput) => Promise<void>;
  onClose: () => void;
}

export default function VehicleFormModal({ initial, onSubmit, onClose }: Props) {
  const [make, setMake] = useState(initial?.make ?? '');
  const [model, setModel] = useState(initial?.model ?? '');
  const [category, setCategory] = useState(initial?.category ?? '');
  const [price, setPrice] = useState(initial ? String(initial.price) : '');
  const [quantity, setQuantity] = useState(initial ? String(initial.quantity) : '');
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? '');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const priceNum = Number(price);
    const qtyNum = Number(quantity);

    if (!make.trim() || !model.trim() || !category.trim()) {
      setError('Make, model, and category are required.');
      return;
    }
    if (Number.isNaN(priceNum) || priceNum < 0) {
      setError('Price must be a non-negative number.');
      return;
    }
    if (Number.isNaN(qtyNum) || qtyNum < 0 || !Number.isInteger(qtyNum)) {
      setError('Quantity must be a non-negative whole number.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        make: make.trim(),
        model: model.trim(),
        category: category.trim(),
        price: priceNum,
        quantity: qtyNum,
        image_url: imageUrl.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-md rounded-lg border border-graphite-700 bg-graphite-800 p-6 shadow-xl">
        <h2 className="font-display text-xl uppercase tracking-wide text-graphite-50">
          {initial ? 'Edit Vehicle' : 'Add Vehicle'}
        </h2>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-widest text-graphite-500">Make</label>
            <input
              value={make}
              onChange={(e) => setMake(e.target.value)}
              className="w-full rounded border border-graphite-600 bg-graphite-900 px-3 py-2 text-sm text-graphite-50 focus:border-amber-500"
              autoFocus
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-widest text-graphite-500">Model</label>
            <input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full rounded border border-graphite-600 bg-graphite-900 px-3 py-2 text-sm text-graphite-50 focus:border-amber-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-widest text-graphite-500">Category</label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Sedan, SUV, Truck, Electric..."
              className="w-full rounded border border-graphite-600 bg-graphite-900 px-3 py-2 text-sm text-graphite-50 placeholder-graphite-500 focus:border-amber-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-widest text-graphite-500">Price ($)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded border border-graphite-600 bg-graphite-900 px-3 py-2 text-sm text-graphite-50 focus:border-amber-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-widest text-graphite-500">Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full rounded border border-graphite-600 bg-graphite-900 px-3 py-2 text-sm text-graphite-50 focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-widest text-graphite-500">
              Image URL (optional)
            </label>
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded border border-graphite-600 bg-graphite-900 px-3 py-2 text-sm text-graphite-50 placeholder-graphite-500 focus:border-amber-500"
            />
          </div>

          {error && <p className="text-sm text-crimson-400">{error}</p>}

          <div className="mt-2 flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded bg-amber-500 py-2 text-sm font-semibold uppercase tracking-wide text-graphite-950 hover:bg-amber-400 disabled:opacity-60"
            >
              {submitting ? 'Saving…' : initial ? 'Save changes' : 'Add vehicle'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-graphite-600 px-4 py-2 text-sm text-graphite-300 hover:bg-graphite-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
