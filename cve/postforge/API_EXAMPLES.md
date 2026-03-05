# PostForge Social Media API Examples

## Quick Start

### 1. Connect a Platform (OAuth Flow)

**Frontend:**
```html
<button onclick="connectTwitter()">Connect X (Twitter)</button>

<script>
async function connectTwitter() {
  const response = await fetch('/api/social/auth/twitter?userId=user123');
  const data = await response.json();
  
  if (data.authUrl) {
    window.location = data.authUrl;
  } else {
    alert('Error: ' + data.error);
  }
}
</script>
```

User is redirected to Twitter → approves → redirected back to `/settings.html?connected=twitter`

### 2. Check Connection Status

**Frontend:**
```javascript
async function checkStatus() {
  const response = await fetch('/api/social/status?userId=user123');
  const data = await response.json();
  
  console.log('Twitter:', data.connections.twitter);
  // Output:
  // {
  //   connected: true,
  //   accountInfo: { id: "123", username: "@myaccount", name: "My Name" },
  //   connectedAt: "2026-03-05T10:00:00Z",
  //   expiresAt: null
  // }
}
```

### 3. Post Content to Platforms

**Frontend:**
```javascript
async function postToAllPlatforms() {
  const response = await fetch('/api/social/post', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: 'user123',
      text: 'Check out this amazing blog post! 🚀 #productivity #tech',
      imageUrl: 'https://example.com/blog-thumb.jpg',
      platformList: ['twitter', 'instagram', 'linkedin', 'facebook'],
      metadata: {
        source: 'blog_post',
        scheduledTime: null
      }
    })
  });
  
  const results = await response.json();
  
  results.results.twitter && console.log('✓ Posted to Twitter:', results.results.twitter.url);
  results.results.instagram && console.log('✓ Posted to Instagram:', results.results.instagram.postId);
  results.results.linkedin && console.log('✓ Posted to LinkedIn:', results.results.linkedin.url);
  results.results.facebook && console.log('✓ Posted to Facebook');
}
```

### 4. Disconnect a Platform

**Frontend:**
```javascript
async function disconnectInstagram() {
  const response = await fetch('/api/social/disconnect/instagram', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: 'user123' })
  });
  
  const result = await response.json();
  console.log('Disconnected:', result.disconnected);
}
```

---

## Advanced Examples

### Example 1: Auto-Post Content from Agent

When the AI agent generates content, automatically post it:

```javascript
// In agent.js or content generation endpoint
async function publishGeneratedContent(userId, content) {
  // Content from AI includes: text, imageUrl, recommendedPlatforms
  
  const response = await fetch('/api/social/post', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      text: content.text,
      imageUrl: content.imageUrl,
      platformList: content.recommendedPlatforms || ['twitter', 'linkedin'],
      metadata: {
        source: 'ai_agent',
        contentId: content.id,
        generatedAt: new Date().toISOString()
      }
    })
  });
  
  return await response.json();
}
```

### Example 2: Platform-Specific Content Adaptation

Different platforms need different text/formatting:

```javascript
function adaptContentForPlatform(baseText, platform, maxLength) {
  switch(platform) {
    case 'twitter':
      // Twitter: 280 characters, hashtags, casual
      return baseText.substring(0, 280) + ' #ProductHunt #Startup';
    
    case 'linkedin':
      // LinkedIn: Longer, professional, emojis work
      return baseText + '\n\n' + 'What do you think? Share your thoughts! 💭';
    
    case 'instagram':
      // Instagram: Longer caption, hashtags, emojis
      return baseText + '\n\n' + '#startup #growth #marketing';
    
    case 'facebook':
      // Facebook: Medium length, conversational
      return baseText + ' Comment your thoughts below!';
    
    default:
      return baseText;
  }
}

// Usage:
const adapters = {
  twitter: adaptContentForPlatform(content, 'twitter', 280),
  instagram: adaptContentForPlatform(content, 'instagram', 2200),
  linkedin: adaptContentForPlatform(content, 'linkedin', 3000),
  facebook: adaptContentForPlatform(content, 'facebook', 63206)
};
```

