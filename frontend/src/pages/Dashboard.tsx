import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import type { Vehicle, SearchFilters } from '../types';
import * as vehicleApi from '../api/vehicles';
import VehicleCard from '../components/VehicleCard';
import SearchFilterBar from '../components/SearchFilterBar';
import VehicleFormModal from '../components/VehicleFormModal';

export default function Dashboard() {
  const { user, isAdmin, logout } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await vehicleApi.listVehicles();
      setVehicles(data);
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Failed to load vehicles.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function handleSearch(filters: SearchFilters) {
    setLoading(true);
    setError(null);
    try {
      const data = await vehicleApi.searchVehicles(filters);
      setVehicles(data);
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Search failed.');
    } finally {
      setLoading(false);
    }
  }

  async function handlePurchase(id: number) {
    const updated = await vehicleApi.purchaseVehicle(id, 1);
    setVehicles((prev) => prev.map((v) => (v.id === id ? updated : v)));
  }

  async function handleRestock(id: number) {
    const updated = await vehicleApi.restockVehicle(id, 1);
    setVehicles((prev) => prev.map((v) => (v.id === id ? updated : v)));
  }

  async function handleDelete(id: number) {
    await vehicleApi.deleteVehicle(id);
    setVehicles((prev) => prev.filter((v) => v.id !== id));
  }

  function openAddModal() {
    setEditingVehicle(null);
    setModalOpen(true);
  }

  function openEditModal(vehicle: Vehicle) {
    setEditingVehicle(vehicle);
    setModalOpen(true);
  }

  async function handleFormSubmit(data: vehicleApi.VehicleInput) {
    if (editingVehicle) {
      const updated = await vehicleApi.updateVehicle(editingVehicle.id, data);
      setVehicles((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
    } else {
      const created = await vehicleApi.createVehicle(data);
      setVehicles((prev) => [created, ...prev]);
    }
  }

  return (
    <div className="min-h-screen bg-graphite-900">
      <header className="border-b border-graphite-700 bg-graphite-800/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="h-6 w-1.5 hazard-edge rounded" />
            <div>
              <h1 className="font-display text-xl uppercase tracking-wide text-graphite-50">
                Ironclad <span className="text-amber-400">Motors</span>
              </h1>
              <p className="text-xs text-graphite-400">Inventory Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
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

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6 flex flex-col gap-4">
          <SearchFilterBar onSearch={handleSearch} onReset={loadAll} />

          {isAdmin && (
            <div className="flex justify-end">
              <button
                onClick={openAddModal}
                className="rounded bg-teal-500 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-graphite-950 hover:bg-teal-400"
              >
                + Add vehicle
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 rounded border border-crimson-500 bg-crimson-500/10 px-4 py-3 text-sm text-crimson-400">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-graphite-400">Loading inventory…</p>
        ) : vehicles.length === 0 ? (
          <div className="rounded-lg border border-dashed border-graphite-600 bg-graphite-800/40 p-12 text-center">
            <p className="text-graphite-300">No vehicles match your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onPurchase={handlePurchase}
                onRestock={handleRestock}
                onEdit={openEditModal}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      {modalOpen && (
        <VehicleFormModal
          initial={editingVehicle}
          onSubmit={handleFormSubmit}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
