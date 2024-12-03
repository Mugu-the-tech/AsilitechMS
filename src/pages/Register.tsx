import  { useState, FormEvent, useContext } from 'react';
import { Mail, LockOpen, Building, Hash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../routes/AuthContext';
import { AuthService } from '../types/AuthService';

const COLORS = {
  primary: '#1eadff',
  secondary: '#0690ff',
  background: '#edfaff',
  text: '#2C3E50',
  accent: '#1E90FF',
  border: '#B0BEC5'
};

const RegisterForm = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    organizationName: '',
    organizationSlug: '',
  });
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await AuthService.register(formData);
      login();
      navigate('/dashboard');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Auto-generate slug from organization name
    if (name === 'organizationName') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setFormData(prev => ({ ...prev, organizationSlug: slug }));
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-6"
      style={{ backgroundColor: COLORS.background }}
    >
      <div 
        className="w-full max-w-md p-8 rounded-xl shadow-xl"
        style={{ backgroundColor: 'white' }}
      >
        <h2 
          className="text-3xl text-center mb-6"
          style={{ color: COLORS.primary }}
        >
          Create Account
        </h2>

        {error && (
          <div 
            className="mb-4 p-3 rounded-lg text-center"
            style={{ backgroundColor: '#FFE5E5', color: '#D8000C' }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div 
              className="flex items-center border rounded-lg"
              style={{ 
                borderColor: COLORS.border,
                backgroundColor: COLORS.background 
              }}
            >
              <div className="p-3" style={{ color: COLORS.primary }}>
                <Mail size={20} />
              </div>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Email Address"
                className="flex-grow p-3 bg-transparent outline-none"
                style={{ color: COLORS.text }}
                required
              />
            </div>
          </div>

          <div>
            <div 
              className="flex items-center border rounded-lg"
              style={{ 
                borderColor: COLORS.border,
                backgroundColor: COLORS.background 
              }}
            >
              <div className="p-3" style={{ color: COLORS.primary }}>
                <LockOpen size={20} />
              </div>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Password"
                className="flex-grow p-3 bg-transparent outline-none"
                style={{ color: COLORS.text }}
                required
                minLength={8}
              />
            </div>
          </div>

          <div>
            <div 
              className="flex items-center border rounded-lg"
              style={{ 
                borderColor: COLORS.border,
                backgroundColor: COLORS.background 
              }}
            >
              <div className="p-3" style={{ color: COLORS.primary }}>
                <Building size={20} />
              </div>
              <input
                type="text"
                value={formData.organizationName}
                onChange={(e) => handleInputChange('organizationName', e.target.value)}
                placeholder="Organization Name"
                className="flex-grow p-3 bg-transparent outline-none"
                style={{ color: COLORS.text }}
                required
              />
            </div>
          </div>

          <div>
            <div 
              className="flex items-center border rounded-lg"
              style={{ 
                borderColor: COLORS.border,
                backgroundColor: COLORS.background 
              }}
            >
              <div className="p-3" style={{ color: COLORS.primary }}>
                <Hash size={20} />
              </div>
              <input
                type="text"
                value={formData.organizationSlug}
                onChange={(e) => handleInputChange('organizationSlug', e.target.value)}
                placeholder="Organization Slug"
                className="flex-grow p-3 bg-transparent outline-none"
                style={{ color: COLORS.text }}
                required
                pattern="[a-z0-9\-]+"
                title="Only lowercase letters, numbers, and hyphens are allowed"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              This will be your unique organization URL: myapp.com/{formData.organizationSlug}
            </p>
          </div>

          <button
            type="submit"
            className="w-full p-3 rounded-lg font-bold hover:bg-[#007cff] disabled:opacity-50"
            style={{
              backgroundColor: COLORS.primary,
              color: 'white',
              transition: 'background-color 0.3s ease'
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button 
              onClick={() => navigate('/login')}
              className="text-blue-500 hover:underline"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;