import { Router, Response } from 'express';
import {
  createVehicle,
  listVehicles,
  searchVehicles,
  findVehicleById,
  updateVehicle,
  deleteVehicle,
  adjustQuantity,
  SortField,
  SortOrder,
} from '../db/vehicleRepository';
import { createOrder } from '../db/orderRepository';
import { requireAuth, requireAdmin, AuthenticatedRequest } from '../middleware/auth';
import { vehicleSchema, vehicleUpdateSchema, quantitySchema } from '../utils/validation';

const router = Router();

const VALID_SORT_FIELDS: SortField[] = ['price', 'created_at', 'make', 'quantity'];

function parseSort(query: any): { sortBy?: SortField; sortOrder?: SortOrder } {
  const sortBy = VALID_SORT_FIELDS.includes(query.sortBy) ? (query.sortBy as SortField) : undefined;
  const sortOrder = query.sortOrder === 'asc' ? 'asc' : query.sortOrder === 'desc' ? 'desc' : undefined;
  return { sortBy, sortOrder };
}

// All vehicle routes require authentication.
router.use(requireAuth);

// GET /api/vehicles?sortBy=price&sortOrder=asc - list all vehicles
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  const { sortBy, sortOrder } = parseSort(req.query);
  return res.status(200).json({ vehicles: listVehicles(sortBy, sortOrder) });
});

// GET /api/vehicles/search?make=&model=&category=&minPrice=&maxPrice=&sortBy=&sortOrder=
// NOTE: registered before the /:id route so "search" is never captured as an id param.
router.get('/search', (req: AuthenticatedRequest, res: Response) => {
  const { make, model, category, minPrice, maxPrice } = req.query;
  const { sortBy, sortOrder } = parseSort(req.query);

  const filters = {
    make: typeof make === 'string' ? make : undefined,
    model: typeof model === 'string' ? model : undefined,
    category: typeof category === 'string' ? category : undefined,
    minPrice: minPrice !== undefined ? Number(minPrice) : undefined,
    maxPrice: maxPrice !== undefined ? Number(maxPrice) : undefined,
    sortBy,
    sortOrder,
  };

  return res.status(200).json({ vehicles: searchVehicles(filters) });
});

// POST /api/vehicles - add a new vehicle
router.post('/', (req: AuthenticatedRequest, res: Response) => {
  const parsed = vehicleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' });
  }

  const vehicle = createVehicle(parsed.data);
  return res.status(201).json({ vehicle });
});

// PUT /api/vehicles/:id - update a vehicle
router.put('/:id', (req: AuthenticatedRequest, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Invalid vehicle id' });
  }

  const parsed = vehicleUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' });
  }

  const vehicle = updateVehicle(id, parsed.data);
  if (!vehicle) {
    return res.status(404).json({ error: 'Vehicle not found' });
  }

  return res.status(200).json({ vehicle });
});

// DELETE /api/vehicles/:id - admin only
router.delete('/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Invalid vehicle id' });
  }

  const existing = findVehicleById(id);
  if (!existing) {
    return res.status(404).json({ error: 'Vehicle not found' });
  }

  deleteVehicle(id);
  return res.status(204).send();
});

// POST /api/vehicles/:id/purchase - decrease quantity
router.post('/:id/purchase', (req: AuthenticatedRequest, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Invalid vehicle id' });
  }

  const parsed = quantitySchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' });
  }

  const existing = findVehicleById(id);
  if (!existing) {
    return res.status(404).json({ error: 'Vehicle not found' });
  }

  try {
    const vehicle = adjustQuantity(id, -parsed.data.quantity);

    // Record this purchase in order history. We snapshot make/model/price at the
    // moment of sale so history stays accurate even if the vehicle is later edited
    // or deleted.
    if (req.user) {
      createOrder({
        userId: req.user.userId,
        vehicleId: existing.id,
        quantity: parsed.data.quantity,
        priceAtPurchase: existing.price,
        make: existing.make,
        model: existing.model,
      });
    }

    return res.status(200).json({ vehicle });
  } catch (err) {
    if (err instanceof Error && err.message === 'INSUFFICIENT_STOCK') {
      return res.status(400).json({ error: 'Not enough stock to complete purchase' });
    }
    throw err;
  }
});

// POST /api/vehicles/:id/restock - admin only, increase quantity
router.post('/:id/restock', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Invalid vehicle id' });
  }

  const parsed = quantitySchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' });
  }

  const existing = findVehicleById(id);
  if (!existing) {
    return res.status(404).json({ error: 'Vehicle not found' });
  }

  const vehicle = adjustQuantity(id, parsed.data.quantity);
  return res.status(200).json({ vehicle });
});

export default router;
