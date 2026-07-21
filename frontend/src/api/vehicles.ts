import client from './client';
import type { Vehicle, SearchFilters } from '../types';

export async function listVehicles(): Promise<Vehicle[]> {
  const res = await client.get<{ vehicles: Vehicle[] }>('/vehicles');
  return res.data.vehicles;
}

export async function searchVehicles(filters: SearchFilters): Promise<Vehicle[]> {
  const params: Record<string, string> = {};
  if (filters.make) params.make = filters.make;
  if (filters.model) params.model = filters.model;
  if (filters.category) params.category = filters.category;
  if (filters.minPrice !== undefined) params.minPrice = String(filters.minPrice);
  if (filters.maxPrice !== undefined) params.maxPrice = String(filters.maxPrice);

  const res = await client.get<{ vehicles: Vehicle[] }>('/vehicles/search', { params });
  return res.data.vehicles;
}

export interface VehicleInput {
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
}

export async function createVehicle(data: VehicleInput): Promise<Vehicle> {
  const res = await client.post<{ vehicle: Vehicle }>('/vehicles', data);
  return res.data.vehicle;
}

export async function updateVehicle(id: number, data: Partial<VehicleInput>): Promise<Vehicle> {
  const res = await client.put<{ vehicle: Vehicle }>(`/vehicles/${id}`, data);
  return res.data.vehicle;
}

export async function deleteVehicle(id: number): Promise<void> {
  await client.delete(`/vehicles/${id}`);
}

export async function purchaseVehicle(id: number, quantity = 1): Promise<Vehicle> {
  const res = await client.post<{ vehicle: Vehicle }>(`/vehicles/${id}/purchase`, { quantity });
  return res.data.vehicle;
}

export async function restockVehicle(id: number, quantity = 1): Promise<Vehicle> {
  const res = await client.post<{ vehicle: Vehicle }>(`/vehicles/${id}/restock`, { quantity });
  return res.data.vehicle;
}
