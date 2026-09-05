# DealFlow360 — Customer Portal Implementation Instructions

## 1. Objective

Implement a complete **Customer Portal** for DealFlow360.

The customer portal must allow a logged-in customer to:

1. View their dashboard
2. View quotations assigned to them
3. View quotation details
4. Negotiate quotation terms
5. Accept or reject quotations
6. Confirm final quotation terms
7. Track confirmed orders
8. View fulfillment status
9. View invoices
10. View subscription information
11. View notifications
12. View/update basic company profile information
13. Logout securely

The implementation must integrate with the existing backend and database rather than using hardcoded frontend-only data.

---

# 2. Existing Technology Stack

Use the existing project stack.

## Frontend

- Next.js
- React
- TypeScript
- Vanilla CSS / CSS Modules
- Zustand
- React Hook Form
- Zod
- Lucide React

## Backend

- Node.js
- Express.js
- Prisma

## Database

- PostgreSQL
- Supabase PostgreSQL

## Important

Do NOT introduce Tailwind CSS for new Customer Portal components.

Use:

```text
CSS Modules
```

or existing project Vanilla CSS conventions.

Do not replace the existing project architecture.

---

# 3. Customer Portal Route Structure

Create the following routes:

```text
/portal
/portal/quotations
/portal/quotations/[id]
/portal/orders
/portal/orders/[id]
/portal/fulfillment
/portal/invoices
/portal/subscriptions
/portal/notifications
/portal/profile
```

Login should redirect the customer to:

```text
/portal
```

Do not redirect customers to the internal employee dashboard.

---

# 4. Customer Portal Layout

Create a dedicated Customer Portal layout.

Suggested structure:

```text
app/
└── portal/
    ├── layout.tsx
    ├── page.tsx
    │
    ├── quotations/
    │   ├── page.tsx
    │   └── [id]/
    │       └── page.tsx
    │
    ├── orders/
    │   ├── page.tsx
    │   └── [id]/
    │       └── page.tsx
    │
    ├── fulfillment/
    │   └── page.tsx
    │
    ├── invoices/
    │   └── page.tsx
    │
    ├── subscriptions/
    │   └── page.tsx
    │
    ├── notifications/
    │   └── page.tsx
    │
    └── profile/
        └── page.tsx
```

---

# 5. Customer Portal Sidebar

Create a separate sidebar for customers.

Navigation:

```text
Customer Portal

Dashboard
Quotations
Orders
Fulfillment
Invoices
Subscriptions
Notifications
Profile
Logout
```

Suggested icons from Lucide React:

```text
Dashboard       → LayoutDashboard
Quotations      → FileText
Orders          → ShoppingBag
Fulfillment     → Truck
Invoices        → Receipt
Subscriptions   → RefreshCw
Notifications   → Bell
Profile         → User
Logout          → LogOut
```

Do not expose internal employee/admin navigation to customers.

Customers must NOT see:

```text
Admin Settings
Approvals
Discount Configuration
Warehouse Configuration
Reports
System Audit Logs
Product Management
```

---

# 6. Customer Dashboard

Route:

```text
/portal
```

The dashboard should display:

## Header

```text
Welcome, {Customer Name}

Here's an overview of your DealFlow360 activity.
```

## KPI Cards

Display:

```text
Active Quotations
Pending Negotiations
Active Orders
Outstanding Invoices
```

Example:

```text
┌────────────────────┐
│ Active Quotations  │
│ 3                  │
└────────────────────┘

┌────────────────────┐
│ Negotiations       │
│ 1                  │
└────────────────────┘

┌────────────────────┐
│ Active Orders      │
│ 2                  │
└────────────────────┘

┌────────────────────┐
│ Outstanding        │
│ ₹85,000            │
└────────────────────┘
```

## Pending Actions

Show quotations requiring customer action.

Example:

```text
Quotation Q-1024

Enterprise Software Package
Total: ₹64,900

Status: Awaiting Customer

[View Quote]
```

## Recent Activity

Display recent:

- quotation updates
- negotiation responses
- order confirmations
- shipment updates
- invoice generation
- payment updates

---

# 7. Customer Authentication

Customers must only access their own data.

