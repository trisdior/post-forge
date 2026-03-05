# Kitchen Remodel Page — WordPress Upload Instructions

**Status:** ✅ Ready to upload  
**File:** `kitchen-page-wp-ready.html`  
**Page:** Kitchen Remodeling Chicago (valconchi.com/kitchen-remodeling/)

---

## What Was Fixed

The original file had emojis (📞🛡️💬📋⏱️👤💰⚡📱🏆🧹) and special characters (✓ — ) encoded in UTF-8 that WordPress was garbling into junk like `â€"`. All special characters have been converted to HTML entities so they render correctly everywhere.

---

## Upload Method: Custom HTML Block (Recommended)

### Step 1 — Open the Page in WordPress
1. Log in to WordPress at `valconchi.com/wp-admin`
2. Go to **Pages → Kitchen Remodeling** (or create new page if it doesn't exist)
3. Click **Edit** to open the Gutenberg editor

### Step 2 — Clear Existing Content
1. Select all content on the page (Ctrl+A)
2. Delete it — you're replacing everything

### Step 3 — Add a Custom HTML Block
1. Click the **+** button to add a block
2. Search for **"Custom HTML"**
3. Click to add it

### Step 4 — Paste the Content
1. Open `kitchen-page-wp-ready.html` in any text editor (Notepad, VS Code)
2. Select All (Ctrl+A) and Copy (Ctrl+C)
3. Click inside the Custom HTML block in WordPress
4. Paste (Ctrl+V)

### Step 5 — Configure Page Settings
In the right sidebar (Page panel):
- **Slug/Permalink:** `kitchen-remodeling` (should be /kitchen-remodeling/)
- **Page Template:** Select **"Full Width"** or **"Blank"** if available — this removes the sidebar
  - If no full-width option: check your theme settings
  - Look for "Page Attributes → Template"

### Step 6 — SEO Settings (Yoast/RankMath)
If you have an SEO plugin:
- **SEO Title:** Kitchen Remodeling Chicago | Valencia Construction
- **Meta Description:** Chicago's trusted kitchen remodeling contractor. Custom cabinets, countertops, islands & full renovations. Licensed & insured. Free estimates. Call (773) 682-7788.
- **Focus Keyword:** kitchen remodeling Chicago

### Step 7 — Preview & Publish
1. Click **Preview** to check it looks right
2. Verify:
   - ✅ Phone number shows as `(773) 682-7788` (not garbled)
   - ✅ Checkmarks (✓) show correctly
   - ✅ Em dash in "owner — not a salesperson" shows correctly  
   - ✅ Icons render (they're HTML entities, not images)
3. Click **Publish** when it looks good

---

## Alternative Method: WP Theme Custom Page Template

If your theme strips Custom HTML block styles (common with page builders), use this approach instead:

1. Go to **Appearance → Theme File Editor** (or FTP)
2. Create a new file: `page-kitchen-remodeling.php`
3. Content:
```php
<?php
/* Template Name: Kitchen Remodeling */
get_header(); ?>
[PASTE kitchen-page-wp-ready.html CONTENT HERE]
<?php get_footer(); ?>
```
4. Assign template to the page in Page Attributes

---

## Troubleshooting

**Icons show as question marks or boxes:**
- The HTML entities should render fine in all modern browsers
- If not, check that your theme isn't stripping HTML from custom blocks
- Solution: Use "Full Width" page template to bypass theme interference

**Styles not applying (page looks unstyled):**
- Make sure the full content including `<style>` tag was pasted
- The CSS must be inside the Custom HTML block along with the HTML
- Verify the block didn't get split into multiple blocks

**Form/CTA links not working:**
- The "Get Free Estimate" button links to `/consultation/` — make sure that page exists
- The phone link `tel:7736827788` works automatically on mobile

---

## Files in This Package

| File | Purpose |
|------|---------|
| `kitchen-page-wp-ready.html` | Paste this into Custom HTML block |
| `kitchen-page-wp-block.html` | Same content with WP block wrapper comments |
| `UPLOAD-INSTRUCTIONS.md` | This file |

---

**Prepared:** February 18, 2026 (Nightshift)
