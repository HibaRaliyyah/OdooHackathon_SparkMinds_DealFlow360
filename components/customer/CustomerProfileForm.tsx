'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import styles from './CustomerProfileForm.module.css';
import { Save, CheckCircle2 } from 'lucide-react';

const profileSchema = z.object({
  contactName: z.string().min(2, 'Contact name is required'),
  phone: z.string().min(6, 'Valid phone number is required'),
  email: z.string().email('Valid email address is required'),
  billingAddress: z.string().min(5, 'Billing address is required'),
  shippingAddress: z.string().min(5, 'Shipping address is required'),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

interface CustomerProfileFormProps {
  initialCompany: string;
  initialContact: string;
  initialEmail: string;
  initialPhone: string;
  initialTier: string;
}

export function CustomerProfileForm({
  initialCompany,
  initialContact,
  initialEmail,
  initialPhone,
  initialTier,
}: CustomerProfileFormProps) {
  const [successNotice, setSuccessNotice] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      contactName: initialContact || 'Tom Acme',
      email: initialEmail || 'tom@acmecorp.com',
      phone: initialPhone || '+1 (555) 010-2020',
      billingAddress: '100 Acme Way, Suite 400, Chicago, IL 60601',
      shippingAddress: '100 Acme Way, Loading Dock B, Chicago, IL 60601',
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    setSuccessNotice('Company profile and shipping details updated successfully!');
    setTimeout(() => setSuccessNotice(''), 4000);
  };

  return (
    <div className={styles.formCard}>
      <h3 className={styles.title}>Company Profile & Addresses</h3>

      {successNotice && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className={styles.grid}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Company Name (Read-Only)</label>
            <input
              type="text"
              value={initialCompany}
              disabled
              className={`${styles.input} ${styles.disabledInput}`}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Customer Tier (Read-Only)</label>
            <input
              type="text"
              value={`${initialTier} Tier`}
              disabled
              className={`${styles.input} ${styles.disabledInput}`}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Primary Contact Person</label>
            <input {...register('contactName')} className={styles.input} />
            {errors.contactName && (
              <span className={styles.errorText}>{errors.contactName.message}</span>
            )}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Contact Email</label>
            <input {...register('email')} className={styles.input} />
            {errors.email && (
              <span className={styles.errorText}>{errors.email.message}</span>
            )}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Contact Phone</label>
            <input {...register('phone')} className={styles.input} />
            {errors.phone && (
              <span className={styles.errorText}>{errors.phone.message}</span>
            )}
          </div>
        </div>

        <div className="space-y-4 pt-2 border-t border-[var(--border-subtle)]">
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Billing Address</label>
            <input {...register('billingAddress')} className={styles.input} />
            {errors.billingAddress && (
              <span className={styles.errorText}>{errors.billingAddress.message}</span>
            )}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Shipping Address</label>
            <input {...register('shippingAddress')} className={styles.input} />
            {errors.shippingAddress && (
              <span className={styles.errorText}>{errors.shippingAddress.message}</span>
            )}
          </div>
        </div>

        <button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
          <Save className="w-4 h-4 inline mr-1.5" /> Save Changes
        </button>
      </form>
    </div>
  );
}
