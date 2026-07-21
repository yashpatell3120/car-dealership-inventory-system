import {
  createVehicle,
  findVehicleById,
  updateVehicle,
  deleteVehicle,
  adjustQuantity,
  listVehicles,
} from '../src/db/vehicleRepository';

describe('vehicleRepository', () => {
  it('creates a vehicle and assigns it an id', () => {
    const vehicle = createVehicle({
      make: 'Audi',
      model: 'A4',
      category: 'Sedan',
      price: 39000,
      quantity: 2,
    });

    expect(vehicle.id).toBeGreaterThan(0);
    expect(vehicle.make).toBe('Audi');
  });

  it('finds a vehicle by id', () => {
    const created = createVehicle({
      make: 'Lexus',
      model: 'RX',
      category: 'SUV',
      price: 48000,
      quantity: 1,
    });

    const found = findVehicleById(created.id);
    expect(found).toEqual(created);
  });

  it('returns undefined for a missing vehicle', () => {
    expect(findVehicleById(-1)).toBeUndefined();
  });

  it('updates only the provided fields', () => {
    const created = createVehicle({
      make: 'Hyundai',
      model: 'Tucson',
      category: 'SUV',
      price: 27000,
      quantity: 3,
    });

    const updated = updateVehicle(created.id, { quantity: 10 });

    expect(updated?.quantity).toBe(10);
    expect(updated?.make).toBe('Hyundai');
    expect(updated?.price).toBe(27000);
  });

  it('deletes a vehicle', () => {
    const created = createVehicle({
      make: 'Volkswagen',
      model: 'Tiguan',
      category: 'SUV',
      price: 29000,
      quantity: 1,
    });

    const deleted = deleteVehicle(created.id);
    expect(deleted).toBe(true);
    expect(findVehicleById(created.id)).toBeUndefined();
  });

  it('increases quantity with a positive delta (restock)', () => {
    const created = createVehicle({
      make: 'Mazda',
      model: 'Mazda3',
      category: 'Sedan',
      price: 21000,
      quantity: 2,
    });

    const restocked = adjustQuantity(created.id, 5);
    expect(restocked?.quantity).toBe(7);
  });

  it('decreases quantity with a negative delta (purchase)', () => {
    const created = createVehicle({
      make: 'Subaru',
      model: 'Forester',
      category: 'SUV',
      price: 28000,
      quantity: 5,
    });

    const purchased = adjustQuantity(created.id, -2);
    expect(purchased?.quantity).toBe(3);
  });

  it('throws when a purchase would make quantity negative', () => {
    const created = createVehicle({
      make: 'Buick',
      model: 'Encore',
      category: 'SUV',
      price: 25000,
      quantity: 1,
    });

    expect(() => adjustQuantity(created.id, -3)).toThrow('INSUFFICIENT_STOCK');
  });

  it('lists all created vehicles', () => {
    const before = listVehicles().length;
    createVehicle({ make: 'Genesis', model: 'G70', category: 'Sedan', price: 42000, quantity: 1 });
    const after = listVehicles().length;
    expect(after).toBe(before + 1);
  });
});
