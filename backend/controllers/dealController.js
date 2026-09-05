const prisma = require('../prismaClient');

// GET /api/deals
exports.getAllDeals = async (req, res, next) => {
  try {
    const deals = await prisma.deal.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        customer: true,
        quotes: true,
        negotiations: true,
        payments: true,
        fulfillments: true,
        activities: { orderBy: { createdAt: 'desc' } },
      },
    });
    res.json({ success: true, data: deals });
  } catch (error) {
    next(error);
  }
};

// GET /api/deals/:id
exports.getDealById = async (req, res, next) => {
  try {
    const deal = await prisma.deal.findUnique({
      where: { id: req.params.id },
      include: {
        customer: true,
        quotes: { include: { items: true } },
        negotiations: true,
        payments: true,
        fulfillments: { include: { product: true } },
        activities: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!deal) {
      return res.status(404).json({ success: false, message: 'Deal not found' });
    }
    res.json({ success: true, data: deal });
  } catch (error) {
    next(error);
  }
};

// POST /api/deals
exports.createDeal = async (req, res, next) => {
  try {
    const { title, description, customerId, amount, discount, expectedMargin, status, probability, expectedCloseDate, assignedTo } = req.body;
    if (!title || !customerId) {
      return res.status(400).json({ success: false, message: 'Title and customerId are required' });
    }

    const deal = await prisma.deal.create({
      data: {
        title,
        description,
        customerId,
        amount: parseFloat(amount || 0),
        discount: parseFloat(discount || 0),
        expectedMargin: parseFloat(expectedMargin || 0),
        status: status || 'NEW',
        probability: parseFloat(probability || 50),
        expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : null,
        assignedTo: assignedTo || 'Alex Admin',
        activities: {
          create: {
            type: 'CREATED',
            description: `Deal "${title}" created with initial status ${status || 'NEW'}`,
          },
        },
      },
      include: { customer: true, activities: true },
    });

    res.status(201).json({ success: true, data: deal });
  } catch (error) {
    next(error);
  }
};

// PUT /api/deals/:id
exports.updateDeal = async (req, res, next) => {
  try {
    const { status, ...updates } = req.body;
    const existingDeal = await prisma.deal.findUnique({ where: { id: req.params.id } });
    if (!existingDeal) {
      return res.status(404).json({ success: false, message: 'Deal not found' });
    }

    const dataToUpdate = { ...updates };
    if (status) dataToUpdate.status = status;
    if (updates.expectedCloseDate) dataToUpdate.expectedCloseDate = new Date(updates.expectedCloseDate);

    const deal = await prisma.deal.update({
      where: { id: req.params.id },
      data: dataToUpdate,
      include: { customer: true },
    });

    if (status && status !== existingDeal.status) {
      await prisma.dealActivity.create({
        data: {
          dealId: deal.id,
          type: 'STATUS_CHANGED',
          description: `Status changed from ${existingDeal.status} to ${status}`,
        },
      });
    }

    res.json({ success: true, data: deal });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/deals/:id
exports.deleteDeal = async (req, res, next) => {
  try {
    await prisma.deal.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Deal deleted successfully' });
  } catch (error) {
    next(error);
  }
};