After authentication, obtain:

```text
currentUser
customerId
customer/company information
role
```

Customer role should be:

```text
CUSTOMER
```

Every customer API request must identify the authenticated customer.

Do NOT trust a customerId sent directly from the frontend without server-side authorization.

The backend must verify:

```text
Authenticated User
        ↓
CUSTOMER role
        ↓
Customer Account
        ↓
Requested Resource belongs to Customer
```

If the resource does not belong to the logged-in customer:

```text
HTTP 403 Forbidden
```

---

# 8. Customer Quotations

Route:

```text
/portal/quotations
```

Display all quotations belonging to the logged-in customer.

Table/list columns:

```text
Quotation No.
Created Date
Valid Until
Total
Discount
Status
Action
```

Possible statuses:

```text
Draft
Pending Approval
Awaiting Customer
Under Negotiation
Approved
Accepted
Rejected
Expired
Converted to Order
```

Use status badges.

---

# 9. Quotation Details

Route:

```text
/portal/quotations/[id]
```

Display:

## Quotation Header

```text
Quotation Q-1024

Created: September 5, 2026
Valid Until: September 15, 2026

Status: Awaiting Customer
```

## Sales Representative

Display:

```text
Sales Representative
Name
Email
```

## Product Table

Display:

```text
Product
Quantity
Unit Price
Discount
Tax
Subtotal
```

## Financial Summary

Calculate/display:

```text
Subtotal
Discount
Tax
Grand Total
```

## Billing Information

Display whether products are:

```text
One-Time
Recurring
Mixed
```

If recurring items exist, display:

```text
Monthly recurring amount
Annual recurring amount
Next billing information
```

---

# 10. Customer Negotiation

This is a CORE DealFlow360 feature.

The customer must be able to request changes to a quotation.

Display:

```text
Request Changes
```

When clicked, open a negotiation form.

Fields:

```text
Requested Discount
Requested Quantity
Requested Price
Message / Reason
```

Do not allow customers to modify arbitrary quotation data.

The customer should submit a negotiation request.

Example:

```text
Current Discount: 10%

Requested Discount:
[ 15% ]

Reason:
[ We are increasing the order quantity. ]

[ Submit Negotiation ]
```

---

# 11. Negotiation Workflow

Implement the following workflow:

```text
Customer submits negotiation
            ↓
Negotiation created
            ↓
Sales Rep reviews
            ↓
Does requested term exceed approval threshold?
          /   \
        YES    NO
         ↓      ↓
   Approval    Sales Rep
     Flow      Response
         ↓
   Approved/Rejected
         ↓
 Customer notified
         ↓
 Customer confirms final terms
```

If the negotiated discount exceeds the configured discount ceiling:

```text
Quotation → Approval
```

must happen again.

Do not bypass the application's approval rules.

---

# 12. Accept Quotation

Provide:

```text
[ Accept Quotation ]
```

Only display this action when the quotation is eligible for customer acceptance.

When clicked:

1. Confirm with the customer.
2. Verify quotation is still valid.
3. Verify quotation is in an acceptable state.
4. Update quotation status.
5. Create/convert the order if required by the existing business logic.
6. Notify the customer.
7. Refresh the UI.

Example confirmation:

```text
Accept Quotation?

By accepting this quotation, you confirm the listed
products, pricing, discounts and terms.

[Cancel] [Accept Quote]
```

---

# 13. Reject Quotation

Provide:

```text
[ Reject Quotation ]
```

Require a reason.

Example:

```text
Reason for rejection:

[____________________________]

[Cancel] [Reject Quote]
```

Store the rejection reason.

Update quotation status to:

```text
Rejected
```

Notify the sales representative.

---

# 14. Customer Confirmation

After negotiation is completed, display the final terms clearly.

Example:

```text
Final Quotation

Subtotal       ₹60,000
Discount       ₹5,000
Tax            ₹9,900
Total          ₹64,900

Discount: 8%

Status: Approved

[ Confirm Final Terms ]
```

Customer confirmation should move the deal into the next stage of the DealFlow360 process.

---

# 15. Orders

Route:

```text
/portal/orders
```

Display customer's orders.

Columns:

