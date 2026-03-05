# PostForge API — Quick Reference

## Get Your API Key

1. Login at https://postforge.local:3004
2. Go to Settings → API Keys (or `/api-keys`)
3. Click "Generate Key"
4. Copy your key (shown only once!)
5. Save it somewhere safe

## Basic Usage

### Install cURL (if needed)
```bash
# macOS
brew install curl

# Windows (already installed)
# Linux: apt-get install curl
```

### Make Your First Request
```bash
curl -X POST https://api.postforge.com/api/v1/generate \
  -H "x-api-key: pk_live_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Your Business",
    "businessType": "Your Service Type",
    "platform": "instagram",
    "count": 3
  }'
```

## Common Endpoints

### Generate Social Content
```bash
POST /api/v1/generate
```
**Parameters**:
- `businessName` (required) - Your business name
- `businessType` (required) - Type of business/service
- `platform` (required) - instagram, facebook, twitter, linkedin, tiktok
- `count` (optional) - Number of posts (1-5, default: 5)
- `location` (optional) - City/region for local references
- `brandVoice` (optional) - Tone description

**Example**:
```bash
curl -X POST https://api.postforge.com/api/v1/generate \
  -H "x-api-key: pk_live_..." \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Valencia Construction",
    "businessType": "Kitchen Remodeling",
    "location": "Chicago, IL",
    "platform": "instagram",
    "count": 5,
    "brandVoice": "professional yet approachable"
  }'
```

### Generate Video Captions
```bash
POST /api/v1/clips
```
**Parameters**:
- `videoUrl` (required) - URL to your video
- `style` (optional) - hormozi, minimal, karaoke, bold
- `platform` (optional) - tiktok, instagram, youtube

### Repurpose Content
```bash
POST /api/v1/repurpose
```
**Parameters**:
- `content` (required) - Original content to repurpose
- `targetPlatforms` (required) - Array of platforms
- `style` (optional) - Repurposing style

## Response Format

All successful responses are JSON:
```json
[
  {
    "id": 1,
    "platform": "instagram",
    "type": "tip|showcase|engagement|testimonial|promo",
    "content": "The actual post text here...",
    "image_suggestion": "Detailed description for image generation",
    "best_time": "Tuesday 6:30 PM"
  }
]
```

## Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 401 | Invalid/missing API key | Check `x-api-key` header |
| 429 | Monthly limit exceeded | Upgrade plan or wait for reset |
| 400 | Bad request | Check parameters |
| 500 | Server error | Contact support |

## Rate Limits

Your monthly limit depends on your plan:

| Plan | Requests/Month |
|------|---|
| Free | 100 |
| Growth | 1,000 |
| Pro | 10,000 |
| Business | 100,000 |

**Check remaining**: Look at `X-RateLimit-Remaining` header

**Reset date**: First day of next month

## Code Samples

### Python
```python
import requests

api_key = "pk_live_your_key"
headers = {
    "x-api-key": api_key,
    "Content-Type": "application/json"
}

data = {
    "businessName": "Your Business",
    "businessType": "Service",
    "platform": "instagram",
    "count": 3
}

response = requests.post(
    "https://api.postforge.com/api/v1/generate",
    headers=headers,
    json=data
)

posts = response.json()
for post in posts:
    print(f"[{post['type']}] {post['content'][:100]}...")
```

### JavaScript/Node.js
```javascript
const apiKey = "pk_live_your_key";

const response = await fetch("https://api.postforge.com/api/v1/generate", {
  method: "POST",
  headers: {
    "x-api-key": apiKey,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    businessName: "Your Business",
    businessType: "Service",
    platform: "instagram",
    count: 3
  })
});

const posts = await response.json();
posts.forEach(post => {
  console.log(`[${post.type}] ${post.content.substring(0, 100)}...`);
});
```

### PHP
```php
<?php
$apiKey = "pk_live_your_key";

$data = array(
    "businessName" => "Your Business",
    "businessType" => "Service",
    "platform" => "instagram",
    "count" => 3
);

$ch = curl_init("https://api.postforge.com/api/v1/generate");
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    "x-api-key: " . $apiKey,
    "Content-Type: application/json"
));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$posts = json_decode($response, true);

foreach ($posts as $post) {
    echo "[" . $post['type'] . "] " . substr($post['content'], 0, 100) . "...\n";
}

curl_close($ch);
?>
```

### Ruby
```ruby
require 'net/http'
require 'json'

api_key = "pk_live_your_key"

data = {
  businessName: "Your Business",
  businessType: "Service",
  platform: "instagram",
  count: 3
}

uri = URI("https://api.postforge.com/api/v1/generate")
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true

request = Net::HTTP::Post.new(uri.path)
request["x-api-key"] = api_key
request["Content-Type"] = "application/json"
request.body = data.to_json

response = http.request(request)
posts = JSON.parse(response.body)

posts.each do |post|
  puts "[#{post['type']}] #{post['content'][0..100]}..."
end
```

### Go
```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    apiKey := "pk_live_your_key"

    data := map[string]interface{}{
        "businessName":  "Your Business",
        "businessType":  "Service",
        "platform":      "instagram",
        "count":         3,
    }

    jsonData, _ := json.Marshal(data)
    req, _ := http.NewRequest("POST", 
        "https://api.postforge.com/api/v1/generate",
        bytes.NewBuffer(jsonData))

    req.Header.Set("x-api-key", apiKey)
    req.Header.Set("Content-Type", "application/json")

    client := &http.Client{}
    resp, _ := client.Do(req)
    body, _ := ioutil.ReadAll(resp.Body)

    var posts []map[string]interface{}
    json.Unmarshal(body, &posts)

    for _, post := range posts {
        fmt.Printf("[%v] %s...\n", 
            post["type"], 
            post["content"].(string)[:100])
    }
}
```

## Troubleshooting

### "Missing API key"
```
Error: Missing API key
Solution: Add -H "x-api-key: your_key_here"
```

### "Invalid API key"
```
Error: Invalid API key
Solution: Copy key exactly from /api-keys dashboard
```

### "Key has been revoked"
```
Error: Key has been revoked
Solution: Generate a new key in dashboard
```

### "Monthly rate limit exceeded"
```
Error: Monthly rate limit exceeded
Solution: Upgrade plan or wait until next month
```

## Performance Tips

1. **Batch requests** - Send multiple items per request when possible
2. **Cache results** - Store generated content locally
3. **Monitor usage** - Check dashboard regularly
4. **Plan ahead** - Generate content before you need it
5. **Upgrade early** - Avoid running out of requests mid-month

## Support

- **Documentation**: https://postforge.com/api-docs
- **Dashboard**: https://postforge.local:3004/api-keys
- **Email**: support@postforge.com
- **Issues**: Check error messages for hints

## Best Practices

✅ **DO**:
- Keep API keys confidential
- Use environment variables for keys
- Check rate limit headers
- Monitor your usage
- Rotate keys periodically

❌ **DON'T**:
- Commit API keys to Git
- Share keys via email/chat
- Use the same key everywhere
- Ignore rate limit warnings
- Log full API keys

---

**API Version**: v1
**Last Updated**: March 5, 2026
**Status**: Production Ready
