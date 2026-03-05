#!/usr/bin/env node
// Facebook Group Lead Scanner for Valencia Construction
// Uses Playwright + Brave to browse Facebook groups and extract homeowner posts.
// Replaces the Google site:facebook.com approach which can't see posts behind login.
//
// Usage:
//   node facebook-scan.js          — Normal scan (minimized browser)
//   node facebook-scan.js --login  — First-run setup (visible browser, manual login)

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// --- Paths ---
const DATA_DIR = path.join(__dirname, '..', 'data');
const GROUPS_FILE = path.join(DATA_DIR, 'facebook-groups.json');
const SEEN_FILE = path.join(DATA_DIR, 'facebook-seen.json');
const OUTPUT_FILE = path.join(DATA_DIR, 'facebook-leads-latest.json');
const PROFILE_DIR = path.join(DATA_DIR, 'facebook-browser-profile');
const BRAVE_PATH = 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe';

const LOGIN_MODE = process.argv.includes('--login');

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

/** Parse relative timestamps like "2h", "3d", "Just now", "Yesterday" into a Date */
function parseRelativeTime(text) {
  const now = new Date();
  if (!text) return now;

  const lower = text.toLowerCase().trim();
  if (lower.includes('just now') || lower.includes('now')) return now;
  if (lower.includes('yesterday')) {
    return new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }

  const match = lower.match(/(\d+)\s*(m|min|h|hr|d|w)/);
  if (match) {
    const n = parseInt(match[1], 10);
    const unit = match[2];
    const multipliers = { m: 60000, min: 60000, h: 3600000, hr: 3600000, d: 86400000, w: 604800000 };
    return new Date(now.getTime() - n * (multipliers[unit] || 0));
  }

  return now;
}

/** Check if a post is within maxPostAge */
function isRecent(dateObj, maxAge) {
  if (!maxAge) return true;
  const match = maxAge.match(/(\d+)(h|d|w)/);
  if (!match) return true;
  const n = parseInt(match[1], 10);
  const unit = match[2];
  const ms = { h: 3600000, d: 86400000, w: 604800000 };
  const cutoff = new Date(Date.now() - n * (ms[unit] || 86400000));
  return dateObj >= cutoff;
}

function formatDate(d) {
  return d.toISOString().split('T')[0];
}

function formatTimestamp(d) {
  return d.toISOString().replace('T', ' ').replace(/\.\d+Z$/, '');
}

// --- Main ---

