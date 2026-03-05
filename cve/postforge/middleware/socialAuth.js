/**
 * OAuth Callback Handlers for Social Platforms
 */

const crypto = require('crypto');
const https = require('https');
const SocialConnectionsSchema = require('../schemas/socialConnections');

// ─── Helper: HTTPS Request ───
function httpsRequest(method, hostname, path, headers, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname,
      path,
      method,
      headers: {
        ...headers,
        ...(body && { 'Content-Length': Buffer.byteLength(body) })
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data), headers: res.headers });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

// ─── Twitter/X OAuth Handler ───
class TwitterOAuthHandler {
  static generateCodeVerifier() {
    return crypto.randomBytes(32).toString('hex');
  }

  static async generateCodeChallenge(verifier) {
    const hash = crypto.createHash('sha256').update(verifier).digest();
    return Buffer.from(hash).toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  static async getAuthorizationUrl(clientId, redirectUri) {
    const verifier = this.generateCodeVerifier();
    const challenge = await this.generateCodeChallenge(verifier);
    const state = crypto.randomBytes(16).toString('hex');

    const url = new URL('https://twitter.com/i/oauth2/authorize');
    url.searchParams.append('response_type', 'code');
    url.searchParams.append('client_id', clientId);
    url.searchParams.append('redirect_uri', redirectUri);
    url.searchParams.append('scope', 'tweet.read tweet.write users.read follows.read follows.write offline.access');
    url.searchParams.append('state', state);
    url.searchParams.append('code_challenge', challenge);
    url.searchParams.append('code_challenge_method', 'S256');

    return { url: url.toString(), verifier, state };
  }

  static async exchangeCodeForToken(clientId, clientSecret, code, redirectUri, codeVerifier) {
    const body = JSON.stringify({
      code,
      grant_type: 'authorization_code',
      client_id: clientId,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier
    });

    const res = await httpsRequest('POST', 'api.twitter.com', '/2/oauth2/token',
      {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body
    );

    if (res.status !== 200) {
      throw new Error(`Twitter token exchange failed: ${res.data}`);
    }

    return {
      accessToken: res.data.access_token,
      refreshToken: res.data.refresh_token,
      expiresAt: new Date(Date.now() + res.data.expires_in * 1000).toISOString(),
    };
  }

  static async getUserInfo(accessToken) {
    const res = await httpsRequest('GET', 'api.twitter.com', '/2/users/me?user.fields=created_at,description,username,public_metrics',
      { 'Authorization': `Bearer ${accessToken}` }
    );

    if (res.status !== 200) {
      throw new Error(`Failed to get Twitter user info: ${res.data}`);
    }

    return res.data.data;
  }
}

// ─── Instagram Business API Handler ───
class InstagramOAuthHandler {
  static async getAuthorizationUrl(clientId, redirectUri) {
    const state = crypto.randomBytes(16).toString('hex');
    const scope = 'instagram_business_basic,instagram_business_content_publish';

    const url = new URL('https://www.instagram.com/oauth/authorize');
    url.searchParams.append('client_id', clientId);
    url.searchParams.append('redirect_uri', redirectUri);
    url.searchParams.append('scope', scope);
    url.searchParams.append('response_type', 'code');
    url.searchParams.append('state', state);

    return { url: url.toString(), state };
  }

  static async exchangeCodeForToken(clientId, clientSecret, code, redirectUri) {
    const body = JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code
    });

    const res = await httpsRequest('POST', 'graph.instagram.com', '/v18.0/oauth/access_token',
      { 'Content-Type': 'application/json' },
      body
    );

    if (res.status !== 200) {
      throw new Error(`Instagram token exchange failed: ${res.data}`);
    }

    return {
      accessToken: res.data.access_token,
      expiresAt: new Date(Date.now() + res.data.expires_in * 1000).toISOString(),
    };
  }

