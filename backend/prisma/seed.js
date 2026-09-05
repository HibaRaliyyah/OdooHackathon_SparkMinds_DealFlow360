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

  // 2. Seed Users & Customers with Bcrypt Passwords
  const bcrypt = require('bcryptjs');
  const defaultHashedPassword = await bcrypt.hash('demo1234', 10);

  // Staff / Admin Users
  await prisma.user.upsert({
    where: { email: 'admin@dealflow360.demo' },
    update: { password: defaultHashedPassword },
    create: {
      name: 'Alex Admin',
      email: 'admin@dealflow360.demo',
      password: defaultHashedPassword,
      role: 'ADMIN',
      company: 'DealFlow360 Internal',
    },
  });

  await prisma.user.upsert({
    where: { email: 'manager@dealflow360.demo' },
    update: { password: defaultHashedPassword },
    create: {
      name: 'Mihail Shah',
      email: 'manager@dealflow360.demo',
      password: defaultHashedPassword,
      role: 'SALES_MANAGER',
      company: 'DealFlow360 Sales Leadership',
    },
  });

  await prisma.user.upsert({
    where: { email: 'sales@dealflow360.demo' },
    update: { password: defaultHashedPassword },
    create: {
      name: 'Jasmine Rao',
      email: 'sales@dealflow360.demo',
      password: defaultHashedPassword,
      role: 'SALES_REP',
      company: 'DealFlow360 Sales Team',
    },
  });

  await prisma.user.upsert({
    where: { email: 'finance@dealflow360.demo' },
    update: { password: defaultHashedPassword },
    create: {
      name: 'Riya Iyer',
      email: 'finance@dealflow360.demo',
      password: defaultHashedPassword,
      role: 'FINANCE',
      company: 'DealFlow360 Finance Ops',
    },
  });

  console.log('✅ Staff users seeded successfully.');

  // Customers
  const cust1 = await prisma.customer.upsert({
    where: { email: 'tom@acmecorp.com' },
    update: { password: defaultHashedPassword },
    create: {
      name: 'Tom Acme',
      company: 'Acme Corp',
      email: 'tom@acmecorp.com',
      password: defaultHashedPassword,
      phone: '+1 (555) 010-2020',
      tier: 'Gold',
      currency: 'USD',
      paymentTerms: 'Net 30',
    },
  });

  const cust2 = await prisma.customer.upsert({
    where: { email: 'sarah@betaind.com' },
    update: { password: defaultHashedPassword },
    create: {
      name: 'Sarah Bet',
      company: 'Beta Industries',
      email: 'sarah@betaind.com',
      password: defaultHashedPassword,
      phone: '+1 (555) 020-3030',
      tier: 'Silver',
      currency: 'USD',
      paymentTerms: 'Net 45',
    },
  });

  await prisma.customer.upsert({
    where: { email: 'customer@dealflow360.demo' },
    update: { password: defaultHashedPassword },
    create: {
      name: 'Tom Acme',
      company: 'Acme Corp',
      email: 'customer@dealflow360.demo',
      password: defaultHashedPassword,
      phone: '+1 (555) 010-2020',
      tier: 'Gold',
      currency: 'USD',
      paymentTerms: 'Net 30',
    },
  });

  console.log('✅ Customers seeded with hashed passwords successfully.');

  // 3. Seed Deals & Quotes
  const existingQuote = await prisma.quote.findUnique({
    where: { quoteNumber: 'Q-1042' },
  });

  if (!existingQuote) {
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
  }

  // 4. Seed Negotiation Data for Customers
  const deals = await prisma.deal.findMany();
  const mainDeal = deals[0];

  if (mainDeal) {
    const existingNeg = await prisma.negotiation.findFirst({
      where: { dealId: mainDeal.id },
    });

    if (!existingNeg) {
      await prisma.negotiation.create({
        data: {
          dealId: mainDeal.id,
          requestedDiscount: 15.0,
          approvedDiscount: 12.0,
          previousAmount: 3500.0,
          negotiatedAmount: 3080.0,
          notes: 'Customer requested 15% volume discount. Approved 12% Gold Tier discount ceiling.',
          status: 'APPROVED',
        },
      });
    }
  }

  // Create a pending negotiation deal for Beta Industries
  const betaDealExisting = await prisma.deal.findFirst({
    where: { title: 'Beta Enterprise IT Procurement' },
  });

  if (!betaDealExisting) {
    const betaDeal = await prisma.deal.create({
      data: {
        title: 'Beta Enterprise IT Procurement',
        description: 'Multi-year hardware and setup package',
        customerId: cust2.id,
        amount: 14800.0,
        discount: 20,
        expectedMargin: 21.5,
        status: 'NEGOTIATION',
        probability: 70,
        assignedTo: 'Alex Manager',
        quotes: {
          create: {
            quoteNumber: 'Q-2045',
            customerId: cust2.id,
            subtotal: 18500,
            discount: 3700,
            tax: 1480,
            total: 16280,
            status: 'SENT',
            items: {
              create: [
                {
                  productId: prod1.id,
                  productName: prod1.name,
                  quantity: 10,
                  unitPrice: 1200,
                  costPrice: 900,
                  discount: 20,
                  taxPercent: 15,
                  lineTotal: 9600,
                  margin: 3000,
                  isSubscription: false,
                },
              ],
            },
          },
        },
        negotiations: {
          create: [
            {
              requestedDiscount: 20.0,
              previousAmount: 18500.0,
              negotiatedAmount: 14800.0,
              notes: 'Customer requested 20% discount on bulk laptop order of 10 units. Under review by Finance.',
              status: 'PENDING',
            },
          ],
        },
      },
    });
  }

  console.log('✅ Deals, Quotes, Negotiations, Payments, and Fulfillments seeded successfully.');
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
