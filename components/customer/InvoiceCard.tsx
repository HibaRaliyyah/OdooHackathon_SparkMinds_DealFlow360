'use client';

import React, { useState } from 'react';
import styles from './InvoiceCard.module.css';
import { CreditCard, CheckCircle2, Download, FileSpreadsheet } from 'lucide-react';

interface InvoiceCardProps {
  invoiceNumber: string;
  orderNumber: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  currency?: string;
  status: string;
  onPay?: () => void;
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
  onPay,
  onDownloadPDF,
  onDownloadXLS,
}: InvoiceCardProps) {
  const [isPaying, setIsPaying] = useState(false);
  const [isPaid, setIsPaid] = useState(status === 'Paid');

  const handlePayClick = () => {
    setIsPaying(true);
    setTimeout(() => {
      setIsPaying(false);
      setIsPaid(true);
      if (onPay) onPay();
    }, 1000);
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <span className={styles.invoiceNum}>{invoiceNumber}</span>
          <div className="text-xs text-slate-400 font-medium mt-0.5">Order: {orderNumber}</div>
        </div>

        <div className="text-right">
          <div className={styles.amount}>
            {currency}{amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <span
            className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase mt-1 border ${
              isPaid
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : status === 'Overdue'
                ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
            }`}
          >
            {isPaid ? 'Paid' : status}
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

      <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t border-white/5">
        <div className="flex items-center gap-1.5">
          {onDownloadPDF && (
            <button
              onClick={onDownloadPDF}
              title="Download PDF Invoice"
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>PDF</span>
            </button>
          )}
          {onDownloadXLS && (
            <button
              onClick={onDownloadXLS}
              title="Download XLS Spreadsheet"
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>XLS</span>
            </button>
          )}
        </div>

        <div className={styles.actions}>
          {!isPaid ? (
            <button onClick={handlePayClick} disabled={isPaying} className={styles.payBtn}>
              <CreditCard className="w-3.5 h-3.5 inline mr-1" />
              {isPaying ? 'Processing...' : 'Pay Invoice'}
            </button>
          ) : (
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Payment Complete
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
