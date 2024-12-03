import React, { useState, FormEvent, useContext } from 'react';
import { LockOpen, Mail, ShieldCheck, Eye, EyeOff, House } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../routes/AuthContext';
import { AuthService } from '../types/AuthService';
import { motion } from 'framer-motion';
const COLORS = {
  primary: '#0b64eb',
  secondary: '#0690ff',
  background: '#ffffff',
  text: '#2C3E50',
  accent: '#1E90FF',
  border: '#B0BEC5'
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
        className="flex items-center border rounded-lg"
        style={{ 
          borderColor: error ? '#FF6B6B' : COLORS.border,
          backgroundColor: COLORS.background 
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
          className="flex-grow p-3 bg-transparent outline-none"
          style={{ color: COLORS.text }}
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="p-3"
            style={{ color: COLORS.primary }}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
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
      const errorMessage= error instanceof Error ? error.message : 'Registration failed';
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
      className="min-h-screen flex items-center justify-center p-6"
      style={{ backgroundColor: COLORS.background }}
    >
      <div 
        className="w-full max-w-md p-8 rounded-xl shadow-xl"
        style={{ backgroundColor: 'white' }}
      >
        <h2 
          className="text-2xl text-center mb-4"
          style={{ color: COLORS.primary }}
        >
          Two-Factor Authentication
        </h2>
  
        {error && (
          <div 
            className="mb-4 p-3 rounded-lg text-center"
            style={{ backgroundColor: '#FFE5E5', color: '#D8000C' }}
          >
            {error}
          </div>
        )}
  
        <form onSubmit={handle2FAVerification}>
          <AuthInput
            type="text"
            name="2faToken"
            value={twoFactorToken}
            onChange={setTwoFactorToken}
            placeholder="Enter 2FA Token"
            icon={ShieldCheck}
          />
  
          <button
            type="submit"
            className="w-full p-3 rounded-lg mt-4 font-bold hover:bg-[#007cff]"
            style={{
              backgroundColor: COLORS.primary,
              color: 'white',
              transition: 'background-color 0.3s ease'
            }}
          >
            Verify
          </button>
        </form>
      </div>
    </div>
  );

  const renderAuthForm = () => (
    <motion.div 
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3 }}
      className="min-h-screen flex items-center justify-center p-6"
      
      style={{ backgroundColor: COLORS.background }}
    >
      <motion.div 
        className="w-full max-w-md p-8 rounded-xl shadow-xl"
        style={{ backgroundColor: 'white' }}
      >
        <h2 
          className="text-3xl text-center mb-4 font-bold"
          style={{ color: COLORS.primary }}
        >
          {isLogin ? 'Sign In' : 'Create Account'}
        </h2>

        {error && (
          <div 
            className="mb-4 p-3 rounded-lg text-center"
            style={{ backgroundColor: '#FFE5E5', color: '#D8000C' }}
          >
            {error}
          </div>
        )}

        <form onSubmit={isLogin ? handleLogin : handleRegister}>
          {!isLogin && (
            <>
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
            </>
          )}

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

          <button
            type="submit"
            className="w-full p-3 rounded-lg mt-4 font-bold hover:bg-[#007cff]"
            style={{
              backgroundColor: COLORS.primary,
              color: 'white',
              transition: 'background-color 0.3s ease',
            }}
          >
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="text-center mt-4">
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-blue-500 hover:underline"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>

          {isLogin && (
            <button 
              onClick={() => navigate('/forgot-password')}
              className="mt-2 text-sm text-blue-500 hover:underline"
            >
              Forgot Password?
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );

  return is2FARequired ? render2FAForm() : renderAuthForm();
};

export default AuthForm;