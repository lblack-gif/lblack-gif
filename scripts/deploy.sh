#!/bin/bash

# Production Deployment Script
echo "🚀 Starting production deployment..."

# Load environment variables
if [ -f .env.production ]; then
    export $(cat .env.production | xargs)
fi

# Pre-deployment checks
echo "🔍 Running pre-deployment checks..."
node scripts/pre-deployment-check.js
if [ $? -ne 0 ]; then
    echo "❌ Pre-deployment checks failed. Aborting deployment."
    exit 1
fi

# Build the application
echo "🏗️ Building application..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed. Aborting deployment."
    exit 1
fi

# Deploy to Vercel
echo "📦 Deploying to Vercel..."
vercel --prod --yes

# Post-deployment health check
echo "🏥 Running health check..."
sleep 30  # Wait for deployment to be ready
curl -f https://your-domain.vercel.app/api/health || {
    echo "❌ Health check failed"
    exit 1
}

echo "✅ Deployment completed successfully!"
echo "🌐 Your app is live at: https://your-domain.vercel.app"
