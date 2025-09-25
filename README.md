# 🎯 QR Unique Number Generator

A web application that generates QR codes which create unique numbers when scanned. Perfect for events, contests, or any situation where you need to give unique numbers to people.

## ✨ Features

- **🔮 Magic QR Codes**: Generate QR codes that create unique numbers when scanned
- **📱 Mobile Optimized**: Beautiful display on mobile devices
- **🌐 Mobile Data Compatible**: Works anywhere with internet access
- **⚡ Real-time Updates**: Live statistics as people scan QR codes
- **🎲 Unique Numbers**: Each scan generates a never-repeated number (1-10,000)
- **📊 Statistics Dashboard**: Track used/remaining numbers in real-time

## 🚀 Quick Start

### Local Development
```bash
npm install
node server.js
```
Open: http://localhost:3000

### Public Deployment (Mobile Data Access)

#### Option 1: Render (Recommended - Free)
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Connect this repository
4. Create new Web Service:
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Environment**: `Node`

#### Option 2: Railway
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Deploy from GitHub repository

#### Option 3: Vercel
1. Go to [vercel.com](https://vercel.com)
2. Import GitHub repository

## 📱 Mobile Usage

Once deployed, you'll get a public URL like:
- `https://your-app-name.onrender.com`
- `https://your-app-name.railway.app`
- `https://your-app-name.vercel.app`

### How to Use:
1. **Open the URL on your phone** (works with mobile data!)
2. **Generate QR Code** - Creates a magic QR code
3. **Share QR Code** - Strangers can scan it with their phones
4. **Real-time Updates** - Your phone gets live statistics as people scan

## 🎯 Perfect For:
- **Event Registration**: Each attendee gets a unique number
- **Contest Entry**: Unique entry numbers for participants
- **Lottery/Ticket System**: Each scan creates a unique ticket
- **Queue Management**: Unique queue numbers for customers
- **Survey/Feedback**: Unique participant IDs

## 🛠️ Technical Details

- **Backend**: Node.js + Express
- **Real-time**: Socket.IO for live updates
- **QR Generation**: qrcode library
- **Storage**: JSON file for number tracking
- **Mobile**: Responsive design with animations

## 📊 API Endpoints

- `GET /` - Main application interface
- `GET /generate-qr` - Generate a new QR code
- `GET /scan` - Generate unique number when QR is scanned
- `GET /stats` - Get current statistics
- `POST /reset` - Reset used numbers (for testing)

## 🔧 Configuration

Edit `server.js` to modify:
- Number range (default: 1-10,000)
- Server port (default: 3000)
- Storage file location

## 📝 License

MIT License - Feel free to use for any purpose!
