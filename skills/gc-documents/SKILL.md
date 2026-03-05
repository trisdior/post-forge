---
name: gc-documents
description: Create, read, and edit Word documents (.docx) for Valencia Construction. Use for proposals, contracts, change orders, punch lists, lien waivers, letters, memos, progress reports, and any professional document. Triggers on mentions of 'document', 'Word doc', '.docx', 'proposal', 'contract', 'letter', 'change order', 'punch list', or 'lien waiver'.
---

# Word Document Creation for Valencia Construction

## Overview

Create professional .docx documents using the `docx` npm package (JavaScript). All documents should look polished and represent Valencia Construction professionally.

## Setup

```bash
npm install -g docx
```

## Quick Start

```javascript
const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        Header, Footer, AlignmentType, HeadingLevel, BorderStyle,
        WidthType, ShadingType, PageBreak, LevelFormat,
        PositionalTab, PositionalTabAlignment, PositionalTabRelativeTo,
        PositionalTabLeader, PageNumber } = require('docx');

const doc = new Document({
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },  // US Letter
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }  // 1" margins
      }
    },
    children: [/* content */]
  }]
});

Packer.toBuffer(doc).then(buffer => fs.writeFileSync("document.docx", buffer));
```

## Valencia Construction Branding

Use these defaults for all documents:

```javascript
const BRAND = {
  font: "Arial",
  primaryColor: "2E4057",    // Dark navy - headers, company name
  accentColor: "E85D04",     // Orange accent - highlights, lines
  textColor: "333333",       // Body text
  lightGray: "F5F5F5",       // Table alternating rows
  medGray: "CCCCCC",         // Borders
};
```

### Standard Header (use on all documents)

```javascript
new Header({
  children: [
    new Paragraph({
      children: [
        new TextRun({ text: "VALENCIA CONSTRUCTION", font: "Arial", size: 28, bold: true, color: BRAND.primaryColor }),
        new TextRun({ text: "  |  Chicago, IL", font: "Arial", size: 20, color: BRAND.textColor }),
      ],
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: BRAND.accentColor, space: 1 } },
      spacing: { after: 200 }
    })
  ]
})
```

### Standard Footer

```javascript
new Footer({
  children: [
    new Paragraph({
      children: [
        new TextRun({ text: "Valencia Construction  •  Chicago, IL  •  ", font: "Arial", size: 16, color: "999999" }),
        new TextRun({ text: "Page ", font: "Arial", size: 16, color: "999999" }),
        new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 16, color: "999999" }),
      ],
      alignment: AlignmentType.CENTER,
      border: { top: { style: BorderStyle.SINGLE, size: 2, color: BRAND.medGray, space: 1 } }
    })
  ]
})
```

## Document Templates

### Proposal / Estimate

Include these sections:
1. Company header with date
2. Client name and project address
3. Scope of Work (detailed description of what's included)
4. Materials and Labor breakdown (table)
5. Project Timeline (estimated start/end, key milestones)
6. Payment Schedule (deposits, progress payments, final)
7. Terms and Conditions
8. Signature lines for both parties

### Change Order

Include:
1. Reference to original contract (date, project)
2. Description of change
3. Cost impact (additions and deductions)
4. Time impact (schedule extension if any)
5. Revised total contract amount
6. Signature lines

### Punch List

Include:
1. Project info (address, date, phase)
2. Table with columns: Item #, Location, Description, Status, Notes
3. Completion deadline
4. Signature lines

### Lien Waiver (Illinois)

Include:
1. Waiver type (conditional/unconditional, progress/final)
2. Property address
3. Claimant info (Valencia Construction)
4. Through date and amount
5. Signature line and notary block
6. Note: Always flag for Tris to review before sending — lien waivers are legal documents

### Progress Report / Update

Include:
1. Project info
2. Work completed this period
3. Work planned for next period
4. Issues or concerns
5. Budget status (% complete vs % spent)
6. Photos section (placeholder)

## Critical Rules

- **Always US Letter size** (12240 x 15840 DXA)
- **Never use `\n`** — use separate Paragraph elements
- **Never use unicode bullets** — use LevelFormat.BULLET with numbering config
- **Tables need dual widths** — set both `columnWidths` on table AND `width` on each cell
- **Use ShadingType.CLEAR** — never SOLID for table shading
- **Always add cell margins** — `{ top: 80, bottom: 80, left: 120, right: 120 }`
- **Table widths in DXA** — never use WidthType.PERCENTAGE

## Lists

```javascript
// Correct bullet list setup
numbering: {
  config: [{
    reference: "bullets",
    levels: [{
      level: 0, format: LevelFormat.BULLET, text: "•",
      alignment: AlignmentType.LEFT,
      style: { paragraph: { indent: { left: 720, hanging: 360 } } }
    }]
  }]
}

// Usage
new Paragraph({
  numbering: { reference: "bullets", level: 0 },
  children: [new TextRun("Bullet item")]
})
```

## Tables

```javascript
const border = { style: BorderStyle.SINGLE, size: 1, color: BRAND.medGray };
const borders = { top: border, bottom: border, left: border, right: border };

new Table({
  width: { size: 9360, type: WidthType.DXA },
  columnWidths: [4680, 4680],  // Must sum to table width
  rows: [
    new TableRow({
      children: [
        new TableCell({
          borders,
          width: { size: 4680, type: WidthType.DXA },
          shading: { fill: "D5E8F0", type: ShadingType.CLEAR },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [new Paragraph({ children: [new TextRun("Cell")] })]
        })
      ]
    })
  ]
})
```
