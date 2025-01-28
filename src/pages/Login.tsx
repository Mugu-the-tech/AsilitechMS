import React, { useState, FormEvent, useContext } from 'react';
import { LockOpen, Mail, ShieldCheck, Eye, EyeOff, House, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AuthContext from '../routes/AuthContext';
import { AuthService } from '../types/AuthService';

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
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <div className="mb-4">
      <div 
        className={`
          flex items-center
          bg-white/10 backdrop-blur-md
          border rounded-xl transition-all duration-300
          ${isFocused ? 'border-blue-400 shadow-lg shadow-blue-500/20' : 'border-white/20'}
          ${error ? 'border-red-400' : ''}
        `}
      >
        <div className={`p-3 ${isFocused ? 'text-blue-400' : 'text-white/60'}`}>
          <Icon size={20} />
        </div>
        <input
          type={type === 'password' && showPassword ? 'text' : type}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="flex-grow p-3 bg-transparent outline-none text-white placeholder-white/50"
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="p-3 text-white/60 hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-red-300 mt-1 pl-2"
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
  const [isLoading, setIsLoading] = useState(false);
  
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
    setIsLoading(true);

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
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateRegisterForm()) return;
    setIsLoading(true);

    try {
      await AuthService.register(registerCredentials);
      login();
      navigate('/dashboard');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FAVerification = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await AuthService.loginWith2FA(loginCredentials, twoFactorToken);
      login();
      navigate('/dashboard');
    } catch (error) {
      setError(error instanceof Error ? error.message : '2FA verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const render2FAForm = () => (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.2),rgba(0,0,0,0.5))]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-8 relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl"
      >
        <h2 className="text-2xl md:text-3xl text-center mb-6 font-bold text-white">
          Two-Factor Authentication
        </h2>
  
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-4 p-3 bg-red-500/10 backdrop-blur-sm border border-red-500/20 text-red-200 rounded-lg text-center"
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
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full p-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 
                     hover:from-blue-600 hover:to-blue-700 text-white font-semibold
                     transform transition-all duration-300 flex items-center justify-center gap-2
                     disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              'Verify'
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );

  const renderAuthForm = () => (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.2),rgba(0,0,0,0.5))]" />
      </div>

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-0 -right-40 w-80 h-80 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 left-20 w-80 h-80 bg-pink-500/30 rounded-full blur-3xl animate-pulse" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-8 relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl"
      >
        <h2 className="text-3xl text-center mb-6 font-bold text-white">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-4 p-3 bg-red-500/10 backdrop-blur-sm border border-red-500/20 text-red-200 rounded-lg text-center"
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
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full p-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 
                     hover:from-blue-600 hover:to-blue-700 text-white font-semibold
                     transform transition-all duration-300 flex items-center justify-center gap-2
                     disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              isLogin ? 'Sign In' : 'Sign Up'
            )}
          </motion.button>
        </form>

        <div className="text-center mt-8">
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-white/80 hover:text-white transition-colors duration-300"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>

          {isLogin && (
            <button 
              onClick={() => navigate('/forgot-password')}
              className="block mx-auto mt-4 text-white/60 hover:text-white transition-colors duration-300"
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