  static async getUserInfo(accessToken, userId) {
    const res = await httpsRequest('GET', 'graph.instagram.com',
      `/v18.0/${userId}?fields=id,username,name,biography`,
      { 'Authorization': `Bearer ${accessToken}` }
    );

    if (res.status !== 200) {
      throw new Error(`Failed to get Instagram user info: ${res.data}`);
    }

    return res.data;
  }
}

// ─── LinkedIn OAuth Handler ───
class LinkedInOAuthHandler {
  static async getAuthorizationUrl(clientId, redirectUri) {
    const state = crypto.randomBytes(16).toString('hex');
    const scope = 'r_basicprofile w_member_social';

    const url = new URL('https://www.linkedin.com/oauth/v2/authorization');
    url.searchParams.append('response_type', 'code');
    url.searchParams.append('client_id', clientId);
    url.searchParams.append('redirect_uri', redirectUri);
    url.searchParams.append('scope', scope);
    url.searchParams.append('state', state);

    return { url: url.toString(), state };
  }

  static async exchangeCodeForToken(clientId, clientSecret, code, redirectUri) {
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret
    }).toString();

    const res = await httpsRequest('POST', 'www.linkedin.com', '/oauth/v2/accessToken',
      {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body
    );

    if (res.status !== 200) {
      throw new Error(`LinkedIn token exchange failed: ${res.data}`);
    }

    return {
      accessToken: res.data.access_token,
      expiresAt: new Date(Date.now() + res.data.expires_in * 1000).toISOString(),
    };
  }

  static async getUserInfo(accessToken) {
    const res = await httpsRequest('GET', 'api.linkedin.com', '/v2/me',
      { 'Authorization': `Bearer ${accessToken}` }
    );

    if (res.status !== 200) {
      throw new Error(`Failed to get LinkedIn user info: ${res.data}`);
    }

    return res.data;
  }
}

// ─── Facebook Pages API Handler ───
class FacebookOAuthHandler {
  static async getAuthorizationUrl(clientId, redirectUri) {
    const state = crypto.randomBytes(16).toString('hex');
    const scope = 'pages_manage_posts,pages_read_engagement,pages_manage_engagement';

    const url = new URL('https://www.facebook.com/v18.0/dialog/oauth');
    url.searchParams.append('client_id', clientId);
    url.searchParams.append('redirect_uri', redirectUri);
    url.searchParams.append('scope', scope);
    url.searchParams.append('state', state);
    url.searchParams.append('response_type', 'code');

    return { url: url.toString(), state };
  }

  static async exchangeCodeForToken(clientId, clientSecret, code, redirectUri) {
    const url = new URL('https://graph.facebook.com/v18.0/oauth/access_token');
    url.searchParams.append('client_id', clientId);
    url.searchParams.append('client_secret', clientSecret);
    url.searchParams.append('code', code);
    url.searchParams.append('redirect_uri', redirectUri);

    const res = await httpsRequest('GET', url.hostname, url.pathname + url.search, {});

    if (res.status !== 200) {
      throw new Error(`Facebook token exchange failed: ${res.data}`);
    }

    return {
      accessToken: res.data.access_token,
      // Facebook tokens don't expire by default, but set a refresh interval
      expiresAt: new Date(Date.now() + 5184000000).toISOString(), // ~60 days
    };
  }

  static async getPages(accessToken) {
    const res = await httpsRequest('GET', 'graph.facebook.com',
      `/me/accounts?fields=id,name,access_token&access_token=${accessToken}`,
      {}
    );

    if (res.status !== 200) {
      throw new Error(`Failed to get Facebook pages: ${res.data}`);
    }

    return res.data.data;
  }

  static async getPageInfo(pageId, accessToken) {
    const res = await httpsRequest('GET', 'graph.facebook.com',
      `/v18.0/${pageId}?fields=id,name,username,category&access_token=${accessToken}`,
      {}
    );

    if (res.status !== 200) {
      throw new Error(`Failed to get Facebook page info: ${res.data}`);
    }

    return res.data;
  }
}

module.exports = {
  TwitterOAuthHandler,
  InstagramOAuthHandler,
  LinkedInOAuthHandler,
  FacebookOAuthHandler,
  httpsRequest
};
