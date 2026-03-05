from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
from reportlab.lib import colors

# Read the markdown file
with open('construction_leads_report.md', 'r', encoding='utf-8') as f:
    content = f.read()

# Create PDF
pdf_filename = "construction_leads_report.pdf"
doc = SimpleDocTemplate(pdf_filename, pagesize=letter)
elements = []

# Add simple title
title_style = ParagraphStyle(
    'CustomTitle',
    fontName='Helvetica-Bold',
    fontSize=16,
    textColor=colors.HexColor('#FF6600')
)

title = Paragraph("Valencia Construction — Chicago Leads Report", title_style)
elements.append(title)
elements.append(Spacer(1, 0.3*inch))

# Add content as simple text
body_style = getSampleStyleSheet()['Normal']
for line in content.split('\n'):
    if line.strip():
        elements.append(Paragraph(line, body_style))
        elements.append(Spacer(1, 0.05*inch))

# Build PDF
doc.build(elements)
print(f"PDF created: {pdf_filename}")
