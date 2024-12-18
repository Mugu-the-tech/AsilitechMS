import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate} from "react-router-dom";

import AuthForm from "../pages/Login";
import AuthContext from './AuthContext'; 
import AdminLayout from '../components/layout/AdminLayout';
import Dashboard from '../pages/DashBoard';
import Sales from '../pages/Sales';
import AddVendorComponent from '../vendors/Addvendor';
import VendorTable from '../vendors/Vendors';
import VendorUpdatePage from '../vendors/VendorUpdate';
import AddMarketComponent from '../markets/AddMarket';
import MarketTable from '../markets/Market';

import MarketUpdatePage from '../markets/MarketUpdate';
import CustomerTable from '../customers/Customers';
import AddCustomerComponent from '../customers/AddCustomer';
import UpdateCustomerPage from '../customers/UpdateCustomers';
import InventoryTable from '../inventory/items';
import CreateUserForm from '../users/registerUser';
import UserManagementTable from '../users/allUsers';

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
            <Route path="inventory" element={<InventoryTable />} />
            <Route path="clients" element={<CustomerTable/>}/>
            <Route path='/clients/edit/:id' element={<UpdateCustomerPage/>}/>
            <Route path='/clients/add' element={<AddCustomerComponent/>}/>
             <Route path='sales' element={<Sales/>}/>
            <Route path='vendors/add' element={<AddVendorComponent/>}/>
            <Route path='vendors' element={<VendorTable/>}/>
            <Route path="/vendors/edit/:id" element={<VendorUpdatePage />} />
            <Route path='markets' element={<MarketTable/>}/>
            <Route path="/markets/add" element={<AddMarketComponent/>}/>
            <Route path="/markets/edit/:id" element={<MarketUpdatePage/>}/>
            <Route path='/createuser' element={<CreateUserForm/>}/>
            <Route path='/allusers' element={<UserManagementTable/>}/>
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