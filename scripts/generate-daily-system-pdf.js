const PDFDocument = require('pdfkit');
const fs = require('fs');

const doc = new PDFDocument({ margin: 50 });
doc.pipe(fs.createWriteStream('C:\\Users\\trisd\\clawd\\valencia-daily-system.pdf'));

const navy = '#0F1A2E';
const gold = '#C5A55A';
const dark = '#333333';

// Header
doc.rect(0, 0, 612, 80).fill(navy);
doc.fontSize(24).fill('#FFFFFF').font('Helvetica-Bold').text('VALENCIA CONSTRUCTION', 50, 25);
doc.fontSize(12).fill(gold).text('Daily Lead Generation System', 50, 52);

doc.moveDown(2);
doc.y = 100;

// Morning
doc.fontSize(16).fill(navy).font('Helvetica-Bold').text('MORNING ROUTINE (9:00 AM - 30 min)', 50);
doc.moveDown(0.5);

doc.fontSize(11).fill(dark).font('Helvetica-Bold').text('1. Check Alerts (5 min)');
doc.font('Helvetica').fontSize(10);
doc.text('   [ ] Check Telegram for Craigslist lead alerts');
doc.text('   [ ] Check Gmail for form submissions');
doc.text('   [ ] Check Google Business Profile for messages');
doc.moveDown(0.5);

doc.font('Helvetica-Bold').fontSize(11).text('2. Facebook Groups (15 min)');
doc.font('Helvetica').fontSize(10);
doc.text('   Post or reply in 3 groups. Target groups:');
doc.text('   - Chicago Home Improvement & Remodeling');
doc.text('   - Chicago Handyman & Contractor Services');
doc.text('   - Chicago Friendly Landlord Group');
doc.text('   - Chicago Real Estate Investors');
doc.text('   - Chicago Homeowners Network');
doc.text('   - Nextdoor (your neighborhood + nearby)');
doc.moveDown(0.3);

doc.font('Helvetica-Bold').fontSize(10).fill(navy).text('   Reply Template:');
doc.font('Helvetica').fontSize(9).fill(dark);
doc.text('   "Hey! I run Valencia Construction - licensed & insured, based right here in Chicago.');
doc.text('   We do [their project]. Happy to come take a look and give you a free estimate.');
doc.text('   DM me or call/text (773) 682-7788"');
doc.moveDown(0.3);

doc.font('Helvetica-Bold').fontSize(10).fill(navy).text('   Proactive Post Template (2-3x/week):');
doc.font('Helvetica').fontSize(9).fill(dark);
doc.text('   "Licensed & insured Chicago contractor here! Kitchen remodels, bathroom renovations,');
doc.text('   flooring, painting, drywall, plumbing - you name it. Owner-operated, transparent pricing.');
doc.text('   Free estimates - call/text (773) 682-7788 or valenciaconstructionchi.com"');
doc.moveDown(0.5);

doc.font('Helvetica-Bold').fontSize(11).fill(dark).text('3. Make 5 Cold Calls (10 min)');
doc.font('Helvetica').fontSize(10);
doc.text('   Work through small-pm-targets.md. 5 calls/day = all 20 done in 4 days.');
doc.moveDown(0.3);

doc.font('Helvetica-Bold').fontSize(10).fill(navy).text('   Cold Call Script:');
doc.font('Helvetica').fontSize(9).fill(dark);
doc.text('   "Hi [Name], this is Tris from Valencia Construction. We\'re a licensed and insured');
doc.text('   contracting company here in Chicago. I\'m reaching out to local property managers');
doc.text('   because we specialize in the kind of work you need - unit turnovers, maintenance,');
doc.text('   renovations. We\'re reliable, pricing is upfront, and you deal directly with me,');
doc.text('   the owner. Could I swing by for a free estimate on any upcoming work?"');
doc.moveDown(0.3);

doc.font('Helvetica-Bold').fontSize(10).fill(navy).text('   Voicemail Script:');
doc.font('Helvetica').fontSize(9).fill(dark);
doc.text('   "Hi [Name], Tris from Valencia Construction, (773) 682-7788. Licensed and insured');
doc.text('   Chicago contractor - turnovers, remodels, maintenance. Would love to be your go-to.');
doc.text('   Give me a call back or text anytime. Thanks!"');
doc.moveDown(0.3);

