import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from "framer-motion";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { 
  Save, 
  X, 
  AlertCircle, 
  UserPlus 
} from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { ScrollArea } from '../components/ui/scroll-area';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../components/ui/select';

// Enum for user roles to match backend
const UserRoles = {
  MEMBER: 'MEMBER',
  ADMIN: 'ADMIN',
  OWNER: 'OWNER'
};

export type UserRole = keyof typeof UserRoles;
// Use BACKEND_URL from .env, fallback to localhost if not set
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
const API_ENDPOINTS = {
  users: '/auth/create-user'
};

interface CreateUserFormData {
  email: string;
  password: string;
  role: UserRole;
  organizationId: string;
}

const CreateUserForm: React.FC = () => {
  const [formData, setFormData] = useState<CreateUserFormData>({
    email: '',
    password: '',
    role: 'MEMBER',
    organizationId: ''
  });

  const [errors, setErrors] = useState<Partial<CreateUserFormData>>({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    // Get and validate organization data from localStorage
    const orgData = localStorage.getItem('organization');
    
    if (!orgData) {
      setSubmitError('Organization data not found. Please log in again.');
      return;
    }

    try {
      const organization = JSON.parse(orgData);
      if (!organization.id) {
        setSubmitError('Invalid organization data. Please log in again.');
        return;
      }
      
      // Set organizationId in the form data
      setFormData(prev => ({
        ...prev,
        organizationId: organization.id
      }));
    } catch (e) {
      console.error('Error parsing organization data:', e);
      setSubmitError('Failed to parse organization data. Please log in again.');
    }
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateUserFormData> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleChange = (value: UserRole) => {
    setFormData(prev => ({
      ...prev,
      role: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Ensure organizationId is set before submission
    if (!formData.organizationId) {
      setSubmitError('Organization ID is missing. Please log in again.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.users}`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.data) {
        throw new Error('No data received from server');
      }

      setSubmitSuccess(true);
      // Reset form after successful submission
      setFormData({
        email: '',
        password: '',
        role:'MEMBER',
        organizationId: formData.organizationId // Keep the organization ID
      });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message: string } } };
      setSubmitError(
        error.response?.data?.message || 
        'Failed to create user. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      email: '',
      password: '',
      role: 'MEMBER',
      organizationId: formData.organizationId // Keep the organization ID
    });
    setErrors({});
    setSubmitError('');
    setSubmitSuccess(false);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg bg-white dark:bg-gray-900">
      <CardHeader className="border-b border-gray-200 p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between"
        >
          <CardTitle className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white flex items-center">
            <UserPlus className="mr-3 h-6 w-6" />
            Create New User
          </CardTitle>
        </motion.div>
      </CardHeader>
      
      <CardContent className="p-4">
        {submitSuccess && (
          <Alert variant="default" className="bg-green-50 mb-4">
            <AlertDescription className="text-green-800">
              User created successfully!
            </AlertDescription>
          </Alert>
        )}

        {submitError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        <ScrollArea className="h-[500px] pr-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter user email"
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="password">Temporary Password *</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Set temporary password"
                    className={errors.password ? 'border-red-500' : ''}
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                  )}
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="role">User Role *</Label>
                  <Select 
                    value={formData.role} 
                    onValueChange={handleRoleChange}
                  >
                    <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select user role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={UserRoles.MEMBER}>Member</SelectItem>
                      <SelectItem value={UserRoles.ADMIN}>Admin</SelectItem>
                      <SelectItem value={UserRoles.OWNER}>Owner</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.role && (
                    <p className="text-red-500 text-sm mt-1">{errors.role}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="organizationId">Organization ID</Label>
                  <Input
                    id="organizationId"
                    name="organizationId"
                    value={formData.organizationId}
                    onChange={handleInputChange}
                    placeholder="Enter organization ID"
                    disabled
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 mt-6">
              <Button 
                type="button" 
                variant="outline"
                onClick={handleReset}
                disabled={isSubmitting}
              >
                <X className="mr-2 h-4 w-4" /> Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                    Creating...
                  </div>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Create User
                  </>
                )}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default CreateUserForm;