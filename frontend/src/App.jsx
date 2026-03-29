import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Purchases from './pages/Purchases';
import Sales from './pages/Sales';
import Analytics from './pages/Analytics';
import Customers from './pages/Customers';
import Returns from './pages/Returns';
import Reports from './pages/Reports';
import Layout from './components/Layout';
import { AuthProvider } from './context/AuthContext';
import { CustomerAuthProvider } from './context/CustomerAuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Portal Components
import CustomerLogin from './pages/portal/CustomerLogin';
import CustomerLayout from './pages/portal/CustomerLayout';
import CustomerDashboard from './pages/portal/CustomerDashboard';
import CustomerOrders from './pages/portal/CustomerOrders';
import CustomerProfile from './pages/portal/CustomerProfile';

function App() {
    return (
        <Router>
            <AuthProvider>
                <CustomerAuthProvider>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/portal/login" element={<CustomerLogin />} />

                        {/* Admin Protected Routes */}
                        <Route path="/" element={
                            <ProtectedRoute>
                                <Layout />
                            </ProtectedRoute>
                        }>
                            <Route index element={<Dashboard />} />
                            <Route path="products" element={<Products />} />
                            <Route path="purchases" element={<Purchases />} />
                            <Route path="sales" element={<Sales />} />
                            <Route path="analytics" element={<Analytics />} />
                            <Route path="customers" element={<Customers />} />
                            <Route path="returns" element={<Returns />} />
                            <Route path="reports" element={<Reports />} />
                        </Route>

                        {/* Customer Portal Routes */}
                        <Route path="/portal" element={
                            <CustomerLayout />
                        }>
                            <Route path="dashboard" element={<CustomerDashboard />} />
                            <Route path="orders" element={<CustomerOrders />} />
                            <Route path="profile" element={<CustomerProfile />} />
                        </Route>
                    </Routes>
                </CustomerAuthProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
