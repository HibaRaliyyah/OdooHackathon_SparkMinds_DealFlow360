// ============================================================
// DealFlow360 — Document & Report Exporter Utility
// Provides direct browser downloads for PDF/HTML & XLS/CSV documents
// without popup blocker issues.
// ============================================================

import type { Invoice, Quotation, Subscription } from '@/lib/types';

/**
 * Triggers direct browser download for a Blob content file
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
 * Direct print-to-PDF via hidden iframe (avoids popup blockers completely)
 */
export function printHtmlDocument(htmlContent: string) {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.zIndex = '-9999';
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(htmlContent);
    doc.close();
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 2000);
    }, 300);
  }
}

/**
 * ------------------------------------------------------------
 * 1. INVOICE EXPORTS
 * ------------------------------------------------------------
 */
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
  triggerDirectDownload(csvContent, `${invoice.invoiceNumber || invoice.id}_Billing_Export.xls`, 'application/vnd.ms-excel;charset=utf-8;');
}

export function downloadInvoicePDF(invoice: Invoice) {
  const balanceDue = (invoice.total || 0) - (invoice.paidAmount || 0);

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Invoice ${invoice.invoiceNumber || invoice.id} — DealFlow360</title>
      <style>
        * { box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        body { padding: 40px; color: #0f172a; background: #ffffff; margin: 0; }
        .invoice-box { max-width: 850px; margin: auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; }
        .header-row { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #4f46e5; padding-bottom: 20px; margin-bottom: 25px; }
        .brand-title { font-size: 26px; font-weight: 900; color: #4f46e5; letter-spacing: -0.5px; }
        .brand-sub { font-size: 12px; color: #64748b; margin-top: 4px; font-weight: 600; }
        .invoice-title { font-size: 24px; font-weight: 900; text-align: right; color: #0f172a; }
        .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; background: #f8fafc; padding: 18px; border-radius: 8px; margin-bottom: 25px; font-size: 13px; }
        .meta-group h4 { margin: 0 0 6px 0; font-size: 11px; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; }
        .meta-group p { margin: 0; font-weight: 700; color: #1e293b; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 13px; }
        th { background: #f1f5f9; text-align: left; padding: 12px 10px; font-size: 11px; text-transform: uppercase; color: #475569; font-weight: 800; border-bottom: 2px solid #cbd5e1; }
        td { padding: 12px 10px; border-bottom: 1px solid #e2e8f0; color: #334155; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .summary-box { width: 320px; margin-left: auto; background: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 25px; font-size: 13px; border: 1px solid #e2e8f0; }
        .summary-line { display: flex; justify-content: space-between; padding: 6px 0; color: #475569; }
        .summary-total { font-size: 16px; font-weight: 900; color: #059669; border-top: 2px solid #0f172a; padding-top: 10px; margin-top: 6px; }
        .footer { text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 30px; }
        @media print {
          body { padding: 0; }
          .invoice-box { border: none; }
        }
      </style>
    </head>
    <body>
      <div class="invoice-box">
        <div class="header-row">
          <div>
            <div class="brand-title">DealFlow360</div>
            <div class="brand-sub">Enterprise B2B CPQ & Billing Platform</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 4px;">100 Enterprise Way, Suite 400, San Francisco CA</div>
          </div>
          <div style="text-align: right;">
            <div class="invoice-title">INVOICE DOCUMENT</div>
            <div style="font-size: 16px; font-weight: 800; color: #4f46e5; font-family: monospace; margin-top: 2px;">
              ${invoice.invoiceNumber || invoice.id}
            </div>
          </div>
        </div>

        <div class="meta-grid">
          <div class="meta-group">
            <h4>Billed To (Customer)</h4>
            <p style="font-size: 15px; color: #0f172a;">${invoice.customerName || 'Customer'}</p>
            <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Ref Quotation: <strong>${invoice.quotationNumber || 'N/A'}</strong></div>
          </div>
          <div class="meta-group" style="text-align: right;">
            <h4>Invoice Schedule & Status</h4>
            <p>Due Date: <span style="color: #dc2626;">${invoice.dueDate || 'Net 30'}</span></p>
            <div style="font-size: 12px; color: #64748b; margin-top: 2px;">
              Status: <strong style="color: ${invoice.status === 'Paid' ? '#059669' : '#d97706'};">${(invoice.status || 'Pending').toUpperCase()}</strong>
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Product / Service Description</th>
              <th class="text-center">Qty</th>
              <th class="text-right">Unit Price</th>
              <th class="text-right">Discount</th>
              <th class="text-right">Line Total</th>
            </tr>
          </thead>
          <tbody>
            ${(invoice.items || [])
              .map(
                (item) => `
              <tr>
                <td><strong>${item.productName || 'Service Item'}</strong></td>
                <td class="text-center">${item.billedQty || item.orderedQty || 1}</td>
                <td class="text-right">$${(item.unitPrice || 0).toFixed(2)}</td>
                <td class="text-right">$${(item.discount || 0).toFixed(2)}</td>
                <td class="text-right"><strong>$${(item.lineTotal || 0).toFixed(2)}</strong></td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        <div class="summary-box">
          <div class="summary-line">
            <span>Subtotal:</span>
            <span>$${(invoice.subtotal || 0).toFixed(2)}</span>
          </div>
          <div class="summary-line">
            <span>Discount:</span>
            <span>-$${(invoice.discount || 0).toFixed(2)}</span>
          </div>
          <div class="summary-line">
            <span>Tax:</span>
            <span>+$${(invoice.tax || 0).toFixed(2)}</span>
          </div>
          <div class="summary-line summary-total">
            <span>Total Amount:</span>
            <span>$${(invoice.total || 0).toFixed(2)}</span>
          </div>
          <div class="summary-line" style="font-weight: 800; border-top: 1px solid #cbd5e1; padding-top: 6px; margin-top: 4px;">
            <span>Balance Due:</span>
            <span>$${balanceDue.toFixed(2)}</span>
          </div>
        </div>

        <div class="footer">
          Thank you for doing business with DealFlow360 Enterprise B2B Ops. For questions, contact billing@dealflow360.demo.
        </div>
      </div>
    </body>
    </html>
  `;

  // 1. Direct file download
  triggerDirectDownload(htmlContent, `${invoice.invoiceNumber || invoice.id}_Invoice_Document.html`, 'text/html;charset=utf-8;');
  // 2. Direct browser print dialog
  printHtmlDocument(htmlContent);
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
  triggerDirectDownload(csvContent, `DealFlow360_All_Invoices_Report_${new Date().toISOString().slice(0, 10)}.xls`, 'application/vnd.ms-excel;charset=utf-8;');
}

/**
 * ------------------------------------------------------------
 * 2. QUOTATION EXPORTS
 * ------------------------------------------------------------
 */
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
  triggerDirectDownload(csvContent, `Proposal_${quotation.quoteNumber}.xls`, 'application/vnd.ms-excel;charset=utf-8;');
}

export function downloadQuotationPDF(quotation: Quotation) {
  const totalValue = (quotation.oneTimeTotal || 0) + (quotation.recurringTotal || 0);

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Quotation ${quotation.quoteNumber} — DealFlow360</title>
      <style>
        * { box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        body { padding: 40px; color: #0f172a; background: #ffffff; margin: 0; }
        .box { max-width: 850px; margin: auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 12px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #6366f1; padding-bottom: 20px; margin-bottom: 24px; }
        .title { font-size: 26px; font-weight: 900; color: #4f46e5; letter-spacing: -0.5px; }
        .subtitle { font-size: 12px; color: #64748b; margin-top: 4px; font-weight: 600; }
        .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; background: #f8fafc; padding: 16px; border-radius: 8px; margin-bottom: 24px; font-size: 13px; }
        .meta-item h4 { margin: 0 0 4px 0; font-size: 11px; text-transform: uppercase; color: #64748b; }
        .meta-item p { margin: 0; font-weight: 700; color: #1e293b; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px; }
        th { background: #f1f5f9; text-align: left; padding: 10px; font-size: 11px; text-transform: uppercase; color: #475569; font-weight: 800; border-bottom: 2px solid #cbd5e1; }
        td { padding: 10px; border-bottom: 1px solid #e2e8f0; color: #334155; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .summary-box { width: 300px; margin-left: auto; background: #f8fafc; border-radius: 8px; padding: 16px; border: 1px solid #e2e8f0; }
        .summary-line { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; color: #475569; }
        .summary-total { font-size: 16px; font-weight: 900; color: #4f46e5; border-top: 2px solid #0f172a; padding-top: 8px; margin-top: 4px; }
        .footer { text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 30px; }
        @media print {
          body { padding: 0; }
          .box { border: none; }
        }
      </style>
    </head>
    <body>
      <div class="box">
        <div class="header">
          <div>
            <div class="title">DealFlow360</div>
            <div class="subtitle">Official B2B Commercial Proposal & Quotation</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 22px; font-weight: 900; color: #0f172a;">QUOTATION</div>
            <div style="font-size: 16px; font-weight: 800; color: #4f46e5; font-family: monospace;">${quotation.quoteNumber}</div>
          </div>
        </div>

        <div class="meta-grid">
          <div class="meta-item">
            <h4>Prepared For Customer</h4>
            <p style="font-size: 15px;">${quotation.customerName}</p>
            <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Assigned Rep: <strong>${quotation.assignedTo || 'Sales Team'}</strong></div>
          </div>
          <div class="meta-item" style="text-align: right;">
            <h4>Stage & Risk Rating</h4>
            <p>Stage: <span style="color: #4f46e5;">${quotation.stage}</span></p>
            <div style="font-size: 12px; color: #64748b; margin-top: 2px;">
              Blended Risk Score: <strong>${quotation.blendedRisk?.riskScore || 20}/100 (${quotation.blendedRisk?.riskLevel || 'LOW'})</strong>
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Item Description</th>
              <th class="text-center">Type</th>
              <th class="text-center">Qty</th>
              <th class="text-right">Unit Price</th>
              <th class="text-right">Discount</th>
              <th class="text-right">Line Total</th>
            </tr>
          </thead>
          <tbody>
            ${(quotation.items || [])
              .map(
                (item) => `
              <tr>
                <td><strong>${item.productName || 'Line Item'}</strong></td>
                <td class="text-center"><span style="font-size: 10px; background: #e0e7ff; color: #3730a3; padding: 2px 6px; border-radius: 4px; font-weight: bold;">${item.isSubscription ? 'Subscription' : 'One-Time'}</span></td>
                <td class="text-center">${item.quantity || 1}</td>
                <td class="text-right">$${(item.unitPrice || 0).toFixed(2)}</td>
                <td class="text-right">${item.discount || 0}%</td>
                <td class="text-right"><strong>$${(item.lineTotal || 0).toFixed(2)}</strong></td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        <div class="summary-box">
          <div class="summary-line">
            <span>One-Time Charges:</span>
            <span>$${(quotation.oneTimeTotal || 0).toFixed(2)}</span>
          </div>
          <div class="summary-line">
            <span>Recurring Annual/Monthly:</span>
            <span>$${(quotation.recurringTotal || 0).toFixed(2)}</span>
          </div>
          <div class="summary-line summary-total">
            <span>Total Proposal Value:</span>
            <span>$${totalValue.toFixed(2)}</span>
          </div>
        </div>

        <div class="footer">
          DealFlow360 Enterprise CPQ & Revenue Governance. Confidential document prepared for ${quotation.customerName}.
        </div>
      </div>
    </body>
    </html>
  `;

  triggerDirectDownload(htmlContent, `Proposal_${quotation.quoteNumber}_Document.html`, 'text/html;charset=utf-8;');
  printHtmlDocument(htmlContent);
}

/**
 * ------------------------------------------------------------
 * 3. CONTRACT / SUBSCRIPTION EXPORTS
 * ------------------------------------------------------------
 */
export function downloadContractPDF(subscription: Subscription | any) {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Contract Agreement ${subscription.id || 'SUB-1001'} — DealFlow360</title>
      <style>
        * { box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        body { padding: 40px; color: #0f172a; background: #ffffff; margin: 0; }
        .contract-box { max-width: 850px; margin: auto; padding: 36px; border: 1px solid #cbd5e1; border-radius: 12px; }
        .header { border-bottom: 3px solid #0284c7; padding-bottom: 20px; margin-bottom: 24px; display: flex; justify-content: space-between; }
        .title { font-size: 26px; font-weight: 900; color: #0284c7; }
        .meta-box { background: #f0f9ff; border-left: 4px solid #0284c7; padding: 16px; margin-bottom: 24px; font-size: 13px; }
        .section-title { font-size: 14px; font-weight: 800; color: #0f172a; text-transform: uppercase; margin-top: 20px; margin-bottom: 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
        ul { margin: 0; padding-left: 20px; font-size: 13px; color: #334155; }
        li { margin-bottom: 6px; }
        .signatures { display: flex; justify-content: space-between; margin-top: 50px; padding-top: 20px; border-top: 1px solid #cbd5e1; font-size: 12px; }
        .sig-block { width: 45%; }
        .sig-line { border-bottom: 1px solid #0f172a; margin-top: 40px; margin-bottom: 6px; }
      </style>
    </head>
    <body>
      <div class="contract-box">
        <div class="header">
          <div>
            <div class="title">DealFlow360</div>
            <div style="font-size: 12px; color: #64748b; font-weight: bold; margin-top: 2px;">Master SaaS & Service Level Contract Agreement</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 18px; font-weight: 900; color: #0f172a;">SERVICE CONTRACT</div>
            <div style="font-size: 13px; font-family: monospace; color: #0284c7; font-weight: bold;">${subscription.id || 'CONTRACT-2026'}</div>
          </div>
        </div>

        <div class="meta-box">
          <strong>Subscriber Entity:</strong> ${subscription.customerName || 'Acme Corp'}<br>
          <strong>Plan Tier:</strong> ${subscription.planName || 'Enterprise Cloud Tier'}<br>
          <strong>Billing Frequency:</strong> ${subscription.billingCycle || 'Annual Prepaid'}<br>
          <strong>Annual Contract Value (ACV):</strong> $${(subscription.amount || 24000).toLocaleString()}/year<br>
          <strong>Contract Status:</strong> Active & Enforced (Auto-renews on ${subscription.nextBillingDate || '2027-08-31'})
        </div>

        <div class="section-title">1. Scope of Enforced Services & Deliverables</div>
        <ul>
          ${(subscription.features || ['24/7 Dedicated Platinum SLA Support', 'Continuous Automated Multi-Warehouse Allocation', 'Full API Access & Webhook Suite', 'Quarterly Executive Business Reviews']).map((f: string) => `<li>${f}</li>`).join('')}
        </ul>

        <div class="section-title">2. Service Level Agreement (SLA) & Uptime Terms</div>
        <p style="font-size: 13px; color: #334155; line-height: 1.6;">
          DealFlow360 guarantees a monthly uptime SLA commitment of 99.95%. In the event of unscheduled downtime exceeding 0.05%, prorated credit credits will automatically apply to subsequent renewal billing cycles.
        </p>

        <div class="signatures">
          <div class="sig-block">
            <div class="sig-line"></div>
            <strong>Authorized Representative (DealFlow360 Inc.)</strong><br>
            <span>Date: ${new Date().toLocaleDateString()}</span>
          </div>
          <div class="sig-block">
            <div class="sig-line"></div>
            <strong>Authorized Customer Signatory (${subscription.customerName || 'Acme Corp'})</strong><br>
            <span>Date: ${new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  triggerDirectDownload(htmlContent, `Contract_Agreement_${subscription.id || 'SUB-1001'}.html`, 'text/html;charset=utf-8;');
  printHtmlDocument(htmlContent);
}

/**
 * ------------------------------------------------------------
 * 4. EXECUTIVE & ANALYTIC REPORT EXPORTS
 * ------------------------------------------------------------
 */
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

export function downloadReportPDF(title: string, kpiCards: { label: string; value: string }[], headers: string[], rows: any[][], filename: string) {
  const rowsHtml = rows
    .map(
      (r) => `
    <tr>
      ${r
        .map(
          (c, idx) => `
        <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; ${idx === 0 ? 'font-weight: bold; color: #0f172a;' : ''} ${typeof c === 'number' || String(c).startsWith('$') ? 'text-align: right; font-family: monospace;' : ''}">
          ${c}
        </td>
      `
        )
        .join('')}
    </tr>
  `
    )
    .join('');

  const kpisHtml = kpiCards
    .map(
      (k) => `
    <div style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 16px; border-radius: 12px; flex: 1;">
      <div style="font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 800; letter-spacing: 0.5px;">${k.label}</div>
      <div style="font-size: 24px; font-weight: 900; color: #0f172a; margin-top: 4px; font-family: monospace;">${k.value}</div>
    </div>
  `
    )
    .join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title} — DealFlow360</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 36px; color: #1e293b; line-height: 1.5; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px; }
          h1 { color: #0f172a; margin: 0; font-size: 24px; font-weight: 900; }
          p { color: #64748b; font-size: 12px; margin: 4px 0 0 0; }
          .kpi-container { display: flex; gap: 16px; margin-bottom: 28px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
          th { text-align: left; padding: 12px; background: #0f172a; color: #ffffff; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
          .footer { margin-top: 40px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>DealFlow360 — ${title}</h1>
            <p>Generated on ${new Date().toLocaleString()} · Official Governance Export</p>
          </div>
          <div style="text-align: right;">
            <span style="font-weight: 800; color: #475569; font-size: 12px;">CONFIDENTIAL REPORT</span>
          </div>
        </div>

        ${kpisHtml ? `<div class="kpi-container">${kpisHtml}</div>` : ''}

        <table>
          <thead>
            <tr>
              ${headers.map((h, i) => `<th ${i === headers.length - 1 ? 'style="text-align: right;"' : ''}>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="footer">DealFlow360 Executive Reporting & Governance Module · All Rights Reserved</div>
      </body>
    </html>
  `;

  triggerDirectDownload(htmlContent, `${filename}.html`, 'text/html;charset=utf-8;');
  printHtmlDocument(htmlContent);
}