```text
Order Number
Quotation
Order Date
Total
Fulfillment Status
Payment Status
Action
```

Example statuses:

```text
Confirmed
Processing
Partially Fulfilled
Shipped
Delivered
Backordered
Completed
Cancelled
```

---

# 16. Order Details

Route:

```text
/portal/orders/[id]
```

Display:

```text
Order Number
Quotation Number
Order Date
Products
Quantity
Price
Discount
Total
Payment Status
Fulfillment Status
```

Also display an order timeline:

```text
✓ Order Confirmed
      ↓
✓ Warehouse Assigned
      ↓
● Preparing Shipment
      ↓
○ Shipped
      ↓
○ Delivered
```

---

# 17. Fulfillment Tracking

Route:

```text
/portal/fulfillment
```

Customers can VIEW fulfillment status.

Customers must NOT be allowed to:

```text
Change warehouse
Override warehouse split
Change shipment quantity
Approve backorder
Change shipping cost
Modify replenishment rules
```

Those actions belong to the Finance / Operations role.

---

# 18. Multi-Warehouse Fulfillment Display

For orders split between warehouses, display:

```text
Order: ORD-1024

Product: Enterprise Laptop
Required: 100

Warehouse A
Fulfilled: 60

Warehouse B
Fulfilled: 40

Total Fulfilled: 100 / 100
```

If there is a backorder:

```text
Required: 100
Fulfilled: 80
Backorder: 20
```

Display:

```text
20 units currently on backorder.
```

If the Operations user consolidates the backorder, the customer portal should automatically reflect the updated fulfillment status.

---

# 19. Invoices

Route:

```text
/portal/invoices
```

Display:

```text
Invoice Number
Order Number
Invoice Date
Due Date
Amount
Status
Action
```

Statuses:

```text
Paid
Pending
Partially Paid
Overdue
Cancelled
```

Actions:

```text
View Invoice
Download Invoice
Pay
```

---

# 20. Invoice Details

Display:

```text
Invoice #INV-1001

Customer
Company Name
Billing Address

Items
Quantity
Price
Tax
Discount

Subtotal
Discount
Tax
Grand Total

Payment Status
Due Date
```

For the hackathon, payment may use a mock/sandbox payment flow if a real payment gateway is not required.

Do not store actual card information.

---

# 21. Subscriptions

Route:

```text
/portal/subscriptions
```

Display customer's active subscriptions.

Example:

```text
Enterprise Pro

Status: Active
Billing: Monthly
Amount: ₹25,000 / month

Next Billing Date:
October 5, 2026
```

Display:

```text
Plan Name
Billing Cycle
Amount
Start Date
Next Billing Date
Status
```

Also provide:

```text
View Subscription
View Billing History
```

Only provide cancellation functionality if it is supported by the existing backend business rules.

---

# 22. Notifications

Route:

```text
/portal/notifications
```

Display notifications such as:

```text
New quotation received
Quotation updated
Negotiation response received
Quotation approved
Quotation rejected
Order confirmed
Shipment dispatched
Backorder updated
Invoice generated
Payment received
Subscription renewal
```

Each notification should contain:

```text
Title
Message
Timestamp
Read/Unread status
```

Provide:

```text
Mark as Read
Mark All as Read
```

---

# 23. Customer Profile

Route:

```text
/portal/profile
```

Display:

```text
Company Name
Contact Person
Email
Phone
Billing Address
Shipping Address
Customer Tier
```

Customer should only be able to edit allowed profile information.

Do not allow customers to modify:

```text
Customer Tier
Discount Ceiling
Internal Approval Rules
Credit Limit
Internal Risk Score
Internal Sales Information
```

---

# 24. Customer Portal Header

Create a top header containing:

```text
DealFlow360 Customer Portal

Notifications 🔔

Customer Name
Company Name

Profile / Logout
```

Use the existing application design system.

---

# 25. UI Design

The customer portal should look professional and consistent with DealFlow360.

Use:

```text
Clean enterprise B2B design
Dark/light existing project theme
Rounded cards
Subtle borders
Readable typography
Status badges
Clear primary actions
Responsive layout
```

Do not use Tailwind classes for new components.

Use CSS Modules.

Example:

