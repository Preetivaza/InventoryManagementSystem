# 🌿 InventoTrack - AI-Powered Inventory Management System

A beautiful, full-featured inventory management system with **embedded AI capabilities**, built with the MERN stack and a stunning green/teal theme.

![Version](https://img.shields.io/badge/version-2.0.0-success)
![License](https://img.shields.io/badge/license-MIT-blue)
![AI](https://img.shields.io/badge/AI-Enabled-purple)

## ✨ Features

### 🤖 **AI-Powered Intelligence** (NEW!)
- **AI Chatbot Assistant** - Ask questions about inventory in natural language
- **Smart Reorder Recommendations** - AI suggests optimal restock quantities
- **Demand Forecasting** - Predict future sales with machine learning
- **Anomaly Detection** - Automatically detect unusual patterns
- Works with **GPT-4** or falls back to rule-based algorithms

### 🔐 Authentication & Security
- Secure JWT-based authentication
- Role-based access control (Admin/Manager/Staff)
- Protected routes and API endpoints

### 📊 Dashboard
- Real-time business metrics
- Revenue tracking
- Low stock alerts
- Interactive charts (Sales Forecast, Top Products)
- Category distribution visualization

### 📦 Inventory Management
- Complete CRUD operations for products
- Search and filter functionality
- Stock level monitoring
- Low stock indicators
- Product categorization
- SKU management

### 📈 Purchase & Restock
- Record new purchases from suppliers
- Automatic stock updates
- Purchase history tracking
- Supplier management
- Cost tracking
- Monthly purchase analytics

### 💰 Sales & POS System
- Real-time product search
- Shopping cart functionality
- Stock validation
- Customer management
- Invoice generation
- Transaction history
- Print-ready invoices

### 📉 Analytics & Insights
- Dead stock detection
- Category distribution analysis
- Sales trends
- Inventory intelligence
- Smart reorder suggestions
- Performance metrics

## 🎨 Design

Beautiful, modern UI with:
- Custom green/teal color palette
- Smooth animations with Framer Motion
- Responsive design
- Glass-morphism effects
- Professional charts (Chart.js)
- Intuitive navigation

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **React Router v6** - Routing
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Chart.js** - Data visualization
- **Lucide React** - Icons
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing

## 📋 Installation

### Prerequisites
- Node.js (v20+)
- MongoDB (local or Atlas)
- npm or yarn

### Setup

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd InventoTrack
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Install frontend dependencies**
```bash
cd ../frontend
npm install
```

4. **Environment Configuration**

Create `backend/.env`:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
```

5. **Seed the database** (Optional)
```bash
cd backend
npm run seed
```

This creates a sample admin user:
- Email: `admin@example.com`
- Password: `123456`

6. **Start the application**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

Visit: `http://localhost:5173`

## 🚀 Usage

### Login
Use the demo credentials or create your own account:
- **Admin**: admin@example.com / 123456

### Managing Products
1. Navigate to **Inventory**
2. Click **Add Product**
3. Fill in product details (name, SKU, price, stock, category)
4. Save

### Recording Purchases
1. Navigate to **Purchases**
2. Click **New Purchase**
3. Select product, enter quantity, supplier, and cost
4. Stock is automatically updated!

### Making Sales
1. Navigate to **Sales & Billing**
2. Search for products
3. Add to cart
4. Enter customer name
5. Complete sale - invoice is generated

### Viewing Analytics
1. Navigate to **Analytics**
2. View dead stock items
3. Check category distribution
4. Get smart reorder insights

## 📁 Project Structure

```
InventoTrack/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── analyticsController.js
│   │   ├── productController.js
│   │   ├── saleController.js
│   │   └── userController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── Product.js
│   │   ├── Purchase.js
│   │   ├── Sale.js
│   │   └── User.js
│   ├── routes/
│   │   ├── analyticsRoutes.js
│   │   ├── productRoutes.js
│   │   ├── purchaseRoutes.js
│   │   ├── saleRoutes.js
│   │   └── userRoutes.js
│   ├── seeder.js
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Analytics.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── Purchases.jsx
│   │   │   └── Sales.jsx
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

## 🎨 Color Palette

```css
/* Green/Teal Theme */
--teal-darkest: #051F20
--teal-darker: #0B2B26
--teal-dark: #163932
--teal-medium: #235347
--sage-green: #8EB69B
--sage-light: #9FD2A7
--mint-light: #C8E8CE
--mint-lightest: #DAF1DE
```

## 🔑 API Endpoints

### Authentication
- `POST /api/users/login` - Login
- `POST /api/users/register` - Register
- `GET /api/users/profile` - Get profile

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Purchases
- `GET /api/purchases` - Get all purchases
- `POST /api/purchases` - Record purchase
- `GET /api/purchases/stats` - Get statistics

### Sales
- `GET /api/sales` - Get all sales
- `POST /api/sales` - Create sale
- `GET /api/sales/:id/invoice` - Get invoice

### Analytics
- `GET /api/analytics/dashboard` - Dashboard stats
- `GET /api/analytics/dead-stock` - Dead stock items
- `GET /api/analytics/forecast` - Sales forecast
- `GET /api/analytics/top-selling` - Top products

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test
```

## 📦 Deployment

### Backend (e.g., Heroku)
1. Set environment variables
2. Deploy:
```bash
git push heroku main
```

### Frontend (e.g., Vercel/Netlify)
1. Build:
```bash
cd frontend
npm run build
```
2. Deploy the `dist` folder

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to branch
5. Open a pull request

## 📄 License

MIT License - feel free to use for personal or commercial projects!

## 👨‍💻 Author

Built with ❤️ by Invora Team

## 🙏 Acknowledgments

- Tailwind CSS for the styling framework
- Chart.js for beautiful data visualization
- Framer Motion for smooth animations
- Lucide for the icon library

---

**InventoTrack** - Smart inventory management made beautiful. 🌿✨
