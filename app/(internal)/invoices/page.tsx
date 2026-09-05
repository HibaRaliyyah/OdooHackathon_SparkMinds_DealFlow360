'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/data/store';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { BackButton } from '@/components/ui/BackButton';
import {
  FileText,
  FileSpreadsheet,
  Download,
  Eye,
  Plus,
  CheckCircle2,
  Clock,
  Building2,
  Calendar,
  CreditCard,
  Receipt,
  Repeat,
  DollarSign,
  ShieldCheck,
  Sparkles,
  Filter,
} from 'lucide-react';
import type { Invoice, InvoiceType, InvoiceStatus } from '@/lib/types';
import {
  downloadInvoicePDF,
  downloadInvoiceXLS,
  exportAllInvoicesXLS,
} from '@/lib/utils/exportInvoice';

export default function InvoicesPage() {
  const { invoices, addInvoice, updateInvoice, currentUser } = useStore();

  // Active filter tab: 'all' | 'One-Time' | 'Recurring'
  const [activeTab, setActiveTab] = useState<'all' | 'One-Time' | 'Recurring'>('all');

  // Selected Invoice for Detail Modal
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // New Invoice Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newInvoiceNumber, setNewInvoiceNumber] = useState(`INV-${1046 + invoices.length}`);
  const [newQuotationNumber, setNewQuotationNumber] = useState('Q-1042');
  const [newCustomerName, setNewCustomerName] = useState('Acme Corp');
  const [newType, setNewType] = useState<InvoiceType>('One-Time');
  const [newProductName, setNewProductName] = useState('Laptop Pro 14');
  const [newQty, setNewQty] = useState(1);
  const [newUnitPrice, setNewUnitPrice] = useState(1200);
  const [newDueDate, setNewDueDate] = useState('2026-10-15');
  const [newStatus, setNewStatus] = useState<InvoiceStatus>('Draft');

  // Notification Banner State
  const [banner, setBanner] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'info' = 'success') => {
    setBanner({ message, type });
    setTimeout(() => setBanner(null), 5000);
  };

  // Filter invoices based on active tab
  const filteredInvoices = invoices.filter((inv) => {
    if (activeTab === 'all') return true;
    return inv.type === activeTab;
  });

  // Calculate totals
  const totalInvoiced = invoices.reduce((acc, i) => acc + i.total, 0);
  const totalPaid = invoices.reduce((acc, i) => acc + i.paidAmount, 0);
  const totalOutstanding = totalInvoiced - totalPaid;

  // Handle Add New Invoice
  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const lineTotal = newQty * newUnitPrice;
    const subtotal = lineTotal;
    const tax = subtotal * 0.15;
    const total = subtotal + tax;

    const newInv: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: newInvoiceNumber,
      quotationId: `quot-${Date.now()}`,
      quotationNumber: newQuotationNumber,
      customerId: 'cust-1',
      customerName: newCustomerName,
      type: newType,
      items: [
        {
          id: `ii-${Date.now()}`,
          productId: 'prod-1',
          productName: newProductName,
          orderedQty: newQty,
          shippedQty: newQty,
          billedQty: newQty,
          unitPrice: newUnitPrice,
          discount: 0,
          taxPercent: 15,
          lineTotal: total,
        },
      ],
      subtotal,
      discount: 0,
      tax,
      total,
      status: newStatus,
      dueDate: newDueDate,
      paidAmount: newStatus === 'Paid' ? total : 0,
      payments:
        newStatus === 'Paid'
          ? [
              {
                id: `pay-${Date.now()}`,
                invoiceId: `inv-${Date.now()}`,
                amount: total,
                currency: 'USD',
                paymentDate: new Date().toISOString().slice(0, 10),
                method: newType === 'Recurring' ? 'Credit Card' : 'Bank Transfer',
                reference: `REF-${Date.now()}`,
                status: 'Confirmed',
              },
            ]
          : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deliveryReconciled: true,
    };

    addInvoice(newInv);
    setIsAddModalOpen(false);
    showNotification(`New ${newType} Invoice ${newInvoiceNumber} created successfully!`, 'success');
  };

  // Handle Mark as Paid
  const handleMarkAsPaid = (inv: Invoice) => {
    updateInvoice(inv.id, {
      status: 'Paid',
      paidAmount: inv.total,
      payments: [
        ...inv.payments,
        {
          id: `pay-${Date.now()}`,
          invoiceId: inv.id,
          amount: inv.total - inv.paidAmount,
          currency: 'USD',
          paymentDate: new Date().toISOString().slice(0, 10),
          method: inv.type === 'Recurring' ? 'Credit Card' : 'Bank Transfer',
          reference: `PAY-MANUAL-${Date.now()}`,
          status: 'Confirmed',
        },
      ],
    });
    setSelectedInvoice(null);
    showNotification(`Invoice ${inv.invoiceNumber} status updated to PAID!`, 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BackButton href="/dashboard" label="Dashboard" />
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Invoice Operations & Billing Management
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage one-time & recurring billing, export PDF/XLS invoices, and track payment reconciliations.
            </p>
          </div>
        </div>

        {/* Top Header Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={() => exportAllInvoicesXLS(invoices)}
            leftIcon={<FileSpreadsheet className="w-4 h-4 text-emerald-400" />}
          >
            Export All (XLS)
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => setIsAddModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create New Invoice
          </Button>
        </div>
      </div>

      {/* Global Notification Banner */}
      {banner && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{banner.message}</span>
          </div>
          <button onClick={() => setBanner(null)} className="text-emerald-400 hover:text-white text-xs font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#0f172a]/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Invoiced</span>
            <div className="text-xl font-black text-white font-mono mt-1">
              ${totalInvoiced.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">{invoices.length} Total Issued Invoices</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0f172a]/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Collected Revenue</span>
            <div className="text-xl font-black text-emerald-400 font-mono mt-1">
              ${totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-emerald-500/80 mt-0.5 block">GAAP Reconciled Payments</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0f172a]/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Outstanding Balance</span>
            <div className="text-xl font-black text-amber-400 font-mono mt-1">
              ${totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-amber-500/80 mt-0.5 block">Pending & Net Credit Due</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Tabs (All Invoices vs One-Time Billing vs Recurring Billing) */}
      <div className="flex items-center justify-between bg-[#111827] p-1.5 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>All Invoices ({invoices.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('One-Time')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'One-Time'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-blue-300" />
            <span>One-Time Billing ({invoices.filter((i) => i.type === 'One-Time').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('Recurring')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'Recurring'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Repeat className="w-3.5 h-3.5 text-purple-300" />
            <span>Recurring Billing ({invoices.filter((i) => i.type === 'Recurring').length})</span>
          </button>
        </div>

        <span className="text-[11px] text-slate-400 font-medium px-3 hidden md:inline-block">
          Click any row or action icon to view full billing details & download files
        </span>
      </div>

      {/* Main Invoices Data Table */}
      <div className="card p-6 bg-[var(--bg-card)] border border-slate-800 shadow-xl">
        <Table
          data={filteredInvoices}
          keyExtractor={(inv) => inv.id}
          onRowClick={(inv) => setSelectedInvoice(inv)}
          columns={[
            {
              header: 'Invoice #',
              cell: (inv) => (
                <div>
                  <div className="font-mono font-bold text-white text-xs">{inv.invoiceNumber}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Quote Ref: <span className="font-mono text-indigo-400">{inv.quotationNumber || 'N/A'}</span>
                  </div>
                </div>
              ),
            },
            {
              header: 'Customer',
              cell: (inv) => (
                <div>
                  <div className="font-semibold text-xs text-white">{inv.customerName}</div>
                  <div className="text-[10px] text-slate-400">Net Terms B2B Account</div>
                </div>
              ),
            },
            {
              header: 'Billing Type',
              cell: (inv) => (
                <div className="space-y-0.5">
                  {inv.type === 'Recurring' ? (
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30 inline-flex items-center gap-1.5">
                      <Repeat className="w-3 h-3 text-purple-400" />
                      Recurring Payment
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30 inline-flex items-center gap-1.5">
                      <CreditCard className="w-3 h-3 text-blue-400" />
                      One-Time Payment
                    </span>
                  )}
                  <div className="text-[10px] text-slate-400 pl-1">
                    {inv.type === 'Recurring' ? 'Subscription Cycle' : 'Standard Hardware / Setup'}
                  </div>
                </div>
              ),
            },
            {
              header: 'Total Amount',
              cell: (inv) => (
                <div>
                  <div className="font-mono text-xs font-bold text-emerald-400">
                    ${inv.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  {inv.paidAmount > 0 && (
                    <div className="text-[10px] text-slate-400">
                      Paid: ${inv.paidAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  )}
                </div>
              ),
            },
            {
              header: 'Due Date',
              cell: (inv) => (
                <div className="font-mono text-xs text-slate-300 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{inv.dueDate}</span>
                </div>
              ),
            },
            {
              header: 'Status',
              cell: (inv) => (
                <div className="space-y-1">
                  <Badge variant={inv.status === 'Paid' ? 'success' : 'warning'}>{inv.status}</Badge>
                  {inv.deliveryReconciled && (
                    <span className="block text-[9px] text-emerald-400 font-medium">Reconciled</span>
                  )}
                </div>
              ),
            },
            {
              header: 'Actions & Export',
              cell: (inv) => (
                <div
                  className="flex items-center gap-1.5"
                  onClick={(e) => e.stopPropagation()} // Prevent double row trigger
                >
                  {/* View Details Button */}
                  <button
                    type="button"
                    title="View Billing Details"
                    onClick={() => setSelectedInvoice(inv)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold px-2"
                  >
                    <Eye className="w-3.5 h-3.5 text-indigo-400" />
                    <span>View Details</span>
                  </button>

                  {/* PDF Download Button */}
                  <button
                    type="button"
                    title="Download PDF Invoice"
                    onClick={() => downloadInvoicePDF(inv)}
                    className="p-1.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-200 border border-indigo-500/30 transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold px-2.5"
                  >
                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                    <span>PDF</span>
                  </button>

                  {/* XLS Download Button */}
                  <button
                    type="button"
                    title="Download XLS Spreadsheet"
                    onClick={() => downloadInvoiceXLS(inv)}
                    className="p-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-200 border border-emerald-500/30 transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold px-2.5"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                    <span>XLS</span>
                  </button>
                </div>
              ),
            },
          ]}
        />
      </div>

      {/* ─── INVOICE DETAILS MODAL (Displayed when clicked) ─── */}
      {selectedInvoice && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedInvoice(null)}
          title={`Invoice Details — ${selectedInvoice.invoiceNumber}`}
          subtitle={`Customer: ${selectedInvoice.customerName} | Quotation: ${selectedInvoice.quotationNumber || 'N/A'}`}
          maxWidth="2xl"
        >
          <div className="space-y-6">
            {/* Download & Print Quick Bar inside Modal */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Badge variant={selectedInvoice.status === 'Paid' ? 'success' : 'warning'}>
                  {selectedInvoice.status}
                </Badge>
                <span className="text-xs text-slate-400">Due Date: <strong className="text-white font-mono">{selectedInvoice.dueDate}</strong></span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadInvoicePDF(selectedInvoice)}
                  leftIcon={<FileText className="w-4 h-4 text-indigo-400" />}
                >
                  Download PDF
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadInvoiceXLS(selectedInvoice)}
                  leftIcon={<FileSpreadsheet className="w-4 h-4 text-emerald-400" />}
                >
                  Download XLS
                </Button>

                {selectedInvoice.status !== 'Paid' && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleMarkAsPaid(selectedInvoice)}
                    leftIcon={<CheckCircle2 className="w-4 h-4" />}
                  >
                    Mark as Paid
                  </Button>
                )}
              </div>
            </div>

            {/* ─── PROMINENT BILLING TYPE DISPLAY (One-Time vs Recurring) ─── */}
            <div
              className={`p-4 rounded-2xl border ${
                selectedInvoice.type === 'Recurring'
                  ? 'bg-purple-950/40 border-purple-500/40 text-purple-200'
                  : 'bg-blue-950/40 border-blue-500/40 text-blue-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2.5 rounded-xl shrink-0 ${
                    selectedInvoice.type === 'Recurring'
                      ? 'bg-purple-500/20 text-purple-300'
                      : 'bg-blue-500/20 text-blue-300'
                  }`}
                >
                  {selectedInvoice.type === 'Recurring' ? (
                    <Repeat className="w-6 h-6" />
                  ) : (
                    <CreditCard className="w-6 h-6" />
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-white">
                      {selectedInvoice.type === 'Recurring' ? 'Recurring Subscription Billing' : 'One-Time Payment Billing'}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-white/10 border border-white/20 text-white">
                      {selectedInvoice.type}
                    </span>
                  </div>
                  <p className="text-xs opacity-90 leading-relaxed">
                    {selectedInvoice.type === 'Recurring'
                      ? 'This invoice is generated automatically for recurring subscription products (e.g. Care Plan 2yr, SaaS license, recurring maintenance). Payment is charged per billing cycle.'
                      : 'This invoice covers non-recurring one-time purchases, hardware products, or setup fees. Billed under standard Net 30/15 credit terms.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Invoice Line Items Breakdown Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Line Items Breakdown</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {selectedInvoice.items.length} Product Line(s)
                </span>
              </h4>

              <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900/60">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800/80 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-700">
                    <tr>
                      <th className="p-3">Product Description</th>
                      <th className="p-3 text-center">Qty Ordered</th>
                      <th className="p-3 text-center">Qty Billed</th>
                      <th className="p-3 text-right">Unit Price</th>
                      <th className="p-3 text-right">Tax %</th>
                      <th className="p-3 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {selectedInvoice.items.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/30">
                        <td className="p-3 font-semibold text-white">{item.productName}</td>
                        <td className="p-3 text-center font-mono">{item.orderedQty}</td>
                        <td className="p-3 text-center font-mono text-emerald-400 font-bold">{item.billedQty}</td>
                        <td className="p-3 text-right font-mono">${item.unitPrice.toFixed(2)}</td>
                        <td className="p-3 text-right font-mono">{item.taxPercent}%</td>
                        <td className="p-3 text-right font-mono font-bold text-white">
                          ${item.lineTotal.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Summary & Payment Breakdown Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Confirmed Payment Records */}
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2.5">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Confirmed Payment Records
                </h4>
                {selectedInvoice.payments && selectedInvoice.payments.length > 0 ? (
                  <div className="space-y-2">
                    {selectedInvoice.payments.map((p) => (
                      <div
                        key={p.id}
                        className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 text-xs flex justify-between items-center"
                      >
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{p.method}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                              {p.status}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Ref: {p.reference} · Date: {p.paymentDate}
                          </div>
                        </div>
                        <div className="font-mono font-bold text-emerald-400 text-sm">
                          ${p.amount.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium text-center">
                    No confirmed payments recorded yet. Status: Unpaid / Draft.
                  </div>
                )}
              </div>

              {/* Financial Calculation Box */}
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal Amount:</span>
                  <span className="font-mono font-semibold text-white">${selectedInvoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Tier Discount:</span>
                  <span className="font-mono text-emerald-400">-${selectedInvoice.discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Sales Tax (VAT/GST):</span>
                  <span className="font-mono text-indigo-300">+${selectedInvoice.tax.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm text-white">
                  <span>Grand Total Amount:</span>
                  <span className="font-mono text-emerald-400">${selectedInvoice.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400 pt-1">
                  <span>Total Paid Amount:</span>
                  <span className="font-mono text-emerald-300 font-bold">${selectedInvoice.paidAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-800 font-bold text-xs">
                  <span className="text-slate-300">Remaining Balance Due:</span>
                  <span
                    className={`font-mono ${
                      selectedInvoice.total - selectedInvoice.paidAmount > 0
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    ${(selectedInvoice.total - selectedInvoice.paidAmount).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => downloadInvoicePDF(selectedInvoice)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Download PDF Invoice</span>
                </button>
                <button
                  type="button"
                  onClick={() => downloadInvoiceXLS(selectedInvoice)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Download XLS Spreadsheet</span>
                </button>
              </div>

              <Button variant="outline" size="sm" onClick={() => setSelectedInvoice(null)}>
                Close Window
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ─── CREATE NEW INVOICE MODAL ─── */}
      {isAddModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsAddModalOpen(false)}
          title="Create New Invoice — B2B Billing"
          subtitle="Generate a new one-time or recurring invoice for customer quotation"
          maxWidth="lg"
        >
          <form onSubmit={handleCreateInvoice} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Invoice Number</label>
                <input
                  type="text"
                  required
                  value={newInvoiceNumber}
                  onChange={(e) => setNewInvoiceNumber(e.target.value)}
                  className="w-full text-xs bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Quotation Reference</label>
                <input
                  type="text"
                  required
                  value={newQuotationNumber}
                  onChange={(e) => setNewQuotationNumber(e.target.value)}
                  className="w-full text-xs bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Customer Account</label>
                <select
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  className="w-full text-xs bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Acme Corp">Acme Corp (Gold Tier)</option>
                  <option value="Beta Industries">Beta Industries (Silver Tier)</option>
                  <option value="Zenith Co">Zenith Co (Bronze Tier)</option>
                  <option value="Delta LLC">Delta LLC (Platinum Tier)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Billing Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as InvoiceType)}
                  className="w-full text-xs bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-bold"
                >
                  <option value="One-Time">One-Time Payment (Hardware/Setup)</option>
                  <option value="Recurring">Recurring Subscription (Monthly/Annual Care Plan)</option>
                </select>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
              <label className="text-xs font-bold text-slate-300 block uppercase tracking-wider">Line Item Details</label>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-[10px] text-slate-400 mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Unit Price ($)</label>
                  <input
                    type="number"
                    required
                    value={newUnitPrice}
                    onChange={(e) => setNewUnitPrice(Number(e.target.value))}
                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Due Date</label>
                <input
                  type="date"
                  required
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full text-xs bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Initial Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as InvoiceStatus)}
                  className="w-full text-xs bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Draft">Draft</option>
                  <option value="Paid">Paid</option>
                  <option value="Partial">Partial</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Create & Issue Invoice
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
