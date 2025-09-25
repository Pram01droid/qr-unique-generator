const express = require('express');
const QRCode = require('qrcode');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configuration for unique number generation
const CONFIG = {
  minRange: 1,
  maxRange: 10000,
  usedNumbersFile: 'usedNumbers.json'
};

// Load used numbers from file or initialize empty set
let usedNumbers = new Set();

try {
  if (fs.existsSync(CONFIG.usedNumbersFile)) {
    const data = fs.readFileSync(CONFIG.usedNumbersFile, 'utf8');
    const parsed = JSON.parse(data);
    usedNumbers = new Set(parsed.usedNumbers || []);
  }
} catch (error) {
  console.log('Initializing new used numbers file');
}

// Save used numbers to file
function saveUsedNumbers() {
  try {
    const data = {
      usedNumbers: Array.from(usedNumbers),
      lastUpdated: new Date().toISOString()
    };
    fs.writeFileSync(CONFIG.usedNumbersFile, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving used numbers:', error);
  }
}

// Broadcast statistics to all connected clients
function broadcastStats() {
  const totalNumbers = CONFIG.maxRange - CONFIG.minRange + 1;
  const usedCount = usedNumbers.size;
  const remainingCount = totalNumbers - usedCount;
  
  const stats = {
    totalNumbers,
    usedCount,
    remainingCount,
    range: {
      min: CONFIG.minRange,
      max: CONFIG.maxRange
    },
    percentage: ((usedCount / totalNumbers) * 100).toFixed(2)
  };
  
  io.emit('statsUpdate', stats);
  return stats;
}

// Generate unique number
function generateUniqueNumber() {
  const availableNumbers = CONFIG.maxRange - CONFIG.minRange + 1 - usedNumbers.size;
  
  if (availableNumbers <= 0) {
    throw new Error('All numbers in range have been used');
  }
  
  let randomNumber;
  do {
    randomNumber = Math.floor(Math.random() * (CONFIG.maxRange - CONFIG.minRange + 1)) + CONFIG.minRange;
  } while (usedNumbers.has(randomNumber));
  
  usedNumbers.add(randomNumber);
  saveUsedNumbers();
  
  // Broadcast updated statistics
  broadcastStats();
  
  return randomNumber;
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Generate QR code (no number generated yet)
app.get('/generate-qr', async (req, res) => {
  try {
    // Use the request host for dynamic URL generation
    const baseUrl = req.get('host') ? `${req.protocol}://${req.get('host')}` : `http://192.168.0.102:${PORT}`;
    const qrData = `${baseUrl}/scan`;
    
    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    res.json({
      success: true,
      qrCode: qrCodeDataURL,
      url: qrData,
      usedCount: usedNumbers.size,
      remainingCount: CONFIG.maxRange - CONFIG.minRange + 1 - usedNumbers.size,
      message: "Number will be generated when QR code is scanned",
      baseUrl: baseUrl
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Generate unique number when QR code is scanned
app.get('/scan', (req, res) => {
  try {
    const uniqueNumber = generateUniqueNumber();
    
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Unique Number Generated</title>
          <style>
              * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
              }
              
              body {
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  min-height: 100vh;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  padding: 20px;
              }
              
              .container {
                  background: white;
                  border-radius: 20px;
                  padding: 40px;
                  text-align: center;
                  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                  max-width: 400px;
                  width: 100%;
                  animation: slideIn 0.5s ease-out;
              }
              
              @keyframes slideIn {
                  from {
                      opacity: 0;
                      transform: translateY(30px);
                  }
                  to {
                      opacity: 1;
                      transform: translateY(0);
                  }
              }
              
              .number-display {
                  font-size: 4rem;
                  font-weight: bold;
                  color: #333;
                  margin: 20px 0;
                  text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
                  animation: pulse 2s infinite;
              }
              
              @keyframes pulse {
                  0% { transform: scale(1); }
                  50% { transform: scale(1.05); }
                  100% { transform: scale(1); }
              }
              
              .label {
                  font-size: 1.2rem;
                  color: #666;
                  margin-bottom: 30px;
              }
              
              .timestamp {
                  font-size: 0.9rem;
                  color: #999;
                  margin-top: 20px;
              }
              
              .icon {
                  font-size: 3rem;
                  margin-bottom: 20px;
                  animation: bounce 1s infinite;
              }
              
              @keyframes bounce {
                  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                  40% { transform: translateY(-10px); }
                  60% { transform: translateY(-5px); }
              }
              
              .congratulations {
                  background: #e8f5e8;
                  padding: 15px;
                  border-radius: 10px;
                  margin: 20px 0;
                  border-left: 4px solid #4caf50;
                  font-size: 0.9rem;
                  color: #2e7d32;
              }
              
              @media (max-width: 480px) {
                  .number-display {
                      font-size: 3rem;
                  }
                  .container {
                      padding: 30px 20px;
                  }
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="icon">🎯</div>
              <div class="label">Your Unique Number</div>
              <div class="number-display">${uniqueNumber}</div>
              <div class="congratulations">
                  ✨ Congratulations! This number was generated just for you and will never be repeated.
              </div>
              <div class="timestamp">Generated: ${new Date().toLocaleString()}</div>
          </div>
      </body>
      </html>
    `;
    
    res.send(html);
  } catch (error) {
    const errorHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Error</title>
          <style>
              body {
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
                  min-height: 100vh;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  padding: 20px;
              }
              .container {
                  background: white;
                  border-radius: 20px;
                  padding: 40px;
                  text-align: center;
                  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                  max-width: 400px;
                  width: 100%;
              }
              .error-icon {
                  font-size: 3rem;
                  margin-bottom: 20px;
              }
              .error-message {
                  color: #d63031;
                  font-size: 1.1rem;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="error-icon">⚠️</div>
              <div class="error-message">${error.message}</div>
          </div>
      </body>
      </html>
    `;
    res.status(500).send(errorHtml);
  }
});

// Keep the old endpoint for backward compatibility (direct number access)
app.get('/number/:number', (req, res) => {
  const number = parseInt(req.params.number);
  
  if (isNaN(number) || number < CONFIG.minRange || number > CONFIG.maxRange) {
    return res.status(400).send('Invalid number');
  }
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Unique Number</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            
            .container {
                background: white;
                border-radius: 20px;
                padding: 40px;
                text-align: center;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                max-width: 400px;
                width: 100%;
            }
            
            .number-display {
                font-size: 4rem;
                font-weight: bold;
                color: #333;
                margin: 20px 0;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
            }
            
            .label {
                font-size: 1.2rem;
                color: #666;
                margin-bottom: 30px;
            }
            
            .timestamp {
                font-size: 0.9rem;
                color: #999;
                margin-top: 20px;
            }
            
            .icon {
                font-size: 3rem;
                margin-bottom: 20px;
            }
            
            @media (max-width: 480px) {
                .number-display {
                    font-size: 3rem;
                }
                .container {
                    padding: 30px 20px;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="icon">🎯</div>
            <div class="label">Your Unique Number</div>
            <div class="number-display">${number}</div>
            <div class="timestamp">Generated: ${new Date().toLocaleString()}</div>
        </div>
    </body>
    </html>
  `;
  
  res.send(html);
});

// Get statistics
app.get('/stats', (req, res) => {
  const totalNumbers = CONFIG.maxRange - CONFIG.minRange + 1;
  const usedCount = usedNumbers.size;
  const remainingCount = totalNumbers - usedCount;
  
  res.json({
    totalNumbers,
    usedCount,
    remainingCount,
    range: {
      min: CONFIG.minRange,
      max: CONFIG.maxRange
    },
    percentage: ((usedCount / totalNumbers) * 100).toFixed(2)
  });
});

// Reset used numbers (for testing)
app.post('/reset', (req, res) => {
  usedNumbers.clear();
  saveUsedNumbers();
  res.json({ success: true, message: 'Used numbers reset successfully' });
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('📱 Client connected:', socket.id);
  
  // Send current stats to newly connected client
  socket.emit('statsUpdate', broadcastStats());
  
  socket.on('disconnect', () => {
    console.log('📱 Client disconnected:', socket.id);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`🚀 QR Unique Number Generator running on:`);
  console.log(`   Local:   http://localhost:${PORT}`);
  console.log(`   Network: http://192.168.0.102:${PORT}`);
  console.log(`📊 Statistics: ${usedNumbers.size} numbers used out of ${CONFIG.maxRange - CONFIG.minRange + 1} total`);
  console.log(`📱 Mobile devices can scan QR codes using: http://192.168.0.102:${PORT}`);
  console.log(`🌐 WebSocket enabled for real-time updates`);
});