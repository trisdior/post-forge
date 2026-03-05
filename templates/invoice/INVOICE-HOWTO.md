# Valencia Invoice Template — How to Use

## Quick Start
1. Open `valencia-invoice.html` in Chrome or Edge
2. Click any field with dotted outline and type to edit
3. When done: **File → Print → Save as PDF** (or press the Print button)
4. Invoice number, dates, client info, line items — everything is editable right in the browser

## What's Pre-Built
- Full Valencia branding (navy blue, professional layout)
- Line items organized by trade section (demo, cabinets, countertops, flooring, electrical/plumbing, finishing)
- Sample kitchen remodel — $11,900 total as a realistic starting point
- Payment schedule tracker (deposit / balance due)
- All payment methods listed (Zelle, Cash App, check, cash, card)
- Signature blocks (you + client)
- Terms & conditions (standard contractor protection)
- Status badge (draft → sent → paid → overdue)
- Responsive (works on mobile for on-the-spot invoicing)

## Customizing for Each Job
Edit these fields (click to type in browser):
- Invoice # (VC-2026-001, VC-2026-002, etc.)
- Issue date, due date, payment terms
- Client name, billing address, job site address  
- Project type, contract #, start/completion dates
- Each line item: description, quantity, unit, unit price, amount
- Totals: subtotal, discount, tax, deposit received, balance due
- Notes section (special instructions per job)
- Status badge class (draft/sent/paid/overdue/partial)

## Adding/Removing Line Items
- **Add:** Copy any `<tr>` block from an existing line item, paste before `</tbody>`, edit text
- **Remove:** Delete the whole `<tr>...</tr>` block for that row
- **Add section header:** Copy a `<tr class="section-header">` row

## Saving as PDF
1. Chrome: Ctrl+P → Destination: "Save as PDF" → More settings → Margins: None → Save
2. Edge: Same workflow
3. Name format: `Invoice-VC-2026-001-ClientName.pdf`

## Invoice Numbering System
Format: **VC-YYYY-###**
- VC = Valencia Construction
- YYYY = year
- ### = sequential number (001, 002, 003...)

## Tax Note
- Contractor labor is generally not taxable in Illinois
- Materials can be taxable — consult your accountant
- The tax line is there; set it to $0.00 if not charging tax on labor-only invoices

## Pro Tips
- Always collect 50% deposit BEFORE starting (protects you from non-payment)
- Send the invoice PDF via text/email the same day the estimate is approved
- "Net 15" means due 15 days from invoice date — standard for residential contractors
- Keep a PDF copy of every invoice in a Google Drive folder named "Invoices-2026"
