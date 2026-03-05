# Deployment Guide

Deploy the PostForge Processing Server to production.

---

## 1. Local Testing (Docker)

```bash
# Clone and navigate
cd processing-server

# Create .env from template
cp .env.example .env

# Add your API keys to .env
nano .env

# Start with Docker Compose
docker-compose up -d

# Test health
curl http://localhost:4000/health
```

---

## 2. DigitalOcean App Platform (Recommended for Beginners)

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/postforge-processing.git
git push -u origin main
```

### Step 2: Create App on DigitalOcean

1. Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Click "Create App"
3. Connect your GitHub repo
4. Select `processing-server` directory
5. Choose `Dockerfile` build method
6. Configure environment variables:
   - `ANTHROPIC_API_KEY`: Your Claude API key
   - `OPENAI_API_KEY`: Your OpenAI key (if using Whisper API)
   - `PROCESSING_API_KEY`: Generate a secure random key
   - `NODE_ENV`: Set to `production`
   - `REQUIRE_AUTH`: Set to `true`

### Step 3: Set Resource Limits

- Memory: **2GB** (for video processing)
- CPU: **1-2 shared CPUs**
- Disk: **50GB** (for uploads + clips)
- Auto-scaling: Optional

### Step 4: Deploy

```bash
# Deploy manually
doctl apps create-deployment <app-id>

# Or push to trigger auto-deploy
git push origin main
```

**Cost:** ~$15-20/month

---

## 3. Railway

### Step 1: Connect GitHub

1. Go to [Railway.app](https://railway.app)
2. Create new project from GitHub
3. Select your repo
4. Choose `postforge-processing` directory

### Step 2: Add Environment Variables

In Railway dashboard:
- `ANTHROPIC_API_KEY`
- `PROCESSING_API_KEY`
- `NODE_ENV=production`

### Step 3: Configure Storage

1. Add PostgreSQL (optional, for tracking jobs)
2. Add Volume:
   - Mount path: `/data`
   - Size: 50GB

### Step 4: Deploy

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway up
```

**Cost:** ~$7-10/month (pay-per-use)

---

## 4. Fly.io

### Step 1: Install Fly CLI

```bash
# macOS/Linux
curl -L https://fly.io/install.sh | sh

# Windows (with Scoop)
scoop install flyctl
```

### Step 2: Configure Fly

Create `fly.toml`:

```toml
app = "postforge-processing"
primary_region = "ord"  # Chicago

[build]
  dockerfile = "Dockerfile"

[[services]]
  internal_port = 4000
  protocol = "tcp"

  [[services.ports]]
    port = 80
    handlers = ["http"]
  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]

[env]
  NODE_ENV = "production"
  REQUIRE_AUTH = "true"

[mounts]
  source = "postforge_data"
  destination = "/data"
```

### Step 3: Deploy

```bash
# Login and launch
flyctl auth login
flyctl launch --ha=false  # Single instance to save cost

# Set secrets
flyctl secrets set ANTHROPIC_API_KEY=sk-ant-...
flyctl secrets set PROCESSING_API_KEY=your-secret-key

# Deploy
flyctl deploy
```

**Cost:** ~$5-7/month

---

## 5. AWS (for Scale)

### Step 1: Create ECS Task Definition

```json
{
  "family": "postforge-processing",
  "containerDefinitions": [
    {
      "name": "processing",
      "image": "your-ecr-repo:latest",
      "memory": 2048,
      "cpu": 512,
      "portMappings": [
        {
          "containerPort": 4000,
          "hostPort": 4000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "ANTHROPIC_API_KEY",
          "valueFrom": "arn:aws:secretsmanager:...:secret:anthropic-api-key"
        }
      ],
      "mountPoints": [
        {
          "sourceVolume": "efs",
          "containerPath": "/data"
        }
      ]
    }
  ],
  "volumes": [
    {
      "name": "efs",
      "efsVolumeConfiguration": {
        "filesystemId": "fs-12345678",
        "transitEncryption": "ENABLED"
      }
    }
  ]
}
```

### Step 2: Push Docker Image to ECR

```bash
# Create ECR repo
aws ecr create-repository --repository-name postforge-processing

# Build and push
docker build -t postforge-processing .
docker tag postforge-processing:latest your-account.dkr.ecr.us-east-1.amazonaws.com/postforge-processing:latest
docker push your-account.dkr.ecr.us-east-1.amazonaws.com/postforge-processing:latest
```

### Step 3: Create ECS Service

```bash
# Create Fargate cluster
aws ecs create-cluster --cluster-name postforge

# Create service
aws ecs create-service \
  --cluster postforge \
  --service-name processing \
  --task-definition postforge-processing \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}
```

**Cost:** ~$25-50/month

---

## 6. Self-Hosted VPS

### Step 1: Choose VPS Provider

- **Linode**: $5-20/month
- **Vultr**: $6-18/month
- **Hetzner**: €5-10/month (Europe)

Recommended: **2GB RAM, 50GB storage, Ubuntu 22.04**

### Step 2: Initial Setup

```bash
# SSH into server
ssh root@your-vps-ip

# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### Step 3: Deploy Application

```bash
# Clone repo
git clone https://github.com/your-username/postforge-processing.git
cd postforge-processing

