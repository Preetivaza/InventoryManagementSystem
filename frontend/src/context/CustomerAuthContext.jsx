import { createContext, useContext, useState } from 'react';
import axios from 'axios';

const CustomerAuthContext = createContext();

const BASE = `${import.meta.env.VITE_API_URL}/api`;

export const CustomerAuthProvider = ({ children }) => {
    const stored = JSON.parse(localStorage.getItem('customerInfo') || 'null');
    const [customerInfo, setCustomerInfo] = useState(stored);

    const login = async (email, password) => {
        const { data } = await axios.post(`${BASE}/portal/login`, { email, password });
        localStorage.setItem('customerInfo', JSON.stringify(data));
        setCustomerInfo(data);
        return data;
    };

    const logout = () => {
        localStorage.removeItem('customerInfo');
        setCustomerInfo(null);
    };

    const token = customerInfo?.token;

    const portalApi = axios.create({ baseURL: BASE });
    portalApi.interceptors.request.use(cfg => {
        if (token) cfg.headers.Authorization = `Bearer ${token}`;
        return cfg;
    });

    return (
        <CustomerAuthContext.Provider value={{ customerInfo, login, logout, portalApi }}>
            {children}
        </CustomerAuthContext.Provider>
    );
};

export const useCustomerAuth = () => useContext(CustomerAuthContext);
