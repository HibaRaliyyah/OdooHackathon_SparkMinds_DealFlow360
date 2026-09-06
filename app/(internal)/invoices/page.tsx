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
import type { Invoice, InvoiceType, InvoiceStatus, CreditNote, CreditNoteReason, CreditNoteStatus } from '@/lib/types';
import {
  downloadInvoicePDF,
  downloadInvoiceXLS,
  exportAllInvoicesXLS,
} from '@/lib/utils/exportInvoice';

export default function InvoicesPage() {
  const { invoices, addInvoice, updateInvoice, currentUser, creditNotes, addCreditNote, reconcileCreditNote, addActivity, addNotification } = useStore();

  // Active filter tab: 'all' | 'One-Time' | 'Recurring' | 'CreditNotes'
  const [activeTab, setActiveTab] = useState<'all' | 'One-Time' | 'Recurring' | 'CreditNotes'>('all');

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

  // Credit Note Modals State
  const [isAddCreditNoteOpen, setIsAddCreditNoteOpen] = useState(false);
  const [selectedCNForReconcile, setSelectedCNForReconcile] = useState<CreditNote | null>(null);
  const [cnCustomerName, setCnCustomerName] = useState('Acme Corp');
  const [cnReason, setCnReason] = useState<CreditNoteReason>('Product Return / RMA');
  const [cnAmount, setCnAmount] = useState<number>(500);
  const [cnNotes, setCnNotes] = useState('');
  const [targetInvoiceForOffset, setTargetInvoiceForOffset] = useState('INV-2026-3107');

  // Notification Banner State
  const [banner, setBanner] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'info' = 'success') => {
    setBanner({ message, type });
    setTimeout(() => setBanner(null), 5000);
  };

  const handleCreateCreditNote = (e: React.FormEvent) => {
    e.preventDefault();
    const newCN: CreditNote = {
      id: `cn-${Date.now()}`,
      creditNoteNumber: `CN-2026-00${creditNotes.length + 1}`,
      customerId: 'cust-1',
      customerName: cnCustomerName,
      amount: cnAmount,
      reason: cnReason,
      status: 'Approved',
      issuedDate: new Date().toISOString().slice(0, 10),
      notes: cnNotes || 'Issued via Finance Control Hub',
      createdAt: new Date().toISOString(),
    };

    addCreditNote(newCN);
    setIsAddCreditNoteOpen(false);
    showNotification(`Credit Note ${newCN.creditNoteNumber} ($${cnAmount}) issued successfully!`, 'success');
  };

  const handleExecuteReconciliation = (cn: CreditNote, invoiceNum: string) => {
    reconcileCreditNote(cn.id, invoiceNum);
    showNotification(`Credit Note ${cn.creditNoteNumber} ($${cn.amount}) reconciled & applied to ${invoiceNum}!`, 'success');
    setSelectedCNForReconcile(null);
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

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BackButton href="/dashboard" label="Dashboard" />
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Invoice Operations & Billing Management
            </h1>
            <p className="text-xs text-slate-700 font-medium mt-0.5">
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
            leftIcon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
          >
            Export All (XLS)
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsAddCreditNoteOpen(true)}
            leftIcon={<ShieldCheck className="w-4 h-4 text-amber-600" />}
          >
            Issue Credit Note
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
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{banner.message}</span>
          </div>
          <button onClick={() => setBanner(null)} className="text-emerald-700 hover:text-emerald-900 text-xs font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Total Invoiced</span>
            <div className="text-xl font-black text-slate-900 font-mono mt-1">
              ${totalInvoiced.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-slate-600 font-semibold mt-0.5 block">{invoices.length} Total Issued Invoices</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 border border-purple-200 flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Collected Revenue</span>
            <div className="text-xl font-black text-emerald-700 font-mono mt-1">
              ${totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-emerald-700 font-semibold mt-0.5 block">GAAP Reconciled Payments</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Outstanding Balance</span>
            <div className="text-xl font-black text-amber-700 font-mono mt-1">
              ${totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-amber-800 font-semibold mt-0.5 block">Pending & Net Credit Due</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 border border-amber-200 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Tabs (All Invoices vs One-Time Billing vs Recurring Billing vs Credit Notes) */}
      <div className="flex items-center justify-between bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'all'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>All Invoices ({invoices.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('One-Time')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'One-Time'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-purple-600" />
            <span>One-Time Billing ({invoices.filter((i) => i.type === 'One-Time').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('Recurring')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'Recurring'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Repeat className="w-3.5 h-3.5 text-purple-600" />
            <span>Recurring Billing ({invoices.filter((i) => i.type === 'Recurring').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('CreditNotes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'CreditNotes'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
            <span>Credit Note Reconciliation ({creditNotes.length})</span>
          </button>
        </div>

        <span className="text-[11px] text-slate-600 font-semibold px-3 hidden md:inline-block">
          Click any row or action icon to view full billing details & download files
        </span>
      </div>

      {/* Main Data Section (Credit Notes vs Invoices Data Table) */}
      {activeTab === 'CreditNotes' ? (
        <div className="card p-6 bg-white border border-slate-200 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-600" /> Credit Note Reconciliation & Offset Console
              </h3>
              <p className="text-xs text-slate-700 font-medium mt-0.5">
                Issue credit memos for returns, billing corrections, or SLA penalties. Reconcile and apply credits against open customer invoices.
              </p>
            </div>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsAddCreditNoteOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Issue New Credit Note
            </Button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-[11px] text-slate-800 uppercase font-extrabold">
                  <th className="py-3 px-4 text-left font-extrabold">Credit Note #</th>
                  <th className="py-3 px-4 text-left font-extrabold">Customer Account</th>
                  <th className="py-3 px-4 text-left font-extrabold">Reason Category</th>
                  <th className="py-3 px-4 text-right font-extrabold">Credit Amount</th>
                  <th className="py-3 px-4 text-center font-extrabold">Status</th>
                  <th className="py-3 px-4 text-left font-extrabold">Issued Date</th>
                  <th className="py-3 px-4 text-left font-extrabold">Offset Target Invoice</th>
                  <th className="py-3 px-4 text-right font-extrabold">Reconciliation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {creditNotes.map((cn) => (
                  <tr key={cn.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-black text-amber-700">
                      {cn.creditNoteNumber}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {cn.customerName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-800">
                      <span className="px-2.5 py-0.5 text-[10px] font-extrabold rounded-full bg-slate-100 text-slate-900 border border-slate-300">
                        {cn.reason}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-black text-emerald-700 text-sm">
                      ${cn.amount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge
                        variant={
                          cn.status === 'Applied'
                            ? 'success'
                            : cn.status === 'Approved'
                            ? 'info'
                            : cn.status === 'Refunded'
                            ? 'purple'
                            : 'warning'
                        }
                      >
                        {cn.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-mono font-bold">
                      {cn.issuedDate}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-extrabold text-slate-800">
                      {cn.appliedInvoiceNumber ? (
                        <span className="text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                          {cn.appliedInvoiceNumber}
                        </span>
                      ) : (
                        <span className="text-slate-600 font-normal italic">Unapplied Balance</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {cn.status !== 'Applied' && cn.status !== 'Refunded' ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => setSelectedCNForReconcile(cn)}
                            leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                          >
                            Reconcile & Apply
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleExecuteReconciliation(cn, '')}
                          >
                            Refund Cash
                          </Button>
                        </div>
                      ) : (
                        <div className="text-[11px] text-emerald-700 font-extrabold flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Reconciled on {cn.reconciledDate || '2026-08-30'}</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Main Invoices Data Table */
        <div className="card p-6 bg-white border border-slate-200 shadow-sm">
        <Table
          data={filteredInvoices}
          keyExtractor={(inv) => inv.id}
          onRowClick={(inv) => setSelectedInvoice(inv)}
          columns={[
            {
              header: 'Invoice #',
              cell: (inv) => (
                <div>
                  <div className="font-mono font-extrabold text-slate-900 text-xs">{inv.invoiceNumber}</div>
                  <div className="text-[10px] text-slate-700 font-medium mt-0.5">
                    Quote Ref: <span className="font-mono text-indigo-700 font-bold">{inv.quotationNumber || 'N/A'}</span>
                  </div>
                </div>
              ),
            },
            {
              header: 'Customer',
              cell: (inv) => (
                <div>
                  <div className="font-bold text-xs text-slate-900">{inv.customerName}</div>
                  <div className="text-[10px] text-slate-700 font-medium">Net Terms B2B Account</div>
                </div>
              ),
            },
            {
              header: 'Billing Type',
              cell: (inv) => (
                <div className="space-y-0.5">
                  {inv.type === 'Recurring' ? (
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase bg-purple-100 text-purple-800 border border-purple-300 inline-flex items-center gap-1.5">
                      <Repeat className="w-3 h-3 text-purple-700" />
                      Recurring Payment
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase bg-blue-100 text-blue-800 border border-blue-300 inline-flex items-center gap-1.5">
                      <CreditCard className="w-3 h-3 text-blue-700" />
                      One-Time Payment
                    </span>
                  )}
                  <div className="text-[10px] text-slate-700 font-medium pl-1">
                    {inv.type === 'Recurring' ? 'Subscription Cycle' : 'Standard Hardware / Setup'}
                  </div>
                </div>
              ),
            },
            {
              header: 'Total Amount',
              cell: (inv) => (
                <div>
                  <div className="font-mono text-xs font-black text-emerald-700">
                    ${inv.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  {inv.paidAmount > 0 && (
                    <div className="text-[10px] text-slate-700 font-bold">
                      Paid: ${inv.paidAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  )}
                </div>
              ),
            },
            {
              header: 'Due Date',
              cell: (inv) => (
                <div className="font-mono text-xs text-slate-800 font-bold flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-600" />
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
                    <span className="block text-[9px] text-emerald-700 font-extrabold">Reconciled</span>
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
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-indigo-800 border border-slate-300 transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold px-2"
                  >
                    <Eye className="w-3.5 h-3.5 text-indigo-700" />
                    <span>View Details</span>
                  </button>

                  {/* PDF Download Button */}
                  <button
                    type="button"
                    title="Download PDF Invoice"
                    onClick={() => downloadInvoicePDF(inv)}
                    className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold px-2.5"
                  >
                    <FileText className="w-3.5 h-3.5 text-indigo-700" />
                    <span>PDF</span>
                  </button>

                  {/* XLS Download Button */}
                  <button
                    type="button"
                    title="Download XLS Spreadsheet"
                    onClick={() => downloadInvoiceXLS(inv)}
                    className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold px-2.5"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                    <span>XLS</span>
                  </button>
                </div>
              ),
            },
          ]}
        />
      </div>
      )}

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
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Badge variant={selectedInvoice.status === 'Paid' ? 'success' : 'warning'}>
                  {selectedInvoice.status}
                </Badge>
                <span className="text-xs text-slate-700 font-medium">Due Date: <strong className="text-slate-900 font-mono font-bold">{selectedInvoice.dueDate}</strong></span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadInvoicePDF(selectedInvoice)}
                  leftIcon={<FileText className="w-4 h-4 text-indigo-700" />}
                >
                  Download PDF
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadInvoiceXLS(selectedInvoice)}
                  leftIcon={<FileSpreadsheet className="w-4 h-4 text-emerald-700" />}
                >
                  Download XLS
                </Button>
              </div>
            </div>

            {/* ─── PROMINENT BILLING TYPE DISPLAY (One-Time vs Recurring) ─── */}
            <div
              className={`p-4 rounded-2xl border ${
                selectedInvoice.type === 'Recurring'
                  ? 'bg-purple-50 border-purple-200 text-purple-900'
                  : 'bg-blue-50 border-blue-200 text-blue-900'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2.5 rounded-xl shrink-0 ${
                    selectedInvoice.type === 'Recurring'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-blue-100 text-blue-800'
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
                    <span className="text-sm font-extrabold text-slate-900">
                      {selectedInvoice.type === 'Recurring' ? 'Recurring Subscription Billing' : 'One-Time Payment Billing'}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-white border border-slate-300 text-slate-900">
                      {selectedInvoice.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-800 font-medium leading-relaxed">
                    {selectedInvoice.type === 'Recurring'
                      ? 'This invoice is generated automatically for recurring subscription products (e.g. Care Plan 2yr, SaaS license, recurring maintenance). Payment is charged per billing cycle.'
                      : 'This invoice covers non-recurring one-time purchases, hardware products, or setup fees. Billed under standard Net 30/15 credit terms.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Invoice Line Items Breakdown Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center justify-between">
                <span>Line Items Breakdown</span>
                <span className="text-[10px] text-slate-700 font-mono font-bold">
                  {selectedInvoice.items.length} Product Line(s)
                </span>
              </h4>

              <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
                <table className="w-full text-left text-xs text-slate-900">
                  <thead className="bg-slate-100 text-[10px] uppercase font-extrabold text-slate-800 border-b border-slate-200">
                    <tr>
                      <th className="p-3">Product Description</th>
                      <th className="p-3 text-center">Qty Ordered</th>
                      <th className="p-3 text-center">Qty Billed</th>
                      <th className="p-3 text-right">Unit Price</th>
                      <th className="p-3 text-right">Tax %</th>
                      <th className="p-3 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {selectedInvoice.items.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">{item.productName}</td>
                        <td className="p-3 text-center font-mono font-bold">{item.orderedQty}</td>
                        <td className="p-3 text-center font-mono text-emerald-700 font-black">{item.billedQty}</td>
                        <td className="p-3 text-right font-mono font-bold">${item.unitPrice.toFixed(2)}</td>
                        <td className="p-3 text-right font-mono font-bold">{item.taxPercent}%</td>
                        <td className="p-3 text-right font-mono font-black text-slate-900">
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
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" /> Confirmed Payment Records
                </h4>
                {selectedInvoice.payments && selectedInvoice.payments.length > 0 ? (
                  <div className="space-y-2">
                    {selectedInvoice.payments.map((p) => (
                      <div
                        key={p.id}
                        className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs flex justify-between items-center"
                      >
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{p.method}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-extrabold">
                              {p.status}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-700 font-mono mt-0.5 font-bold">
                            Ref: {p.reference} · Date: {p.paymentDate}
                          </div>
                        </div>
                        <div className="font-mono font-black text-emerald-700 text-sm">
                          ${p.amount.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold text-center">
                    No confirmed payments recorded yet. Status: Unpaid / Draft.
                  </div>
                )}
              </div>

              {/* Financial Calculation Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-700 font-medium">
                  <span>Subtotal Amount:</span>
                  <span className="font-mono font-bold text-slate-900">${selectedInvoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-700 font-medium">
                  <span>Tier Discount:</span>
                  <span className="font-mono font-bold text-emerald-700">-${selectedInvoice.discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-700 font-medium">
                  <span>Sales Tax (VAT/GST):</span>
                  <span className="font-mono font-bold text-indigo-700">+${selectedInvoice.tax.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-extrabold text-sm text-slate-900">
                  <span>Grand Total Amount:</span>
                  <span className="font-mono text-emerald-700 font-black">${selectedInvoice.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-700 font-medium pt-1">
                  <span>Total Paid Amount:</span>
                  <span className="font-mono text-emerald-700 font-bold">${selectedInvoice.paidAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 font-extrabold text-xs">
                  <span className="text-slate-900">Remaining Balance Due:</span>
                  <span
                    className={`font-mono font-black ${
                      selectedInvoice.total - selectedInvoice.paidAmount > 0
                        ? 'text-amber-700'
                        : 'text-emerald-700'
                    }`}
                  >
                    ${(selectedInvoice.total - selectedInvoice.paidAmount).toFixed(2)}
                  </span>
                </div>
              </div>
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
                <label className="block text-xs font-bold text-slate-900 mb-1">Invoice Number</label>
                <input
                  type="text"
                  required
                  value={newInvoiceNumber}
                  onChange={(e) => setNewInvoiceNumber(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">Quotation Reference</label>
                <input
                  type="text"
                  required
                  value={newQuotationNumber}
                  onChange={(e) => setNewQuotationNumber(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">Customer Account</label>
                <select
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-indigo-500"
                >
                  <option value="Acme Corp">Acme Corp (Gold Tier)</option>
                  <option value="Beta Industries">Beta Industries (Silver Tier)</option>
                  <option value="Zenith Co">Zenith Co (Bronze Tier)</option>
                  <option value="Delta LLC">Delta LLC (Platinum Tier)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">Billing Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as InvoiceType)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500 font-bold"
                >
                  <option value="One-Time">One-Time Payment (Hardware/Setup)</option>
                  <option value="Recurring">Recurring Subscription (Monthly/Annual Care Plan)</option>
                </select>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <label className="text-xs font-extrabold text-slate-900 block uppercase tracking-wider">Line Item Details</label>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-[10px] text-slate-700 font-semibold mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-700 font-semibold mb-1">Unit Price ($)</label>
                  <input
                    type="number"
                    required
                    value={newUnitPrice}
                    onChange={(e) => setNewUnitPrice(Number(e.target.value))}
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">Due Date</label>
                <input
                  type="date"
                  required
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">Initial Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as InvoiceStatus)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-indigo-500"
                >
                  <option value="Draft">Draft</option>
                  <option value="Paid">Paid</option>
                  <option value="Partial">Partial</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
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

      {/* ─── CREATE CREDIT NOTE MODAL ─── */}
      {isAddCreditNoteOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsAddCreditNoteOpen(false)}
          title="Issue Credit Note — Financial Adjustment"
          subtitle="Generate a credit memo for customer RMA returns, tax corrections, or SLA penalties"
          maxWidth="md"
        >
          <form onSubmit={handleCreateCreditNote} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">Customer Account *</label>
              <select
                value={cnCustomerName}
                onChange={(e) => setCnCustomerName(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500 font-bold"
              >
                <option value="Acme Corp">Acme Corp (Gold Tier)</option>
                <option value="Beta Industries">Beta Industries (Silver Tier)</option>
                <option value="Zenith Co">Zenith Co (Bronze Tier)</option>
                <option value="Delta LLC">Delta LLC (Platinum Tier)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">Credit Reason Category *</label>
                <select
                  value={cnReason}
                  onChange={(e) => setCnReason(e.target.value as CreditNoteReason)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-indigo-500"
                >
                  <option value="Product Return / RMA">Product Return / RMA</option>
                  <option value="Billing / Tax Correction">Billing / Tax Correction</option>
                  <option value="Volume Rebate & Discount">Volume Rebate & Discount</option>
                  <option value="SLA Breach Penalty">SLA Breach Penalty</option>
                  <option value="Goodwill Customer Credit">Goodwill Customer Credit</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">Credit Amount ($) *</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={cnAmount}
                  onChange={(e) => setCnAmount(Number(e.target.value))}
                  className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-extrabold focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">Adjustment Notes / Justification</label>
              <textarea
                rows={3}
                placeholder="Specify RMA ticket number, damaged unit details, or tax refund justification..."
                value={cnNotes}
                onChange={(e) => setCnNotes(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <Button variant="outline" size="sm" type="button" onClick={() => setIsAddCreditNoteOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" leftIcon={<ShieldCheck className="w-4 h-4" />}>
                Issue & Approve Credit Note
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ─── RECONCILE CREDIT NOTE MODAL ─── */}
      {selectedCNForReconcile && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedCNForReconcile(null)}
          title={`Reconcile Credit Note — ${selectedCNForReconcile.creditNoteNumber}`}
          subtitle={`Apply credit balance of $${selectedCNForReconcile.amount.toFixed(2)} for ${selectedCNForReconcile.customerName}`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-700 font-medium">Credit Note Number:</span>
                <span className="font-mono font-black text-amber-700">{selectedCNForReconcile.creditNoteNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-700 font-medium">Customer Account:</span>
                <span className="font-bold text-slate-900">{selectedCNForReconcile.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-700 font-medium">Reason Category:</span>
                <span className="text-slate-900 font-bold">{selectedCNForReconcile.reason}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-sm">
                <span className="text-slate-900 font-extrabold">Total Credit Amount:</span>
                <span className="font-mono font-black text-emerald-700">${selectedCNForReconcile.amount.toFixed(2)}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">Target Open Invoice for Offset *</label>
              <select
                value={targetInvoiceForOffset}
                onChange={(e) => setTargetInvoiceForOffset(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-indigo-500 font-bold"
              >
                {invoices.map((inv) => (
                  <option key={inv.id} value={inv.invoiceNumber}>
                    {inv.invoiceNumber} — {inv.customerName} (${inv.total.toFixed(2)} Total, Status: {inv.status})
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-700 font-medium mt-1">
                Applying this credit note will offset the open balance of the selected target invoice in GAAP accounting books.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <Button variant="outline" size="sm" type="button" onClick={() => setSelectedCNForReconcile(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleExecuteReconciliation(selectedCNForReconcile, targetInvoiceForOffset)}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Reconcile & Apply Credit
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
