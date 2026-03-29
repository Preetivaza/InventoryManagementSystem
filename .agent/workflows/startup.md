---
description: Complete startup guide for InventoTrack
---

# 🚀 InventoTrack - Complete Startup Guide

Follow these steps to run the application from scratch:

## Step 1: Start MongoDB

MongoDB must be running before anything else!

### Option A: Windows Service
```powershell
# Check MongoDB service name
Get-Service | findstr -i mongo

# Then start it (replace with actual service name)
net start MongoDB
# OR
net start MongoDBServer
```

### Option B: Manual Start
```powershell
# Navigate to MongoDB bin folder
cd "C:\Program Files\MongoDB\Server\7.0\bin"

# Start MongoDB
.\mongod.exe --dbpath "C:\data\db"
```

### Option C: Install & Start MongoDB
If MongoDB is not installed, download from: https://www.mongodb.com/try/download/community

## Step 2: Install Dependencies (First Time Only)

```powershell
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## Step 3: Seed Database (Optional but Recommended)

```powershell
cd backend
node seeder.js
```

**Expected output:**
```
✅ DATA SEEDING COMPLETE!
========================
👥 Users: 5
📦 Products: 30
🛒 Purchases: ~180
💰 Sales: ~220
📊 Total Revenue: $45,234.56
```

**If seeding fails:** The app will still work, just with less data.

## Step 4: Start Backend Server

```powershell
cd backend
npm run dev
```

**Expected output:**
```
Server running on port 5000
MongoDB Connected
```

## Step 5: Start Frontend Server

**Open a NEW terminal** and run:

```powershell
cd frontend
npm run dev
```

**Expected output:**
```
VITE v5.x.x  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h + enter to show help
```

## Step 6: Open Application

Open your browser and go to:
```
http://localhost:5173
```

**Or if port 5173 is busy:**
```
http://localhost:5174
```

## Step 7: Login

Use these credentials:

**Admin Account:**
- Email: `admin@example.com`
- Password: `123456`

**Other accounts:**
- Manager: `manager@example.com` / `123456`
- Staff: `staff@example.com` / `123456`

---

## 🎯 Quick Start (If Everything is Already Set Up)

```powershell
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev

# Browser: http://localhost:5173
```

---

## ✅ Verification Checklist

- [ ] MongoDB is running
- [ ] Backend server started (port 5000)
- [ ] Frontend server started (port 5173)
- [ ] Can access http://localhost:5173
- [ ] Can login with admin@example.com / 123456
- [ ] Dashboard shows data

---

## 🐛 Common Issues

### "MongoDB connection failed"
- **Solution**: Start MongoDB service or mongod process

### "Port 5000 already in use"
- **Solution**: Kill the process or change PORT in `.env`

### "Port 5173 already in use"
- **Solution**: Frontend will auto-use port 5174 or 5175

### "Cannot find module"
- **Solution**: Run `npm install` in both backend and frontend folders

### "Seeder timeout"
- **Solution**: Make sure MongoDB is running, then try again

---

## 🎨 What to Explore

1. **Dashboard** - See revenue, charts, statistics
2. **Inventory** - Browse 30 products
3. **Purchases** - View purchase history
4. **Sales** - Use POS system, create invoices
5. **Analytics** - AI insights, dead stock detection
6. **AI Assistant** - Click floating button (bottom-right)

---

## 🤖 Enable AI Features (Optional)

1. Get API key from https://platform.openai.com/api-keys
2. Add to `backend/.env`:
   ```
   OPENAI_API_KEY=sk-your-key-here
   ```
3. Restart backend server

---

**Enjoy InventoTrack!** 🌿✨
