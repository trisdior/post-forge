import os
import subprocess

html_file = r'C:\Users\trisd\Desktop\PostForge_Launch_Strategy.html'
pdf_file = r'C:\Users\trisd\Desktop\PostForge_Launch_Strategy.pdf'

# Try using Windows native print to PDF via HTML
try:
    # Use Python's built-in HTML to PDF via weasyprint or similar
    from weasyprint import HTML
    HTML(html_file).write_pdf(pdf_file)
    print(f"✅ PDF created: {pdf_file}")
except ImportError:
    try:
        # Fallback: use wkhtmltopdf if installed
        result = subprocess.run(
            ['wkhtmltopdf', html_file, pdf_file],
            capture_output=True,
            text=True,
            timeout=30
        )
        if result.returncode == 0:
            print(f"✅ PDF created: {pdf_file}")
        else:
            print(f"Error: {result.stderr}")
    except FileNotFoundError:
        print("⚠️ wkhtmltopdf not found. Using reportlab instead...")
        # Simple reportlab fallback
        from reportlab.lib.pagesizes import letter
        from reportlab.pdfgen import canvas
        
        c = canvas.Canvas(pdf_file, pagesize=letter)
        c.setFont("Helvetica-Bold", 20)
        c.drawString(50, 750, "PostForge Launch Strategy")
        c.setFont("Helvetica", 10)
        c.drawString(50, 730, "March 6-31, 2026 | Complete Go-To-Market Plan")
        c.drawString(50, 700, "See PostForge_Launch_Strategy.html for full details")
        c.save()
        print(f"✅ Simple PDF created: {pdf_file}")
