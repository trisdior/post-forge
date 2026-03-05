---
name: gc-pdf
description: Read, create, edit, merge, and manipulate PDF files for Valencia Construction. Use for reading contracts and plans, creating PDF proposals, merging documents, filling PDF forms, extracting text from scanned documents, and any PDF-related task. Triggers on mentions of '.pdf', 'PDF', 'plans', 'blueprints', 'contract PDF', or 'scan'.
---

# PDF Processing for Valencia Construction

## Overview

Handle all PDF tasks — reading contracts, creating proposals, merging documents, filling forms, and extracting data from plans and scanned docs.

## Dependencies

```bash
pip install pypdf pdfplumber reportlab pytesseract pdf2image --break-system-packages
```

## Reading PDFs

### Extract Text
```python
from pypdf import PdfReader

reader = PdfReader("document.pdf")
text = ""
for page in reader.pages:
    text += page.extract_text()
print(text)
```

### Extract Tables (great for material lists, invoices)
```python
import pdfplumber

with pdfplumber.open("document.pdf") as pdf:
    for page in pdf.pages:
        tables = page.extract_tables()
        for table in tables:
            for row in table:
                print(row)
```

### Read Scanned Documents (OCR)
```python
import pytesseract
from pdf2image import convert_from_path

images = convert_from_path('scanned.pdf')
text = ""
for i, image in enumerate(images):
    text += f"Page {i+1}:\n"
    text += pytesseract.image_to_string(image)
    text += "\n\n"
```

Use OCR for:
- Scanned contracts from clients
- Photos of plans or permits
- Handwritten notes that have been scanned

## Creating PDFs

### Professional Proposal PDF
```python
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor

# Valencia Construction colors
NAVY = HexColor("#2E4057")
ORANGE = HexColor("#E85D04")
DARK_TEXT = HexColor("#333333")

doc = SimpleDocTemplate("proposal.pdf", pagesize=letter,
    topMargin=1*inch, bottomMargin=1*inch,
    leftMargin=1*inch, rightMargin=1*inch)

styles = getSampleStyleSheet()

# Custom styles
styles.add(ParagraphStyle('CompanyName',
    fontSize=18, textColor=NAVY, fontName='Helvetica-Bold',
    spaceAfter=6))
styles.add(ParagraphStyle('SectionHead',
    fontSize=14, textColor=NAVY, fontName='Helvetica-Bold',
    spaceBefore=18, spaceAfter=8))
styles.add(ParagraphStyle('BodyText',
    fontSize=11, textColor=DARK_TEXT, fontName='Helvetica',
    spaceAfter=6, leading=14))

story = []
story.append(Paragraph("VALENCIA CONSTRUCTION", styles['CompanyName']))
story.append(Paragraph("Chicago, IL", styles['BodyText']))
story.append(Spacer(1, 24))

# Add sections as needed...
doc.build(story)
```

### Important Notes for PDF Creation

- **Never use Unicode subscript/superscript characters** — they render as black boxes. Use `<sub>` and `<super>` tags in Paragraph objects instead.
- Use `Helvetica` (built-in) to avoid font issues
- Always use `letter` page size for US documents

## Merging PDFs

Useful for combining proposals, contracts, and supporting docs into one package:

```python
from pypdf import PdfWriter, PdfReader

writer = PdfWriter()
for pdf_file in ["proposal.pdf", "contract.pdf", "insurance.pdf"]:
    reader = PdfReader(pdf_file)
    for page in reader.pages:
        writer.add_page(page)

with open("complete_package.pdf", "wb") as output:
    writer.write(output)
```

## Splitting PDFs

Pull specific pages from plans or long documents:

```python
reader = PdfReader("full_plans.pdf")
writer = PdfWriter()

# Extract just pages 3-5 (floor plans)
for i in range(2, 5):  # 0-indexed
    writer.add_page(reader.pages[i])

with open("floor_plans_only.pdf", "wb") as output:
    writer.write(output)
```

## Adding Watermarks

Add "DRAFT" or "CONFIDENTIAL" to documents:

```python
from pypdf import PdfReader, PdfWriter

watermark = PdfReader("watermark.pdf").pages[0]
reader = PdfReader("document.pdf")
writer = PdfWriter()

for page in reader.pages:
    page.merge_page(watermark)
    writer.add_page(page)

with open("watermarked.pdf", "wb") as output:
    writer.write(output)
```

## Password Protection

Protect sensitive documents:

```python
from pypdf import PdfReader, PdfWriter

reader = PdfReader("contract.pdf")
writer = PdfWriter()
for page in reader.pages:
    writer.add_page(page)

writer.encrypt("clientpassword", "ownerpassword")

with open("protected_contract.pdf", "wb") as output:
    writer.write(output)
```

## Common GC Tasks

| Task | Approach |
|------|----------|
| Read a contract PDF | `pdfplumber` for text, `extract_tables()` for pricing tables |
| Read scanned plans | OCR with `pytesseract` + `pdf2image` |
| Create a proposal | `reportlab` with Valencia branding |
| Merge docs for client | `pypdf` PdfWriter |
| Extract specific pages | `pypdf` page selection |
| Protect a document | `pypdf` encrypt |
| Fill a PDF form | `pypdf` or check for form fields first |

## Quick Reference

```bash
# Command line text extraction
pdftotext input.pdf output.txt
pdftotext -layout input.pdf output.txt  # preserve layout

# Merge from command line
qpdf --empty --pages file1.pdf file2.pdf -- merged.pdf

# Extract images from plans
pdfimages -j input.pdf output_prefix
```
