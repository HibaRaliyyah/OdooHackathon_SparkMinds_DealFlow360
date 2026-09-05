/**
 * DealFlow360 — Financial & Deal Calculation Service
 * Performs reliable server-side financial metrics calculations.
 */
class DealCalculationService {
  /**
   * Calculate line item financials
   */
  calculateLineItem({ unitPrice, costPrice, discountPercent = 0, quantity = 1, taxPercent = 0 }) {
    const listTotal = unitPrice * quantity;
    const discountAmount = listTotal * (discountPercent / 100);
    const netSellingPrice = listTotal - discountAmount;
    const taxAmount = netSellingPrice * (taxPercent / 100);
    const lineTotal = netSellingPrice + taxAmount;
    const totalCost = costPrice * quantity;
    const grossProfit = netSellingPrice - totalCost;
    const marginPercent = netSellingPrice > 0 ? (grossProfit / netSellingPrice) * 100 : 0;

    return {
      listTotal: parseFloat(listTotal.toFixed(2)),
      discountAmount: parseFloat(discountAmount.toFixed(2)),
      netSellingPrice: parseFloat(netSellingPrice.toFixed(2)),
      taxAmount: parseFloat(taxAmount.toFixed(2)),
      lineTotal: parseFloat(lineTotal.toFixed(2)),
      totalCost: parseFloat(totalCost.toFixed(2)),
      grossProfit: parseFloat(grossProfit.toFixed(2)),
      marginPercent: parseFloat(marginPercent.toFixed(1)),
    };
  }

  /**
   * Calculate aggregate deal financials
   */
  calculateDealSummary(items = []) {
    let subtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;
    let totalCost = 0;

    items.forEach((item) => {
      const calc = this.calculateLineItem(item);
      subtotal += calc.listTotal;
      totalDiscount += calc.discountAmount;
      totalTax += calc.taxAmount;
      totalCost += calc.totalCost;
    });

    const netAmount = subtotal - totalDiscount;
    const totalAmount = netAmount + totalTax;
    const grossProfit = netAmount - totalCost;
    const expectedMarginPercent = netAmount > 0 ? (grossProfit / netAmount) * 100 : 0;

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      totalDiscount: parseFloat(totalDiscount.toFixed(2)),
      totalTax: parseFloat(totalTax.toFixed(2)),
      netAmount: parseFloat(netAmount.toFixed(2)),
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      grossProfit: parseFloat(grossProfit.toFixed(2)),
      expectedMarginPercent: parseFloat(expectedMarginPercent.toFixed(1)),
    };
  }
}

module.exports = new DealCalculationService();