### Example 3: Scheduled Posting with Queue

For scheduling posts to go out at optimal times:

```javascript
// Store post in queue
async function schedulePost(userId, post, scheduledTime) {
  // This would be in your database / Redis
  const scheduleKey = `scheduled:${userId}:${Date.parse(scheduledTime)}`;
  
  await redis.set(scheduleKey, JSON.stringify({
    userId,
    text: post.text,
    imageUrl: post.imageUrl,
    platformList: post.platformList,
    scheduledTime
  }), { ex: 86400 * 30 }); // Store for 30 days
  
  return { scheduled: true, time: scheduledTime };
}

// Background job (runs every minute)
async function processPendingScheduledPosts() {
  const now = new Date();
  
  // Get all scheduled posts
  const posts = await redis.keys('scheduled:*');
  
  for (const key of posts) {
    const timestamp = parseInt(key.split(':')[2]);
    
    if (timestamp <= now.getTime()) {
      const post = JSON.parse(await redis.get(key));
      
      // Post to platforms
      const result = await fetch('/api/social/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post)
      });
      
      // Delete from queue
      await redis.del(key);
      
      console.log('Posted scheduled content:', post.userId);
    }
  }
}
```

### Example 4: Analytics Dashboard

Track which platforms perform best:

```javascript
async function getAnalytics(userId, days = 30) {
  const response = await fetch(`/api/social/analytics?days=${days}&userId=${userId}`);
  const data = await response.json();
  
  // Summarize performance
  const summary = {};
  for (const [date, stats] of Object.entries(data.analytics)) {
    for (const [platform, metrics] of Object.entries(stats)) {
      if (!summary[platform]) {
        summary[platform] = { sent: 0, failed: 0 };
      }
      summary[platform].sent += metrics.sent || 0;
      summary[platform].failed += metrics.failed || 0;
    }
  }
  
  // Calculate success rate
  for (const [platform, metrics] of Object.entries(summary)) {
    const total = metrics.sent + metrics.failed;
    metrics.successRate = total > 0 ? (metrics.sent / total * 100).toFixed(1) : 0;
  }
  
  return summary;
}

// Usage:
const analytics = await getAnalytics('user123', 30);
console.log(analytics);
// Output:
// {
//   twitter: { sent: 47, failed: 2, successRate: 95.9 },
//   instagram: { sent: 30, failed: 1, successRate: 96.8 },
//   linkedin: { sent: 25, failed: 3, successRate: 89.3 },
//   facebook: { sent: 56, failed: 4, successRate: 93.3 }
// }
```

### Example 5: Error Handling & Retry

Handle failures gracefully:

```javascript
async function postWithRetry(userId, content, maxRetries = 3) {
  let lastError = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch('/api/social/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          text: content.text,
          imageUrl: content.imageUrl,
          platformList: content.platformList
        })
      });
      
      const result = await response.json();
      
      // Check if at least one platform succeeded
      if (result.success) {
        return result;
      } else {
        throw new Error('All platforms failed');
      }
    } catch (error) {
      lastError = error;
      console.warn(`Attempt ${attempt} failed:`, error.message);
      
      // Exponential backoff: wait 2s, 4s, 8s
      if (attempt < maxRetries) {
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
      }
    }
  }
  
  throw new Error(`Failed after ${maxRetries} attempts: ${lastError.message}`);
}
```

### Example 6: Rate Limit Aware Posting

Check limits before posting:

