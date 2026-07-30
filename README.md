# VyapaarOS

> The AI Operating System for Bharat’s businesses.

VyapaarOS is a Next.js prototype for small-business owners who do not want another dashboard to maintain. It brings orders, inventory, payments, invoices, suppliers, GST, and cash flow into one connected **Business Brain**—so an owner can simply ask what is happening and what to do next.

## Why it matters

Most MSMEs operate across WhatsApp, UPI, paper bills, spreadsheets, bank statements, and notebooks. VyapaarOS turns those disconnected events into an understandable, continuously updated business context.

The goal is not to be another ERP. It is to feel like an AI employee that learns how a business runs and helps operate it.

## Prototype highlights

- **Business Brain** — Ask natural-language questions about cash flow, receivables, profit, and GST.
- **Business Memory & Knowledge Graph** — Explore the links between customers, invoices, payments, products, and suppliers, with contextual history behind each one.
- **Digital Twin** — Simulate a stock-purchase decision before committing money.
- **AI Auditor** — Surface duplicate payments, missing GST entries, and unusual refunds.
- **AI Employee Command Center** — See explainable recommendations from the AI CFO, Procurement Manager, and Auditor.
- **Voice and Bharat-first prompts** — Kannada + English-oriented question flow, including GST queries.
- **WhatsApp & document inbox** — Demonstrates ingestion of WhatsApp orders, UPI screenshots, invoices, bank statements, and inventory sheets.
- **Business DNA** — Clone operational rules to launch a new branch quickly.
- **Autopilot** — Run high-level operational goals through a visible AI workflow.

## Tech stack

- [Next.js](https://nextjs.org/) 16 with the App Router
- React 19
- In-memory Next.js API routes for prototype data and interactions
- CSS-based responsive interface

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For a production build:

```bash
npm run build
npm run start
```

## Project structure

```text
app/
  page.jsx                  # Next.js client entry point
  layout.jsx                # Metadata and global styles
  api/[...route]/route.js   # Prototype API: chat, audit, twin, branches, uploads
src/
  components/               # Business OS interface modules
  mockData.js               # Demo business data and Business DNA defaults
  App.jsx                   # Application shell and view orchestration
```

## Prototype note

The current data layer is deliberately in-memory so that the experience can be demonstrated without setup. For production, replace it with authenticated, persistent services and integrate real bank, UPI, GST, WhatsApp, OCR, and accounting providers.

---

Built to make business intelligence accessible to every Bharat entrepreneur.
