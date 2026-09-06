import type {
  Quotation,
  FulfillmentOrder,
  WarehouseAllocation,
  Invoice,
  NegotiationRequest,
  Notification,
  ActivityItem,
  Warehouse,
  InventoryItem,
  Subscription,
} from '@/lib/types';
import { createInvoiceFromFulfillment, calculateNextBillingDate } from './billingService';
import { adjustInventoryForAllocations } from './inventoryService';

/**
 * Step 1: Customer Confirms Terms -> Moves stage to 'Awaiting Allocation'.
 * Creates/registers Fulfillment in 'Awaiting' status.
 * Notifies Finance & Operations to perform depot resource allocation before payment is unlocked.
 */
export function submitQuotationForFinanceAllocation(
  quotation: Quotation,
  store: {
    updateQuotation: (id: string, updates: Partial<Quotation>) => void;
    addNotification: (n: Notification) => void;
    addActivity: (a: ActivityItem) => void;
    fulfillmentOrders?: FulfillmentOrder[];
    addFulfillmentOrder?: (fo: FulfillmentOrder) => void;
    updateFulfillmentOrder?: (id: string, updates: Partial<FulfillmentOrder>) => void;
    negotiations?: NegotiationRequest[];
    updateNegotiation?: (id: string, updates: Partial<NegotiationRequest>) => void;
  }
) {
  // 1. Update quotation stage to Awaiting Allocation
  store.updateQuotation(quotation.id, { stage: 'Awaiting Allocation' });

  // 2. Resolve any active negotiation
  if (store.negotiations && store.updateNegotiation) {
    const activeNeg = store.negotiations.find(
      (n) => n.quotationId === quotation.id || n.quotationNumber === quotation.quoteNumber
    );
    if (activeNeg) {
      store.updateNegotiation(activeNeg.id, { status: 'Resolved' });
    }
  }

  // 3. Register or update pending fulfillment order in Awaiting status
  if (store.fulfillmentOrders) {
    const existingFulfillment = store.fulfillmentOrders.find(
      (f) => f.quotationId === quotation.id || f.quotationNumber === quotation.quoteNumber
    );

    if (!existingFulfillment && store.addFulfillmentOrder) {
      const newFulfillment: FulfillmentOrder = {
        id: `ful-${quotation.id}-${Date.now()}`,
        quotationId: quotation.id,
        quotationNumber: quotation.quoteNumber,
        customerId: quotation.customerId,
        customerName: quotation.customerName,
        status: 'Awaiting',
        allocations: [],
        shipments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      store.addFulfillmentOrder(newFulfillment);
    } else if (existingFulfillment && store.updateFulfillmentOrder) {
      store.updateFulfillmentOrder(existingFulfillment.id, {
        status: 'Awaiting',
        updatedAt: new Date().toISOString(),
      });
    }
  }

  // 4. Notify Finance (Primary action taker)
  store.addNotification({
    id: `notif-fin-alloc-${Date.now()}`,
    userId: 'user-finance',
    title: 'Quotation Awaiting Fulfillment Allocation',
    message: `Customer ${quotation.customerName} confirmed terms for ${quotation.quoteNumber}. Pending Finance depot stock allocation before customer payment is unlocked.`,
    type: 'warning',
    read: false,
    createdAt: new Date().toISOString(),
  });

  // 5. Notify Customer
  store.addNotification({
    id: `notif-cust-await-${Date.now()}`,
    userId: 'user-customer',
    title: 'Quotation Terms Confirmed',
    message: `Quotation ${quotation.quoteNumber} terms confirmed! Submitted to Finance for warehouse depot stock allocation. Payment will unlock once warehouses are allocated.`,
    type: 'info',
    read: false,
    createdAt: new Date().toISOString(),
  });

  // 6. Notify Sales Representative
  store.addNotification({
    id: `notif-rep-await-${Date.now()}`,
    userId: quotation.assignedToId || 'user-2',
    title: 'Customer Confirmed Terms — Awaiting Finance',
    message: `Customer ${quotation.customerName} accepted ${quotation.quoteNumber}. Transferred to Finance for warehouse stock allocation.`,
    type: 'info',
    read: false,
    createdAt: new Date().toISOString(),
  });

  // 7. Activity Log
  store.addActivity({
    id: `act-awaiting-alloc-${Date.now()}`,
    type: 'fulfillment',
    message: `${quotation.customerName} confirmed quotation terms for ${quotation.quoteNumber}. Stage set to Awaiting Allocation — routed to Finance for depot allocation prior to payment.`,
    relatedTo: quotation.id,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Step 2: Finance Allocates Warehouses -> Moves stage to 'Allocated'.
 * Sets FulfillmentOrder status to 'Allocated' and generates/updates Invoice in 'Unpaid' status.
 * Unlocks the customer's ability to complete payment.
 */
export function confirmQuotationAndAllocate(
  quotation: Quotation,
  store: {
    updateQuotation: (id: string, updates: Partial<Quotation>) => void;
    fulfillmentOrders: FulfillmentOrder[];
    addFulfillmentOrder: (fo: FulfillmentOrder) => void;
    updateFulfillmentOrder: (id: string, updates: Partial<FulfillmentOrder>) => void;
    addNotification: (n: Notification) => void;
    addActivity: (a: ActivityItem) => void;
    warehouses?: Warehouse[];
    inventory?: InventoryItem[];
    updateInventory?: (id: string, updates: Partial<InventoryItem>) => void;
    addInventoryItem?: (item: InventoryItem) => void;
    invoices?: Invoice[];
    addInvoice?: (inv: Invoice) => void;
    updateInvoice?: (id: string, updates: Partial<Invoice>) => void;
    negotiations?: NegotiationRequest[];
    updateNegotiation?: (id: string, updates: Partial<NegotiationRequest>) => void;
  },
  customAllocations?: WarehouseAllocation[]
): string {
  // 1. Update quotation stage to Allocated (Awaiting Customer Payment)
  store.updateQuotation(quotation.id, { stage: 'Allocated' });

  // 2. Resolve any active negotiation
  const activeNeg = (store.negotiations || []).find(
    (n) => n.quotationId === quotation.id || n.quotationNumber === quotation.quoteNumber
  );
  if (activeNeg && store.updateNegotiation) {
    store.updateNegotiation(activeNeg.id, { status: 'Resolved' });
  }

  // 3. Determine Allocations
  const existingFulfillment = store.fulfillmentOrders.find(
    (f) => f.quotationId === quotation.id || f.quotationNumber === quotation.quoteNumber
  );

  const availableWarehouses = store.warehouses && store.warehouses.length > 0
    ? store.warehouses
    : [
        { id: 'wh-1', name: 'Main Warehouse', location: 'Chicago, IL' },
        { id: 'wh-2', name: 'East Depot', location: 'Newark, NJ' },
        { id: 'wh-3', name: 'West Hub', location: 'Los Angeles, CA' },
      ];

  const defaultAllocations: WarehouseAllocation[] = (quotation.items || []).map((item, idx) => {
    const wh = availableWarehouses[idx % availableWarehouses.length];
    return {
      warehouseId: wh.id,
      warehouseName: wh.name,
      productId: item.productId,
      productName: item.productName || 'Item',
      requestedQty: item.quantity || 1,
      allocatedQty: item.quantity || 1,
      shippedQty: 0,
      backorderQty: 0,
    };
  });

  const finalAllocations = customAllocations || (
    existingFulfillment?.allocations && existingFulfillment.allocations.length > 0
      ? existingFulfillment.allocations
      : defaultAllocations
  );

  let fulfillmentId = '';
  if (!existingFulfillment) {
    fulfillmentId = `ful-${quotation.id}-${Date.now()}`;
    const newFulfillmentOrder: FulfillmentOrder = {
      id: fulfillmentId,
      quotationId: quotation.id,
      quotationNumber: quotation.quoteNumber,
      customerId: quotation.customerId,
      customerName: quotation.customerName,
      status: 'Allocated',
      allocations: finalAllocations,
      shipments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.addFulfillmentOrder(newFulfillmentOrder);
  } else {
    fulfillmentId = existingFulfillment.id;
    store.updateFulfillmentOrder(existingFulfillment.id, {
      status: 'Allocated',
      allocations: finalAllocations,
      updatedAt: new Date().toISOString(),
    });
  }

  // Dynamically reserve physical stock across allocated depots
  if (store.inventory && store.updateInventory) {
    adjustInventoryForAllocations(
      finalAllocations,
      existingFulfillment?.allocations,
      store.inventory,
      store.updateInventory,
      store.addInventoryItem,
      false
    );
  }

  // 4. Generate/Update matching invoice in 'Unpaid' status (Customer payment is now unlocked!)
  if (store.invoices && store.updateInvoice) {
    const matchingInvoices = store.invoices.filter(
      (i) =>
        i.quotationNumber === quotation.quoteNumber ||
        i.quotationId === quotation.id ||
        (quotation.quoteNumber && i.invoiceNumber.includes(quotation.quoteNumber)) ||
        (quotation.quoteNumber && i.quotationNumber === quotation.quoteNumber)
    );

    if (matchingInvoices.length > 0) {
      matchingInvoices.forEach((matchingInv) => {
        if (matchingInv.status !== 'Paid') {
          store.updateInvoice!(matchingInv.id, {
            status: 'Unpaid',
            dueAmount: matchingInv.total,
            paidAmount: 0,
          });
        }
      });
    } else if (store.addInvoice) {
      const newInvoice = createInvoiceFromFulfillment(quotation, {
        id: fulfillmentId,
        quotationId: quotation.id,
        quotationNumber: quotation.quoteNumber,
        customerId: quotation.customerId,
        customerName: quotation.customerName,
        status: 'Allocated',
        allocations: finalAllocations,
        shipments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      newInvoice.status = 'Unpaid';
      newInvoice.dueAmount = newInvoice.total;
      newInvoice.paidAmount = 0;
      store.addInvoice(newInvoice);
    }
  }

  // 5. Notify Customer that Payment is Unlocked
  store.addNotification({
    id: `notif-cust-unlocked-${Date.now()}`,
    userId: 'user-customer',
    title: 'Warehouse Allocated — Payment Unlocked!',
    message: `Finance has allocated warehouse stock for ${quotation.quoteNumber}. You can now complete your payment online.`,
    type: 'success',
    read: false,
    createdAt: new Date().toISOString(),
  });

  // 6. Notify Sales Representative
  store.addNotification({
    id: `notif-rep-alloc-${Date.now()}`,
    userId: quotation.assignedToId || 'user-2',
    title: 'Warehouse Allocated by Finance',
    message: `Finance completed depot stock allocation for ${quotation.quoteNumber}. Customer payment is now unlocked.`,
    type: 'success',
    read: false,
    createdAt: new Date().toISOString(),
  });

  // 7. Activity Log
  store.addActivity({
    id: `act-alloc-${Date.now()}`,
    type: 'fulfillment',
    message: `Finance allocated warehouse depots for ${quotation.quoteNumber}. Customer payment is now unlocked.`,
    relatedTo: quotation.id,
    timestamp: new Date().toISOString(),
  });

  return fulfillmentId;
}

/**
 * Step 3: Customer Completes Payment (Once Warehouses are Allocated).
 * Transitions Invoice to 'Paid', Quotation to 'Paid', and Fulfillment to 'Completed' / Dispatch.
 */
export function processCustomerPayment(
  quotation: Quotation,
  paymentDetails: {
    amount: number;
    billingType: 'onetime' | 'recurring';
    recurringCycle?: 'Monthly' | 'Quarterly' | 'Yearly';
    method: 'Credit Card' | 'ACH / Bank Wire' | 'Bank Transfer' | 'Wire';
  },
  store: {
    updateQuotation: (id: string, updates: Partial<Quotation>) => void;
    fulfillmentOrders: FulfillmentOrder[];
    updateFulfillmentOrder: (id: string, updates: Partial<FulfillmentOrder>) => void;
    invoices: Invoice[];
    updateInvoice: (id: string, updates: Partial<Invoice>) => void;
    addInvoice?: (inv: Invoice) => void;
    addSubscription?: (sub: Subscription) => void;
    addNotification: (n: Notification) => void;
    addActivity: (a: ActivityItem) => void;
    inventory?: InventoryItem[];
    updateInventory?: (id: string, updates: Partial<InventoryItem>) => void;
    addInventoryItem?: (item: InventoryItem) => void;
  }
) {
  // 1. Update quotation to Paid
  store.updateQuotation(quotation.id, { stage: 'Paid' });

  // 2. Update matching fulfillment order to Completed / Shipped
  const matchingFulfillment = store.fulfillmentOrders.find(
    (f) => f.quotationId === quotation.id || f.quotationNumber === quotation.quoteNumber
  );
  if (matchingFulfillment) {
    store.updateFulfillmentOrder(matchingFulfillment.id, {
      status: 'Completed',
      updatedAt: new Date().toISOString(),
    });

    // Deduct physical inventory across allocated depots upon final payment dispatch
    if (store.inventory && store.updateInventory) {
      adjustInventoryForAllocations(
        matchingFulfillment.allocations || [],
        undefined,
        store.inventory,
        store.updateInventory,
        store.addInventoryItem,
        true
      );
    }
  }

  // 3. Update or create invoice to Paid
  let activeInvoice = store.invoices.find(
    (i) => i.quotationId === quotation.id || i.quotationNumber === quotation.quoteNumber
  );

  const paymentMethodType =
    paymentDetails.method === 'ACH / Bank Wire'
      ? ('Wire' as const)
      : paymentDetails.method === 'Credit Card'
      ? ('Credit Card' as const)
      : ('Bank Transfer' as const);

  const paymentRecord = {
    id: `pay-${Date.now()}`,
    invoiceId: activeInvoice?.id || `inv-${quotation.id}`,
    amount: paymentDetails.amount,
    currency: (quotation.currency || 'USD') as 'USD' | 'EUR',
    paymentDate: new Date().toISOString().slice(0, 10),
    method: paymentMethodType,
    reference: `TXN-${Date.now().toString().slice(-6)}`,
    status: 'Confirmed' as const,
  };

  const invoiceType = paymentDetails.billingType === 'recurring' ? 'Recurring' : 'One-Time';

  if (activeInvoice) {
    store.updateInvoice(activeInvoice.id, {
      type: invoiceType,
      status: 'Paid',
      paidAmount: paymentDetails.amount,
      dueAmount: 0,
      payments: [...(activeInvoice.payments || []), paymentRecord],
    });
    activeInvoice = {
      ...activeInvoice,
      type: invoiceType,
      status: 'Paid',
      paidAmount: paymentDetails.amount,
      dueAmount: 0,
      payments: [...(activeInvoice.payments || []), paymentRecord],
    };
  } else if (store.addInvoice) {
    const grandTotal = (quotation.oneTimeTotal || 0) + (quotation.recurringTotal || 0);
    const newInv: Invoice = {
      id: `inv-${quotation.id}-${Date.now()}`,
      invoiceNumber: `INV-2026-${quotation.quoteNumber ? quotation.quoteNumber.replace(/[^0-9]/g, '') : '5004'}`,
      quotationId: quotation.id,
      quotationNumber: quotation.quoteNumber,
      customerId: quotation.customerId || 'cust-1',
      customerName: quotation.customerName,
      type: invoiceType,
      status: 'Paid',
      subtotal: quotation.subtotal || grandTotal,
      discount: quotation.totalDiscount || 0,
      tax: quotation.totalTax || (quotation.subtotal || grandTotal) * 0.08,
      total: grandTotal,
      paidAmount: paymentDetails.amount,
      dueAmount: 0,
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deliveryReconciled: false,
      items: (quotation.items || []).map((it, idx) => ({
        id: `inv-item-${idx}`,
        productId: it.productId,
        productName: it.productName,
        orderedQty: it.quantity,
        shippedQty: it.quantity,
        billedQty: it.quantity,
        unitPrice: it.unitPrice,
        discount: it.discount || 0,
        taxPercent: it.taxPercent || 8,
        lineTotal: it.unitPrice * it.quantity * (1 - (it.discount || 0) / 100),
      })),
      payments: [paymentRecord],
    };
    activeInvoice = newInv;
    store.addInvoice(newInv);
  }

  // 4. If recurring subscription, register subscription record
  if (paymentDetails.billingType === 'recurring' && store.addSubscription) {
    const cycle = paymentDetails.recurringCycle || 'Monthly';
    const nextBillDate = calculateNextBillingDate(new Date().toISOString().slice(0, 10), cycle);
    store.addSubscription({
      id: `sub-${quotation.id}-${Date.now()}`,
      quotationId: quotation.id,
      quotationNumber: quotation.quoteNumber,
      customerId: quotation.customerId || 'cust-1',
      customerName: quotation.customerName,
      plan: `${cycle} Subscription Plan (${quotation.quoteNumber})`,
      status: 'Active',
      cycle,
      currentAmount: paymentDetails.amount,
      nextBillDate,
      startDate: new Date().toISOString().slice(0, 10),
      items: [],
      billingHistory: activeInvoice ? [activeInvoice] : [],
      prorationHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }


  // 5. Notifications
  store.addNotification({
    id: `notif-paid-cust-${Date.now()}`,
    userId: 'user-customer',
    title: 'Payment Successful',
    message: `Payment of $${paymentDetails.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} for ${quotation.quoteNumber} was confirmed. Order is dispatched to warehouse fulfillment.`,
    type: 'success',
    read: false,
    createdAt: new Date().toISOString(),
  });

  store.addNotification({
    id: `notif-paid-rep-${Date.now()}`,
    userId: quotation.assignedToId || 'user-2',
    title: 'Customer Paid Quotation!',
    message: `Customer ${quotation.customerName} completed payment ($${paymentDetails.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}) for ${quotation.quoteNumber}. Order is released for dispatch.`,
    type: 'success',
    read: false,
    createdAt: new Date().toISOString(),
  });

  store.addNotification({
    id: `notif-paid-fin-${Date.now()}`,
    userId: 'user-finance',
    title: 'Customer Payment Received',
    message: `Customer ${quotation.customerName} completed payment of $${paymentDetails.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} for ${quotation.quoteNumber}.`,
    type: 'success',
    read: false,
    createdAt: new Date().toISOString(),
  });

  // 6. Activity Log
  store.addActivity({
    id: `act-paid-${Date.now()}`,
    type: 'payment',
    message: `${quotation.customerName} completed payment ($${paymentDetails.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}) for ${quotation.quoteNumber}. Transferred to fulfillment dispatch.`,
    relatedTo: quotation.id,
    timestamp: new Date().toISOString(),
  });
}
