/**
 * Craigslist Autonomous Outreach Bot
 * Logs in, finds posts, sends personalized replies
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.craigslist' });

const EMAIL = process.env.CRAIGSLIST_EMAIL;
const PASSWORD = process.env.CRAIGSLIST_PASSWORD;

// Lead data with Craigslist URLs
const LEADS_TO_SEND = {
  1: {
    name: 'Handyman - Lakeview',
    url: 'https://chicago.craigslist.org/chc/lbg/d/chicago-need-handyman-for-simple-home/7917470906.html',
    message: `Hi! I'm Chris with Valencia Construction — licensed and insured. We handle handyman jobs the same day! From small repairs to bigger projects, we've got you covered. Can you send a few photos of what needs done? Call me (773) 682-7788 — let's get this taken care of ASAP!`
  },
  2: {
    name: 'Drywall/Paint - Barrington',
    url: 'https://chicago.craigslist.org/nwc/lbg/d/barrington-interior-work-drywall-paint/7917464229.html',
    message: `Hi! I'm Chris with Valencia Construction — licensed and insured. We handle full painting + flooring installs all the time. This is a great project and we've done tons like it. Send over some photos of the spaces that need paint and flooring? I'll put together a solid estimate. Call (773) 682-7788!`
  }
};

async function loginToCraigslist(page) {
  console.log('[Bot] Navigating to Craigslist...');
  await page.goto('https://accounts.craigslist.org/login', { waitUntil: 'networkidle2' });
  
  // Wait for login form
  await page.waitForSelector('input[type="email"]', { timeout: 5000 });
  
  // Fill in email
  await page.type('input[type="email"]', EMAIL);
  await page.type('input[type="password"]', PASSWORD);
  
  // Click login
  await page.click('button[type="submit"]');
  
  // Wait for redirect (successful login)
  await page.waitForNavigation({ waitUntil: 'networkidle2' });
  console.log('[Bot] ✅ Logged in successfully');
}

async function sendReply(page, leadId, url, message) {
  try {
    console.log(`\n[Bot] Processing Lead #${leadId}: ${LEADS_TO_SEND[leadId].name}`);
    
    // Navigate to post
    await page.goto(url, { waitUntil: 'networkidle2' });
    
    // Find and click "Reply" button
    const replyButton = await page.$('button:has-text("Reply")') || 
                        await page.$('a[href*="reply"]') ||
                        await page.$('button[class*="reply"]');
    
    if (!replyButton) {
      console.log(`  ⚠️  Could not find Reply button. Post may be closed.`);
      return { success: false, reason: 'No reply button found' };
    }
    
    await replyButton.click();
    
    // Wait for reply form
    await page.waitForSelector('textarea', { timeout: 5000 });
    
    // Type message
    await page.type('textarea', message);
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Wait for confirmation
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    
    console.log(`  ✅ Reply sent!`);
    return { success: true, leadId, name: LEADS_TO_SEND[leadId].name };
    
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`);
    return { success: false, leadId, error: error.message };
  }
}

async function logResults(results) {
  const logFile = 'C:\\Users\\trisd\\clawd\\data\\outreach-log.json';
  const timestamp = new Date().toISOString();
  
  const log = {
    timestamp,
    results,
    successful: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length
  };
  
  fs.writeFileSync(logFile, JSON.stringify(log, null, 2));
  console.log(`\n📊 Results logged to outreach-log.json`);
}

async function run(leadsToSend) {
  const browser = await puppeteer.launch({ headless: false }); // headless: false so you can see it
  const page = await browser.newPage();
  
  try {
    // Login
    await loginToCraigslist(page);
    
    // Send replies
    const results = [];
    for (const leadId of leadsToSend) {
      if (LEADS_TO_SEND[leadId]) {
        const result = await sendReply(
          page, 
          leadId, 
          LEADS_TO_SEND[leadId].url, 
          LEADS_TO_SEND[leadId].message
        );
        results.push(result);
        
        // Wait between sends (don't spam Craigslist)
        await page.waitForTimeout(2000);
      }
    }
    
    // Log results
    await logResults(results);
    
    console.log(`\n✅ Bot complete! Sent ${results.filter(r => r.success).length} replies`);
    
  } catch (error) {
    console.error('Bot error:', error);
  } finally {
    await browser.close();
  }
}

// Usage: node craigslist-outreach-bot.js 1 2 3 4
const leadsToSend = process.argv.slice(2).map(Number);
if (leadsToSend.length === 0) {
  console.log('Usage: node craigslist-outreach-bot.js 1 2 3 4');
  process.exit(1);
}

run(leadsToSend);
