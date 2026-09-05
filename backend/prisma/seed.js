const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting DealFlow360 Database Seeding...');

  // 1. Seed Product Catalog
  const prod1 = await prisma.product.upsert({
    where: { sku: 'LAP-PRO-14' },
    update: {},
    create: {
      name: 'Laptop Pro 14',
      description: 'High-performance business laptop with 14" display, Intel Core i7, 16GB RAM.',
      sku: 'LAP-PRO-14',
      basePrice: 1200,
      unitPrice: 1200,
      costPrice: 900,
      stockQuantity: 50,
      type: 'Hardware',
      unit: 'Each',
      taxPercent: 15,
      isSubscription: false,
      status: 'Active',
    },
  });

  const prod2 = await prisma.product.upsert({
    where: { sku: 'SVC-SETUP-ONS' },
    update: {},
    create: {
      name: 'Onsite Setup Service',
      description: 'Professional on-site hardware setup and configuration service.',
      sku: 'SVC-SETUP-ONS',
      basePrice: 450,
      unitPrice: 450,
      costPrice: 200,
      stockQuantity: 100,
      type: 'Services',
      unit: 'Each',
      taxPercent: 10,
      isSubscription: false,
      status: 'Active',
    },
  });

  const prod3 = await prisma.product.upsert({
    where: { sku: 'SUB-CARE-2YR' },
    update: {},
    create: {
      name: 'Care Plan 2yr',
      description: 'Comprehensive 2-year care plan with priority support and remote diagnostics.',
      sku: 'SUB-CARE-2YR',
      basePrice: 46,
      unitPrice: 46,
      costPrice: 12,
      stockQuantity: 999,
      type: 'Subscription',
      unit: 'Monthly',
      taxPercent: 10,
      isSubscription: true,
      status: 'Active',
    },
  });

  console.log('✅ Products seeded successfully.');

  // 2. Seed Customers
  const cust1 = await prisma.customer.upsert({
    where: { email: 'tom@acmecorp.com' },
    update: {},
    create: {
      name: 'Tom Acme',
      company: 'Acme Corp',
      email: 'tom@acmecorp.com',
      phone: '+1 (555) 010-2020',
      tier: 'Gold',
      currency: 'USD',
      paymentTerms: 'Net 30',
    },
  });

  const cust2 = await prisma.customer.upsert({
    where: { email: 'sarah@betaind.com' },
    update: {},
    create: {
      name: 'Sarah Bet',
      company: 'Beta Industries',
      email: 'sarah@betaind.com',
      phone: '+1 (555) 020-3030',
      tier: 'Silver',
      currency: 'USD',
      paymentTerms: 'Net 45',
    },
  });

  console.log('✅ Customers seeded successfully.');

  // 3. Seed Deals & Quotes
  const deal1 = await prisma.deal.create({
    data: {
      title: 'Acme Hardware & Services Deployment',
      description: '14-inch Laptop rollout with on-site installation',
      customerId: cust1.id,
      amount: 2876.55,
      discount: 12,
      expectedMargin: 26.2,
      status: 'WON',
      probability: 100,
      assignedTo: 'Jasmine Rao',
      quotes: {
        create: {
          quoteNumber: 'Q-1042',
          customerId: cust1.id,
          subtotal: 3080,
          discount: 303.6,
          tax: 259.95,
          total: 3036.35,
          status: 'ACCEPTED',
          items: {
            create: [
              {
                productId: prod1.id,
                productName: prod1.name,
                quantity: 2,
                unitPrice: 1200,
                costPrice: 900,
                discount: 12,
                taxPercent: 15,
                lineTotal: 2112,
                margin: 456,
                isSubscription: false,
              },
              {
                productId: prod2.id,
                productName: prod2.name,
                quantity: 1,
                unitPrice: 450,
                costPrice: 200,
                discount: 18,
                taxPercent: 10,
                lineTotal: 407.55,
                margin: 119,
                isSubscription: false,
              },
            ],
          },
        },
      },
      payments: {
        create: {
          amount: 3036.35,
          paymentMethod: 'Credit Card',
          status: 'PAID',
          transactionReference: 'TXN-994821',
          paidAt: new Date(),
        },
      },
      fulfillments: {
        create: {
          productId: prod1.id,
          quantity: 2,
          fulfilledQuantity: 2,
          remainingQuantity: 0,
          status: 'FULFILLED',
        },
      },
    },
  });

  console.log('✅ Deals, Quotes, Payments, and Fulfillments seeded successfully.');
  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
