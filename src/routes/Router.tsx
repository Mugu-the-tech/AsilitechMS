import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate} from "react-router-dom";

import AuthForm from "../pages/Login";
import AuthContext from './AuthContext'; 
import AdminLayout from '../components/layout/AdminLayout';
import Dashboard from '../pages/DashBoard';
import Inventory from '../pages/Inventory';
import Sales from '../pages/Sales';
import AddVendorComponent from '../vendors/Addvendor';
import VendorTable from '../vendors/Vendors';
import VendorUpdatePage from '../vendors/VendorUpdate';
import AddMarketComponent from '../markets/AddMarket';
import MarketTable from '../markets/Market';
import CustomerTable from '../customers/customers';
import MarketUpdatePage from '../markets/MarketUpdate';

const RouterPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Login handler
  const login = () => {
    setIsAuthenticated(true);
  };

  // Logout handler
  const logout = () => {
    setIsAuthenticated(false);
  };

  // Protected Route Component
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    return isAuthenticated ? (
      <>{children}</>
    ) : (
      <Navigate to="/login" replace />
    );
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<AuthForm />} />
          
          {/* Protected Routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            } 
          >
            {/* Nested routes inside AdminLayout */}
            <Route index element={<Dashboard />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="clients" element={<CustomerTable/>}/>
             <Route path='sales' element={<Sales/>}/>
            <Route path='vendors/add' element={<AddVendorComponent/>}/>
            <Route path='vendors' element={<VendorTable/>}/>
            <Route path="/vendors/edit/:id" element={<VendorUpdatePage />} />
            <Route path='markets' element={<MarketTable/>}/>
            <Route path="/markets/add" element={<AddMarketComponent/>}/>
            <Route path="/markets/edit/:id" element={<MarketUpdatePage/>}/>
          </Route>
          
          {/* Redirect to login for unknown routes */}
          <Route 
            path="*" 
            element={isAuthenticated ? <Navigate to="/" /> : <Navigate to="/login" />} 
          />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
};

export default RouterPage;