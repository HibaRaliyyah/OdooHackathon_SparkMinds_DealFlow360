import type { WarehouseAllocation, InventoryItem } from '@/lib/types';

/**
 * Finds matching inventory item by product and warehouse (flexible on ID or name).
 */
export function findInventoryItem(
  inventory: InventoryItem[],
  alloc: {
    productId?: string;
    productName?: string;
    warehouseId?: string;
    warehouseName?: string;
  }
): InventoryItem | undefined {
  // 1. Exact product + warehouse match
  const exact = inventory.find((i) => {
    const matchProduct =
      (alloc.productId && i.productId === alloc.productId) ||
      (alloc.productName && i.productName.toLowerCase().trim() === alloc.productName.toLowerCase().trim());

    const matchWarehouse =
      (alloc.warehouseId && i.warehouseId === alloc.warehouseId) ||
      (alloc.warehouseName && (
        i.warehouseName.toLowerCase().includes(alloc.warehouseName.toLowerCase()) ||
        alloc.warehouseName.toLowerCase().includes(i.warehouseName.toLowerCase())
      ));

    return matchProduct && matchWarehouse;
  });

  if (exact) return exact;

  // 2. Match by product and warehouse ID or name startsWith
  const partial = inventory.find((i) => {
    const matchProd =
      (alloc.productId && i.productId === alloc.productId) ||
      (alloc.productName && i.productName.toLowerCase().includes(alloc.productName.toLowerCase()));

    const matchWh =
      (alloc.warehouseId && i.warehouseId === alloc.warehouseId) ||
      (alloc.warehouseName && (
        alloc.warehouseName.toLowerCase().split(' ')[0] === i.warehouseName.toLowerCase().split(' ')[0]
      ));

    return matchProd && matchWh;
  });

  if (partial) return partial;

  // 3. Fallback: match by warehouse only for the product
  return inventory.find((i) => {
    return (
      (alloc.productId && i.productId === alloc.productId) ||
      (alloc.productName && i.productName.toLowerCase().trim() === alloc.productName.toLowerCase().trim())
    );
  });
}

/**
 * Dynamically adjusts physical stock (inStock), reserved units, and net available units
 * across regional warehouse depots whenever resources are allocated, split, or manually overridden.
 */
