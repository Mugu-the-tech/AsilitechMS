import React, { useState, FormEvent, useContext } from 'react';
import { LockOpen, Mail, ShieldCheck, Eye, EyeOff, House } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AuthContext from '../routes/AuthContext';
import { AuthService } from '../types/AuthService';

const COLORS = {
  primary: '#3B82F6',  // Updated to a more modern blue
  secondary: '#60A5FA',
  background: '#F3F4F6', // Soft gray background
  text: '#1F2937',
  accent: '#10B981', // Added a green accent
  border: '#E5E7EB'
};

interface AuthInputProps {
  type: 'text' | 'email' | 'password';
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon: React.ElementType;
  error?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  email: string;
  password: string;
  organizationName: string;
  organizationSlug: string;
}

const AuthInput: React.FC<AuthInputProps> = ({
  type,
  name,
  value,
  onChange,
  placeholder,
  icon: Icon,
  error
}) => {
  const [showPassword, setShowPassword] = useState(false);
  
  return (
    <div className="mb-4">
      <div 
        className="flex items-center border-2 rounded-xl transition-all duration-300 focus-within:border-blue-500 focus-within:shadow-md"
        style={{ 
          borderColor: error ? '#EF4444' : COLORS.border,
          backgroundColor: 'white'
        }}
      >
        <div className="p-3" style={{ color: COLORS.primary }}>
          <Icon size={20} />
        </div>
        <input
          type={type === 'password' && showPassword ? 'text' : type}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-grow p-3 bg-transparent outline-none text-sm"
          style={{ color: COLORS.text }}
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="p-3 hover:bg-gray-100 rounded-full transition-colors"
            style={{ color: COLORS.primary }}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-red-500 mt-1 pl-2"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

const AuthForm: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);
  
  const [loginCredentials, setLoginCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });

  const [registerCredentials, setRegisterCredentials] = useState<RegisterCredentials>({
    email: '',
    password: '',
    organizationName: '',
    organizationSlug: ''
  });

  const [is2FARequired, setIs2FARequired] = useState(false);
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [error, setError] = useState('');

  const validateRegisterForm = (): boolean => {
    if (!registerCredentials.email || !registerCredentials.password || 
        !registerCredentials.organizationName || !registerCredentials.organizationSlug) {
      setError('All fields are required');
      return false;
    }

    if (registerCredentials.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }

    return true;
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await AuthService.login(loginCredentials);
      
      if (response.user.twoFactorEnabled) {
        setIs2FARequired(true);
      } else {
        login();
        navigate('/dashboard');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      setTimeout(() => setError(''), 5000); 
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateRegisterForm()) return;

    try {
      await AuthService.register(registerCredentials);
      login();
      navigate('/dashboard');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setError(errorMessage);
      setTimeout(() => setError(''), 5000); 
    }
  };

  const handle2FAVerification = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      await AuthService.loginWith2FA(loginCredentials, twoFactorToken);
      login();
      navigate('/dashboard');
    } catch (error) {
      setError(error instanceof Error ? error.message : '2FA verification failed');
    }
  };

  const render2FAForm = () => (
    <div 
      className="min-h-screen flex items-center justify-center p-4 md:p-6 lg:p-8 bg-gradient-to-br from-blue-50 to-blue-100"
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-6 md:p-8 bg-white rounded-2xl shadow-2xl"
      >
        <h2 
          className="text-2xl md:text-3xl text-center mb-6 font-bold"
          style={{ color: COLORS.primary }}
        >
          Two-Factor Authentication
        </h2>
  
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-center"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
  
        <form onSubmit={handle2FAVerification}>
          <AuthInput
            type="text"
            name="2faToken"
            value={twoFactorToken}
            onChange={setTwoFactorToken}
            placeholder="Enter 2FA Token"
            icon={ShieldCheck}
          />
  
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full p-3 rounded-xl mt-4 font-bold text-white transition-all duration-300 ease-in-out"
            style={{
              backgroundColor: COLORS.primary,
              backgroundImage: `linear-gradient(to right, ${COLORS.primary}, ${COLORS.secondary})`,
              boxShadow: '0 4px 6px rgba(59, 130, 246, 0.3)'
            }}
          >
            Verify
          </motion.button>
        </form>
      </motion.div>
    </div>
  );

  const renderAuthForm = () => (
    <div 
      className="min-h-screen flex items-center justify-center p-4 md:p-6 lg:p-8 bg-gradient-to-br from-blue-50 to-blue-100"
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-6 md:p-8 bg-white rounded-2xl shadow-2xl"
      >
        <h2 
          className="text-3xl text-center mb-6 font-bold"
          style={{ color: COLORS.primary }}
        >
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-center"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={isLogin ? handleLogin : handleRegister}>
          <AnimatePresence>
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <AuthInput
                  type="text"
                  name="organizationName"
                  value={registerCredentials.organizationName}
                  onChange={(value) => setRegisterCredentials(prev => ({ ...prev, organizationName: value }))}
                  placeholder="Organization Name"
                  icon={House}
                />

                <AuthInput
                  type="text"
                  name="organizationSlug"
                  value={registerCredentials.organizationSlug}
                  onChange={(value) => setRegisterCredentials(prev => ({ ...prev, organizationSlug: value }))}
                  placeholder="Organization Slug"
                  icon={House}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <AuthInput
            type="email"
            name="email"
            value={isLogin ? loginCredentials.email : registerCredentials.email}
            onChange={(value) => 
              isLogin 
                ? setLoginCredentials(prev => ({ ...prev, email: value }))
                : setRegisterCredentials(prev => ({ ...prev, email: value }))
            }
            placeholder="Email Address"
            icon={Mail}
          />

          <AuthInput
            type="password"
            name="password"
            value={isLogin ? loginCredentials.password : registerCredentials.password}
            onChange={(value) => 
              isLogin 
                ? setLoginCredentials(prev => ({ ...prev, password: value }))
                : setRegisterCredentials(prev => ({ ...prev, password: value }))
            }
            placeholder="Password"
            icon={LockOpen}
          />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full p-3 rounded-xl mt-4 font-bold text-white transition-all duration-300 ease-in-out"
            style={{
              backgroundColor: COLORS.primary,
              backgroundImage: `linear-gradient(to right, ${COLORS.primary}, ${COLORS.secondary})`,
              boxShadow: '0 4px 6px rgba(59, 130, 246, 0.3)'
            }}
          >
            {isLogin ? 'Sign In' : 'Sign Up'}
          </motion.button>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-blue-500 font-semibold hover:underline"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>

          {isLogin && (
            <button 
              onClick={() => navigate('/forgot-password')}
              className="mt-3 text-sm text-blue-500 hover:underline"
            >
              Forgot Password?
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );

  return is2FARequired ? render2FAForm() : renderAuthForm();
};

export default AuthForm;