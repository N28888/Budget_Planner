# 💰 Budget Tracker

[English](README.md) | [中文](README_CN.md)

A full-featured personal budget management application with multi-device sync, dual-currency conversion, and PWA installation support.

## ✨ Features

- 💰 **Monthly Budget Management** - Set and track monthly budgets, view remaining balance in real-time
- 💱 **Dual Currency Support** - Support for 7 currencies with real-time exchange rates (auto-updates hourly)
- 📊 **Expense Tracking** - Record daily expenses, preserve exchange rates at time of entry, editable
- 🛍️ **Wishlist** - Track items you want to buy, tax calculation support, automatic currency conversion
- 👤 **User System** - Register/login, cloud data storage, multi-device sync
- 📱 **PWA Support** - Installable as an app, fullscreen experience, no address bar
- 🎨 **Modern UI** - Dark theme, glassmorphism effects, smooth animations
- 🔄 **Offline Cache** - Service Worker support, partial offline functionality

## 📱 Install as App (PWA)

### iOS (iPhone/iPad)

1. Open the webpage in Safari
2. Tap the "Share" button at the bottom
3. Select "Add to Home Screen"
4. Done! Open from home screen, no address bar

### Android

1. Open the webpage in Chrome
2. Tap the "Install" prompt that appears
3. Or tap menu → "Install app"
4. Done! App appears in app list

### Desktop (Chrome/Edge)

1. Open the webpage
2. Click the "Install" icon ⊕ in the address bar
3. Click "Install" to confirm
4. Done! Runs in standalone window

## 💻 Tech Stack

### Frontend

- HTML5 / CSS3 / JavaScript
- PWA (Progressive Web App)
- Service Worker (offline cache)
- Responsive design

### Backend

- Node.js + Express
- JWT authentication
- JSON file storage

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Start server
npm start

# Access application
http://localhost:3000/auth.html
```

## 🌐 Deploy to Server

```bash
# Run deployment script
./deploy-to-server.sh
```

The script will automatically:

- Package the project
- Upload to server
- Install dependencies
- Start PM2 process
- Configure auto-restart

## 💱 Supported Currencies

- 🇨🇳 CNY (Chinese Yuan)
- 🇺🇸 USD (US Dollar)
- 🇪🇺 EUR (Euro)
- 🇬🇧 GBP (British Pound)
- 🇯🇵 JPY (Japanese Yen)
- 🇭🇰 HKD (Hong Kong Dollar)
- 🇨🇦 CAD (Canadian Dollar)
  You are more than welcome to create [Issues](https://github.com/N28888/Budget_Planner/issues) if you need more currency.

## ⚙️ Environment Variables

Create a `.env` file:

```env
PORT=3000
JWT_SECRET=your-secret-key-here
NODE_ENV=production
```

## 📂 Project Structure

```
Budget_Planner/
├── public/              # Frontend files
│   ├── auth.html       # Login/Register page
│   ├── index.html      # Main application page
│   ├── auth.css        # Login page styles
│   ├── style.css       # Main app styles
│   ├── auth.js         # Login logic
│   ├── app.js          # Main app logic
│   ├── manifest.json   # PWA configuration
│   ├── service-worker.js  # Offline cache
│   └── icons/          # App icons
├── server.js           # Backend server
├── package.json        # Project configuration
├── ecosystem.config.js # PM2 configuration
└── deploy-to-server.sh # Deployment script
```

## 🎯 User Guide

1. **Register Account** - First-time visitors need to register
2. **Set Budget** - Set monthly budget on overview page
3. **Track Expenses** - Add daily expenses on expenses page
4. **Manage Wishlist** - Add items you want to buy on wishlist page
5. **Multi-device Sync** - Login on any device, data syncs automatically

## 🔒 Security Features

- Password encryption using bcrypt
- JWT Token authentication
- Mandatory secret key in production
- Data isolation (each user independent)

## 📊 Common Commands

```bash
# Check service status
ssh users@server 'pm2 status'

# View logs
ssh users@server 'pm2 logs budget-tracker'

# Restart service
ssh users@server 'pm2 restart budget-tracker'

# Update code
./deploy-to-server.sh
```

## 🐛 Troubleshooting

### Service Won't Start

```bash
# Check logs
pm2 logs budget-tracker --lines 50

# Check port usage
lsof -i :3000
```

### PWA Won't Install

- Ensure using HTTPS (or localhost)
- Check if manifest.json is correct
- Clear browser cache and retry

## 📝 Changelog

### v1.0.1 (2025-11-10)

- ✅ User registration/login system
- ✅ Monthly budget management
- ✅ Expense tracking (editable)
- ✅ Wishlist (tax calculation support)
- ✅ Dual currency real-time conversion
- ✅ PWA support
- ✅ Multi-device data sync
- ✅ Responsive design

## 👨‍💻 Author: [N28888](https://github.com/N28888)

Budget Tracker - Making financial management easier

---

**⭐ If you find this useful, please Star!**
