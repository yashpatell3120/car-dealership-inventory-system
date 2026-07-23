import { useState } from 'react';
import type { FormEvent } from 'react';
import type { SearchFilters, SortField, SortOrder } from '../types';

interface Props {
  onSearch: (filters: SearchFilters) => void;
  onReset: () => void;
}

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: 'created_at', label: 'Newest' },
  { value: 'price', label: 'Price' },
  { value: 'make', label: 'Make (A–Z)' },
  { value: 'quantity', label: 'Stock qty' },
];

export default function SearchFilterBar({ onSearch, onReset }: Props) {
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  function currentFilters(): SearchFilters {
    return {
      make: make || undefined,
      model: model || undefined,
      category: category || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sortBy,
      sortOrder,
    };
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSearch(currentFilters());
  }

  function handleSortChange(nextSortBy: SortField, nextSortOrder: SortOrder) {
    setSortBy(nextSortBy);
    setSortOrder(nextSortOrder);
    onSearch({
      make: make || undefined,
      model: model || undefined,
      category: category || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sortBy: nextSortBy,
      sortOrder: nextSortOrder,
    });
  }

  function handleReset() {
    setMake('');
    setModel('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('created_at');
    setSortOrder('desc');
    onReset();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-2 gap-3 rounded-lg border border-graphite-700 bg-graphite-800 p-4 md:grid-cols-7"
    >
      <div className="col-span-1 md:col-span-1">
        <label className="mb-1 block text-[10px] uppercase tracking-widest text-graphite-500">Make</label>
        <input
          value={make}
          onChange={(e) => setMake(e.target.value)}
          placeholder="Toyota"
          className="w-full rounded border border-graphite-600 bg-graphite-900 px-2 py-1.5 text-sm text-graphite-50 placeholder-graphite-500 focus:border-amber-500"
        />
      </div>
      <div>
        <label className="mb-1 block text-[10px] uppercase tracking-widest text-graphite-500">Model</label>
        <input
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder="Camry"
          className="w-full rounded border border-graphite-600 bg-graphite-900 px-2 py-1.5 text-sm text-graphite-50 placeholder-graphite-500 focus:border-amber-500"
        />
      </div>
      <div>
        <label className="mb-1 block text-[10px] uppercase tracking-widest text-graphite-500">Category</label>
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="SUV"
          className="w-full rounded border border-graphite-600 bg-graphite-900 px-2 py-1.5 text-sm text-graphite-50 placeholder-graphite-500 focus:border-amber-500"
        />
      </div>
      <div>
        <label className="mb-1 block text-[10px] uppercase tracking-widest text-graphite-500">Min ₹</label>
        <input
          type="number"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          placeholder="0"
          className="w-full rounded border border-graphite-600 bg-graphite-900 px-2 py-1.5 text-sm text-graphite-50 placeholder-graphite-500 focus:border-amber-500"
        />
      </div>
      <div>
        <label className="mb-1 block text-[10px] uppercase tracking-widest text-graphite-500">Max ₹</label>
        <input
          type="number"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          placeholder="100000"
          className="w-full rounded border border-graphite-600 bg-graphite-900 px-2 py-1.5 text-sm text-graphite-50 placeholder-graphite-500 focus:border-amber-500"
        />
      </div>
      <div>
        <label className="mb-1 block text-[10px] uppercase tracking-widest text-graphite-500">Sort by</label>
        <div className="flex gap-1">
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value as SortField, sortOrder)}
            className="w-full rounded border border-graphite-600 bg-graphite-900 px-2 py-1.5 text-sm text-graphite-50 focus:border-amber-500"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => handleSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')}
            title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            className="rounded border border-graphite-600 px-2 text-graphite-300 hover:bg-graphite-700"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      <div className="flex items-end gap-2 md:col-span-2">
        <button
          type="submit"
          className="flex-1 rounded bg-amber-500 py-1.5 text-sm font-semibold uppercase tracking-wide text-graphite-950 hover:bg-amber-400"
        >
          Search
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="rounded border border-graphite-600 px-3 py-1.5 text-sm text-graphite-300 hover:bg-graphite-700"
        >
          Reset
        </button>
      </div>
    </form>
  );
}