doc.font('Helvetica-Bold').fontSize(10).fill(navy).text('   Follow-up Text (send right after call):');
doc.font('Helvetica').fontSize(9).fill(dark);
doc.text('   "Hi [Name]! Tris from Valencia Construction - just called about working together.');
doc.text('   Licensed & insured, free estimates. Site: valenciaconstructionchi.com. Let me know');
doc.text('   if you have anything coming up!"');

// Page 2
doc.addPage();

// Afternoon
doc.fontSize(16).fill(navy).font('Helvetica-Bold').text('AFTERNOON CHECK-IN (2:00 PM - 10 min)', 50);
doc.moveDown(0.5);
doc.font('Helvetica').fontSize(10).fill(dark);
doc.text('   [ ] Check for new Craigslist alerts');
doc.text('   [ ] Reply to any Facebook group posts from the morning');
doc.text('   [ ] Follow up with anyone who showed interest');
doc.text('   [ ] Refresh Craigslist ad if 48+ hours old');
doc.moveDown(1);

// Evening
doc.fontSize(16).fill(navy).font('Helvetica-Bold').text('EVENING WRAP (8:00 PM - 10 min)', 50);
doc.moveDown(0.5);
doc.font('Helvetica').fontSize(10).fill(dark);
doc.text('   [ ] Log today\'s activity (calls, replies, leads)');
doc.text('   [ ] Plan tomorrow\'s 5 calls');
doc.text('   [ ] Post in 1 Facebook group (evening audience)');
doc.moveDown(1);

// Weekly Goals
doc.fontSize(16).fill(navy).font('Helvetica-Bold').text('WEEKLY GOALS', 50);
doc.moveDown(0.5);
doc.font('Helvetica').fontSize(11).fill(dark);
doc.text('   25 cold calls made');
doc.text('   15 Facebook group posts/replies');
doc.text('   3 Craigslist ads live');
doc.text('   1 Nextdoor post');
doc.text('   Track: leads in -> consultations booked -> jobs closed');
doc.moveDown(1);

// Personal Network Blast
doc.rect(50, doc.y, 512, 120).fillAndStroke('#FFF8E7', gold);
doc.moveDown(0.3);
doc.fontSize(14).fill(navy).font('Helvetica-Bold').text('PERSONAL NETWORK BLAST (DO THIS ONCE)', 60);
doc.moveDown(0.3);
doc.font('Helvetica').fontSize(10).fill(dark);
doc.text('Text this to EVERYONE in your contacts:', 60, undefined, {width: 490});
doc.moveDown(0.3);
doc.font('Helvetica-Oblique').fontSize(9.5);
doc.text('"Hey! Quick favor - I just launched my contracting company, Valencia Construction. We do kitchen/bathroom remodels, flooring, painting, handyman work, the whole deal. Licensed & insured. If you or anyone you know needs work done, send them my way! Free estimates. (773) 682-7788 or valenciaconstructionchi.com"', 60, undefined, {width: 490});
doc.moveDown(1.5);

// Tracking
doc.fontSize(16).fill(navy).font('Helvetica-Bold').text('DAILY TRACKING', 50);
doc.moveDown(0.5);

const tableTop = doc.y;
const headers = ['Date', 'Calls', 'FB Posts', 'CL Ads', 'Leads', 'Consults', 'Notes'];
const colWidths = [70, 50, 60, 55, 50, 55, 172];
let x = 50;

// Header row
doc.rect(50, tableTop, 512, 20).fill(navy);
headers.forEach((h, i) => {
  doc.fontSize(9).fill('#FFFFFF').font('Helvetica-Bold').text(h, x + 3, tableTop + 5, {width: colWidths[i]});
  x += colWidths[i];
});

// Empty rows
for (let row = 0; row < 10; row++) {
  const y = tableTop + 20 + (row * 20);
  doc.rect(50, y, 512, 20).stroke('#CCCCCC');
  x = 50;
  colWidths.forEach(w => {
    doc.rect(x, y, w, 20).stroke('#CCCCCC');
    x += w;
  });
}

// Footer
doc.y = 720;
doc.fontSize(8).fill('#999').font('Helvetica').text('Valencia Construction | (773) 682-7788 | valenciaconstructionchi.com', 50, 720, {align: 'center'});

doc.end();
console.log('PDF created!');
