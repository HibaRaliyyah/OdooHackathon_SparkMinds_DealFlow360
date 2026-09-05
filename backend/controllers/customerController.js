const prisma = require('../prismaClient');

// GET /api/customers
exports.getAllCustomers = async (req, res, next) => {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: 'desc' },
      include: { deals: true },
    });
    res.json({ success: true, data: customers });
  } catch (error) {
    next(error);
  }
};

// GET /api/customers/:id
exports.getCustomerById = async (req, res, next) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id },
      include: { deals: true, quotes: true },
    });
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

// POST /api/customers
exports.createCustomer = async (req, res, next) => {
  try {
    const { name, email, phone, company, tier, currency, paymentTerms } = req.body;
    if (!name || !email || !company) {
      return res.status(400).json({ success: false, message: 'Name, email, and company are required' });
    }

    const customer = await prisma.customer.create({
      data: { name, email, phone, company, tier, currency, paymentTerms },
    });

    res.status(201).json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

// PUT /api/customers/:id
exports.updateCustomer = async (req, res, next) => {
  try {
    const customer = await prisma.customer.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/customers/:id
exports.deleteCustomer = async (req, res, next) => {
  try {
    await prisma.customer.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Customer deleted successfully' });
  } catch (error) {
    next(error);
  }
};
