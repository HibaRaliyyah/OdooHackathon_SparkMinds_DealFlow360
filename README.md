# DealFlow360 — Enterprise B2B Deal Operations Platform

> **"From Quote to Cash — Intelligent, Controlled, Connected."**

DealFlow360 is a complete end-to-end B2B deal-management and sales-operations platform that manages the full lifecycle of a business deal — from customer selection through quotation, approval, fulfillment, customer negotiation, billing, subscription management, and anomaly monitoring.

---

## 🎯 Core Features

| Feature | Description |
|---|---|
| **Live Discount Validation** | Validates each quotation line against tier + category limits in real time |
| **Blended Risk Engine** | Calculates deal-level risk (LOW/MEDIUM/HIGH) from all line violations |
| **Approval Workflow** | Multi-stage approval routing: Sales Manager → Finance → Confirmed |
| **AI Upsell/Cross-sell** | OpenRouter-powered recommendations with deterministic fallback |
| **Fulfillment** | Warehouse split calculation, backorder tracking, partial delivery |
| **Customer Negotiation** | Portal-based negotiation with automatic reapproval trigger |
| **Partial Invoicing** | Items are only invoiced after they ship — never before |
| **Subscriptions** | Recurring billing with proration for mid-cycle changes |
| **Deal Health** | Anomaly detection: stalled deals, discount anomalies, delivery slippage |
| **Reports** | Fully dynamic KPIs, charts, and export capability |

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| Sales Rep | sales@dealflow360.demo | demo1234 |
| Sales Manager | manager@dealflow360.demo | demo1234 |
| Finance | finance@dealflow360.demo | demo1234 |
| Customer | customer@dealflow360.demo | demo1234 |
| Admin | admin@dealflow360.demo | demo1234 |

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Vanilla CSS with design tokens
- **Charts**: Recharts
- **Tables**: TanStack Table v8
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React
- **State**: Zustand
- **AI**: OpenRouter API (with deterministic fallback)

---

## 🚀 Quick Start

```bash
# Clone and install
git clone <repo>
cd dealflow360
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your OpenRouter API key

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and log in with any demo credential above.

---

## 📁 Project Structure

```
dealflow360/
├── app/
│   ├── (auth)/               # Login, Signup, Forgot Password
│   ├── (internal)/           # Internal dashboard (role-protected)
│   │   ├── dashboard/
│   │   ├── quotations/
│   │   ├── approvals/
│   │   ├── fulfillment/
│   │   ├── subscriptions/
│   │   ├── invoices/
│   │   ├── deal-health/
│   │   ├── reports/
│   │   ├── products/
│   │   └── customers/
│   ├── portal/               # Customer portal
│   └── api/                  # REST API route handlers
├── lib/
│   ├── types/                # Shared TypeScript types
│   ├── data/                 # In-memory mock data store
│   ├── services/             # Pure business logic services
│   ├── ai/                   # OpenRouter integration + fallback
│   └── auth/                 # Auth helpers
└── components/               # Reusable UI components
```

---

## 🎬 Demo Flow (5-minute judge walkthrough)

1. **Login** as Sales Rep (`sales@dealflow360.demo`)
2. Open **Quotations** → find **Q-1042** (Acme Corp)
3. See live discount validation — Onsite Setup at 18% vs 10% limit → **OVER +8pt**
4. See **BLENDED RISK: HIGH** with full explanation
5. Switch to **Sales Manager** (`manager@dealflow360.demo`)
6. Go to **Approvals** → open Q-1042
7. Review risk breakdown, view AI upsell suggestions
8. Click **Approve**
9. Switch to **Finance** (`finance@dealflow360.demo`)
10. Go to **Approvals** → **Confirm** Q-1042
11. Go to **Fulfillment** → see warehouse split (Main + East Depot)
12. Switch back to **Customer** (`customer@dealflow360.demo`)
13. Go to **My Quotation** → submit negotiation request
14. Watch system trigger **reapproval** loop
15. Go to **Invoices** → see partial invoice (12 of 20 units)
16. See **Care Plan** subscription with next billing date
17. Go to **Deal Health** → see anomaly cards and stalled deals
18. Go to **Reports** → see dynamic KPIs and charts

---

## 📄 Documentation

- [SETUP.md](./SETUP.md) — Detailed setup instructions
- [ARCHITECTURE.md](./ARCHITECTURE.md) — Technical architecture
- [API.md](./API.md) — API reference

---

## 🏆 Hackathon Notes

This application was built for a 24-hour hackathon. It uses **in-memory mock data** for maximum demo reliability — no database setup required. The data store is a Zustand store initialized with realistic seed data on server start.

To connect a real PostgreSQL database, see [SETUP.md](./SETUP.md).
# Mahadealflow
