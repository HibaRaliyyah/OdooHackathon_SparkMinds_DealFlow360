const prisma = require('../prismaClient');

// GET /api/negotiations
exports.getAllNegotiations = async (req, res, next) => {
  try {
    const negotiations = await prisma.negotiation.findMany({
      orderBy: { createdAt: 'desc' },
      include: { deal: { include: { customer: true } } },
    });
    res.json({ success: true, data: negotiations });
  } catch (error) {
    next(error);
  }
};

// POST /api/negotiations
exports.createNegotiation = async (req, res, next) => {
  try {
    const { dealId, requestedDiscount, previousAmount, negotiatedAmount, notes } = req.body;
    if (!dealId || requestedDiscount === undefined) {
      return res.status(400).json({ success: false, message: 'dealId and requestedDiscount are required' });
    }

    const negotiation = await prisma.negotiation.create({
      data: {
        dealId,
        requestedDiscount: parseFloat(requestedDiscount),
        previousAmount: parseFloat(previousAmount || 0),
        negotiatedAmount: parseFloat(negotiatedAmount || 0),
        notes,
        status: 'PENDING',
      },
      include: { deal: true },
    });

    await prisma.dealActivity.create({
      data: {
        dealId,
        type: 'NEGOTIATION_STARTED',
        description: `Discount negotiation submitted requesting ${requestedDiscount}% discount`,
      },
    });

    res.status(201).json({ success: true, data: negotiation });
  } catch (error) {
    next(error);
  }
};

// PUT /api/negotiations/:id
exports.updateNegotiation = async (req, res, next) => {
  try {
    const { status, approvedDiscount, notes } = req.body;
    const negotiation = await prisma.negotiation.update({
      where: { id: req.params.id },
      data: {
        status,
        approvedDiscount: approvedDiscount !== undefined ? parseFloat(approvedDiscount) : undefined,
        notes,
      },
      include: { deal: true },
    });

    if (status === 'APPROVED') {
      await prisma.dealActivity.create({
        data: {
          dealId: negotiation.dealId,
          type: 'NEGOTIATION_APPROVED',
          description: `Discount negotiation approved at ${approvedDiscount || negotiation.requestedDiscount}% discount`,
        },
      });
    }

    res.json({ success: true, data: negotiation });
  } catch (error) {
    next(error);
  }
};
