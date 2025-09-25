#!/bin/bash

echo "🚀 Deploying QR Unique Number Generator..."

# Option 1: Deploy to Render (Recommended)
echo "📱 For mobile data access, deploy to Render:"
echo "1. Go to https://render.com"
echo "2. Sign up with GitHub"
echo "3. Connect this repository"
echo "4. Create new Web Service with these settings:"
echo "   - Build Command: npm install"
echo "   - Start Command: node server.js"
echo "   - Environment: Node"
echo ""
echo "5. After deployment, you'll get a URL like:"
echo "   https://your-app-name.onrender.com"
echo ""
echo "📱 Then you can:"
echo "- Open the URL on your phone (works with mobile data!)"
echo "- Generate QR codes"
echo "- Share with strangers who can scan with their phones"
echo "- Get real-time statistics updates"
echo ""
echo "✨ Features:"
echo "✅ Mobile data compatible"
echo "✅ Real-time statistics"
echo "✅ Unique number generation"
echo "✅ Beautiful mobile display"

# Test local server
echo ""
echo "🧪 Testing local server..."
if curl -s http://localhost:3000/generate-qr > /dev/null; then
    echo "✅ Local server is running at http://localhost:3000"
else
    echo "❌ Local server not running. Start with: node server.js"
fi