```text
QuotationCard.tsx
QuotationCard.module.css
```

---

# 26. Recommended Component Structure

Create reusable components.

```text
components/
└── customer/
    ├── CustomerSidebar.tsx
    ├── CustomerHeader.tsx
    ├── CustomerKpiCard.tsx
    ├── QuotationCard.tsx
    ├── QuotationStatusBadge.tsx
    ├── NegotiationForm.tsx
    ├── QuotationSummary.tsx
    ├── OrderCard.tsx
    ├── OrderTimeline.tsx
    ├── FulfillmentStatus.tsx
    ├── WarehouseFulfillmentCard.tsx
    ├── InvoiceCard.tsx
    ├── SubscriptionCard.tsx
    ├── NotificationItem.tsx
    └── CustomerProfileForm.tsx
```

Each component should have its own CSS Module where appropriate.

---

# 27. API Structure

Use the existing Node.js/Express backend.

Suggested endpoints:

## Dashboard

```http
GET /api/customer/dashboard
```

## Quotations

```http
GET /api/customer/quotations
GET /api/customer/quotations/:id
POST /api/customer/quotations/:id/negotiate
POST /api/customer/quotations/:id/accept
POST /api/customer/quotations/:id/reject
POST /api/customer/quotations/:id/confirm
```

## Orders

```http
GET /api/customer/orders
GET /api/customer/orders/:id
```

## Fulfillment

```http
GET /api/customer/fulfillment
GET /api/customer/orders/:id/fulfillment
```

## Invoices

```http
GET /api/customer/invoices
GET /api/customer/invoices/:id
POST /api/customer/invoices/:id/pay
```

## Subscriptions

```http
GET /api/customer/subscriptions
GET /api/customer/subscriptions/:id
```

## Notifications

```http
GET /api/customer/notifications
PATCH /api/customer/notifications/:id/read
PATCH /api/customer/notifications/read-all
```

## Profile

```http
GET /api/customer/profile
PATCH /api/customer/profile
```

Use the project's existing API naming conventions if they differ.

---

# 28. Database Requirements

Use the existing Prisma schema.

Do NOT create duplicate models if equivalent models already exist.

Reuse existing entities where possible:

```text
User
Customer
Quotation
QuotationItem
Deal
Order
OrderItem
Product
Warehouse
Fulfillment
Invoice
Subscription
Notification
Negotiation
ApprovalRequest
```

If a required model does not exist, add it only when necessary.

All database changes must be implemented through Prisma migrations.

Example:

```bash
npx prisma migrate dev --name add_customer_portal
```

Then:

```bash
npx prisma generate
```

---

# 29. Important Authorization Rules

Customer data must be isolated.

A customer can:

```text
VIEW their quotations
VIEW their orders
VIEW their fulfillment
VIEW their invoices
VIEW their subscriptions
VIEW their notifications
UPDATE allowed profile information
NEGOTIATE their quotations
ACCEPT their quotations
REJECT their quotations
```

A customer cannot:

```text
VIEW another customer's data
CREATE internal quotations
CHANGE product catalog
CHANGE prices
CHANGE discount tiers
CHANGE approval chains
CHANGE warehouse allocation
APPROVE discounts
APPROVE internal requests
CHANGE deal health
VIEW internal reports
VIEW audit logs
VIEW internal margins
VIEW internal profit
```

---

# 30. Deal Health Privacy

Do NOT expose internal Deal Health information to customers.

The customer may see:

```text
Quotation Status
Order Status
Fulfillment Status
Payment Status
```

The customer must NOT see:

```text
Internal Deal Health Score
Internal Risk Score
Margin
Expected Profit
Internal Discount Risk
Approval Risk
Sales Performance
Internal Anomaly Flags
```

---

# 31. Loading States

Every API-driven page must have a loading state.

Example:

```text
Loading quotations...
```

Use skeleton loaders where appropriate.

Do not show an empty page while API requests are loading.

---

# 32. Error Handling

Handle:

```text
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Validation Error
500 Server Error
```

Display user-friendly messages.

Example:

```text
We couldn't load this quotation.
Please try again.
```

Do not expose raw backend errors or database errors to customers.

---