async function main() {
  // Load config
  if (!fs.existsSync(GROUPS_FILE)) {
    console.error('ERROR: facebook-groups.json not found. Create it at:', GROUPS_FILE);
    process.exit(1);
  }

  const config = loadJson(GROUPS_FILE, { groups: [], scrollCount: 3, maxPostAge: '24h' });
  if (!config.groups || config.groups.length === 0) {
    console.error('ERROR: No groups configured in facebook-groups.json');
    process.exit(1);
  }

  const seen = loadJson(SEEN_FILE, {});
  const scrollCount = config.scrollCount || 3;
  const maxPostAge = config.maxPostAge || '24h';

  // Ensure profile dir exists
  if (!fs.existsSync(PROFILE_DIR)) {
    fs.mkdirSync(PROFILE_DIR, { recursive: true });
  }

  console.log(LOGIN_MODE ? 'Starting in LOGIN mode (visible browser)...' : 'Starting Facebook scan...');
  console.log(`Groups: ${config.groups.length}, Scroll depth: ${scrollCount}, Max age: ${maxPostAge}`);

  // Launch Brave with persistent context
  const launchOptions = {
    executablePath: BRAVE_PATH,
    headless: false,
    args: [
      '--disable-blink-features=AutomationControlled',
      ...(LOGIN_MODE ? [] : ['--start-minimized']),
    ],
    viewport: { width: 1280, height: 900 },
    ignoreDefaultArgs: ['--enable-automation'],
  };

  let context;
  try {
    context = await chromium.launchPersistentContext(PROFILE_DIR, launchOptions);
  } catch (err) {
    if (err.message && err.message.includes('Failed to launch')) {
      console.error('ERROR: Could not launch Brave. Is it installed at:', BRAVE_PATH);
      console.error(err.message);
      process.exit(1);
    }
    throw err;
  }

  const page = context.pages()[0] || await context.newPage();

  // --- Login mode ---
  if (LOGIN_MODE) {
    console.log('Navigating to Facebook... Please log in manually.');
    await page.goto('https://www.facebook.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Poll for login completion — resilient to page navigations
    console.log('Waiting for login... Log into Facebook in the browser window.');
    console.log('The script will auto-detect when you are logged in (up to 10 minutes).');
    const loginStart = Date.now();
    const LOGIN_TIMEOUT = 600000; // 10 minutes
    let loggedIn = false;

    while (Date.now() - loginStart < LOGIN_TIMEOUT) {
      await sleep(3000);
      try {
        const activePage = context.pages()[0];
        if (!activePage) break;
        const url = activePage.url();
        // Logged in = navigated to facebook.com feed (not login/checkpoint)
        if (url.includes('facebook.com') && !url.includes('/login') && !url.includes('checkpoint')) {
          const hasLoginForm = await activePage.$('input[name="email"]').catch(() => null);
          if (!hasLoginForm) {
            loggedIn = true;
            break;
          }
        }
      } catch {
        // Page might be navigating, keep polling
      }
    }

    if (loggedIn) {
      console.log('Login detected! Session saved to:', PROFILE_DIR);
      // Wait a moment for cookies to fully save
      await sleep(3000);

      // Test with first group if available
      try {
        const testPage = context.pages()[0];
        if (testPage && config.groups.length > 0 && config.groups[0].url && !config.groups[0].url.includes('GROUP_ID')) {
          console.log('Testing with first group:', config.groups[0].name);
          await testPage.goto(config.groups[0].url, { waitUntil: 'domcontentloaded', timeout: 30000 });
          await sleep(3000);
          const feedExists = await testPage.$('div[role="feed"]');
          console.log(feedExists ? 'Group feed loaded successfully!' : 'Warning: Could not find group feed. Check the group URL.');
        }
      } catch (err) {
        console.log('Test navigation failed, but login session should still be saved.');
      }
    } else {
      console.log('Login timeout or browser closed. If you logged in, the session should still be saved.');
    }

    try { await context.close(); } catch {}
    console.log('Login setup complete. Run without --login for normal scanning.');
    process.exit(0);
  }

  // --- Normal scan mode ---
  const allPosts = [];
  let sessionExpired = false;

  for (let i = 0; i < config.groups.length; i++) {
    const group = config.groups[i];
    if (!group.url || group.url.includes('GROUP_ID')) {
      console.log(`Skipping unconfigured group: ${group.name}`);
      continue;
    }

    console.log(`\n[${i + 1}/${config.groups.length}] Scanning: ${group.name}`);

    try {
      await page.goto(group.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await sleep(3000);

      // --- Session expiry detection ---
      const currentUrl = page.url();
      const hasLoginForm = await page.$('input[name="email"]');
      if (currentUrl.includes('/login') || currentUrl.includes('checkpoint') || hasLoginForm) {
        console.error('ERROR: Facebook session expired. Please re-login with: node facebook-scan.js --login');
        sessionExpired = true;
        break;
      }

      // Wait for feed to load
      const feed = await page.$('div[role="feed"]');
      if (!feed) {
        console.log('  Warning: No feed found, skipping group');
        continue;
      }

      // Scroll to load more posts
      for (let s = 0; s < scrollCount; s++) {
        await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2));
        await sleep(2000 + Math.random() * 1000);
      }

      // Extract posts
      const posts = await page.evaluate((groupName) => {
        const articles = document.querySelectorAll('div[role="feed"] div[role="article"]');
        const results = [];

        for (const article of articles) {
          try {
            // Extract post text — look for the main text content block
            const textBlocks = article.querySelectorAll('div[data-ad-preview="message"], div[dir="auto"]');
            let postText = '';
            for (const block of textBlocks) {
              const t = block.innerText?.trim();
              if (t && t.length > 20 && t.length > postText.length) {
                postText = t;
              }
            }
            if (!postText || postText.length < 10) continue;

            // Extract permalink — look for timestamp links that contain /posts/ or /permalink/
            let postUrl = '';
            const links = article.querySelectorAll('a[href]');
            for (const link of links) {
              const href = link.getAttribute('href') || '';
              if (href.includes('/posts/') || href.includes('/permalink/')) {
                postUrl = href.startsWith('http') ? href : 'https://www.facebook.com' + href;
                // Clean tracking params
                try { postUrl = postUrl.split('?')[0]; } catch {}
                break;
              }
            }

            // Extract author name — typically in a header/strong element
            let author = '';
            const headerLinks = article.querySelectorAll('strong a, h3 a, h2 a, a[role="link"]');
            for (const hl of headerLinks) {
              const name = hl.innerText?.trim();
              if (name && name.length > 1 && name.length < 60 && !name.includes('http')) {
                author = name;
                break;
              }
            }

            // Extract timestamp text
            let timeText = '';
            const timeEl = article.querySelector('a[href*="/posts/"] span, a[href*="/permalink/"] span, abbr');
            if (timeEl) {
              timeText = timeEl.innerText?.trim() || timeEl.getAttribute('title') || '';
            }

            // Extract comment count
            let commentCount = 0;
            const commentEls = article.querySelectorAll('span');
            for (const el of commentEls) {
              const t = el.innerText?.trim() || '';
              const m = t.match(/(\d+)\s*comment/i);
              if (m) { commentCount = parseInt(m[1], 10); break; }
            }

            // Build post ID from URL or text hash
            let postId = '';
            if (postUrl) {
              const urlMatch = postUrl.match(/\/(\d+)\/?$/);
              postId = urlMatch ? 'fb_' + urlMatch[1] : 'fb_' + postUrl.replace(/\W/g, '').slice(-20);
            } else {
              postId = 'fb_' + postText.slice(0, 50).replace(/\W/g, '').toLowerCase();
            }

            results.push({
              id: postId,
              text: postText.slice(0, 500),
              url: postUrl,
              author: author,
              timeText: timeText,
              commentCount: commentCount,
              groupName: groupName,
            });
          } catch {
            // Skip malformed articles
          }
        }

        return results;
      }, group.name);

      console.log(`  Found ${posts.length} posts`);

      // Filter and deduplicate
      for (const post of posts) {
        if (seen[post.id]) continue;

        const postDate = parseRelativeTime(post.timeText);
        if (!isRecent(postDate, maxPostAge)) continue;

        allPosts.push({
          id: post.id,
          title: post.text.slice(0, 100),
          url: post.url || group.url,
          date: formatDate(postDate),
          source: 'Facebook',
          snippet: post.text,
          author: post.author,
          groupName: post.groupName,
          commentCount: post.commentCount,
        });

        seen[post.id] = formatTimestamp(new Date());
      }

    } catch (err) {
      console.error(`  Error scanning ${group.name}:`, err.message);
    }

    // Rate limit between groups
    if (i < config.groups.length - 1) {
      const delay = 3000 + Math.random() * 2000;
      await sleep(delay);
    }
  }

  // Close browser
  await context.close();

  // Handle session expiry
  if (sessionExpired) {
    saveJson(OUTPUT_FILE, { timestamp: formatTimestamp(new Date()), newPostsCount: 0, posts: [] });
    process.exit(2);
  }

  // Write output
  const output = {
    timestamp: formatTimestamp(new Date()),
    newPostsCount: allPosts.length,
    posts: allPosts,
  };

  saveJson(OUTPUT_FILE, output);
  saveJson(SEEN_FILE, seen);

  console.log(`\nScan complete. ${allPosts.length} new posts found.`);

  // Call integrate-scanner-leads.py if new posts found
  if (allPosts.length > 0) {
    console.log('Integrating leads...');
    const { execSync } = require('child_process');
    try {
      const pythonPath = 'C:\\Users\\trisd\\AppData\\Local\\Programs\\Python\\Python312\\python.exe';
      const integratePath = path.join(__dirname, 'integrate-scanner-leads.py');
      execSync(`"${pythonPath}" "${integratePath}" --source facebook`, { stdio: 'inherit' });
    } catch (err) {
      console.error('Warning: integrate-scanner-leads.py failed:', err.message);
    }
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
