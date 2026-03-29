# 🚨 MongoDB Not Running - Complete Fix Guide

## The Problem

Your InventoTrack app has **NO DATA** because MongoDB database is not running.

MongoDB must be installed and running for the app to store data.

---

## ✅ SOLUTION 1: Install MongoDB (Recommended)

### Download & Install

1. **Download MongoDB Community Edition:**
   - Go to: https://www.mongodb.com/try/download/community
   - Select: **Windows** platform
   - Version: **Latest (7.0+)**
   - Package: **MSI**

2. **Install MongoDB:**
   - Run the downloaded `.msi` file
   - Choose **"Complete"** installation
   - **IMPORTANT:** Check ✅ **"Install MongoDB as a Service"**
   - **IMPORTANT:** Check ✅ **"Run service as Network Service user"**
   - Click **Install**

3. **Verify Installation:**
   ```powershell
   # Check if MongoDB service is running
   Get-Service -Name "MongoDB"

   # Should show: Status "Running"
   ```

4. **If service isn't running, start it:**
   ```powershell
   Start-Service -Name "MongoDB"
   ```

### After MongoDB is Running

1. **Restart your backend server:**
   - Stop backend (Ctrl+C in terminal)
   - Start again: `npm run dev`
   - You should see: `MongoDB Connected ✓`

2. **Open setup.html and click "Initialize Database"**

3. **Refresh InventoTrack** - Data will appear!

---

## ✅ SOLUTION 2: Use MongoDB Atlas (Cloud - Free)

If you don't want to install MongoDB locally:

### Step 1: Create Free Cloud Database

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up (free tier)
3. Create a **FREE** cluster
4. **Whitelist your IP:** Click "Network Access" → "Add IP Address" → "Allow Access from Anywhere"
5. **Create Database User:** Click "Database Access" → "Add New User"
   - Username: `admin`
   - Password: `admin123` (or your choice)

### Step 2: Get Connection String

1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string (looks like):
   ```
   mongodb+srv://admin:admin123@cluster0.xxxxx.mongodb.net/inventotrack
   ```

### Step 3: Update .env File

Edit `backend/.env`:
```env
MONGO_URI=mongodb+srv://admin:admin123@cluster0.xxxxx.mongodb.net/inventotrack
```
(Replace with YOUR connection string)

### Step 4: Restart & Seed

1. Restart backend server
2. Open `setup.html` → Click "Initialize Database"
3. Refresh app!

---

## ✅ SOLUTION 3: Manual Data Entry (If MongoDB Can't Be Installed)

If you can't install MongoDB, add data through the UI:

### Add Products Manually:

1. Click **"Inventory"** → **"+ Add Product"**
2. Fill in details and save
3. Repeat for multiple products

**Sample Products to Add:**

| Name | SKU | Category | Price | Quantity | Min Stock |
|------|-----|----------|-------|----------|-----------|
| Wireless Mouse | WM-001 | Electronics | 29.99 | 100 | 20 |
| Keyboard | KB-002 | Electronics | 89.99 | 50 | 15 |
| Office Chair | OC-003 | Furniture | 199.99 | 30 | 5 |
| Desk Lamp | DL-004 | Furniture | 24.99 | 80 | 15 |
| Notebook | NB-005 | Stationery | 4.99 | 200 | 50 |

### Make Sales:

1. Go to **"Sales & Billing"**
2. Search product → Add to cart
3. Enter customer name
4. Complete sale

---

## 🎯 Quick Decision Tree

**Do you have admin rights on your PC?**
- ✅ **YES** → Install MongoDB Community (Solution 1)
- ❌ **NO** → Use MongoDB Atlas Cloud (Solution 2)

**Can't do either?**
- Use Solution 3 (Manual entry)

---

## 🔍 How to Check if MongoDB is Working

After installation, check connection:

1. **Open MongoDB Compass** (installed with MongoDB)
2. Connect to: `mongodb://127.0.0.1:27017`
3. You should see `inventotrack` database after seeding

**Or check in terminal:**
```powershell
# Test connection
mongosh

# You should see MongoDB shell open
```

---

## 📋 After MongoDB is Running - Quick Setup

```powershell
# 1. Restart backend
cd backend
npm run dev

# Should see: "MongoDB Connected ✓"

# 2. Open setup.html in browser
# Click "Initialize Database"

# 3. Refresh InventoTrack app
# You'll see data everywhere!
```

---

## ⚠️ Common Issues

### "MongoDB service not found"
- **Fix:** MongoDB isn't installed. Use Solution 1 or 2.

### "Failed to connect to MongoDB"
- **Fix:** Start MongoDB service
  ```powershell
  Start-Service -Name "MongoDB"
  ```

### "Connection timeout"
- **Fix:** Check if MongoDB is running:
  ```powershell
  Get-Process mongod
  ```

---

## 🎉 Success Checklist

- [ ] MongoDB installed/running OR Atlas connected
- [ ] Backend shows "MongoDB Connected ✓"
- [ ] Ran setup.html → Clicked "Initialize Database"
- [ ] App shows data on Dashboard
- [ ] Can see 10 products in Inventory
- [ ] Can create new sales

---

**Choose your solution and let me know if you need help with any step!**

Recommended: **Solution 1** if you have admin access, **Solution 2** otherwise.
