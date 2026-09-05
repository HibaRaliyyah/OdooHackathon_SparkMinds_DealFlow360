const prisma = require('../prismaClient');

// GET /api/fulfillment
exports.getAllFulfillments = async (req, res, next) => {
  try {
    const fulfillments = await prisma.fulfillment.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        deal: { include: { customer: true } },
        product: true,
      },
    });
    res.json({ success: true, data: fulfillments });
  } catch (error) {
    next(error);
  }
};

// POST /api/fulfillment
exports.createFulfillment = async (req, res, next) => {
  try {
    const { dealId, productId, quantity, expectedDate } = req.body;
    if (!dealId || !productId || !quantity) {
      return res.status(400).json({ success: false, message: 'dealId, productId, and quantity are required' });
    }

    const qty = parseInt(quantity, 10);
    const fulfillment = await prisma.fulfillment.create({
      data: {
        dealId,
        productId,
        quantity: qty,
        fulfilledQuantity: 0,
        remainingQuantity: qty,
        status: 'PENDING',
        expectedDate: expectedDate ? new Date(expectedDate) : null,
      },
      include: { deal: true, product: true },
    });

    await prisma.dealActivity.create({
      data: {
        dealId,
        type: 'FULFILLMENT_STARTED',
        description: `Fulfillment record created for ${qty}x ${fulfillment.product.name}`,
      },
    });

    res.status(201).json({ success: true, data: fulfillment });
  } catch (error) {
    next(error);
  }
};

// PUT /api/fulfillment/:id
exports.updateFulfillment = async (req, res, next) => {
  try {
    const { fulfilledQuantity, status } = req.body;
    const existing = await prisma.fulfillment.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Fulfillment record not found' });
    }

    const newFulfilledQty = fulfilledQuantity !== undefined ? parseInt(fulfilledQuantity, 10) : existing.fulfilledQuantity;
    const remainingQty = existing.quantity - newFulfilledQty;
    let computedStatus = status || existing.status;

    if (!status) {
      if (newFulfilledQty >= existing.quantity) computedStatus = 'FULFILLED';
      else if (newFulfilledQty > 0) computedStatus = 'PARTIAL';
      else computedStatus = 'PENDING';
    }

    const fulfillment = await prisma.fulfillment.update({
      where: { id: req.params.id },
      data: {
        fulfilledQuantity: newFulfilledQty,
        remainingQuantity: Math.max(0, remainingQty),
        status: computedStatus,
      },
      include: { deal: true, product: true },
    });

    res.json({ success: true, data: fulfillment });
  } catch (error) {
    next(error);
  }
};
