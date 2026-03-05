#!/usr/bin/env node
// Facebook Engagement Script for Valencia Construction (Closer Agent)
// Uses Playwright + Brave to post comments and send DMs on Facebook.
// Shares the same browser profile as facebook-scan.js.
//
// Usage:
//   node facebook-engage.js --post     — Post approved comment replies
//   node facebook-engage.js --dm       — Send approved DMs
//   node facebook-engage.js --login    — Re-login (same as scanner)

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// --- Paths ---
const DATA_DIR = path.join(__dirname, '..', 'data');
const QUEUE_FILE = path.join(DATA_DIR, 'facebook-reply-queue.json');
const LOG_FILE = path.join(DATA_DIR, 'facebook-engagement-log.json');
const PROFILE_DIR = path.join(DATA_DIR, 'facebook-browser-profile');
const BRAVE_PATH = 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe';

const MODE_POST = process.argv.includes('--post');
const MODE_DM = process.argv.includes('--dm');
const MODE_LOGIN = process.argv.includes('--login');

// --- Safety limits ---
const MAX_COMMENTS = 10;
const MAX_DMS = 5;
const TYPING_DELAY_MIN = 50;
const TYPING_DELAY_MAX = 100;
const COMMENT_DELAY_MIN = 30000;
const COMMENT_DELAY_MAX = 60000;
const DM_DELAY_MIN = 60000;
const DM_DELAY_MAX = 90000;

// --- Helpers ---

function loadJson(filepath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
  } catch {
    return fallback;
  }
}

function saveJson(filepath, data) {
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function randomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatTimestamp(d) {
  return d.toISOString().replace('T', ' ').replace(/\.\d+Z$/, '');
}

/** Type text with human-like delays */
async function humanType(page, selector, text) {
  const el = await page.$(selector);
  if (!el) throw new Error(`Element not found: ${selector}`);
  await el.click();
  await sleep(500);

  for (const char of text) {
    await page.keyboard.type(char, { delay: randomDelay(TYPING_DELAY_MIN, TYPING_DELAY_MAX) });
  }
}

/** Type text into a focused contenteditable div */
async function humanTypeIntoFocused(page, text) {
  for (const char of text) {
    await page.keyboard.type(char, { delay: randomDelay(TYPING_DELAY_MIN, TYPING_DELAY_MAX) });
  }
}

// --- Login Mode ---
async function loginMode() {
  console.log('Login mode — opening Brave for Facebook login...');
  console.log('This is the same session used by facebook-scan.js.');

  if (!fs.existsSync(PROFILE_DIR)) {
    fs.mkdirSync(PROFILE_DIR, { recursive: true });
  }

  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    executablePath: BRAVE_PATH,
    headless: false,
    args: ['--disable-blink-features=AutomationControlled'],
    viewport: { width: 1280, height: 900 },
    ignoreDefaultArgs: ['--enable-automation'],
  });

  const page = context.pages()[0] || await context.newPage();
  await page.goto('https://www.facebook.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });

  console.log('Please log in manually. Waiting up to 10 minutes...');
  const loginStart = Date.now();
  let loggedIn = false;

  while (Date.now() - loginStart < 600000) {
    await sleep(3000);
    try {
      const activePage = context.pages()[0];
      if (!activePage) break;
      const url = activePage.url();
      if (url.includes('facebook.com') && !url.includes('/login') && !url.includes('checkpoint')) {
        const hasLoginForm = await activePage.$('input[name="email"]').catch(() => null);
        if (!hasLoginForm) {
          loggedIn = true;
          break;
        }
      }
    } catch {}
  }

  if (loggedIn) {
    console.log('Login detected! Session saved.');
    await sleep(3000);
  } else {
    console.log('Login timeout. Session may still be saved if you logged in.');
  }

  try { await context.close(); } catch {}
  console.log('Done. Run with --post or --dm to engage.');
  process.exit(0);
}

