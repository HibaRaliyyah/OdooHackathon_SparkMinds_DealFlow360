'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import styles from './NegotiationForm.module.css';
import { X, Send } from 'lucide-react';

const negotiationSchema = z.object({
  requestedDiscount: z.number().min(0, 'Discount cannot be negative').max(100, 'Discount cannot exceed 100%'),
  reason: z.string().min(5, 'Reason must be at least 5 characters long'),
});

export type NegotiationFormData = z.infer<typeof negotiationSchema>;

interface NegotiationFormProps {
  quoteNumber: string;
  currentDiscount: number;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NegotiationFormData) => void;
}

export function NegotiationForm({
  quoteNumber,
  currentDiscount,
  isOpen,
  onClose,
  onSubmit,
}: NegotiationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<NegotiationFormData>({
    resolver: zodResolver(negotiationSchema),
    defaultValues: {
      requestedDiscount: currentDiscount + 5,
      reason: '',
    },
  });

  if (!isOpen) return null;

  const handleFormSubmit = (data: NegotiationFormData) => {
    onSubmit(data);
    reset();
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3 className={styles.title}>Negotiate Terms — {quoteNumber}</h3>
          <button onClick={onClose} className={styles.closeBtn}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className={styles.form}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              Requested Discount (%):
            </label>
            <input
              type="number"
              step="0.5"
              {...register('requestedDiscount', { valueAsNumber: true })}
              className={styles.input}
              placeholder="e.g. 15"
            />
            <p className="text-[11px] text-slate-400">Current discount: {currentDiscount}%</p>
            {errors.requestedDiscount && (
              <span className={styles.errorText}>{errors.requestedDiscount.message}</span>
            )}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Reason / Business Justification:</label>
            <textarea
              {...register('reason')}
              className={`${styles.input} ${styles.textarea}`}
              placeholder="Explain why you are requesting this adjustment (e.g. higher order volume, multi-year agreement)..."
            />
            {errors.reason && (
              <span className={styles.errorText}>{errors.reason.message}</span>
            )}
          </div>

          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
              <Send className="w-4 h-4 inline mr-1.5" />
              Submit Negotiation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