# 33. Empty States

Create useful empty states.

Example:

```text
No Quotations

You don't have any quotations yet.

We'll notify you when a quotation is available.
```

For invoices:

```text
No Invoices

There are currently no invoices associated
with your account.
```

---

# 34. Form Validation

Use:

```text
React Hook Form
+
Zod
```

Validate negotiation fields.

Example:

```text
Discount:
0–100%

Quantity:
positive integer

Message:
required
```

Prevent invalid values before sending them to the backend.

Backend validation must also be implemented.

Never rely only on frontend validation.

---

# 35. State Management

Use the existing Zustand store where appropriate.

Do not duplicate the same customer state unnecessarily.

Suggested state:

```text
currentUser
customer
customerQuotations
customerOrders
customerInvoices
customerSubscriptions
customerNotifications
```

If the existing store already has equivalent state, reuse it.

Do not create another global store without a strong reason.

---

# 36. API Loading Pattern

Frontend pages should follow this general pattern:

```text
Page loads
   ↓
Request API
   ↓
Show loading state
   ↓
Receive response
   ↓
Store/update state
   ↓
Render UI
```

Do not hardcode production data inside components.

Seed/demo data belongs in the database or existing seed system.

---

# 37. Customer Portal Demo Data

Create realistic demo data for the hackathon.

Example customer:

```text
Company:
Acme Corporation
```

Example quotation:

```text
Q-1024

Enterprise Software Package
Quantity: 10

Subtotal: ₹60,000
Discount: ₹5,000
Tax: ₹9,900
Total: ₹64,900
```

Example negotiation:

```text
Requested Discount:
15%

Reason:
Increasing order quantity.
```

Example order:

```text
ORD-1024

Status:
Partially Fulfilled
```

Example fulfillment:

```text
Warehouse A:
60 units

Warehouse B:
20 units

Backorder:
20 units
```

Example invoice:

```text
INV-1001
Amount: ₹64,900
Status: Pending
```

Use the project's actual currency/configuration if already defined.

---

# 38. Important Business Flow

The complete customer-facing flow must work:

```text
Customer Login
      ↓
Customer Dashboard
      ↓
Quotation Received
      ↓
View Quotation
      ↓
Customer Negotiates
      ↓
Sales Rep Responds
      ↓
Approval if required
      ↓
Customer Receives Updated Terms
      ↓
Customer Accepts
      ↓
Order Created
      ↓
Warehouse Fulfillment
      ↓
Customer Tracks Fulfillment
      ↓
Invoice Generated
      ↓
Customer Pays
      ↓
Order Completed
```

This flow should be testable during the hackathon demo.

---

# 39. Do Not Implement Customer-Side Internal Operations

Do NOT give the customer:

```text
Warehouse Override
Manual Warehouse Split
Backorder Approval
Discount Tier Configuration
Approval Configuration
Product Configuration
Price List Configuration
Subscription Plan Creation
Internal Reporting
```

These belong to internal DealFlow360 roles.

---

# 40. Responsive Design

The portal must work on:

```text
Desktop
Tablet
Mobile
```

On smaller screens:

```text
Sidebar
   ↓
Collapsible/mobile navigation
```

Tables should become responsive cards or horizontally scrollable containers.

---

# 41. Security Requirements

Never trust frontend authorization.

Backend must verify:

```text
User is authenticated
        ↓
User has CUSTOMER role
        ↓
Customer owns requested quotation/order/invoice
```

Do not send internal fields to the customer API.

For example, do NOT return:

```text
internalMargin
profit
approvalRisk
internalDiscountCeiling
internalNotes
dealHealthScore
```

unless explicitly required for the customer experience.

---

# 42. Testing Checklist

Test the following:

## Authentication

- Customer can login.
- Customer is redirected to `/portal`.
- Customer can logout.
- Unauthenticated users cannot access `/portal`.

## Quotations

- Customer sees only their quotations.
- Customer can open quotation details.
- Customer can negotiate.
- Customer can accept.
- Customer can reject.
- Invalid quotation states prevent invalid actions.

## Authorization

- Customer cannot access another customer's quotation.
- Customer cannot access another customer's order.
- Customer cannot access internal admin routes.

