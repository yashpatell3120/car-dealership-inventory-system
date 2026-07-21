import { useState } from 'react';
import type { FormEvent } from 'react';
import type { SearchFilters } from '../types';

interface Props {
  onSearch: (filters: SearchFilters) => void;
  onReset: () => void;
}

export default function SearchFilterBar({ onSearch, onReset }: Props) {
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSearch({
      make: make || undefined,
      model: model || undefined,
      category: category || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    });
  }

  function handleReset() {
    setMake('');
    setModel('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    onReset();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-2 gap-3 rounded-lg border border-graphite-700 bg-graphite-800 p-4 md:grid-cols-6"
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
        <label className="mb-1 block text-[10px] uppercase tracking-widest text-graphite-500">Min $</label>
        <input
          type="number"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          placeholder="0"
          className="w-full rounded border border-graphite-600 bg-graphite-900 px-2 py-1.5 text-sm text-graphite-50 placeholder-graphite-500 focus:border-amber-500"
        />
      </div>
      <div>
        <label className="mb-1 block text-[10px] uppercase tracking-widest text-graphite-500">Max $</label>
        <input
          type="number"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          placeholder="100000"
          className="w-full rounded border border-graphite-600 bg-graphite-900 px-2 py-1.5 text-sm text-graphite-50 placeholder-graphite-500 focus:border-amber-500"
        />
      </div>
      <div className="flex items-end gap-2">
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
