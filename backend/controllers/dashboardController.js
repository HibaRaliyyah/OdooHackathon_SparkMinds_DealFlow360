const prisma = require('../prismaClient');

// GET /api/dashboard/summary
exports.getSummary = async (req, res, next) => {
  try {
    const customerCount = await prisma.customer.count();
    const dealCount = await prisma.deal.count();
    const productCount = await prisma.product.count();
    const quoteCount = await prisma.quote.count();

    const aggregatePipeline = await prisma.deal.aggregate({
      _sum: { amount: true },
      _avg: { expectedMargin: true, probability: true },
    });

    res.json({
      success: true,
      data: {
        totalCustomers: customerCount,
        totalDeals: dealCount,
        totalProducts: productCount,
        totalQuotes: quoteCount,
        totalPipelineValue: aggregatePipeline._sum.amount || 0,
        averageMarginPercent: parseFloat((aggregatePipeline._avg.expectedMargin || 0).toFixed(1)),
        averageWinProbability: parseFloat((aggregatePipeline._avg.probability || 0).toFixed(1)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/dashboard/deal-health
exports.getDealHealth = async (req, res, next) => {
  try {
    const deals = await prisma.deal.findMany({
      include: { customer: true, negotiations: true },
    });

    const riskyDeals = deals.filter((d) => d.discount > 15 || d.expectedMargin < 20);
    const wonDeals = deals.filter((d) => d.status === 'WON');
    const lostDeals = deals.filter((d) => d.status === 'LOST');

    res.json({
      success: true,
      data: {
        totalDeals: deals.length,
        wonCount: wonDeals.length,
        lostCount: lostDeals.length,
        riskyCount: riskyDeals.length,
        riskyDeals: riskyDeals.map((d) => ({
          id: d.id,
          title: d.title,
          customer: d.customer.company,
          amount: d.amount,
          discount: d.discount,
          expectedMargin: d.expectedMargin,
          riskLevel: d.discount > 20 ? 'HIGH' : 'MEDIUM',
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/dashboard/revenue
exports.getRevenue = async (req, res, next) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { status: 'PAID' },
    });

    const totalRevenue = payments.reduce((acc, p) => acc + p.amount, 0);

    res.json({
      success: true,
      data: {
        totalRevenue,
        paidTransactionsCount: payments.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/dashboard/pipeline
exports.getPipeline = async (req, res, next) => {
  try {
    const dealsByStatus = await prisma.deal.groupBy({
      by: ['status'],
      _count: { id: true },
      _sum: { amount: true },
    });

    res.json({
      success: true,
      data: dealsByStatus.map((g) => ({
        status: g.status,
        count: g._count.id,
        value: g._sum.amount || 0,
      })),
    });
  } catch (error) {
    next(error);
  }
};
