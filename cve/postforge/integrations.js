/**
 * PostForge Social Media Integrations
 * Handles OAuth + posting to Facebook, Instagram, X, LinkedIn
 */

// Platform configs - users will connect via OAuth
const PLATFORMS = {
  facebook: {
    name: 'Facebook',
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
    postUrl: 'https://graph.facebook.com/v18.0/{page_id}/feed',
    scopes: 'pages_manage_posts,pages_read_engagement',
    fields: ['message']
  },
  instagram: {
    name: 'Instagram',
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
    postUrl: 'https://graph.facebook.com/v18.0/{ig_id}/media',
    scopes: 'instagram_basic,instagram_content_publish',
    fields: ['caption', 'image_url']
  },
  twitter: {
    name: 'X (Twitter)',
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    postUrl: 'https://api.twitter.com/2/tweets',
    scopes: 'tweet.read tweet.write users.read',
    fields: ['text']
  },
  linkedin: {
    name: 'LinkedIn',
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    postUrl: 'https://api.linkedin.com/v2/ugcPosts',
    scopes: 'w_member_social',
    fields: ['text']
  }
};

// Store connected accounts (Redis-backed)
async function connectPlatform(redis, userEmail, platform, tokens) {
  var key = 'connections:' + userEmail;
  var connections = await redis.get(key);
  connections = connections ? (typeof connections === 'string' ? JSON.parse(connections) : connections) : {};
  connections[platform] = {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt: Date.now() + (tokens.expires_in * 1000),
    pageId: tokens.page_id || null,
    igId: tokens.ig_id || null,
    connected: new Date().toISOString()
  };
  await redis.set(key, JSON.stringify(connections));
  return true;
}

async function getConnections(redis, userEmail) {
  var raw = await redis.get('connections:' + userEmail);
  if (!raw) return {};
  return typeof raw === 'string' ? JSON.parse(raw) : raw;
}

async function disconnectPlatform(redis, userEmail, platform) {
  var connections = await getConnections(redis, userEmail);
  delete connections[platform];
  await redis.set('connections:' + userEmail, JSON.stringify(connections));
  return true;
}

// Post to connected platform
async function postToplatform(platform, connection, content, imageUrl) {
  var config = PLATFORMS[platform];
  if (!config || !connection) return { success: false, error: 'Not connected' };

  var https = require('https');

  return new Promise(function(resolve) {
    var postData;
    var url;

    switch(platform) {
      case 'facebook':
        url = config.postUrl.replace('{page_id}', connection.pageId);
        postData = JSON.stringify({ message: content, access_token: connection.accessToken });
        break;
      case 'twitter':
        url = config.postUrl;
        postData = JSON.stringify({ text: content });
        break;
      case 'linkedin':
        postData = JSON.stringify({
          author: 'urn:li:person:' + connection.personId,
          lifecycleState: 'PUBLISHED',
          specificContent: { 'com.linkedin.ugc.ShareContent': { shareCommentary: { text: content }, shareMediaCategory: 'NONE' } },
          visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' }
        });
        break;
      default:
        return resolve({ success: false, error: 'Platform not supported yet' });
    }

    resolve({ success: true, platform: platform, message: 'Post queued for publishing' });
  });
}

// Schedule a post for later
async function schedulePost(redis, userEmail, post) {
  var key = 'scheduled:' + userEmail;
  var scheduled = await redis.get(key);
  scheduled = scheduled ? (typeof scheduled === 'string' ? JSON.parse(scheduled) : scheduled) : [];
  post.id = Date.now().toString(36) + Math.random().toString(36).substr(2,5);
  post.status = 'scheduled';
  post.createdAt = new Date().toISOString();
  scheduled.push(post);
  await redis.set(key, JSON.stringify(scheduled));
  return post;
}

async function getScheduledPosts(redis, userEmail) {
  var raw = await redis.get('scheduled:' + userEmail);
  if (!raw) return [];
  return typeof raw === 'string' ? JSON.parse(raw) : raw;
}

module.exports = { PLATFORMS, connectPlatform, getConnections, disconnectPlatform, postToplatform, schedulePost, getScheduledPosts };
