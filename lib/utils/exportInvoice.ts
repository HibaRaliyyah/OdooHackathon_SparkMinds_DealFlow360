// ============================================================
// DealFlow360 — Invoice PDF & XLS Exporter
// Exports invoice data to PDF and Excel (XLS) formats
// ============================================================

import type { Invoice } from '@/lib/types';

/**
 * Generate and download an Excel/Spreadsheet (.xls) file for an Invoice
 */
export function downloadInvoiceXLS(invoice: Invoice) {
  const lineItemsRows = invoice.items.map((item) => [
    `"${item.productName.replace(/"/g, '""')}"`,
    item.orderedQty,
    item.shippedQty,
    item.billedQty,
    `$${item.unitPrice.toFixed(2)}`,
    `$${item.discount.toFixed(2)}`,
    `${item.taxPercent}%`,
    `$${item.lineTotal.toFixed(2)}`,
  ]);

  const paymentRows = (invoice.payments || []).map((p) => [
    `"${p.id}"`,
    `"${p.paymentDate}"`,
    `"${p.method}"`,
    `"${p.reference}"`,
    `$${p.amount.toFixed(2)}`,
    `"${p.status}"`,
  ]);

  const balanceDue = invoice.total - invoice.paidAmount;

  const csvRows = [
    ['=== DEALFLOW360 ENTERPRISE B2B OPS — OFFICIAL INVOICE EXPORT ==='],
    [],
    ['INVOICE METADATA'],
    ['Invoice Number', `"${invoice.invoiceNumber}"`],
    ['Quotation Reference', `"${invoice.quotationNumber || 'N/A'}"`],
    ['Customer Name', `"${invoice.customerName}"`],
    ['Billing Type', `"${invoice.type} Billing"`],
    ['Billing Description', invoice.type === 'Recurring' ? '"Recurring Periodic Subscription Billed Cyclically"' : '"Standard One-Time Payment Net 30/15 Terms"'],
    ['Invoice Status', `"${invoice.status}"`],
    ['Created Date', `"${invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : 'N/A'}"`],
    ['Due Date', `"${invoice.dueDate}"`],
    ['Delivery Reconciled', invoice.deliveryReconciled ? '"Yes (100% Stock Matched)"' : '"No (Pending Verification)"'],
    [],
    ['LINE ITEMS BREAKDOWN'],
    ['Product Name', 'Ordered Qty', 'Shipped Qty', 'Billed Qty', 'Unit Price', 'Discount', 'Tax %', 'Line Total'],
    ...lineItemsRows,
    [],
    ['FINANCIAL SUMMARY'],
    ['Subtotal Amount', `$${invoice.subtotal.toFixed(2)}`],
    ['Tier Discount Applied', `$${invoice.discount.toFixed(2)}`],
    ['Sales Tax', `$${invoice.tax.toFixed(2)}`],
    ['Grand Total Amount', `$${invoice.total.toFixed(2)}`],
    ['Total Paid Amount', `$${invoice.paidAmount.toFixed(2)}`],
    ['Remaining Balance Due', `$${balanceDue.toFixed(2)}`],
    [],
    ['PAYMENT & TRANSACTION RECORDS'],
    ['Payment ID', 'Payment Date', 'Payment Method', 'Reference ID', 'Amount', 'Status'],
    ...(paymentRows.length > 0 ? paymentRows : [['No payment records available', '', '', '', '', '']]),
    [],
    ['Export Timestamp', `"${new Date().toLocaleString()}"`],
  ];

  const csvContent = csvRows.map((row) => row.join(',')).join('\n');
  const blob = new Blob(['\ufeff' + csvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${invoice.invoiceNumber}_Billing_Export.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate and download/print a formatted PDF document for an Invoice
 */
export function downloadInvoicePDF(invoice: Invoice) {
  const balanceDue = invoice.total - invoice.paidAmount;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Invoice ${invoice.invoiceNumber} — DealFlow360</title>
      <style>
        * { box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        body { padding: 40px; color: #0f172a; background: #ffffff; margin: 0; }
        .invoice-box { max-width: 850px; margin: auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .header-row { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #4f46e5; padding-bottom: 20px; margin-bottom: 25px; }
        .brand-title { font-size: 26px; font-weight: 900; color: #4f46e5; letter-spacing: -0.5px; }
        .brand-sub { font-size: 12px; color: #64748b; margin-top: 4px; font-weight: 600; }
        .invoice-title { font-size: 24px; font-weight: 900; text-align: right; color: #0f172a; }
        .billing-tag { display: inline-block; padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; margin-top: 6px; letter-spacing: 0.5px; }
        .type-one-time { background-color: #e0e7ff; color: #3730a3; border: 1px solid #c7d2fe; }
        .type-recurring { background-color: #f3e8ff; color: #6b21a8; border: 1px solid #e9d5ff; }
        .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; background: #f8fafc; padding: 18px; border-radius: 8px; margin-bottom: 25px; font-size: 13px; }
        .meta-group h4 { margin: 0 0 6px 0; font-size: 11px; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; }
        .meta-group p { margin: 0; font-weight: 700; color: #1e293b; }
        .billing-type-box { padding: 14px; border-radius: 8px; margin-bottom: 25px; font-size: 12px; font-weight: 600; }
        .one-time-box { background: #eff6ff; border-left: 4px solid #3b82f6; color: #1e40af; }
        .recurring-box { background: #faf5ff; border-left: 4px solid #a855f7; color: #6b21a8; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 13px; }
        th { background: #f1f5f9; text-align: left; padding: 12px 10px; font-size: 11px; text-transform: uppercase; color: #475569; font-weight: 800; border-bottom: 2px solid #cbd5e1; }
        td { padding: 12px 10px; border-bottom: 1px solid #e2e8f0; color: #334155; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .summary-box { width: 320px; margin-left: auto; background: #f8fafc; p-4; border-radius: 8px; padding: 16px; margin-bottom: 25px; font-size: 13px; border: 1px solid #e2e8f0; }
        .summary-line { display: flex; justify-content: space-between; padding: 6px 0; color: #475569; }
        .summary-total { font-size: 16px; font-weight: 900; color: #059669; border-top: 2px solid #0f172a; padding-top: 10px; margin-top: 6px; }
        .payment-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 25px; }
        .payment-title { font-size: 12px; font-weight: 800; text-transform: uppercase; color: #475569; margin-bottom: 10px; }
        .footer { text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 30px; }
        @media print {
          body { padding: 0; }
          .invoice-box { border: none; box-shadow: none; }
        }
      </style>
    </head>
    <body>
      <div class="invoice-box">
        <!-- Header -->
        <div class="header-row">
          <div>
            <div class="brand-title">DealFlow360</div>
            <div class="brand-sub">Enterprise B2B CPQ & Billing Platform</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 4px;">100 Enterprise Way, Suite 400, San Francisco CA</div>
          </div>
          <div style="text-align: right;">
            <div class="invoice-title">INVOICE</div>
            <div style="font-size: 16px; font-weight: 800; color: #4f46e5; font-family: monospace; margin-top: 2px;">
              ${invoice.invoiceNumber}
            </div>
            <div>
              <span class="billing-tag ${invoice.type === 'Recurring' ? 'type-recurring' : 'type-one-time'}">
                ${invoice.type} Billing
              </span>
            </div>
          </div>
        </div>

        <!-- Billing Info Box -->
        <div class="billing-type-box ${invoice.type === 'Recurring' ? 'recurring-box' : 'one-time-box'}">
          <strong>Billing Structure (${invoice.type}):</strong>
          ${
            invoice.type === 'Recurring'
              ? 'This invoice is generated periodically for automated recurring subscription services (Care Plan / SaaS license). Renewal cycle active.'
              : 'This invoice covers standard one-time purchases, hardware deliverables, or setup services billed under Net 30/15 credit terms.'
          }
        </div>

        <!-- Meta Info Grid -->
        <div class="meta-grid">
          <div class="meta-group">
            <h4>Billed To (Customer)</h4>
            <p style="font-size: 15px; color: #0f172a;">${invoice.customerName}</p>
            <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Ref Quotation: <strong>${invoice.quotationNumber || 'N/A'}</strong></div>
          </div>
          <div class="meta-group" style="text-align: right;">
            <h4>Invoice Schedule & Status</h4>
            <p>Due Date: <span style="color: #dc2626;">${invoice.dueDate}</span></p>
            <div style="font-size: 12px; color: #64748b; margin-top: 2px;">
              Status: <strong style="color: ${invoice.status === 'Paid' ? '#059669' : '#d97706'};">${invoice.status.toUpperCase()}</strong>
            </div>
          </div>
        </div>

        <!-- Line Items Table -->
        <table>
          <thead>
            <tr>
              <th>Product / Service Description</th>
              <th class="text-center">Ordered</th>
              <th class="text-center">Billed</th>
              <th class="text-right">Unit Price</th>
              <th class="text-right">Discount</th>
              <th class="text-right">Tax</th>
              <th class="text-right">Line Total</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items
              .map(
                (item) => `
              <tr>
                <td><strong>${item.productName}</strong></td>
                <td class="text-center">${item.orderedQty}</td>
                <td class="text-center">${item.billedQty}</td>
                <td class="text-right">$${item.unitPrice.toFixed(2)}</td>
                <td class="text-right">$${item.discount.toFixed(2)}</td>
                <td class="text-right">${item.taxPercent}%</td>
                <td class="text-right"><strong>$${item.lineTotal.toFixed(2)}</strong></td>
              </tr>
            `,
              )
              .join('')}
          </tbody>
        </table>

        <!-- Summary & Balance -->
        <div class="summary-box">
          <div class="summary-line">
            <span>Subtotal:</span>
            <span>$${invoice.subtotal.toFixed(2)}</span>
          </div>
          <div class="summary-line">
            <span>Tier Discount:</span>
            <span>-$${invoice.discount.toFixed(2)}</span>
          </div>
          <div class="summary-line">
            <span>Sales Tax:</span>
            <span>+$${invoice.tax.toFixed(2)}</span>
          </div>
          <div class="summary-line summary-total">
            <span>Total Amount:</span>
            <span>$${invoice.total.toFixed(2)}</span>
          </div>
          <div class="summary-line" style="margin-top: 6px; font-weight: 700; color: ${invoice.paidAmount >= invoice.total ? '#059669' : '#d97706'};">
            <span>Paid Amount:</span>
            <span>$${invoice.paidAmount.toFixed(2)}</span>
          </div>
          <div class="summary-line" style="font-weight: 800; border-top: 1px solid #cbd5e1; padding-top: 6px; margin-top: 4px;">
            <span>Balance Due:</span>
            <span>$${balanceDue.toFixed(2)}</span>
          </div>
        </div>

        <!-- Payment Transactions -->
        ${
          (invoice.payments || []).length > 0
            ? `
          <div class="payment-box">
            <div class="payment-title">Confirmed Payment Records</div>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Payment Method</th>
                  <th>Reference ID</th>
                  <th class="text-right">Amount</th>
                  <th class="text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.payments
                  .map(
                    (p) => `
                  <tr>
                    <td>${p.paymentDate}</td>
                    <td>${p.method}</td>
                    <td><code>${p.reference}</code></td>
                    <td class="text-right"><strong>$${p.amount.toFixed(2)}</strong></td>
                    <td class="text-center"><span style="color: #059669; font-weight: bold;">${p.status}</span></td>
                  </tr>
                `,
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        `
            : ''
        }

        <!-- Footer -->
        <div class="footer">
          Thank you for doing business with DealFlow360 Enterprise B2B Ops. For billing inquiries, contact billing@dealflow360.demo.
        </div>
      </div>
    </body>
    </html>
  `;

  // Create printable Blob and trigger PDF print window + HTML Blob fallback
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (win) {
    win.onload = () => {
      win.print();
    };
  }

  // Also trigger direct Blob download with .pdf extension for file download
  const pdfBlob = new Blob([htmlContent], { type: 'application/pdf' });
  const pdfUrl = URL.createObjectURL(pdfBlob);
  const downloadLink = document.createElement('a');
  downloadLink.href = pdfUrl;
  downloadLink.setAttribute('download', `${invoice.invoiceNumber}_Invoice.pdf`);
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(pdfUrl);
}

/**
 * Bulk export all invoices to a master Excel (XLS) file
 */
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
    `"${inv.invoiceNumber}"`,
    `"${inv.quotationNumber || 'N/A'}"`,
    `"${inv.customerName}"`,
    `"${inv.type} Billing"`,
    `"${inv.status}"`,
    inv.total.toFixed(2),
    inv.paidAmount.toFixed(2),
    (inv.total - inv.paidAmount).toFixed(2),
    `"${inv.dueDate}"`,
    `"${inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : 'N/A'}"`,
  ]);

  const csvContent = [header, ...rows].map((row) => row.join(',')).join('\n');
  const blob = new Blob(['\ufeff' + csvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `DealFlow360_All_Invoices_Report_${new Date().toISOString().slice(0, 10)}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
