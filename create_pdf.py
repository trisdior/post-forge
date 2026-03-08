from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.enums import TA_CENTER, TA_LEFT
import os

# Read markdown file
md_path = r'C:\Users\trisd\clawd\cve\postforge\LAUNCH_STRATEGY_COMPLETE.md'
with open(md_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Create PDF
pdf_path = r'C:\Users\trisd\Desktop\PostForge_Launch_Strategy.pdf'
doc = SimpleDocTemplate(pdf_path, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)
styles = getSampleStyleSheet()

# Create custom styles
title_style = ParagraphStyle(
    'CustomTitle',
    parent=styles['Heading1'],
    fontSize=20,
    textColor='#000080',
    spaceAfter=12,
    alignment=TA_CENTER
)

heading_style = ParagraphStyle(
    'CustomHeading',
    parent=styles['Heading2'],
    fontSize=12,
    textColor='#003366',
    spaceAfter=8,
    spaceBefore=8,
    fontName='Helvetica-Bold'
)

body_style = ParagraphStyle(
    'CustomBody',
    parent=styles['Normal'],
    fontSize=9,
    spaceAfter=4
)

# Parse and build document
story = []

# Add title
story.append(Paragraph("PostForge Launch Strategy", title_style))
story.append(Paragraph("March 6-31, 2026", heading_style))
story.append(Spacer(1, 0.2*inch))

# Extract key sections
lines = content.split('\n')
for i, line in enumerate(lines):
    line = line.rstrip()
    
    if line.startswith('# '):
        title = line.replace('# ', '').strip()
        story.append(Paragraph(title, title_style))
        story.append(Spacer(1, 0.1*inch))
    elif line.startswith('## '):
        heading = line.replace('## ', '').strip()
        story.append(Paragraph(heading, heading_style))
    elif line.startswith('### '):
        subheading = line.replace('### ', '').strip()
        story.append(Paragraph(f"<b>{subheading}</b>", body_style))
    elif line.startswith('- '):
        bullet = line[2:].strip()
        story.append(Paragraph(f"• {bullet}", body_style))
    elif line.startswith('* '):
        bullet = line[2:].strip()
        story.append(Paragraph(f"• {bullet}", body_style))
    elif line.startswith('| '):
        # Skip table lines
        continue
    elif line.strip() and not line.startswith('```'):
        if line.strip() != '---':
            story.append(Paragraph(line.strip(), body_style))
    elif line.strip() == '':
        story.append(Spacer(1, 0.05*inch))

# Build PDF
doc.build(story)
print(f"✅ PDF created successfully!")
print(f"📄 Location: {pdf_path}")