// --- Post Comments ---
async function postComments() {
  const queue = loadJson(QUEUE_FILE, { items: [] });
  const log = loadJson(LOG_FILE, { engagements: [] });

  const approved = queue.items.filter(item => item.status === 'approved');
  if (approved.length === 0) {
    console.log('No approved comments to post.');
    return;
  }

  console.log(`Posting ${Math.min(approved.length, MAX_COMMENTS)} comments (max ${MAX_COMMENTS})...`);

  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    executablePath: BRAVE_PATH,
    headless: false,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--start-minimized',
    ],
    viewport: { width: 1280, height: 900 },
    ignoreDefaultArgs: ['--enable-automation'],
  });

  const page = context.pages()[0] || await context.newPage();
  let posted = 0;
  let sessionExpired = false;

  for (const item of approved.slice(0, MAX_COMMENTS)) {
    if (!item.postUrl) {
      console.log(`  Skipping ${item.id}: no post URL`);
      item.status = 'failed';
      item.error = 'No post URL';
      continue;
    }

    console.log(`  [${posted + 1}] Posting to: ${item.groupName} — ${item.id}`);

    try {
      await page.goto(item.postUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await sleep(3000);

      // Session expiry check
      const currentUrl = page.url();
      const hasLoginForm = await page.$('input[name="email"]');
      if (currentUrl.includes('/login') || currentUrl.includes('checkpoint') || hasLoginForm) {
        console.error('ERROR: Facebook session expired.');
        sessionExpired = true;
        break;
      }

      // Find the comment box
      // Facebook uses contenteditable divs for comments
      // Look for the comment input area
      let commentBox = null;

      // Strategy 1: Look for div with role="textbox" and aria-label containing "comment" or "Write"
      const textboxes = await page.$$('div[role="textbox"]');
      for (const tb of textboxes) {
        const label = await tb.getAttribute('aria-label').catch(() => '');
        if (label && (label.toLowerCase().includes('comment') || label.toLowerCase().includes('write'))) {
          commentBox = tb;
          break;
        }
      }

      // Strategy 2: Look for contenteditable in the comment form area
      if (!commentBox) {
        commentBox = await page.$('form div[contenteditable="true"]');
      }

      // Strategy 3: Look for any comment-area textbox
      if (!commentBox) {
        commentBox = await page.$('div[data-testid="UFI2CommentTopComponent/TextInput"] div[contenteditable="true"]');
      }

      // Strategy 4: Click "Write a comment..." placeholder to reveal the input
      if (!commentBox) {
        const placeholder = await page.$('div[aria-label*="comment" i], span:has-text("Write a comment"), div[aria-placeholder*="Write" i]');
        if (placeholder) {
          await placeholder.click();
          await sleep(1500);
          commentBox = await page.$('div[role="textbox"][contenteditable="true"]');
        }
      }

      if (!commentBox) {
        console.log(`  Could not find comment box for ${item.id}`);
        item.status = 'failed';
        item.error = 'Comment box not found';
        continue;
      }

      // Click and type the reply
      await commentBox.click();
      await sleep(500);
      await humanTypeIntoFocused(page, item.reply);
      await sleep(1000);

      // Submit the comment (Enter key)
      await page.keyboard.press('Enter');
      await sleep(2000);

      // Verify comment was posted (check for our text in the page)
      const pageText = await page.textContent('body').catch(() => '');
      const snippet = item.reply.slice(0, 30);
      if (pageText.includes(snippet)) {
        console.log(`  ✓ Comment posted successfully`);
        item.status = 'posted';
        item.postedAt = formatTimestamp(new Date());
      } else {
        // Comment might still have been posted — mark as posted with warning
        console.log(`  ⚠ Comment may have posted (could not verify)`);
        item.status = 'posted';
        item.postedAt = formatTimestamp(new Date());
        item.warning = 'Unverified';
      }

      // Update engagement log
      const existing = log.engagements.find(e => e.id === item.id);
      if (existing) {
        existing.commentPosted = item.postedAt;
        existing.commentText = item.reply;
        existing.status = 'engaged';
        existing.lastAction = item.postedAt;
      } else {
        log.engagements.push({
          id: item.id,
          postUrl: item.postUrl,
          groupName: item.groupName,
          postAuthor: item.postAuthor,
          score: item.score,
          commentPosted: item.postedAt,
          commentText: item.reply,
          dmSent: null,
          dmText: null,
          followUps: [],
          followUpCount: 0,
          status: 'engaged',
          lastAction: item.postedAt,
        });
      }

      posted++;

      // Rate limit between comments
      if (posted < approved.length) {
        const delay = randomDelay(COMMENT_DELAY_MIN, COMMENT_DELAY_MAX);
        console.log(`  Waiting ${Math.round(delay / 1000)}s before next comment...`);
        await sleep(delay);
      }

    } catch (err) {
      console.error(`  Error posting to ${item.id}:`, err.message);
      item.status = 'failed';
      item.error = err.message;
    }
  }

  // Save updated queue and log
  saveJson(QUEUE_FILE, queue);
  saveJson(LOG_FILE, log);

  await context.close();

  if (sessionExpired) {
    console.error('Session expired. Re-login with: node facebook-engage.js --login');
    process.exit(2);
  }

  console.log(`\nDone. ${posted} comments posted.`);
}

