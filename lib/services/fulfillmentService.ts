// ============================================================
// DealFlow360 — Fulfillment Service
// Warehouse allocation + backorder logic
// ============================================================

import type { InventoryItem, WarehouseAllocation } from '@/lib/types';

export interface AllocationInput {
  productId: string;
  productName: string;
  requestedQty: number;
}

export interface AllocationOutput {
  allocations: WarehouseAllocation[];
  backorderQty: number;
  totalAllocated: number;
  canFulfillFully: boolean;
}

/**
 * Calculate best warehouse allocation for a product quantity.
 * Prioritizes warehouses with most available stock first.
 */
export function calculateWarehouseAllocation(
  input: AllocationInput,
  inventory: InventoryItem[],
): AllocationOutput {
  const { productId, productName, requestedQty } = input;

  // Filter inventory for this product, sorted by available (desc)
  const productInventory = inventory
    .filter(i => i.productId === productId && i.available > 0)
    .sort((a, b) => b.available - a.available);

  const allocations: WarehouseAllocation[] = [];
  let remaining = requestedQty;

  for (const inv of productInventory) {
    if (remaining <= 0) break;
    const allocate = Math.min(remaining, inv.available);
    allocations.push({
      warehouseId: inv.warehouseId,
      warehouseName: inv.warehouseName,
      productId,
      productName,
      requestedQty,
      allocatedQty: allocate,
      shippedQty: 0,
      backorderQty: 0,
    });
    remaining -= allocate;
  }

  const totalAllocated = requestedQty - remaining;
  const backorderQty = remaining;

  if (backorderQty > 0) {
    // Add a backorder entry
    allocations.push({
      warehouseId: 'BACKORDER',
      warehouseName: 'Backorder',
      productId,
      productName,
      requestedQty,
      allocatedQty: 0,
      shippedQty: 0,
      backorderQty,
    });
  }

  return {
    allocations: allocations.filter(a => a.warehouseId !== 'BACKORDER'),
    backorderQty,
    totalAllocated,
    canFulfillFully: backorderQty === 0,
  };
}

/**
 * Calculate invoice-eligible quantity (only shipped items).
 */
export function calculateInvoiceEligibility(ordered: number, shipped: number): {
  eligibleQty: number;
  remainingQty: number;
  canInvoiceFully: boolean;
} {
  const eligibleQty = Math.min(shipped, ordered);
  return {
    eligibleQty,
    remainingQty: ordered - eligibleQty,
    canInvoiceFully: shipped >= ordered,
  };
}
