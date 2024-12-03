import React, { createContext, useState, ReactNode } from 'react';

// Define the shape of the authentication context
interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

// Create the authentication context with a default value
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: () => {},
  logout: () => {}
});

// Authentication provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Login method - now a simple setter based on your existing login logic
  const login = () => {
    setIsAuthenticated(true);
  };

  // Logout method
  const logout = () => {
    setIsAuthenticated(false);
    // You might want to add additional logout logic here, 
    // such as clearing tokens or making a logout API call
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;