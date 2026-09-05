// ============================================================
// DealFlow360 — Direct PDF & XLS Exporter Utility
// Uses jsPDF for 100% native client-side PDF document generation
// and direct file downloads without display/print popups.
// ============================================================

import { jsPDF } from 'jspdf';
import type { Invoice, Quotation, Subscription } from '@/lib/types';

/**
 * Triggers direct browser download for a text/CSV/Blob file
 */
export function triggerDirectDownload(content: string, fileName: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * ------------------------------------------------------------
 * 1. INVOICE EXPORTS (PDF & XLS)
 * ------------------------------------------------------------
 */
export function downloadInvoicePDF(invoice: Invoice) {
  const doc = new jsPDF();
  const balanceDue = (invoice.total || 0) - (invoice.paidAmount || 0);

  // Header Banner
  doc.setFillColor(79, 70, 229); // Indigo-600
  doc.rect(0, 0, 210, 24, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('DEALFLOW360', 14, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('ENTERPRISE B2B CPQ & BILLING PLATFORM', 70, 15);

  // Invoice Title & Metadata Block
  let y = 36;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('OFFICIAL INVOICE', 14, y);

  doc.setFontSize(11);
  doc.setTextColor(79, 70, 229);
  doc.text(`Invoice #: ${invoice.invoiceNumber || invoice.id}`, 14, y + 7);

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date Issued: ${invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : 'N/A'}`, 140, y);
  doc.text(`Due Date: ${invoice.dueDate || 'Net 30'}`, 140, y + 6);
  doc.text(`Status: ${(invoice.status || 'Pending').toUpperCase()}`, 140, y + 12);

  // Customer & Terms Card
  y += 22;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, 182, 26, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('BILLED TO (CUSTOMER):', 18, y + 8);
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.customerName || 'Valued Enterprise Client', 18, y + 17);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('QUOTATION REF:', 120, y + 8);
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.quotationNumber || 'N/A', 120, y + 17);

  // Line Items Table Header
  y += 34;
  doc.setFillColor(15, 23, 42);
  doc.rect(14, y, 182, 8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('PRODUCT / SERVICE DESCRIPTION', 18, y + 5.5);
  doc.text('QTY', 115, y + 5.5);
  doc.text('UNIT PRICE', 135, y + 5.5);
  doc.text('DISCOUNT', 160, y + 5.5);
  doc.text('TOTAL', 180, y + 5.5);

  // Line Items Rows
  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(8.5);

  const items = invoice.items && invoice.items.length > 0 ? invoice.items : [
    { productName: 'Standard Billing Deliverable', billedQty: 1, unitPrice: invoice.total || 0, discount: 0, lineTotal: invoice.total || 0 }
  ];

  items.forEach((item: any) => {
    doc.setFillColor(255, 255, 255);
    doc.rect(14, y, 182, 8, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.line(14, y + 8, 196, y + 8);

    const title = (item.productName || 'Service Item').slice(0, 50);
    const qty = item.billedQty || item.orderedQty || 1;
    const price = `$${(item.unitPrice || 0).toFixed(2)}`;
    const disc = `$${(item.discount || 0).toFixed(2)}`;
    const total = `$${(item.lineTotal || 0).toFixed(2)}`;

    doc.text(title, 18, y + 5.5);
    doc.text(String(qty), 117, y + 5.5);
    doc.text(price, 135, y + 5.5);
    doc.text(disc, 160, y + 5.5);
    doc.text(total, 180, y + 5.5);

    y += 8;
  });

  // Totals Summary Box
  y += 6;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(110, y, 86, 36, 3, 3, 'FD');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);

  doc.text('Subtotal:', 115, y + 8);
  doc.text(`$${(invoice.subtotal || 0).toFixed(2)}`, 188, y + 8, { align: 'right' });

  doc.text('Discount:', 115, y + 15);
  doc.text(`-$${(invoice.discount || 0).toFixed(2)}`, 188, y + 15, { align: 'right' });

  doc.text('Sales Tax:', 115, y + 22);
  doc.text(`+$${(invoice.tax || 0).toFixed(2)}`, 188, y + 22, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(5, 150, 105);
  doc.text('Grand Total:', 115, y + 31);
  doc.text(`$${(invoice.total || 0).toFixed(2)}`, 188, y + 31, { align: 'right' });

  // Footer Note
  y += 48;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('DealFlow360 Enterprise B2B Ops · Thank you for your business!', 105, y, { align: 'center' });

  // DIRECT DOWNLOAD FILE (.pdf)
  doc.save(`${invoice.invoiceNumber || invoice.id}_Invoice.pdf`);
}

export function downloadInvoiceXLS(invoice: Invoice) {
  const lineItemsRows = (invoice.items || []).map((item) => [
    `"${(item.productName || '').replace(/"/g, '""')}"`,
    item.orderedQty || 1,
    item.shippedQty || 1,
    item.billedQty || 1,
    `$${(item.unitPrice || 0).toFixed(2)}`,
    `$${(item.discount || 0).toFixed(2)}`,
    `${item.taxPercent || 0}%`,
    `$${(item.lineTotal || 0).toFixed(2)}`,
  ]);

  const paymentRows = (invoice.payments || []).map((p) => [
    `"${p.id}"`,
    `"${p.paymentDate}"`,
    `"${p.method}"`,
    `"${p.reference}"`,
    `$${p.amount.toFixed(2)}`,
    `"${p.status}"`,
  ]);

  const balanceDue = (invoice.total || 0) - (invoice.paidAmount || 0);

  const csvRows = [
    ['=== DEALFLOW360 ENTERPRISE B2B OPS — OFFICIAL INVOICE EXPORT ==='],
    [],
    ['INVOICE METADATA'],
    ['Invoice Number', `"${invoice.invoiceNumber || invoice.id}"`],
    ['Quotation Reference', `"${invoice.quotationNumber || 'N/A'}"`],
    ['Customer Name', `"${invoice.customerName || 'N/A'}"`],
    ['Billing Type', `"${invoice.type || 'One-Time'} Billing"`],
    ['Invoice Status', `"${invoice.status || 'Pending'}"`],
    ['Created Date', `"${invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : 'N/A'}"`],
    ['Due Date', `"${invoice.dueDate || 'N/A'}"`],
    [],
    ['LINE ITEMS BREAKDOWN'],
    ['Product Name', 'Ordered Qty', 'Shipped Qty', 'Billed Qty', 'Unit Price', 'Discount', 'Tax %', 'Line Total'],
    ...lineItemsRows,
    [],
    ['FINANCIAL SUMMARY'],
    ['Subtotal Amount', `$${(invoice.subtotal || 0).toFixed(2)}`],
    ['Tier Discount Applied', `$${(invoice.discount || 0).toFixed(2)}`],
    ['Sales Tax', `$${(invoice.tax || 0).toFixed(2)}`],
    ['Grand Total Amount', `$${(invoice.total || 0).toFixed(2)}`],
    ['Total Paid Amount', `$${(invoice.paidAmount || 0).toFixed(2)}`],
    ['Remaining Balance Due', `$${balanceDue.toFixed(2)}`],
    [],
    ['PAYMENT & TRANSACTION RECORDS'],
    ['Payment ID', 'Payment Date', 'Payment Method', 'Reference ID', 'Amount', 'Status'],
    ...(paymentRows.length > 0 ? paymentRows : [['No payment records available', '', '', '', '', '']]),
    [],
    ['Export Timestamp', `"${new Date().toLocaleString()}"`],
  ];

  const csvContent = '\uFEFF' + csvRows.map((row) => row.join(',')).join('\n');
  triggerDirectDownload(csvContent, `${invoice.invoiceNumber || invoice.id}_Billing_Export.csv`, 'text/csv;charset=utf-8;');
}