export function adjustInventoryForAllocations(
  newAllocations: WarehouseAllocation[],
  oldAllocations: WarehouseAllocation[] | undefined,
  inventory: InventoryItem[],
  updateInventory?: (id: string, updates: Partial<InventoryItem>) => void,
  addInventoryItem?: (item: InventoryItem) => void,
  isDispatched: boolean = true
) {
  if (!inventory || !updateInventory) return;

  // 1. Revert previous allocations if warehouse routing or quantity changed
  if (oldAllocations && oldAllocations.length > 0) {
    oldAllocations.forEach((oldAlloc) => {
      const prevQty = oldAlloc.allocatedQty || oldAlloc.requestedQty || 0;
      if (prevQty <= 0) return;

      const item = findInventoryItem(inventory, oldAlloc);
      if (item) {
        const newInStock = isDispatched ? (item.inStock || 0) + prevQty : (item.inStock || 0);
        const newReserved = Math.max(0, (item.reserved || 0) - prevQty);
        const newAvailable = Math.max(0, newInStock - newReserved);

        updateInventory(item.id, {
          inStock: newInStock,
          reserved: newReserved,
          available: newAvailable,
        });

        item.inStock = newInStock;
        item.reserved = newReserved;
        item.available = newAvailable;
      }
    });
  }

  // 2. Apply new allocations to target warehouse depots
  newAllocations.forEach((newAlloc) => {
    const qty = newAlloc.allocatedQty || newAlloc.requestedQty || 0;
    if (qty <= 0) return;

    let item = findInventoryItem(inventory, newAlloc);
    if (item) {
      const newInStock = isDispatched ? Math.max(0, (item.inStock || 0) - qty) : (item.inStock || 0);
      const newReserved = isDispatched ? Math.max(0, (item.reserved || 0) - qty) : ((item.reserved || 0) + qty);
      const newAvailable = Math.max(0, newInStock - newReserved);

      updateInventory(item.id, {
        inStock: newInStock,
        reserved: newReserved,
        available: newAvailable,
      });

      item.inStock = newInStock;
      item.reserved = newReserved;
      item.available = newAvailable;
    } else if (addInventoryItem) {
      // If no inventory line exists for this product at the selected warehouse, create one
      const baseStock = 45;
      const newInStock = isDispatched ? Math.max(0, baseStock - qty) : baseStock;
      const newReserved = isDispatched ? 0 : qty;
      const newAvailable = Math.max(0, newInStock - newReserved);

      const newInvItem: InventoryItem = {
        id: `inv-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        warehouseId: newAlloc.warehouseId || 'wh-1',
        warehouseName: newAlloc.warehouseName || 'Main Warehouse',
        productId: newAlloc.productId || 'prod-1',
        productName: newAlloc.productName || 'Product Line',
        inStock: newInStock,
        reserved: newReserved,
        available: newAvailable,
      };

      addInventoryItem(newInvItem);
      inventory.push(newInvItem);
    }
  });
}

/**
 * Backordering & Surplus Return Engine:
 * When allocating or adjusting resources, if extra quantity was allocated but a lesser quantity
 * is needed, this sends back the remaining/surplus quantity directly to the source warehouse where it originated.
 */
export function returnSurplusToSourceWarehouse(
  params: {
    allocation: WarehouseAllocation;
    newLesserQty: number;
    orderQuotationNumber?: string;
    inventory: InventoryItem[];
    updateInventory?: (id: string, updates: Partial<InventoryItem>) => void;
    addActivity?: (a: any) => void;
    addNotification?: (n: any) => void;
    currentUserName?: string;
  }
): { returnedQty: number; sourceWarehouseName: string; updatedAllocation: WarehouseAllocation } {
  const {
    allocation,
    newLesserQty,
    orderQuotationNumber,
    inventory,
    updateInventory,
    addActivity,
    addNotification,
    currentUserName,
  } = params;

  const currentAllocated = Number(allocation.allocatedQty ?? allocation.requestedQty ?? 0);
  const targetLesser = Math.max(0, Number(newLesserQty));
  const surplusQty = Math.max(0, currentAllocated - targetLesser);

  const updatedAllocation: WarehouseAllocation = {
    ...allocation,
    allocatedQty: targetLesser,
    backorderQty: (Number(allocation.backorderQty) || 0) + surplusQty,
  };

  if (surplusQty > 0 && inventory && updateInventory) {
    const sourceItem = findInventoryItem(inventory, allocation);

    if (sourceItem) {
      // Credit back surplus units to the source warehouse
      const newInStock = (sourceItem.inStock || 0) + surplusQty;
      const newReserved = Math.max(0, (sourceItem.reserved || 0) - surplusQty);
      const newAvailable = Math.max(0, newInStock - newReserved);

      updateInventory(sourceItem.id, {
        inStock: newInStock,
        reserved: newReserved,
        available: newAvailable,
      });

      sourceItem.inStock = newInStock;
      sourceItem.reserved = newReserved;
      sourceItem.available = newAvailable;
    }

    if (addActivity) {
      addActivity({
        id: `act-backorder-ret-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        type: 'fulfillment',
        message: `Finance Backorder: Reduced allocation for ${allocation.productName} (Order ${orderQuotationNumber || 'N/A'}). Returned surplus of ${surplusQty} units back to source warehouse "${allocation.warehouseName}". Physical stock credited.`,
        timestamp: new Date().toISOString(),
      });
    }

    if (addNotification) {
      addNotification({
        id: `notif-backorder-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        userId: 'user-finance',
        title: 'Surplus Units Returned to Source Warehouse',
        message: `${surplusQty} surplus units of ${allocation.productName} returned to source warehouse "${allocation.warehouseName}". Depot stock credited.`,
        type: 'success',
        read: false,
        createdAt: new Date().toISOString(),
      });
    }
  }

  return {
    returnedQty: surplusQty,
    sourceWarehouseName: allocation.warehouseName,
    updatedAllocation,
  };
}

