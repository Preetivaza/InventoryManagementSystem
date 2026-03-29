# 🎲 How to Seed Dummy Data - Quick Guide

## Your Enhanced Seeder is Ready!

I've created a comprehensive seeder with **rich dummy data**:

### What's Included:
- ✅ **5 Users** (Admin, Managers, Staff)
- ✅ **30 Products** across 7 categories
- ✅ **~180 Purchases** (60 days history)
- ✅ **~200+ Sales** (45 days with variety)
- ✅ **Realistic patterns** (more sales on weekends!)

---

## 🚀 Quick Start

### Option 1: Using npm script
```bash
cd backend
npm run seed
```

### Option 2: Direct node command
```bash
cd backend
node seeder.js
```

---

## ⚠️ Prerequisites

### MongoDB Must Be Running!

**Check if MongoDB is running:**
```bash
# Windows
net start MongoDB

# Or check services
tasklist | findstr mongod
```

**If NOT running, start it:**

#### Method 1: Windows Service
```bash
net start MongoDB
```

#### Method 2: Manual Start
```bash
# Navigate to MongoDB bin folder (usually):
cd C:\Program Files\MongoDB\Server\7.0\bin

# Start MongoDB
mongod
```

#### Method 3: Using MongoDB Compass
- Open MongoDB Compass
- Connect to `mongodb://127.0.0.1:27017`
- Leave it running

---

## 📊 What the Seeder Creates

### Users (5 total)
| Name | Email | Password | Role |
|------|-------|----------|------|
| Admin User | admin@example.com | 123456 | admin |
| Sarah Johnson | manager@example.com | 123456 | manager |
| Michael Chen | staff@example.com | 123456 | staff |
| Emily Rodriguez | emily@example.com | 123456 | staff |
| David Kim | david@example.com | 123456 | manager |

### Products (30 total)
- **Electronics** (7): Mouse, Keyboard, Monitor, USB-C Hub, Earbuds, Laptop Stand, Smart Speaker
- **Furniture** (3): Office Chair, Standing Desk, Desk Lamp, Filing Cabinet
- **Clothing** (4): T-Shirt, Jeans, Hoodie, Running Shoes
- **Books** (3): Python Programming, Business Management, Cookbook
- **Sports** (4): Yoga Mat, Dumbbell Set, Water Bottle, Resistance Bands
- **Home** (4): Coffee Maker, Blender, Cookware Set
- **Stationery** (5): Notebooks, Pens, Desk Organizer, Sticky Notes, Calendar

### Sales (~200+ transactions)
- **45 days** of sales history
- **Multiple items** per transaction (1-4 products)
- **Realistic patterns**: More sales on weekends
- **20 different customers**
- **Varied times** (9 AM - 7 PM)

### Purchases (~180 records)
- **60 days** of purchase history
- **8 different suppliers**
- **Bulk orders** (10-60 units)
- **Realistic pricing** (50-80% of retail)

---

## 📈 Expected Output

When seeding completes, you'll see:
```
✅ DATA SEEDING COMPLETE!
========================
👥 Users: 5
📦 Products: 30
🛒 Purchases: ~180
💰 Sales: ~220
📊 Total Revenue: $45,234.56
💵 Total Purchase Cost: $28,456.78
💸 Gross Profit: $16,777.78
========================

🌿 Ready to use InventoTrack!
```

---

## 🧪 Verify the Data

### Method 1: Check in the App
1. Open http://localhost:5174
2. Login: `admin@example.com` / `123456`
3. Check each page:
   - **Dashboard**: Should show revenue, products, charts
   - **Inventory**: 30 products listed
   - **Purchases**: ~180 purchase records
   - **Sales**: ~220 sales transactions
   - **Analytics**: Dead stock, category distribution

### Method 2: Check in MongoDB Compass
1. Open MongoDB Compass
2. Connect to `mongodb://127.0.0.1:27017`
3. Select `inventotrack` database
4. Check collections:
   - `users`: 5 documents
   - `products`: 30 documents
   - `purchases`: ~180 documents
   - `sales`: ~220 documents

---

## 🔄 Re-seed (Clear and Start Fresh)

To clear all data and re-seed:

```bash
# Destroy all data first
node seeder.js -d

# Then import fresh data
node seeder.js
```

Or just run the import (it clears automatically):
```bash
node seeder.js
```

---

## 🐛 Troubleshooting

### Error: "MongoDB connection timed out"
**Solution:**
```bash
# Start MongoDB
net start MongoDB

# Then try seeding again
node seeder.js
```

### Error: "ENOSPC: no space left on device"
**Solution:**
- Free up disk space (delete temp files, empty recycle bin)
- Clear npm cache: `npm cache clean --force`

### Error: "Cannot find module './data/products.js'"
**Solution:**
- Make sure you're in the `backend` folder
- Check that `data/products.js` and `data/users.js` exist

### Seeder runs but no data in app
**Solution:**
1. Check database connection in `.env`
2. Verify MongoDB is running
3. Try destroying and re-seeding:
   ```bash
   node seeder.js -d
   node seeder.js
   ```

### "Data already exists" warning
**Solution:**
- The seeder automatically clears existing data
- Just run it again
- Or manually clear: `node seeder.js -d`

---

## 💡 Tips

1. **Before seeding**: Make sure the backend server is STOPPED
   ```bash
   # Stop the server (Ctrl+C in terminal)
   # Then seed
   node seeder.js
   # Then start server again
   npm run dev
   ```

2. **Quick test**: After seeding, the admin login is:
   - Email: `admin@example.com`
   - Password: `123456`

3. **AI Features**: With all this data, the AI will have lots to analyze!
   - Try asking: "Which products should I reorder?"
   - Check Analytics page for AI insights

4. **Customize**: Edit `backend/data/products.js` to add your own products

---

## 📝 Summary

```bash
# Full seeding process:
cd backend
node seeder.js

# Wait for completion (10-20 seconds)
# Then login and explore your data!
```

---

**Your database is now loaded with rich, realistic dummy data for testing!** 🎉

All charts, analytics, and AI features will have plenty of data to work with!
