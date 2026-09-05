const prisma = require('../prismaClient');
const dealCalculationService = require('../services/dealCalculationService');

// GET /api/quotes
exports.getAllQuotes = async (req, res, next) => {
  try {
    const quotes = await prisma.quote.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        customer: true,
        deal: true,
        items: true,
      },
    });
    res.json({ success: true, data: quotes });
  } catch (error) {
    next(error);
  }
};

// GET /api/quotes/:id
exports.getQuoteById = async (req, res, next) => {
  try {
    const quote = await prisma.quote.findUnique({
      where: { id: req.params.id },
      include: { customer: true, deal: true, items: true },
    });
    if (!quote) {
      return res.status(404).json({ success: false, message: 'Quote not found' });
    }
    res.json({ success: true, data: quote });
  } catch (error) {
    next(error);
  }
};

// POST /api/quotes
exports.createQuote = async (req, res, next) => {
  try {
    const { quoteNumber, customerId, dealId, items = [], status, validUntil } = req.body;
    if (!quoteNumber || !customerId) {
      return res.status(400).json({ success: false, message: 'quoteNumber and customerId are required' });
    }

    const summary = dealCalculationService.calculateDealSummary(items);

    const quote = await prisma.quote.create({
      data: {
        quoteNumber,
        customerId,
        dealId,
        subtotal: summary.subtotal,
        discount: summary.totalDiscount,
        tax: summary.totalTax,
        total: summary.totalAmount,
        status: status || 'DRAFT',
        validUntil: validUntil ? new Date(validUntil) : null,
        items: {
          create: items.map((item) => {
            const calc = dealCalculationService.calculateLineItem(item);
            return {
              productId: item.productId,
              productName: item.productName || 'Product Item',
              quantity: parseInt(item.quantity || 1, 10),
              unitPrice: parseFloat(item.unitPrice || 0),
              costPrice: parseFloat(item.costPrice || 0),
              discount: parseFloat(item.discountPercent || item.discount || 0),
              taxPercent: parseFloat(item.taxPercent || 0),
              lineTotal: calc.lineTotal,
              margin: calc.grossProfit,
              isSubscription: Boolean(item.isSubscription),
            };
          }),
        },
      },
      include: { customer: true, items: true },
    });

    if (dealId) {
      await prisma.dealActivity.create({
        data: {
          dealId,
          type: 'QUOTE_GENERATED',
          description: `Quote ${quoteNumber} generated for total amount $${summary.totalAmount}`,
        },
      });
    }

    res.status(201).json({ success: true, data: quote });
  } catch (error) {
    next(error);
  }
};

// PUT /api/quotes/:id
exports.updateQuote = async (req, res, next) => {
  try {
    const { status, validUntil, ...updates } = req.body;
    const dataToUpdate = { ...updates };
    if (status) dataToUpdate.status = status;
    if (validUntil) dataToUpdate.validUntil = new Date(validUntil);

    const quote = await prisma.quote.update({
      where: { id: req.params.id },
      data: dataToUpdate,
      include: { customer: true, items: true },
    });

    res.json({ success: true, data: quote });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/quotes/:id
exports.deleteQuote = async (req, res, next) => {
  try {
    await prisma.quote.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Quote deleted successfully' });
  } catch (error) {
    next(error);
  }
};
