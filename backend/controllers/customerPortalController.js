const prisma = require('../prismaClient');

/**
 * Helper to strip internal financial/margin metrics before sending data to customer
 */
function sanitizeQuoteForCustomer(quote) {
  if (!quote) return null;
  const { items, ...rest } = quote;

  const sanitizedItems = items ? items.map(item => {
    const { costPrice, margin, ...publicItemFields } = item;
    return publicItemFields;
  }) : [];

  return {
    ...rest,
    items: sanitizedItems,
  };
}

// GET /api/customer/dashboard
exports.getDashboardData = async (req, res, next) => {
  try {
    const customerId = req.query.customerId;
    const whereCondition = customerId ? { customerId } : {};

    const [quotes, deals] = await Promise.all([
      prisma.quote.findMany({
        where: whereCondition,
        include: { items: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.deal.findMany({
        where: whereCondition,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const activeQuotesCount = quotes.filter(q => q.status === 'SENT' || q.status === 'DRAFT').length;
    const confirmedOrdersCount = deals.filter(d => d.status === 'WON').length;
    const pendingInvoicesCount = quotes.filter(q => q.status === 'ACCEPTED').length;

    const sanitizedQuotes = quotes.slice(0, 5).map(sanitizeQuoteForCustomer);

    res.json({
      success: true,
      data: {
        kpis: {
          activeQuotations: activeQuotesCount,
          confirmedOrders: confirmedOrdersCount,
          pendingInvoices: pendingInvoicesCount,
        },
        recentQuotations: sanitizedQuotes,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/customer/quotations
exports.getQuotations = async (req, res, next) => {
  try {
    const customerId = req.query.customerId;
    const whereCondition = customerId ? { customerId } : {};

    const quotes = await prisma.quote.findMany({
      where: whereCondition,
      include: { items: true, customer: true },
      orderBy: { createdAt: 'desc' },
    });

    const sanitizedQuotes = quotes.map(sanitizeQuoteForCustomer);

    res.json({ success: true, data: sanitizedQuotes });
  } catch (error) {
    next(error);
  }
};

// GET /api/customer/quotations/:id
exports.getQuotationById = async (req, res, next) => {
  try {
    const quote = await prisma.quote.findUnique({
      where: { id: req.params.id },
      include: { items: true, customer: true },
    });

    if (!quote) {
      return res.status(404).json({ success: false, message: 'Quotation not found' });
    }

    res.json({ success: true, data: sanitizeQuoteForCustomer(quote) });
  } catch (error) {
    next(error);
  }
};

// POST /api/customer/quotations/:id/negotiate
exports.negotiateQuotation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { requestedDiscountPercent, customerNotes, lineItemChanges } = req.body;

    const quote = await prisma.quote.findUnique({ where: { id } });
    if (!quote) {
      return res.status(404).json({ success: false, message: 'Quotation not found' });
    }

    // Update quote status to SENT / Under Negotiation
    const updatedQuote = await prisma.quote.update({
      where: { id },
      data: {
        status: 'SENT',
        discount: quote.subtotal * ((requestedDiscountPercent || 5) / 100),
      },
      include: { items: true },
    });

    // Create negotiation record if deal exists
    if (quote.dealId) {
      await prisma.negotiation.create({
        data: {
          dealId: quote.dealId,
          requestedDiscount: requestedDiscountPercent || 5,
          previousAmount: quote.total,
          negotiatedAmount: quote.subtotal * (1 - (requestedDiscountPercent || 5) / 100),
          notes: customerNotes || 'Customer requested terms revision.',
          status: 'PENDING',
        },
      });
    }

    res.json({
      success: true,
      message: 'Negotiation request submitted successfully.',
      data: sanitizeQuoteForCustomer(updatedQuote),
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/customer/quotations/:id/accept
exports.acceptQuotation = async (req, res, next) => {
  try {
    const { id } = req.params;

    const quote = await prisma.quote.update({
      where: { id },
      data: { status: 'ACCEPTED' },
      include: { items: true },
    });

    if (quote.dealId) {
      await prisma.deal.update({
        where: { id: quote.dealId },
        data: { status: 'WON' },
      });
    }

    res.json({
      success: true,
      message: 'Quotation accepted and order confirmed!',
      data: sanitizeQuoteForCustomer(quote),
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/customer/quotations/:id/reject
exports.rejectQuotation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const quote = await prisma.quote.update({
      where: { id },
      data: { status: 'REJECTED' },
      include: { items: true },
    });

    res.json({
      success: true,
      message: 'Quotation rejected.',
      data: sanitizeQuoteForCustomer(quote),
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/customer/orders
exports.getOrders = async (req, res, next) => {
  try {
    const customerId = req.query.customerId;
    const whereCondition = customerId ? { customerId } : {};

    const deals = await prisma.deal.findMany({
      where: { ...whereCondition, status: 'WON' },
      include: { fulfillments: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: deals });
  } catch (error) {
    next(error);
  }
};

// GET /api/customer/profile
exports.getProfile = async (req, res, next) => {
  try {
    const customerId = req.query.customerId;
    if (!customerId) {
      const firstCustomer = await prisma.customer.findFirst();
      return res.json({ success: true, data: firstCustomer });
    }

    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    res.json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

// PUT /api/customer/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { customerId, name, email, phone, billingAddress, shippingAddress } = req.body;

    const updatedCustomer = await prisma.customer.update({
      where: { id: customerId },
      data: { name, email, phone },
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedCustomer,
    });
  } catch (error) {
    next(error);
  }
};
