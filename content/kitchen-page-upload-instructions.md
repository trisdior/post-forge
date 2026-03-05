# How to Update the Kitchen Page in WordPress

## Step-by-Step Instructions

### Step 1: Log into WordPress
1. Go to **valenciaconstructionchi.com/wp-admin**
2. Enter your username and password
3. Click **Log In**

### Step 2: Find the Kitchen Page
1. In the left sidebar, click **Pages** → **All Pages**
2. Find the Kitchen page in the list (use the search bar if needed)
3. Hover over it and click **Edit**

### Step 3: Switch to Code Editor
1. In the top-right corner of the editor, click the **three dots** (⋮) menu
2. Select **Code editor** (this lets you paste raw HTML)
3. You'll see the current page content as HTML code

### Step 4: Replace the Content
1. **Select all** the existing code (Ctrl+A)
2. **Delete** it
3. Open the file `kitchen-page-fixed.html` (I gave you) in Notepad
4. **Copy everything** from that file (Ctrl+A, then Ctrl+C)
5. **Paste** it into the WordPress code editor (Ctrl+V)

### Step 5: Preview Before Publishing
1. Click the **Preview** button (top-right area)
2. Select **Preview in new tab**
3. Check that everything looks right — text, images, buttons, layout
4. Make sure there are no weird characters (â€", Â, etc.)

### Step 6: Publish
1. If the preview looks good, go back to the editor tab
2. Click **Update** (blue button, top-right)
3. Done! ✅

### Step 7: Clear Cache (if applicable)
If your site uses a caching plugin (like WP Super Cache, W3 Total Cache, or LiteSpeed):
1. Go to the cache plugin settings in the sidebar
2. Click **Purge/Clear All Cache**
3. Visit the live page to confirm changes are showing

---

## What Was Fixed
The original page had **character encoding issues** — weird characters like `â€"` instead of em dashes (—) and `â€™` instead of apostrophes ('). The fixed version uses proper Unicode characters throughout.

## Questions?
Text Tris's team if anything looks off after uploading.