```javascript
async function postIfWithinLimit(userId, content) {
  const response = await fetch('/api/social/status?userId=' + userId);
  const status = await response.json();
  
  // Check which platforms are connected
  const connectedPlatforms = Object.keys(status.connections)
    .filter(p => status.connections[p].connected);
  
  if (connectedPlatforms.length === 0) {
    throw new Error('No platforms connected');
  }
  
  // Reduce platform list to only connected ones
  const platformList = content.platformList.filter(p => 
    connectedPlatforms.includes(p)
  );
  
  if (platformList.length === 0) {
    throw new Error('None of your selected platforms are connected');
  }
  
  // Post
  return await fetch('/api/social/post', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      ...content,
      platformList
    })
  });
}
```

### Example 7: Multi-User Bulk Posting

Manage content for multiple accounts:

```javascript
async function bulkPostToAllUsers(users, content) {
  const results = {};
  
  for (const user of users) {
    try {
      const response = await fetch('/api/social/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          text: content.text,
          imageUrl: content.imageUrl,
          platformList: user.enabledPlatforms || ['twitter', 'linkedin'],
          metadata: { bulkId: user.campaignId }
        })
      });
      
      const result = await response.json();
      results[user.id] = {
        success: result.success,
        platforms: Object.keys(result.results).filter(p => 
          result.results[p].success
        )
      };
    } catch (error) {
      results[user.id] = {
        success: false,
        error: error.message
      };
    }
  }
  
  return results;
}
```

### Example 8: Settings Page Integration

Full integration in settings:

```javascript
// Load and display connections on page load
async function initializeSettings() {
  const userId = getCurrentUserId();
  const response = await fetch('/api/social/status?userId=' + userId);
  const status = await response.json();
  
  // Update UI for each platform
  ['twitter', 'instagram', 'linkedin', 'facebook'].forEach(platform => {
    const connection = status.connections[platform];
    const card = document.querySelector(`[data-platform="${platform}"]`);
    
    if (connection.connected) {
      card.classList.add('connected');
      card.querySelector('.status').textContent = 
        `Connected as @${connection.accountInfo.username}`;
      card.querySelector('button').textContent = 'Disconnect';
      card.querySelector('button').onclick = () => disconnectPlatform(platform);
    } else {
      card.classList.remove('connected');
      card.querySelector('.status').textContent = 'Not connected';
      card.querySelector('button').textContent = 'Connect';
      card.querySelector('button').onclick = () => connectPlatform(platform);
    }
  });
}

async function connectPlatform(platform) {
  const userId = getCurrentUserId();
  const response = await fetch(`/api/social/auth/${platform}?userId=${userId}`);
  const data = await response.json();
  window.location = data.authUrl;
}

async function disconnectPlatform(platform) {
  if (!confirm(`Disconnect ${platform}?`)) return;
  
  const userId = getCurrentUserId();
  const response = await fetch(`/api/social/disconnect/${platform}`, {
    method: 'DELETE',
    body: JSON.stringify({ userId })
  });
  
  const result = await response.json();
  if (result.success) {
    alert('Disconnected!');
    initializeSettings(); // Refresh
  }
}

// On page load
document.addEventListener('DOMContentLoaded', initializeSettings);

// On OAuth callback
const params = new URLSearchParams(window.location.search);
if (params.has('connected')) {
  setTimeout(() => initializeSettings(), 500);
}
```

---

## Testing Checklist

Use these examples to test the integration:

```javascript
// 1. Test OAuth flow
connectTwitter();

// 2. Test status check
checkStatus();

// 3. Test posting
postToAllPlatforms();

// 4. Test platform-specific content
console.log(adaptContentForPlatform('Hello world', 'twitter', 280));

// 5. Test analytics
const analytics = await getAnalytics('user123');

// 6. Test disconnect
disconnectInstagram();

// 7. Test error handling
postWithRetry('user123', { text: 'Test', platformList: ['twitter'] });
```

All examples assume:
- User ID: `user123`
- Server running on `localhost:3004` or `yourdomain.com`
- Redis properly configured
- API keys set in environment

For production, replace hardcoded `user123` with actual user ID from auth token.