export function exportAllInvoicesXLS(invoices: Invoice[]) {
  const header = [
    'Invoice Number',
    'Quotation Reference',
    'Customer Name',
    'Billing Type',
    'Status',
    'Total Amount ($)',
    'Paid Amount ($)',
    'Balance Due ($)',
    'Due Date',
    'Created Date',
  ];

  const rows = invoices.map((inv) => [
    `"${inv.invoiceNumber || inv.id}"`,
    `"${inv.quotationNumber || 'N/A'}"`,
    `"${inv.customerName || 'N/A'}"`,
    `"${inv.type || 'One-Time'} Billing"`,
    `"${inv.status || 'Pending'}"`,
    (inv.total || 0).toFixed(2),
    (inv.paidAmount || 0).toFixed(2),
    ((inv.total || 0) - (inv.paidAmount || 0)).toFixed(2),
    `"${inv.dueDate || 'N/A'}"`,
    `"${inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : 'N/A'}"`,
  ]);

  const csvContent = '\uFEFF' + [header, ...rows].map((row) => row.join(',')).join('\n');
  triggerDirectDownload(csvContent, `DealFlow360_All_Invoices_Report_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
}

/**
 * ------------------------------------------------------------
 * 2. QUOTATION EXPORTS (PDF & XLS)
 * ------------------------------------------------------------
 */
export function downloadQuotationPDF(quotation: Quotation) {
  const doc = new jsPDF();
  const totalValue = (quotation.oneTimeTotal || 0) + (quotation.recurringTotal || 0);

  // Header Banner
  doc.setFillColor(99, 102, 241); // Indigo-500
  doc.rect(0, 0, 210, 24, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('DEALFLOW360', 14, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('COMMERCIAL PROPOSAL & QUOTATION DOCUMENT', 70, 15);

  // Title Block
  let y = 36;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('OFFICIAL PROPOSAL', 14, y);

  doc.setFontSize(11);
  doc.setTextColor(99, 102, 241);
  doc.text(`Quotation #: ${quotation.quoteNumber}`, 14, y + 7);

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Stage: ${quotation.stage}`, 140, y);
  doc.text(`Blended Risk: ${quotation.blendedRisk?.riskScore || 20}/100`, 140, y + 6);
  doc.text(`Assigned Rep: ${quotation.assignedTo || 'Sales Representative'}`, 140, y + 12);

  // Customer Card
  y += 22;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, 182, 22, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('PREPARED FOR CUSTOMER:', 18, y + 7);
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(quotation.customerName || 'Valued Customer', 18, y + 16);

  // Line Items Table Header
  y += 28;
  doc.setFillColor(15, 23, 42);
  doc.rect(14, y, 182, 8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('PRODUCT / ITEM DESCRIPTION', 18, y + 5.5);
  doc.text('TYPE', 105, y + 5.5);
  doc.text('QTY', 130, y + 5.5);
  doc.text('UNIT PRICE', 148, y + 5.5);
  doc.text('TOTAL', 178, y + 5.5);

  // Rows
  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(8.5);

  (quotation.items || []).forEach((item: any) => {
    doc.setFillColor(255, 255, 255);
    doc.rect(14, y, 182, 8, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.line(14, y + 8, 196, y + 8);

    doc.text((item.productName || 'Line Item').slice(0, 42), 18, y + 5.5);
    doc.text(item.isSubscription ? 'Subscription' : 'One-Time', 105, y + 5.5);
    doc.text(String(item.quantity || 1), 132, y + 5.5);
    doc.text(`$${(item.unitPrice || 0).toFixed(2)}`, 148, y + 5.5);
    doc.text(`$${(item.lineTotal || 0).toFixed(2)}`, 178, y + 5.5);

    y += 8;
  });

  // Financial Summary Box
  y += 6;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(110, y, 86, 28, 3, 3, 'FD');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);

  doc.text('One-Time Deliverables:', 115, y + 8);
  doc.text(`$${(quotation.oneTimeTotal || 0).toFixed(2)}`, 188, y + 8, { align: 'right' });

  doc.text('Recurring Subscriptions:', 115, y + 15);
  doc.text(`$${(quotation.recurringTotal || 0).toFixed(2)}`, 188, y + 15, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(79, 70, 229);
  doc.text('Grand Total:', 115, y + 24);
  doc.text(`$${totalValue.toFixed(2)}`, 188, y + 24, { align: 'right' });

  // DIRECT DOWNLOAD FILE (.pdf)
  doc.save(`Proposal_${quotation.quoteNumber}.pdf`);
}

export function downloadQuotationXLS(quotation: Quotation) {
  const lineItems = (quotation.items || []).map((item) => [
    `"${item.productId || ''}"`,
    `"${(item.productName || '').replace(/"/g, '""')}"`,
    `"${item.isSubscription ? 'Subscription' : 'One-Time'}"`,
    item.quantity || 1,
    `$${(item.unitPrice || 0).toFixed(2)}`,
    `$${(item.costPrice || 0).toFixed(2)}`,
    `${item.discount || 0}%`,
    `$${(item.lineTotal || 0).toFixed(2)}`,
  ]);

  const csvRows = [
    ['=== DEALFLOW360 ENTERPRISE B2B OPS — OFFICIAL QUOTATION EXPORT ==='],
    [],
    ['QUOTATION DETAILS'],
    ['Quotation Number', `"${quotation.quoteNumber}"`],
    ['Customer Name', `"${quotation.customerName}"`],
    ['Sales Representative', `"${quotation.assignedTo || 'Unassigned'}"`],
    ['Current Stage', `"${quotation.stage}"`],
    ['Total Discount Applied', `${quotation.totalDiscount || 0}%`],
    ['Blended Risk Score', `${quotation.blendedRisk?.riskScore || 0}/100 (${quotation.blendedRisk?.riskLevel || 'LOW'})`],
    ['Created Date', `"${quotation.createdAt ? new Date(quotation.createdAt).toLocaleDateString() : 'N/A'}"`],
    [],
    ['QUOTATION LINE ITEMS'],
    ['SKU ID', 'Product Description', 'Billing Mode', 'Quantity', 'Unit List Price', 'Unit Cost', 'Discount %', 'Net Line Total'],
    ...lineItems,
    [],
    ['FINANCIAL TOTALS'],
    ['One-Time Hardware / Setup Total', `$${(quotation.oneTimeTotal || 0).toFixed(2)}`],
    ['Recurring Subscription Total', `$${(quotation.recurringTotal || 0).toFixed(2)}`],
    ['Grand Total Proposal Value', `$${((quotation.oneTimeTotal || 0) + (quotation.recurringTotal || 0)).toFixed(2)}`],
    [],
    ['Export Timestamp', `"${new Date().toLocaleString()}"`],
  ];

  const csvContent = '\uFEFF' + csvRows.map((row) => row.join(',')).join('\n');
  triggerDirectDownload(csvContent, `Proposal_${quotation.quoteNumber}.csv`, 'text/csv;charset=utf-8;');
}

