from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch

pdf_path = r'C:\Users\trisd\Desktop\PostForge_Launch_Strategy.pdf'
c = canvas.Canvas(pdf_path, pagesize=letter)

# Title
c.setFont("Helvetica-Bold", 24)
c.drawString(inch, 10*inch, "PostForge Launch Strategy")

# Subtitle
c.setFont("Helvetica", 11)
c.drawString(inch, 9.7*inch, "Complete Go-To-Market Plan | March 6-31, 2026")

# Content
y = 9.3*inch
line_height = 0.25*inch

c.setFont("Helvetica-Bold", 14)
c.drawString(inch, y, "Phase 1: ProductHunt Launch (Day 1)")
y -= line_height

c.setFont("Helvetica", 10)
sections = [
    "LAUNCH STRATEGY (12:01 AM Pacific):",
    "- Create ProductHunt listing with screenshots",
    "- Send DMs to 20 influencers",
    "- Post in r/entrepreneurs, r/startup, r/contractors",
    "- Respond to ALL comments within 15 minutes",
    "",
    "EXPECTED: 300-500 upvotes, 50-100 signups, $500-1,000 MRR",
    "",
    "Phase 2: Reddit Launch (Day 2 - Evergreen)",
    "- Post to 80+ subreddits",
    "- Target: r/Entrepreneurs, r/Contractors, r/StartUp, r/SmallBusiness",
    "- Reply to every top-level comment",
    "",
    "EXPECTED: 30K impressions, 150-300 signups, $1-2K MRR",
    "",
    "Phase 3: Twitter Launch (Days 3-7)",
    "- Day 3: Launch announcement",
    "- Day 4: Social proof thread (250+ signups, top 5 PH)",
    "- Days 5-7: Proof of concept posts",
    "- Days 8-14: Thought leadership content",
    "",
    "EXPECTED: 50-100K impressions, 500-1,000 signups, $5-10K MRR",
    "",
    "Phase 4: Warm Outreach (Days 1-7, Parallel)",
    "- 100 contractors + 50 service businesses + 25 agencies + 75 founders",
    "- Offer: Free trial + 50% off first 3 months",
    "",
    "EXPECTED: 2-4 conversions = $200-400/mo",
    "",
    "30-DAY REVENUE FORECAST",
    "- Total signups: 1,050+",
    "- Free-to-paid conversion: ~4.8%",
    "- Month 1 MRR: $3,850",
    "",
    "SUCCESS METRICS (March 31 Target)",
    "- 1,000+ signups",
    "- $3,500-4,000 MRR",
    "- 5+ customer testimonials",
    "- 50+ YouTube/Twitter mentions",
    "- 1-2 case studies published",
    "",
    "READY TO DEPLOY",
    "All materials built. Launch immediately when ready.",
]

for section in sections:
    if y < inch:  # Page break if needed
        c.showPage()
        c.setFont("Helvetica", 10)
        y = 10*inch
    
    if section.startswith("Phase"):
        c.setFont("Helvetica-Bold", 12)
        y -= 0.3*inch
    elif section.startswith("EXPECTED") or section.startswith("SUCCESS") or section.startswith("30-DAY") or section.startswith("READY"):
        c.setFont("Helvetica-Bold", 10)
    else:
        c.setFont("Helvetica", 10)
    
    c.drawString(inch, y, section)
    y -= line_height

# Save
c.save()
print("PDF created: C:\\Users\\trisd\\Desktop\\PostForge_Launch_Strategy.pdf")
