import client from './client';
import type { Order } from '../types';

export async function listMyOrders(): Promise<Order[]> {
  const res = await client.get<{ orders: Order[] }>('/orders');
  return res.data.orders;
}

export async function listAllOrders(): Promise<Order[]> {
  const res = await client.get<{ orders: Order[] }>('/orders', { params: { all: 'true' } });
  return res.data.orders;
}