// --- Send DMs ---
async function sendDMs() {
  const queue = loadJson(QUEUE_FILE, { items: [] });
  const log = loadJson(LOG_FILE, { engagements: [] });

  // Find items with approved DMs
  const dmApproved = queue.items.filter(item =>
    item.dmStatus === 'approved' && item.dm
  );

  if (dmApproved.length === 0) {
    console.log('No approved DMs to send.');
    return;
  }

  console.log(`Sending ${Math.min(dmApproved.length, MAX_DMS)} DMs (max ${MAX_DMS})...`);

  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    executablePath: BRAVE_PATH,
    headless: false,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--start-minimized',
    ],
    viewport: { width: 1280, height: 900 },
    ignoreDefaultArgs: ['--enable-automation'],
  });

  const page = context.pages()[0] || await context.newPage();
  let sent = 0;
  let sessionExpired = false;

  for (const item of dmApproved.slice(0, MAX_DMS)) {
    if (!item.postUrl) {
      console.log(`  Skipping DM for ${item.id}: no post URL`);
      item.dmStatus = 'failed';
      item.dmError = 'No post URL';
      continue;
    }

    console.log(`  [${sent + 1}] DM to: ${item.postAuthor} — ${item.id}`);

    try {
      // Navigate to the post to find the author's profile
      await page.goto(item.postUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await sleep(3000);

      // Session expiry check
      const currentUrl = page.url();
      const hasLoginForm = await page.$('input[name="email"]');
      if (currentUrl.includes('/login') || currentUrl.includes('checkpoint') || hasLoginForm) {
        console.error('ERROR: Facebook session expired.');
        sessionExpired = true;
        break;
      }

      // Find the post author's profile link
      let profileLink = null;
      const headerLinks = await page.$$('strong a[role="link"], h2 a[role="link"], h3 a[role="link"]');
      for (const link of headerLinks) {
        const text = await link.textContent().catch(() => '');
        const href = await link.getAttribute('href').catch(() => '');
        if (text && href && !href.includes('/groups/') && !href.includes('/posts/')) {
          profileLink = href.startsWith('http') ? href : 'https://www.facebook.com' + href;
          break;
        }
      }

      if (!profileLink) {
        console.log(`  Could not find author profile link for ${item.id}`);
        item.dmStatus = 'failed';
        item.dmError = 'Profile link not found';
        continue;
      }

      // Navigate to the author's profile
      await page.goto(profileLink, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await sleep(3000);

      // Find and click the "Message" button
      let messageBtn = null;

      // Look for Message button on profile
      const buttons = await page.$$('div[role="button"], a[role="button"]');
      for (const btn of buttons) {
        const text = await btn.textContent().catch(() => '');
        if (text && text.trim().toLowerCase() === 'message') {
          messageBtn = btn;
          break;
        }
      }

      if (!messageBtn) {
        // Try aria-label approach
        messageBtn = await page.$('a[aria-label="Message"], div[aria-label="Message"]');
      }

      if (!messageBtn) {
        console.log(`  Could not find Message button for ${item.postAuthor}`);
        item.dmStatus = 'failed';
        item.dmError = 'Message button not found';
        continue;
      }

      await messageBtn.click();
      await sleep(3000);

      // Find the Messenger input box
      let msgInput = null;

      // Strategy 1: Look for the Messenger composer textbox
      msgInput = await page.$('div[role="textbox"][aria-label*="Message" i]');

      // Strategy 2: contenteditable in Messenger
      if (!msgInput) {
        msgInput = await page.$('div[contenteditable="true"][role="textbox"]');
      }

      // Strategy 3: Any contenteditable in the Messenger area
      if (!msgInput) {
        const editables = await page.$$('div[contenteditable="true"]');
        if (editables.length > 0) {
          msgInput = editables[editables.length - 1]; // Usually the last one is the input
        }
      }

      if (!msgInput) {
        console.log(`  Could not find Messenger input for ${item.postAuthor}`);
        item.dmStatus = 'failed';
        item.dmError = 'Messenger input not found';
        continue;
      }

      // Type the DM
      await msgInput.click();
      await sleep(500);
      await humanTypeIntoFocused(page, item.dm);
      await sleep(1000);

      // Send the message (Enter key)
      await page.keyboard.press('Enter');
      await sleep(2000);

      console.log(`  ✓ DM sent to ${item.postAuthor}`);
      item.dmStatus = 'sent';
      item.dmSentAt = formatTimestamp(new Date());

      // Update engagement log
      const existing = log.engagements.find(e => e.id === item.id);
      if (existing) {
        existing.dmSent = item.dmSentAt;
        existing.dmText = item.dm;
        existing.lastAction = item.dmSentAt;
      } else {
        log.engagements.push({
          id: item.id,
          postUrl: item.postUrl,
          groupName: item.groupName,
          postAuthor: item.postAuthor,
          score: item.score,
          commentPosted: null,
          commentText: null,
          dmSent: item.dmSentAt,
          dmText: item.dm,
          followUps: [],
          followUpCount: 0,
          status: 'engaged',
          lastAction: item.dmSentAt,
        });
      }

      sent++;

      // Rate limit between DMs
      if (sent < dmApproved.length) {
        const delay = randomDelay(DM_DELAY_MIN, DM_DELAY_MAX);
        console.log(`  Waiting ${Math.round(delay / 1000)}s before next DM...`);
        await sleep(delay);
      }

    } catch (err) {
      console.error(`  Error sending DM for ${item.id}:`, err.message);
      item.dmStatus = 'failed';
      item.dmError = err.message;
    }
  }

  // Save updated queue and log
  saveJson(QUEUE_FILE, queue);
  saveJson(LOG_FILE, log);

  await context.close();

  if (sessionExpired) {
    console.error('Session expired. Re-login with: node facebook-engage.js --login');
    process.exit(2);
  }

  console.log(`\nDone. ${sent} DMs sent.`);
}

// --- Main ---
async function main() {
  if (!MODE_POST && !MODE_DM && !MODE_LOGIN) {
    console.log('Usage:');
    console.log('  node facebook-engage.js --post    Post approved comment replies');
    console.log('  node facebook-engage.js --dm      Send approved DMs');
    console.log('  node facebook-engage.js --login   Re-login to Facebook');
    process.exit(0);
  }

  if (MODE_LOGIN) {
    await loginMode();
    return;
  }

  if (MODE_POST) {
    await postComments();
  }

  if (MODE_DM) {
    await sendDMs();
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