## Orders

- Customer can see confirmed orders.
- Customer can view order details.
- Customer can view status timeline.

## Fulfillment

- Customer can view warehouse fulfillment.
- Customer can see backordered quantity.
- Customer cannot modify warehouse allocation.

## Invoices

- Customer can view invoices.
- Customer can see payment status.
- Customer can use the available payment/mock payment flow.

## Notifications

- Customer receives relevant notifications.
- Customer can mark notifications as read.

## Profile

- Customer can view profile.
- Customer can update permitted fields.
- Restricted internal fields cannot be changed.

---

# 43. Implementation Order

Implement in this order.

### Phase 1 — Layout

```text
Customer Layout
Customer Sidebar
Customer Header
Authentication protection
```

### Phase 2 — Dashboard

```text
Dashboard
KPI Cards
Pending Actions
Recent Activity
```

### Phase 3 — Quotations

```text
Quotation List
Quotation Details
Quotation Summary
Accept
Reject
```

### Phase 4 — Negotiation

```text
Negotiation Form
Negotiation API
Approval re-entry logic
Negotiation status
Notifications
```

### Phase 5 — Orders

```text
Order List
Order Details
Order Timeline
```

### Phase 6 — Fulfillment

```text
Fulfillment Status
Warehouse Allocation Display
Backorder Display
```

### Phase 7 — Billing

```text
Invoices
Invoice Details
Payment Status
Subscriptions
```

### Phase 8 — Supporting Features

```text
Notifications
Profile
Responsive design
Error states
Loading states
Empty states
```

### Phase 9 — Testing

Test the complete:

```text
Quotation → Negotiation → Approval → Acceptance → Order → Fulfillment → Invoice
```

flow.

---

# 44. Coding Rules

Follow these rules:

1. Use TypeScript.
2. Use reusable React components.
3. Use CSS Modules/Vanilla CSS.
4. Do not introduce Tailwind.
5. Do not duplicate existing components.
6. Reuse existing Zustand state when possible.
7. Reuse existing API utilities.
8. Reuse existing Prisma models when possible.
9. Do not hardcode business rules in the UI.
10. Business rules must be enforced by the backend.
11. Validate both frontend and backend.
12. Do not expose internal company data to customers.
13. Keep customer authorization server-side.
14. Keep components reasonably small.
15. Use meaningful names.
16. Do not remove existing DealFlow360 functionality.
17. Do not modify unrelated employee/admin functionality.
18. Do not commit `.env` files or secrets.

---

# 45. Definition of Done

The Customer Portal is complete when:

- Customer can login.
- Customer lands on `/portal`.
- Customer dashboard works.
- Customer sees only their own data.
- Customer can view quotations.
- Customer can negotiate a quotation.
- Negotiation can trigger approval when required.
- Customer can accept/reject quotations.
- Confirmed quotation moves into order flow.
- Customer can track order.
- Customer can view warehouse fulfillment.
- Customer can see backorders.
- Customer can view invoices.
- Customer can view payment status.
- Customer can view subscriptions.
- Customer can view notifications.
- Customer can manage allowed profile information.
- Customer cannot access internal admin functions.
- Customer portal is responsive.
- API and database integration work.
- No customer data is hardcoded in production components.
- The complete customer flow can be demonstrated in the hackathon.

---

# 46. Final Hackathon Demo Flow

The final demonstration should use this scenario:

```text
1. Login as Acme Corporation
             ↓
2. Open Customer Dashboard
             ↓
3. Show quotation Q-1024
             ↓
4. Open quotation details
             ↓
5. Request 15% discount
             ↓
6. Show negotiation status
             ↓
7. Sales Rep/Approver processes request
             ↓
8. Customer receives updated quotation
             ↓
9. Customer accepts final quotation
             ↓
10. Order is created
             ↓
11. Customer opens order
             ↓
12. Show warehouse fulfillment
             ↓
13. Show split across warehouses
             ↓
14. Show backorder if applicable
             ↓
15. Show generated invoice
             ↓
16. Show payment status
```

The goal is to demonstrate that the Customer Portal is not just a static dashboard, but an integrated part of the **DealFlow360 quote-to-cash workflow**.