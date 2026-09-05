const prisma = require('../prismaClient');

// GET /api/products
exports.getAllProducts = async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

// GET /api/products/:id
exports.getProductById = async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
    });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// POST /api/products
exports.createProduct = async (req, res, next) => {
  try {
    const { name, description, sku, basePrice, unitPrice, costPrice, stockQuantity, type, unit, taxPercent, isSubscription, status } = req.body;
    if (!name || !sku) {
      return res.status(400).json({ success: false, message: 'Name and SKU are required' });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        sku,
        basePrice: parseFloat(basePrice || unitPrice || 0),
        unitPrice: parseFloat(unitPrice || basePrice || 0),
        costPrice: parseFloat(costPrice || 0),
        stockQuantity: parseInt(stockQuantity || 0, 10),
        type: type || 'Hardware',
        unit: unit || 'Each',
        taxPercent: parseFloat(taxPercent || 15),
        isSubscription: Boolean(isSubscription),
        status: status || 'Active',
      },
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// PUT /api/products/:id
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/products/:id
exports.deleteProduct = async (req, res, next) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};
