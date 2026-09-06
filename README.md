# DealFlow360

> **Enterprise Quote-to-Cash Platform** — Built for the Odoo Hackathon by Team SparkMinds

DealFlow360 is a full-stack B2B sales operations platform that manages the complete deal lifecycle — from initial quotation and multi-tier negotiation through finance-gated warehouse allocation, payment processing, and invoice generation — all within a single, unified interface.

---

## 🚀 Features

### 📋 Quotation Management
- Create, edit, and version multi-line quotations with product variants
- Automatic discount validation against tier policies and risk thresholds
- PDF & XLS export of quotations with full line-item breakdown
- Stage-aware workflow: `Draft → Negotiation → Pending Approval → Awaiting Allocation → Paid`

### 🤝 Negotiation Engine
- Customer-initiated counter-offer submission with target discount and notes
- Real-time negotiation thread (message history) between customer and sales rep
- Risk scoring engine with auto-approval or escalation to Sales Manager / Finance
- Re-approval triggering when discount breaches category ceilings

### ✅ Multi-Tier Approval Workflow
- **Sales Rep** → **Sales Manager** → **Finance** approval chain
- Risk-level classification (LOW / MEDIUM / HIGH) with configurable escalation
- Approval actions logged with timestamps and user attribution

### 🏭 Finance Fulfillment & Warehouse Allocation
- Finance allocates warehouse stock before customer payment is unlocked
- Manual warehouse selection with per-product quantity split across multiple depots
- Auto-split routing across registered facilities
- **Backorder engine**: surplus allocated qty is returned to the source warehouse, stock numbers update in real-time
- Live warehouse cards showing IN STOCK / RESERVED / AVAILABLE derived from active fulfillment allocations

### 💳 Payment System
- **One-Time Payment**: full amount charged, invoice generated and auto-downloaded
- **Recurring Payment**: Monthly / Quarterly / Semi-Annual / Yearly installments
- Subscription record created per recurring cycle
- Auto-generated PDF invoice on payment confirmation
- Payment locked until Finance completes warehouse allocation

### 📦 Inventory & Warehouse Management
- Multi-depot physical stock tracking across unlimited warehouses
- Live sync: reserved quantities computed from active fulfillment orders
- Backorder adjustment reflected immediately in available count
- Stock transfer between warehouses
- Low-stock alerts and reorder threshold monitoring

### 🧾 Invoice & Subscription Hub
- Invoice lifecycle: `Draft → Unpaid → Partially Paid → Paid`
- Recurring subscription management with billing history
- PDF & XLS invoice export
- Finance dashboard with invoice reconciliation view

### 👥 Role-Based Access Control
| Role | Access |
|---|---|
| **Admin** | Full system access |
| **Sales Rep** | Quotations, customers, negotiations |
| **Sales Manager** | Approval dashboard, discount overrides |
| **Finance** | Fulfillment allocation, invoices, warehouse management |
| **Customer** | Portal — view quotes, negotiate, pay, track orders |

### 📊 Dashboards
- **Executive Dashboard**: Pipeline KPIs, revenue forecast, deal health, escalation center
- **Sales Manager Dashboard**: Approval queue, team performance, discount analytics
- **Finance Dashboard**: Fulfillment pipeline, invoice reconciliation, backorder status
- **Sales Rep Dashboard**: My deals, quota tracking, negotiation inbox
- **Customer Portal**: Quotation status, payment, order tracking, invoice history

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript 5 |
| **UI** | React 19, Vanilla CSS, Tailwind CSS 4 |
| **Icons** | Lucide React |
| **Charts** | Recharts |
| **State Management** | Zustand 5 |
| **Forms** | React Hook Form + Zod |
| **Tables** | TanStack Table v9 |
| **PDF Export** | jsPDF |
| **AI Integration** | OpenRouter (GPT-4o-mini via server route) |

---

## 📁 Project Structure

