'use client';

import React, { useState, useEffect } from 'react';
import styles from './InvoiceCard.module.css';
import { CreditCard, CheckCircle2, Download, FileSpreadsheet, ShieldCheck, AlertCircle, Repeat, Calendar, Lock } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { calculateNextBillingDate } from '@/lib/services/billingService';

interface InvoiceCardProps {
  invoiceNumber: string;
  orderNumber: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  currency?: string;
  status: string;
  isAllocationPending?: boolean;
  onPay?: (billingDetails?: { type: 'One-Time' | 'Recurring'; cycle?: 'Monthly' | 'Quarterly' | 'Yearly'; amount: number }) => void;
  onDownloadPDF?: () => void;
  onDownloadXLS?: () => void;
}

export function InvoiceCard({
  invoiceNumber,
  orderNumber,
  invoiceDate,
  dueDate,
  amount,
  currency = '$',
  status,
  isAllocationPending = false,
  onPay,
  onDownloadPDF,
  onDownloadXLS,
}: InvoiceCardProps) {
  const [isPaying, setIsPaying] = useState(false);
  const [isPaid, setIsPaid] = useState(status === 'Paid');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'wire'>('card');
  const [billingType, setBillingType] = useState<'onetime' | 'recurring'>('onetime');
  const [recurringCycle, setRecurringCycle] = useState<'Monthly' | 'Quarterly' | 'Yearly'>('Monthly');

  useEffect(() => {
    setIsPaid(status === 'Paid');
  }, [status]);

  const handleOpenConfirm = () => {
    setShowConfirmModal(true);
  };

  const calculateInstalment = () => {
    if (billingType === 'onetime') return amount;
    if (recurringCycle === 'Monthly') return Math.round((amount / 12) * 100) / 100;
    if (recurringCycle === 'Quarterly') return Math.round((amount / 4) * 100) / 100;
    return amount;
  };

  const payableAmount = calculateInstalment();
  const nextBillingDate = calculateNextBillingDate(new Date().toISOString().slice(0, 10), recurringCycle);

  const handleConfirmPayment = () => {
    setShowConfirmModal(false);
    setIsPaying(true);
    setTimeout(() => {
      setIsPaying(false);
      setIsPaid(true);
      if (onPay) {
        onPay({
          type: billingType === 'onetime' ? 'One-Time' : 'Recurring',
          cycle: billingType === 'recurring' ? recurringCycle : undefined,
          amount: payableAmount,
        });
      }
    }, 1100);
  };

  const formattedAmount = `${currency}${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  const formattedPayable = `${currency}${payableAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  return (
    <>
      <div className={styles.card}>
        <div className={styles.header}>
          <div>
            <span className={styles.invoiceNum}>{invoiceNumber}</span>
            <div className="text-xs text-slate-600 font-medium mt-0.5">Order: {orderNumber}</div>
          </div>

          <div className="text-right">
            <div className={styles.amount}>{formattedAmount}</div>
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase mt-1 border ${
                isPaid
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : isAllocationPending
                  ? 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse'
                  : status === 'Overdue'
                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              {isPaid ? 'PAID' : isAllocationPending ? 'AWAITING ALLOCATION' : status}
            </span>
          </div>
        </div>

        <div className={styles.detailsGrid}>
          <div>
            <div className={styles.label}>Invoice Date</div>
            <div className={styles.val}>{invoiceDate}</div>
          </div>
          <div>
            <div className={styles.label}>Due Date</div>
            <div className={styles.val}>{dueDate}</div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t border-slate-200">
          <div className="flex items-center gap-1.5">
            {onDownloadPDF && (
              <button
                onClick={onDownloadPDF}
                title="Download PDF Invoice"
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-indigo-600" />
                <span>PDF</span>
              </button>
            )}
            {onDownloadXLS && (
              <button
                onClick={onDownloadXLS}
                title="Download XLS Spreadsheet"
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>XLS</span>
              </button>
            )}
          </div>

          <div className={styles.actions}>
            {isPaid ? (
              <span className="text-xs text-emerald-700 font-extrabold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Payment Complete
              </span>
            ) : isAllocationPending ? (
              <button
                disabled
                title="Payment will be unlocked once Finance allocates warehouse fulfillment"
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed flex items-center gap-1"
              >
                <Lock className="w-3.5 h-3.5" /> Awaiting Allocation
              </button>
            ) : (
              <button onClick={handleOpenConfirm} disabled={isPaying} className={styles.payBtn}>
                <CreditCard className="w-3.5 h-3.5 inline mr-1" />
                {isPaying ? 'Processing...' : 'Pay Invoice'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation & Payment Billing Method Modal */}
      {showConfirmModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowConfirmModal(false)}
          title={`Confirm Payment — ${invoiceNumber}`}
          subtitle={`Select Billing Type & Payment Method for Order ${orderNumber}`}
          maxWidth="lg"
        >
          <div className="space-y-5">
            {/* Invoice Summary Box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600">Invoice Reference:</span>
                <span className="font-mono font-bold text-indigo-700">{invoiceNumber}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600">Quotation Order #:</span>
                <span className="font-mono font-bold text-slate-900">{orderNumber}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600">Full Quoted Value:</span>
                <span className="font-mono font-bold text-slate-800">{formattedAmount}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-800">
                  {billingType === 'onetime' ? 'Total Payable Today:' : `First ${recurringCycle} Instalment Today:`}
                </span>
                <span className="font-mono font-black text-xl text-emerald-700">{formattedPayable}</span>
              </div>
            </div>

            {/* 1. Payment Billing Method Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">Select Payment Billing Method *</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setBillingType('onetime')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    billingType === 'onetime'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-900 font-bold'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold text-xs flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-indigo-600" />
                    <span>One-Time Payment</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">Settle full amount ({formattedAmount}) in a single payment</div>
                </button>

                <button
                  type="button"
                  onClick={() => setBillingType('recurring')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    billingType === 'recurring'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-900 font-bold'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold text-xs flex items-center gap-1.5">
                    <Repeat className="w-4 h-4 text-emerald-600" />
                    <span>Recurring Subscription</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">Periodic interval billing schedule & auto-renewals</div>
                </button>
              </div>
            </div>

            {/* 2. Recurring Plan Interval Options */}
            {billingType === 'recurring' && (
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-indigo-900 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    <span>Choose Subscription Billing Interval</span>
                  </span>
                  <span className="text-[11px] text-indigo-700 font-bold font-mono">
                    Next Billing Date: {nextBillingDate}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {(['Monthly', 'Quarterly', 'Yearly'] as const).map((cycle) => {
                    const cycleAmount =
                      cycle === 'Monthly'
                        ? Math.round((amount / 12) * 100) / 100
                        : cycle === 'Quarterly'
                        ? Math.round((amount / 4) * 100) / 100
                        : amount;

                    return (
                      <button
                        key={cycle}
                        type="button"
                        onClick={() => setRecurringCycle(cycle)}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          recurringCycle === cycle
                            ? 'bg-white border-indigo-600 text-indigo-950 font-black shadow-sm'
                            : 'bg-white/60 border-indigo-200 text-indigo-800 hover:bg-white'
                        }`}
                      >
                        <div className="text-xs font-bold">{cycle}</div>
                        <div className="text-[11px] font-mono font-extrabold text-emerald-700 mt-0.5">
                          ${cycleAmount.toLocaleString()}/{cycle === 'Monthly' ? 'mo' : cycle === 'Quarterly' ? 'qtr' : 'yr'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. Payment Method Choice */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">Select Payment Card / Account *</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-900 font-bold'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold text-xs flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-indigo-600" />
                    <span>Corporate Credit Card</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">Visa ending in **** 4242</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('wire')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    paymentMethod === 'wire'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-900 font-bold'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>ACH / Bank Wire</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">Direct bank debit account</div>
                </button>
              </div>
            </div>

            {/* Confirmation Box */}
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Please confirm that you authorize the <strong>{billingType === 'onetime' ? 'One-Time' : `Recurring ${recurringCycle}`}</strong> payment of <strong>{formattedPayable}</strong> for <strong>{invoiceNumber}</strong>.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <Button variant="outline" size="sm" type="button" onClick={() => setShowConfirmModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="button"
                onClick={handleConfirmPayment}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Confirm & Pay {formattedPayable}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
