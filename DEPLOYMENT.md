# Guardia-AI Deployment Guide

Guide for deploying Guardia-AI to production environments.

## Cloud Deployment Options

### 1. Docker Deployment (AWS ECS, Azure Container Instances)

#### Build and Push Docker Images

```bash
# Tag images
docker-compose build
docker tag guardia-backend:latest your-registry/guardia-backend:v1.0.0
docker tag guardia-frontend:latest your-registry/guardia-frontend:v1.0.0

# Push to registry
docker push your-registry/guardia-backend:v1.0.0
docker push your-registry/guardia-frontend:v1.0.0
```

#### Deploy on AWS ECS

1. Create ECR repositories:
```bash
aws ecr create-repository --repository-name guardia-backend
aws ecr create-repository --repository-name guardia-frontend
```

2. Create ECS task definitions with above images
3. Create services and ALB
4. Configure RDS PostgreSQL

#### Deploy on Azure Container Instances

```bash
az container create \
  --resource-group myResourceGroup \
  --name guardia-backend \
  --image myregistry.azurecr.io/guardia-backend:v1.0.0 \
  --cpu 2 --memory 2 \
  --environment-variables \
    SPRING_PROFILES_ACTIVE=prod \
    DATABASE_URL=your-postgres-url
```

### 2. Traditional VPS Deployment

#### Ubuntu/Debian Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Java 21
sudo apt install -y openjdk-21-jdk-headless

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Create application user
sudo useradd -m guardia
sudo -u guardia mkdir -p /home/guardia/app
```

#### Deploy Backend

```bash
# Copy JAR to server
scp target/guardia-ai-backend-1.0.0.jar guardia@your-server:/home/guardia/app/

# Create systemd service
sudo tee /etc/systemd/system/guardia-backend.service > /dev/null <<EOF
[Unit]
Description=Guardia-AI Backend Service
After=network.target

[Service]
Type=simple
User=guardia
WorkingDirectory=/home/guardia/app
ExecStart=/usr/bin/java -jar guardia-ai-backend-1.0.0.jar
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable guardia-backend
sudo systemctl start guardia-backend
```

#### Deploy Frontend with Nginx

```bash
# Install Nginx
sudo apt install -y nginx

# Build frontend
npm run build

# Copy dist to Nginx
sudo cp -r dist/* /var/www/html/

# Configure Nginx
sudo cp nginx.conf /etc/nginx/sites-available/guardia
sudo ln -s /etc/nginx/sites-available/guardia /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 3. Railway.app Deployment

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize
railway init

# Set environment variables
railway variable set SPRING_PROFILES_ACTIVE prod
railway variable set JWT_SECRET your-secret
railway variable set DATABASE_URL postgresql://...

# Deploy
railway up
```

### 4. Heroku Deployment (Legacy)

```bash
# Create app
heroku create guardia-ai

# Set buildpacks
heroku buildpacks:add heroku/java
heroku buildpacks:add heroku/nodejs

# Set config vars
heroku config:set SPRING_PROFILES_ACTIVE=prod
heroku config:set JWT_SECRET=your-secret

# Deploy
git push heroku main
```

## Database Setup

### PostgreSQL Cloud Options

**AWS RDS:**
```bash
# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier guardia-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username guardia \
  --allocated-storage 20
```

**Azure Database for PostgreSQL:**
```bash
az postgres server create \
  --resource-group myResourceGroup \
  --name guardia-postgres-server \
  --admin-user guardiaadmin \
  --sku-name B_Gen5_1
```

**DigitalOcean Managed Database:**
- Create via dashboard
- Connection string provided automatically

### Database Migration

```sql
-- Connect to your production database
psql -h your-postgres-host -U guardia -d guardiadb

-- Tables auto-created by Spring JPA (application-prod.properties)
-- Verify tables exist:
\dt
```

## SSL/HTTPS Configuration

### Using Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --nginx -d your-domain.com

# Auto-renew
sudo systemctl enable certbot.timer
```

### Nginx SSL Config

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

## Monitoring & Logging

### Application Logs

```bash
# Backend logs
tail -f /var/log/guardia-backend.log

# System logs
journalctl -u guardia-backend -f
```

### Enable Logging in application-prod.properties

```properties
logging.level.com.guardiaai=INFO
logging.file.name=/opt/guardia/logs/app.log
logging.file.max-size=10MB
logging.file.max-history=30
```

### Monitoring Services

- **New Relic**: `newrelic.ini` agent setup
- **DataDog**: Docker labels in docker-compose.yml
- **Prometheus**: Add dependencies and /actuator/prometheus

## Backup Strategy

### PostgreSQL Backups

```bash
# Automated daily backup
0 2 * * * pg_dump -h localhost -U guardia -d guardiadb | gzip > /backups/guardia-$(date +\%Y\%m\%d).sql.gz
```

## Performance Optimization

### Backend Tuning

```properties
# application-prod.properties
spring.datasource.hikari.maximum-pool-size=20
spring.jpa.properties.hibernate.jdbc.batch_size=20
spring.jpa.properties.hibernate.query.in_clause_parameter_padding=true
```

### Frontend Optimization

```bash
# Enable gzip compression
# In nginx.conf
gzip on;
gzip_types text/plain text/css application/javascript;
gzip_min_length 1000;
```

## Scaling Considerations

- **Horizontal scaling**: Load balance multiple backend instances
- **Database**: Connection pooling, read replicas
- **Frontend**: CDN (CloudFront, Cloudflare)
- **Caching**: Redis for session/fraud rule cache

## Troubleshooting Production Issues

### Health Check

```bash
curl https://your-domain.com/api/dashboard/ping
# Should return: {"status":"online"}
```

### Database Connection Issues

```bash
# Check connection
psql -h your-db-host -U guardia -c "SELECT 1"

# Verify environment variables
echo $DATABASE_URL
```

### Certificate Issues

```bash
# Check cert expiry
openssl x509 -in /etc/letsencrypt/live/your-domain.com/fullchain.pem -text -noout | grep "Not After"
```

## Post-Deployment Checklist

- [ ] HTTPS enabled
- [ ] Database backups configured
- [ ] Monitoring alerts set up
- [ ] JWT_SECRET changed from default
- [ ] CORS configured for your domain
- [ ] Logging configured
- [ ] Error notifications enabled
- [ ] Rate limiting configured
- [ ] Load balancer health checks passing
- [ ] CDN configured (optional)

## Support & Issues

For deployment-specific issues, check:
1. Application logs
2. Database connectivity
3. Environment variables
4. Firewall rules
5. SSL certificates