```
dealflow360/
├── app/
│   ├── (auth)/login/          # Login page
│   ├── (internal)/            # Internal staff routes
│   │   ├── dashboard/         # Role-based dashboard hub
│   │   ├── quotations/        # Quotation list & detail
│   │   ├── approvals/         # Approval workflow
│   │   ├── fulfillment/       # Finance fulfillment & allocation
│   │   ├── invoices/          # Invoice management
│   │   ├── warehouses/        # Warehouse & inventory management
│   │   ├── customers/         # Customer CRM
│   │   ├── products/          # Product & pricing catalogue
│   │   ├── subscriptions/     # Subscription management
│   │   ├── reports/           # Analytics & reports
│   │   └── deal-health/       # Deal health scoring
│   ├── portal/                # Customer self-service portal
│   │   ├── quotation/         # Active quotation view & payment
│   │   ├── quotations/        # Quotation history
│   │   ├── orders/            # Order tracking
│   │   ├── invoices/          # Invoice history
│   │   └── subscriptions/     # Subscription overview
│   └── api/                   # Next.js API routes (AI chat, portal)
│
├── components/
│   ├── dashboard/             # Role-specific dashboard components
│   ├── customer/              # Customer portal UI components
│   ├── quotation/             # Quotation builder components
│   ├── layout/                # Sidebar, TopNav
│   ├── ui/                    # Shared: Button, Badge, Modal, Table
│   └── ai/                    # AI Chatbot component
│
├── lib/
│   ├── data/
│   │   ├── mockData.ts        # Seed data for all entities
│   │   └── store.ts           # Zustand global store
│   ├── services/
│   │   ├── fulfillmentService.ts   # Quote confirmation → allocation → payment
│   │   ├── inventoryService.ts     # Stock sync & backorder engine
│   │   ├── billingService.ts       # Invoice creation & billing cycle calc
│   │   ├── negotiationService.ts   # Counter-offer evaluation
│   │   ├── approvalService.ts      # Approval routing logic
│   │   ├── discountService.ts      # Discount validation & risk scoring
│   │   ├── permissionService.ts    # Role-based permission checks
│   │   ├── pricingService.ts       # Price list & tier pricing
│   │   ├── dealHealthService.ts    # Deal health scoring
│   │   └── auditService.ts         # Audit trail helpers
│   ├── types/index.ts         # All shared TypeScript interfaces
│   ├── ai/openrouter.ts       # OpenRouter API client
│   └── utils/
│       ├── documentExporter.ts # PDF / XLS export utilities
│       └── exportInvoice.ts    # Invoice export helpers
│
├── backend/                   # Express.js backend controllers (API layer)
└── public/                    # Static assets
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/HibaRaliyyah/OdooHackathon_SparkMinds_DealFlow360.git
cd OdooHackathon_SparkMinds_DealFlow360

# Install dependencies
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
# AI Integration (optional — app works without it)
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=openai/gpt-4o-mini
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm run start
```

---

## 🔑 Demo Login Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@dealflow360.com | any |
| Sales Rep | rep@dealflow360.com | any |
| Sales Manager | manager@dealflow360.com | any |
| Finance | finance@dealflow360.com | any |
| Customer | customer@acmecorp.com | any |

> The app uses mock authentication — any password is accepted for demo purposes.

---

## 🔄 Core Business Flow

```
1. Sales Rep creates Quotation
         ↓
2. Customer reviews & negotiates (counter-offer thread)
         ↓
3. Approval workflow (Sales Manager / Finance sign-off)
         ↓
4. Customer confirms final terms
         ↓
5. Finance allocates warehouse stock (payment locked until this step)
   ├── Manual warehouse selection + qty split
   ├── Auto-split across depots
   └── Backorder: surplus qty returned to source warehouse
         ↓
6. Customer pays (One-Time or Recurring with intervals)
   ├── Invoice auto-generated & downloaded (PDF/XLS)
   └── Subscription record created (recurring mode)
         ↓
7. Fulfillment dispatched, inventory deducted
```

---

## 🏆 Hackathon

**Event**: Odoo Hackathon  
**Team**: SparkMinds  
**Members**: Hiba Raliyyah & Mahalashmi

---

## 📄 License

This project is built for hackathon demonstration purposes.
