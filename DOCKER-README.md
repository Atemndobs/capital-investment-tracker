# Docker Deployment Guide

This guide covers Docker deployment for the Capital Investment Tracker PWA application.

## 🐳 **Docker Configuration Overview**

### Production Setup
- **Dockerfile**: Multi-stage build with Node.js 20 Alpine and Nginx
- **docker-compose.yml**: Production deployment configuration
- **nginx.conf**: Optimized for PWA with service worker support

### Development Setup
- **Dockerfile.dev**: Development container with hot reload
- **docker-compose.dev.yml**: Development and preview environments

## 🚀 **Quick Start**

### Production Deployment
```bash
# Build and start the production container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

### Development Environment
```bash
# Start development server
docker-compose -f docker-compose.dev.yml up web-dev

# Start preview server (for PWA testing)
docker-compose -f docker-compose.dev.yml --profile preview up web-preview

# Start both development and preview
docker-compose -f docker-compose.dev.yml --profile preview up
```

## 📋 **Configuration Details**

### Production Container (docker-compose.yml)
- **Port**: 5533 → 80 (configurable)
- **Image**: `atemndobs/capital-tracker-amd64:v0.1`
- **Health Check**: Validates PWA manifest availability
- **Environment**: Production optimized with PWA enabled
- **Volumes**: Environment file mounted for runtime config

### Development Container (docker-compose.dev.yml)
- **Ports**: 
  - 5173 (Vite dev server)
  - 4173 (Vite preview)
  - 4174 (Preview with production build)
- **Hot Reload**: File watching enabled with volume mounts
- **PWA Testing**: Preview profile for testing PWA functionality

## 🔧 **Environment Variables**

### Required Variables (.env)
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# PWA Configuration
VITE_PWA_ENABLED=true
PWA_ENABLED=true
NODE_ENV=production
```

### Docker-Specific Variables
- `NODE_ENV`: Set to 'production' or 'development'
- `CHOKIDAR_USEPOLLING`: Enables file watching in Docker (dev only)
- `VITE_PWA_ENABLED`: Enables PWA features in Vite build

## 🏗️ **Build Process**

### Production Build
1. **Stage 1 (Build)**:
   - Uses Node.js 20 Alpine for security and size
   - Installs all dependencies (including dev dependencies)
   - Runs `npm run build` to create optimized PWA build
   - Generates service worker and PWA assets

2. **Stage 2 (Production)**:
   - Uses Nginx Alpine for serving static files
   - Copies built assets from build stage
   - Configures Nginx for PWA support
   - Sets up proper caching headers

### Development Build
- Single-stage Node.js container
- Mounts source code as volume for hot reload
- Runs Vite dev server with PWA plugin
- Supports both development and preview modes

## 🌐 **Nginx Configuration**

### PWA-Specific Features
- **Service Worker Support**: Proper headers and caching
- **Manifest Handling**: Correct MIME types and cache control
- **CORS Headers**: Enables cross-origin requests
- **Security Headers**: XSS protection, content type options
- **Asset Caching**: Long-term caching for static assets

### Cache Strategy
- **Static Assets**: 1 year cache with immutable flag
- **Service Worker**: No cache (always fresh)
- **Manifest**: No cache (always fresh)
- **HTML**: No cache (always fresh)
- **Workbox Files**: Long-term cache with immutable flag

## 🔍 **Health Checks**

### Production Health Check
```bash
wget --spider --quiet http://localhost/manifest.webmanifest
```
- Validates that the PWA manifest is accessible
- Ensures Nginx is serving files correctly
- Runs every 30 seconds with 3 retries

### Development Health Check
```bash
wget --spider --quiet http://localhost:5173
```
- Validates that Vite dev server is running
- Ensures development environment is accessible

## 🐛 **Troubleshooting**

### Common Issues

#### PWA Not Installing
```bash
# Check if manifest is accessible
curl -I http://localhost:5533/manifest.webmanifest

# Check service worker
curl -I http://localhost:5533/sw.js

# View container logs
docker-compose logs web
```

#### Build Failures
```bash
# Check build logs
docker-compose logs web

# Rebuild without cache
docker-compose build --no-cache

# Check disk space
docker system df
```

#### Environment Variables Not Loading
```bash
# Verify .env file is mounted
docker-compose exec web ls -la /usr/share/nginx/html/.env

# Check environment variables
docker-compose exec web env | grep VITE
```

### Performance Issues
```bash
# Check container resource usage
docker stats capital-tracker

# Check Nginx access logs
docker-compose exec web tail -f /var/log/nginx/access.log

# Check Nginx error logs
docker-compose exec web tail -f /var/log/nginx/error.log
```

## 🔒 **Security Considerations**

### Production Security
- Uses Alpine Linux for minimal attack surface
- Non-root user in container
- Security headers configured in Nginx
- No unnecessary packages installed

### Environment Security
- Environment variables loaded from .env file
- Sensitive data not baked into image
- .dockerignore prevents sensitive files from being copied

## 📊 **Monitoring**

### Container Health
```bash
# Check container status
docker-compose ps

# View health check status
docker inspect capital-tracker --format='{{.State.Health.Status}}'

# Monitor resource usage
docker stats --no-stream capital-tracker
```

### Application Monitoring
- Health check endpoint: `/manifest.webmanifest`
- Service worker status: `/sw.js`
- Application logs: `docker-compose logs -f`

## 🚀 **Deployment Commands**

### Production Deployment
```bash
# Pull latest changes
git pull origin main

# Rebuild and deploy
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Verify deployment
docker-compose ps
curl -I http://localhost:5533/manifest.webmanifest
```

### Development Testing
```bash
# Test PWA build locally
docker-compose -f docker-compose.dev.yml --profile preview up web-preview

# Access preview at http://localhost:4174
# Test PWA installation in browser
```

## 📝 **Notes**

- The production image is optimized for size and security
- PWA features require HTTPS in production (use reverse proxy)
- Service worker updates automatically on new deployments
- All PWA assets are generated during build process
