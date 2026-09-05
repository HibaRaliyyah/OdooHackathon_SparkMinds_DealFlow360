const prisma = require('../prismaClient');

// GET /api/payments
exports.getAllPayments = async (req, res, next) => {
  try {
    const payments = await prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
      include: { deal: { include: { customer: true } } },
    });
    res.json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
};

// POST /api/payments
exports.createPayment = async (req, res, next) => {
  try {
    const { dealId, amount, paymentMethod, transactionReference, status } = req.body;
    if (!dealId || amount === undefined) {
      return res.status(400).json({ success: false, message: 'dealId and amount are required' });
    }

    const paymentStatus = status || 'PAID';
    const payment = await prisma.payment.create({
      data: {
        dealId,
        amount: parseFloat(amount),
        paymentMethod: paymentMethod || 'Credit Card',
        transactionReference: transactionReference || `TXN-${Date.now()}`,
        status: paymentStatus,
        paidAt: paymentStatus === 'PAID' ? new Date() : null,
      },
      include: { deal: true },
    });

    if (paymentStatus === 'PAID') {
      await prisma.dealActivity.create({
        data: {
          dealId,
          type: 'PAYMENT_RECEIVED',
          description: `Payment of $${amount} received via ${paymentMethod || 'Credit Card'} (${payment.transactionReference})`,
        },
      });
    }

    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

// PUT /api/payments/:id
exports.updatePayment = async (req, res, next) => {
  try {
    const { status, transactionReference } = req.body;
    const dataToUpdate = {};
    if (status) {
      dataToUpdate.status = status;
      if (status === 'PAID') dataToUpdate.paidAt = new Date();
    }
    if (transactionReference) dataToUpdate.transactionReference = transactionReference;

    const payment = await prisma.payment.update({
      where: { id: req.params.id },
      data: dataToUpdate,
      include: { deal: true },
    });

    res.json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};
