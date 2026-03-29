# 🚀 InventoTrack Deployment Guide

## Production Checklist

### Pre-deployment
- [ ] Update all environment variables
- [ ] Set `NODE_ENV=production`
- [ ] Test all features locally
- [ ] Run security audit: `npm audit`
- [ ] Optimize images and assets
- [ ] Enable MongoDB Atlas IP whitelist

### Backend Deployment (Heroku/Railway/Render)

#### Option 1: Heroku
```bash
# Login to Heroku
heroku login

# Create app
heroku create inventotrack-api

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGO_URI=your_mongodb_atlas_uri
heroku config:set JWT_SECRET=your_production_secret

# Deploy
git push heroku main

# Check logs
heroku logs --tail
```

#### Option 2: Railway
1. Connect GitHub repository
2. Select `backend` as root directory
3. Add environment variables in Railway dashboard
4. Deploy automatically on push

#### Option 3: Render
1. Create new Web Service
2. Connect repository
3. Root directory: `backend`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables
7. Deploy

### Frontend Deployment

#### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend
cd frontend

# Deploy
vercel --prod

# Set environment variable
# VITE_API_URL=https://your-backend-url.com
```

#### Option 2: Netlify
```bash
# Build
cd frontend
npm run build

# Deploy via Netlify CLI
npm install netlify-cli -g
netlify deploy --prod --dir=dist
```

#### Option 3: GitHub Pages
```bash
# Build
npm run build

# Deploy dist folder
# (Use gh-pages or manual upload)
```

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/inventotrack
JWT_SECRET=super_secure_random_string_here
FRONTEND_URL=https://your-frontend-domain.com
```

#### Frontend (.env)
```env
VITE_API_URL=https://your-backend-domain.com
```

### Database Setup (MongoDB Atlas)

1. Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create database user
3. Whitelist IP addresses (or use 0.0.0.0/0 for all)
4. Get connection string
5. Replace in your backend .env

### Post-Deployment

#### Test API
```bash
curl https://your-backend-url.com/api/users/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"123456"}'
```

#### Monitor
- Set up uptime monitoring (e.g., UptimeRobot, Pingdom)
- Enable error tracking (e.g., Sentry)
- Monitor database performance

### Security Best Practices

1. **Use strong JWT secrets** (32+ characters)
2. **Enable CORS** only for your frontend domain
3. **Use HTTPS** everywhere
4. **Rate limiting** on login endpoints
5. **Sanitize inputs** to prevent injection
6. **Regular backups** of MongoDB
7. **Keep dependencies updated**

### Performance Optimization

#### Backend
- Enable gzip compression
- Use Redis for session storage (optional)
- Implement API caching
- Database indexing on frequently queried fields

#### Frontend
- Code splitting
- Lazy loading routes
- Image optimization
- CDN for static assets
- Enable service worker (PWA)

### CI/CD Pipeline

#### GitHub Actions Example
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{secrets.HEROKU_API_KEY}}
          heroku_app_name: "inventotrack-api"
          heroku_email: "your-email@example.com"

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID}}
          vercel-project-id: ${{ secrets.PROJECT_ID}}
```

### Troubleshooting

#### "Cannot connect to database"
- Check MongoDB Atlas IP whitelist
- Verify connection string
- Ensure network access is configured

#### "CORS Error"
- Update CORS configuration in `server.js`
- Add frontend URL to allowed origins

#### "JWT Error"
- Ensure JWT_SECRET matches between sessions
- Check token expiration settings

### Maintenance

#### Regular Tasks
- [ ] Weekly dependency updates
- [ ] Monthly security audits
- [ ] Database backups (automated)
- [ ] Performance monitoring
- [ ] User feedback collection

#### Scaling
- Horizontal scaling with load balancer
- Database sharding for large datasets
- Caching layer (Redis)
- CDN for global distribution

---

**Happy Deploying! 🚀**

Need help? Check the main [README.md](./README.md) or open an issue.