# Create .env
nano .env
# Add all environment variables

# Create persistent volumes
mkdir -p /opt/postforge/{uploads,clips}
chmod 755 /opt/postforge/{uploads,clips}

# Start with Docker Compose
docker-compose up -d

# Setup auto-restart
docker update --restart=always postforge-processing
```

### Step 4: Configure Reverse Proxy (Nginx)

```bash
sudo apt install -y nginx

# Create config
sudo nano /etc/nginx/sites-available/processing.postforge.com
```

```nginx
upstream processing {
  server localhost:4000;
}

server {
  listen 80;
  server_name processing.postforge.com;

  location / {
    proxy_pass http://processing;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # Increase timeouts for video processing
    proxy_connect_timeout 300s;
    proxy_send_timeout 300s;
    proxy_read_timeout 300s;
  }
}
```

### Step 5: Enable HTTPS

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d processing.postforge.com

# Auto-renew
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### Step 6: Monitor Logs

```bash
# View server logs
docker logs -f postforge-processing

# Monitor disk usage
df -h /opt/postforge
du -sh /opt/postforge/*

# Setup log rotation
docker logs --tail 100 postforge-processing > /var/log/postforge.log
```

**Cost:** $5-20/month

---

## 7. Kubernetes (for High Traffic)

### Step 1: Create Deployment

`k8s/deployment.yaml`:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postforge-processing
  labels:
    app: postforge-processing
spec:
  replicas: 3
  selector:
    matchLabels:
      app: postforge-processing
  template:
    metadata:
      labels:
        app: postforge-processing
    spec:
      containers:
      - name: processing
        image: your-registry/postforge-processing:latest
        ports:
        - containerPort: 4000
        env:
        - name: NODE_ENV
          value: "production"
        - name: ANTHROPIC_API_KEY
          valueFrom:
            secretKeyRef:
              name: api-keys
              key: anthropic
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 4000
          initialDelaySeconds: 10
          periodSeconds: 10
        volumeMounts:
        - name: storage
          mountPath: /data
      volumes:
      - name: storage
        persistentVolumeClaim:
          claimName: postforge-pvc
```

### Step 2: Create Service

`k8s/service.yaml`:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: postforge-processing
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 4000
  selector:
    app: postforge-processing
```

### Step 3: Deploy

```bash
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml

# Check status
kubectl get pods
kubectl get svc
```

---

## Environment Variable Checklist

Before deploying, ensure:

- [ ] `ANTHROPIC_API_KEY` is set and valid
- [ ] `PROCESSING_API_KEY` is a secure random string (32+ chars)
- [ ] `NODE_ENV` is `production`
- [ ] `REQUIRE_AUTH` is `true`
- [ ] `/data` directory has 50GB+ free space
- [ ] FFmpeg is installed or available in Docker
- [ ] Python 3 + Whisper are available

---

## Performance Tuning

### For High Throughput

```env
# Increase Node.js memory
NODE_OPTIONS=--max-old-space-size=4096

# Use faster Whisper model
WHISPER_MODEL=tiny

# Lower quality for faster processing
FFMPEG_PRESET=fast
```

### For Best Quality

```env
# Use largest Whisper model
WHISPER_MODEL=medium

# Use slower, higher quality encoding
FFMPEG_PRESET=slow
```

---

## Monitoring

### Health Checks

```bash
# Check server is running
curl https://processing.postforge.com/health

# Monitor logs (Docker)
docker logs --follow --tail 50 postforge-processing

# Monitor disk usage
df -h /data
du -sh /data/*
```

### Automated Cleanup

```bash
# Add cron job to clean old files daily
0 2 * * * curl -X POST https://processing.postforge.com/cleanup \
  -H "x-api-key: $PROCESSING_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"maxAgeHours": 24}'
```

---

## Troubleshooting Deployment

### "Connection refused"
- Check firewall rules (port 4000 open)
- Check service is running: `docker ps`
- Check logs: `docker logs postforge-processing`

### "Out of disk space"
- Run cleanup: `POST /cleanup`
- Increase disk size on VPS
- Check what's using space: `du -sh /data/*`

### "API key invalid"
- Verify `ANTHROPIC_API_KEY` in environment
- Test with: `curl http://localhost:4000/health`
- Check error logs for details

### "Slow video processing"
- Use smaller Whisper model: `WHISPER_MODEL=tiny`
- Check CPU usage: `docker stats`
- Consider upgrading server resources

---

## Security Checklist

- [ ] Use HTTPS (get SSL cert)
- [ ] Change default `PROCESSING_API_KEY`
- [ ] Run as non-root user
- [ ] Set file permissions correctly
- [ ] Use environment variables for secrets (not in code)
- [ ] Keep dependencies updated
- [ ] Monitor logs for errors
- [ ] Enable Docker security scanning
- [ ] Use private Docker registry

---

## Next Steps

1. **Deploy to development**: Use local Docker or DigitalOcean
2. **Test end-to-end**: Upload videos, verify clips are generated
3. **Monitor**: Set up log aggregation and alerts
4. **Optimize**: Benchmark performance, adjust resource limits
5. **Scale**: Add more replicas or upgrade server as needed

Questions? Check README.md or logs for debugging info.
