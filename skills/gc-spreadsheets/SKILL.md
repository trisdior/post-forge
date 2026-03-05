---
name: gc-spreadsheets
description: Create, read, and edit Excel spreadsheets (.xlsx) for Valencia Construction. Use for estimates, budgets, project trackers, material takeoffs, payment schedules, job costing, and any spreadsheet task. Triggers on mentions of 'spreadsheet', 'Excel', '.xlsx', '.csv', 'budget', 'tracker', 'takeoff', 'job costing', or 'schedule of values'.
---

# Spreadsheets for Valencia Construction

## Overview

Create and manage Excel spreadsheets for estimates, budgets, trackers, and financial documents. Always use Excel formulas — never hardcode calculated values.

## Dependencies

```bash
pip install openpyxl pandas --break-system-packages
```

## Critical Rules

### Always Use Formulas
```python
# ❌ WRONG — hardcoded calculation
total = sum(costs)
sheet['B10'] = total

# ✅ CORRECT — Excel formula
sheet['B10'] = '=SUM(B2:B9)'
```

This applies to ALL calculations. The spreadsheet must recalculate when data changes.

### Professional Formatting
- Font: Arial, 11pt for body, 14pt bold for headers
- Use consistent number formatting throughout
- Currency: `$#,##0.00`
- Percentages: `0.0%`
- Column widths should fit content
- Freeze header rows for scrollability

## Creating Spreadsheets

```python
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side, numbers
from openpyxl.utils import get_column_letter

wb = Workbook()
sheet = wb.active

# Valencia Construction styling
HEADER_FILL = PatternFill('solid', fgColor='2E4057')    # Navy
HEADER_FONT = Font(name='Arial', size=12, bold=True, color='FFFFFF')
ACCENT_FILL = PatternFill('solid', fgColor='E85D04')    # Orange
BODY_FONT = Font(name='Arial', size=11, color='333333')
CURRENCY_FMT = '$#,##0.00'
PCT_FMT = '0.0%'
THIN_BORDER = Border(
    left=Side(style='thin', color='CCCCCC'),
    right=Side(style='thin', color='CCCCCC'),
    top=Side(style='thin', color='CCCCCC'),
    bottom=Side(style='thin', color='CCCCCC')
)

# Apply header styling
def style_header(sheet, row, cols):
    for col in range(1, cols + 1):
        cell = sheet.cell(row=row, column=col)
        cell.fill = HEADER_FILL
        cell.font = HEADER_FONT
        cell.alignment = Alignment(horizontal='center', vertical='center')
        cell.border = THIN_BORDER

wb.save('output.xlsx')
```

## GC Spreadsheet Templates

### Project Estimate / Bid

Columns: Category | Description | Quantity | Unit | Unit Cost | Total | Notes

Categories to include:
- Demo & Haul-off
- Framing / Structural
- Electrical
- Plumbing
- HVAC
- Drywall & Finishing
- Flooring
- Cabinetry & Countertops
- Paint
- Fixtures & Hardware
- Permits & Inspections
- Cleanup
- Contingency (typically 10-15%)

Bottom section:
- Subtotal (=SUM of all category totals)
- Overhead & Profit markup (formula referencing markup %)
- Grand Total

### Job Cost Tracker

Sheets:
1. **Summary** — Project name, budget vs actual, % complete
2. **Budget** — Original estimate by category
3. **Actuals** — Expenses logged with date, vendor, category, amount
4. **Variance** — Budget minus actuals per category (all formulas)

Key formulas:
```python
# Variance = Budget - Actual
sheet['D2'] = '=Budget!E2-Actuals!E2'

# % Over/Under
sheet['E2'] = '=IF(Budget!E2=0,0,D2/Budget!E2)'

# Total spent
sheet['B15'] = '=SUM(Actuals!E:E)'
```

### Material Takeoff

Columns: Item | Spec/Size | Quantity | Unit | Unit Price | Total | Supplier | Lead Time

Group by trade (electrical, plumbing, framing, etc.)
Include formulas for totals per trade and grand total.

### Payment Schedule / Schedule of Values

Columns: Line Item | Scheduled Value | Previous Billing | Current Billing | Stored Materials | Total Completed | Balance to Finish | % Complete

Standard AIA-style format:
```python
# Total Completed = Previous + Current + Stored
sheet['F2'] = '=D2+E2+F2'

# Balance to Finish = Scheduled Value - Total Completed
sheet['G2'] = '=C2-F2'

# % Complete = Total Completed / Scheduled Value
sheet['H2'] = '=IF(C2=0,0,F2/C2)'
```

### Subcontractor Comparison

Columns: Trade | Sub Name | Bid Amount | Scope Notes | Insurance? | Licensed? | Availability | Rating

Use conditional formatting to highlight the lowest bid per trade.

## Reading Existing Spreadsheets

```python
import pandas as pd

# Read all sheets
all_sheets = pd.read_excel('file.xlsx', sheet_name=None)

# Analyze
for name, df in all_sheets.items():
    print(f"\n--- {name} ---")
    print(df.head())
    print(f"Rows: {len(df)}, Columns: {len(df.columns)}")
```

## Editing Existing Files

```python
from openpyxl import load_workbook

wb = load_workbook('existing.xlsx')
sheet = wb.active

# Modify
sheet['A1'] = 'Updated Value'
sheet.insert_rows(2)

wb.save('modified.xlsx')
```

**Warning**: Opening with `data_only=True` and saving will permanently replace formulas with their last calculated values. Only use `data_only=True` for reading.

## Best Practices

- Always use formulas, never hardcode calculations
- Include a assumptions/inputs section with blue text for values users should change
- Add cell comments explaining complex formulas
- Source-tag any hardcoded numbers ("Source: Home Depot pricing 2/2026")
- Test formulas with edge cases (zero quantities, etc.)
- Format currency consistently as $#,##0.00
- Freeze top row(s) for headers
- Auto-fit column widths to content
