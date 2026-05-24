# Smart Offer Slot Booking System

An enterprise-ready, role-based, limited-time promotional catalog reservation and appointment scheduling platform. Featuring robust PostgreSQL structures, JWT protection schemes, dynamic slot planners, and responsive dual-role interfaces.

Developed for university defense projects, hackathons, and software architectural examinations.

---

## 🏗️ System Architecture & Stack

### Frontend Client
- **Framework**: React 19 (TypeScript, functional components)
- **Styling**: Tailwind CSS 4.x (highly customized modern colors, grid layouts, spacious negative margins)
- **Routing**: Sectional Hash State navigation (anti iFrame break, highly resilient sandbox flow)
- **Visuals & Charts**: Recharts & SVG custom matrix models
- **Icons**: Lucide React

### Backend API Solution
- **Production Standard**: ASP.NET 8.0 Core Web API (clean architecture, repository design pattern)
- **Database Engine**: PostgreSQL 16+ ORM: Entity Framework Core (DbSet migrations, unique constraints, and B-Tree indexing strategies)
- **Authentication**: Bearer JWT Tokens with Claims-based Roles (Admin vs. Customer checkups)

---

## 📂 Project Component Schema Structure

```bash
├── backend-dotnet/           # Real-World .NET 8 Web API & SQL Assets
│   ├── DbSchema.sql          # Complete PostgreSQL B-Tree schema definitions
│   └── solution-guide.md     # Setup, Program.cs, config parameters
├── server.ts                 # Fullstack Node/Express REST API powering Sandbox Environment (Vite Middleware)
├── src/
│   ├── App.tsx               # Master App router shell, business provider contexts
│   ├── types.ts              # Contract models (Business, Offer, Slot, Booking)
│   ├── components/
│   │   ├── QRGenerator.tsx   # Custom SVG vector barcode/QR ticketer
│   │   ├── DatabaseExplorer.tsx # Visual interactive PostgreSQL dictionary ER model
│   │   ├── DotnetCodeViewer.tsx # Inline C# backend tab inspector
│   │   └── NotificationLogPanel.tsx # Webhook messages live alert ticker
│   └── pages/
│       ├── AdminLogin.tsx    # Secure sign-in viewport
│       ├── AdminDashboard.tsx# Numerical analytics, Recharts curves, actions lists
│       ├── CreateOffer.tsx   # Dual-mode forms with automatic slot hour splitter rules
│       ├── ManageOffers.tsx  # Campaign portfolio managers with calendar drawers
│       ├── ManageBookings.tsx# Master ledger database, CSV generator trigger
│       ├── PublicListing.tsx # Customer campaign grids, countdown timers, search filters
│       ├── PublicDetail.tsx  # Dynamic slot picker, duplicate limit validators
│       └── BookingConfirmation.tsx # Wallet boarding voucher card, PDF generator
```

---

## 📊 Database ERD Schematic & Constraints

The PostgreSQL engine utilizes a robust snowflake schema:
1. **Businesses**: Holds company meta parameters. One-To-Many relationship with Offers.
2. **Offers**: Houses specific campaign discount details, pricing structures, and coupon parameters. One-To-Many with OfferSlots (Cascade deletes enabled. Trigger price checks: `OfferPrice < OriginalPrice`).
3. **OfferSlots**: Dynamic child timing blocks tracking group capacities. (`BookedCount <= Capacity` constraint).
4. **Bookings (Fact ledger)**: Core transactions linking Customer details and selected Slots securely via unique scan keys (`ReferenceNumber` marked as UNIQUE).

---

## 👩‍🎓 Demo Presentation & Viva Checklists

During oral review or software defense, highlighting these key items guarantees a top score:

1. **Dual-Role Simulation**: Toggle the **Presentation Sandbox Console** at the top of the interface in 1-click. Show how adding an offer as Admin instantly publishes it to the public Customer view, and how a customer checkout subtracts seats from the slot in real-time.
2. **Business Controls**: Show price rules validation (entering an offer price higher than the original price will trigger a soft warning).
3. **Duplicate Spam Filter**: Highlight the duplicate booking guard: same customer phone numbers cannot exceed the `MaxBookingPerCustomer` threshold for a campaign.
4. **Interactive DB Explorer & .NET tabs**: Click **PostgreSQL & .NET 8** on the Admin Sidebar to visually show the examiner your real SQL code and C# layers inside the browser.
5. **Voucher Ticket & QR Code**: Complete a booking as a customer, click print to trigger paper billing, and explain the deterministic SVG algorithm of the QR.
