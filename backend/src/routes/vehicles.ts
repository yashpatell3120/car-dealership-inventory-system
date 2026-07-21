import { Router, Response } from 'express';
import {
  createVehicle,
  listVehicles,
  searchVehicles,
  findVehicleById,
  updateVehicle,
  deleteVehicle,
  adjustQuantity,
} from '../db/vehicleRepository';
import { requireAuth, requireAdmin, AuthenticatedRequest } from '../middleware/auth';
import { vehicleSchema, vehicleUpdateSchema, quantitySchema } from '../utils/validation';

const router = Router();

// All vehicle routes require authentication.
router.use(requireAuth);

// GET /api/vehicles - list all vehicles
router.get('/', (_req: AuthenticatedRequest, res: Response) => {
  return res.status(200).json({ vehicles: listVehicles() });
});

// GET /api/vehicles/search?make=&model=&category=&minPrice=&maxPrice=
// NOTE: registered before the /:id route so "search" is never captured as an id param.
router.get('/search', (req: AuthenticatedRequest, res: Response) => {
  const { make, model, category, minPrice, maxPrice } = req.query;

  const filters = {
    make: typeof make === 'string' ? make : undefined,
    model: typeof model === 'string' ? model : undefined,
    category: typeof category === 'string' ? category : undefined,
    minPrice: minPrice !== undefined ? Number(minPrice) : undefined,
    maxPrice: maxPrice !== undefined ? Number(maxPrice) : undefined,
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