/**
 * ------------------------------------------------------------
 * 3. CONTRACT / SUBSCRIPTION EXPORTS
 * ------------------------------------------------------------
 */
export function downloadContractPDF(subscription: Subscription | any) {
  const doc = new jsPDF();

  // Header Banner
  doc.setFillColor(2, 132, 199); // Sky-600
  doc.rect(0, 0, 210, 24, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('DEALFLOW360', 14, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('MASTER SAAS & SERVICE AGREEMENT', 80, 15);

  // Contract Details
  let y = 36;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('SERVICE LEVEL CONTRACT AGREEMENT', 14, y);

  doc.setFontSize(10);
  doc.setTextColor(2, 132, 199);
  doc.text(`Contract Ref #: ${subscription.id || 'SUB-1001'}`, 14, y + 7);

  y += 18;
  doc.setFillColor(240, 249, 255);
  doc.setDrawColor(186, 230, 253);
  doc.roundedRect(14, y, 182, 34, 3, 3, 'FD');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`Subscriber Entity: ${subscription.customerName || 'Acme Corp'}`, 18, y + 8);
  doc.text(`Plan Tier: ${subscription.planName || 'Enterprise Cloud Tier'}`, 18, y + 15);
  doc.text(`Billing Cycle: ${subscription.billingCycle || 'Annual Prepaid'}`, 18, y + 22);
  doc.text(`Annual Contract Value (ACV): $${(subscription.amount || 24000).toLocaleString()}/year`, 18, y + 29);

  // Section 1
  y += 42;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('1. SCOPE OF ENFORCED SERVICES & DELIVERABLES', 14, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);

  const features = subscription.features || [
    '24/7 Dedicated Platinum SLA Support',
    'Continuous Automated Multi-Warehouse Allocation',
    'Full API Access & Webhook Suite',
    'Quarterly Executive Business Reviews'
  ];

  features.forEach((feat: string, idx: number) => {
    doc.text(`• ${feat}`, 18, y + 8 + (idx * 6));
  });

  // Section 2
  y += 14 + (features.length * 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('2. SERVICE LEVEL AGREEMENT (SLA) & UPTIME COMMITMENT', 14, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text('DealFlow360 guarantees a monthly uptime commitment of 99.95%. Unscheduled downtime credits apply automatically.', 14, y + 7);

  // Signatures
  y += 35;
  doc.line(14, y, 90, y);
  doc.line(110, y, 196, y);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Authorized Signatory (DealFlow360 Inc.)', 14, y + 5);
  doc.text(`Authorized Signatory (${subscription.customerName || 'Customer'})`, 110, y + 5);

  // DIRECT DOWNLOAD FILE (.pdf)
  doc.save(`Contract_Agreement_${subscription.id || 'SUB-1001'}.pdf`);
}

/**
 * ------------------------------------------------------------
 * 4. EXECUTIVE & ANALYTIC REPORT EXPORTS (PDF & XLS)
 * ------------------------------------------------------------
 */
export function downloadReportPDF(title: string, kpiCards: { label: string; value: string }[], headers: string[], rows: any[][], filename: string) {
  const doc = new jsPDF();

  // Header Banner
  doc.setFillColor(15, 23, 42); // Slate-900
  doc.rect(0, 0, 210, 24, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);
  doc.text('DEALFLOW360', 14, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('EXECUTIVE REPORTING & GOVERNANCE MODULE', 75, 15);

  // Report Title
  let y = 36;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title.toUpperCase(), 14, y);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated on: ${new Date().toLocaleString()} · Scope: ${rows.length} Records`, 14, y + 6);

  // KPI Summary Cards
  if (kpiCards && kpiCards.length > 0) {
    y += 15;
    const cardWidth = (182 - (kpiCards.length - 1) * 4) / kpiCards.length;

    kpiCards.forEach((kpi, idx) => {
      const cardX = 14 + idx * (cardWidth + 4);
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(cardX, y, cardWidth, 18, 2, 2, 'FD');

      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 116, 139);
      doc.text(kpi.label.toUpperCase(), cardX + 4, y + 6);

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(kpi.value, cardX + 4, y + 14);
    });

    y += 18;
  }

  // Data Table Header
  y += 10;
  doc.setFillColor(15, 23, 42);
  doc.rect(14, y, 182, 8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);

  const colCount = headers.length;
  const colWidth = 182 / colCount;

  headers.forEach((h, idx) => {
    doc.text(h.toUpperCase(), 16 + (idx * colWidth), y + 5.5);
  });

  // Table Rows
  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);

  rows.forEach((row) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }

    doc.setFillColor(255, 255, 255);
    doc.rect(14, y, 182, 7.5, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.line(14, y + 7.5, 196, y + 7.5);

    row.forEach((cell, colIdx) => {
      const strVal = String(cell ?? '').slice(0, 22);
      doc.text(strVal, 16 + (colIdx * colWidth), y + 5);
    });

    y += 7.5;
  });

  // DIRECT DOWNLOAD FILE (.pdf)
  doc.save(`${filename}.pdf`);
}

export function downloadReportXLS(title: string, headers: string[], rows: any[][], filename: string) {
  const csvRows = [
    [`=== DEALFLOW360 ENTERPRISE REPORT EXPORT: ${title.toUpperCase()} ===`],
    [`Export Date: ${new Date().toLocaleString()}`],
    [],
    headers,
    ...rows.map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`)),
  ];

  const csvContent = '\uFEFF' + csvRows.map((r) => r.join(',')).join('\n');
  triggerDirectDownload(csvContent, `${filename}.csv`, 'text/csv;charset=utf-8;');
}
