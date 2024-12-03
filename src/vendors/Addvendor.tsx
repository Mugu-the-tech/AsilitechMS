import React, { useEffect, useState } from 'react';
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
import dotenv from "dotenv";
// Vendor Type options matching backend expectations
const VENDOR_TYPES = [
  'SUPPLIER',
  'MANUFACTURER',
  'SERVICE_PROVIDER',
  'DISTRIBUTOR',
  'OTHER'
];

interface VendorFormData {
  vendorName: string;
  phoneNumber: string;
  vendorEmail: string;
  address: string;
  vendorType: string;
  organizationId: string;
}

const AddVendorComponent: React.FC = () => {
  const [formData, setFormData] = useState<VendorFormData>({
    vendorName: '',
    phoneNumber: '',
    vendorEmail: '',
    address: '',
    vendorType: '',
    organizationId: '' // You might want to get this dynamically or from context
  });

  const [errors, setErrors] = useState<Partial<VendorFormData>>({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  dotenv.config();

  // Use BACKEND_URL from .env, fallback to localhost if not set
   const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:3000'; 
  const API_ENDPOINTS = {
    vendors: '/vendors'
  };

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
    const newErrors: Partial<VendorFormData> = {};

    if (!formData.vendorName.trim()) {
      newErrors.vendorName = 'Vendor name is required';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    }

    if (!formData.vendorEmail.trim()) {
      newErrors.vendorEmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.vendorEmail)) {
      newErrors.vendorEmail = 'Invalid email format';
    }

    if (!formData.vendorType) {
      newErrors.vendorType = 'Vendor type is required';
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

  const handleVendorTypeChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      vendorType: value
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
      const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.vendors}`, formData, {
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
        vendorName: '',
        phoneNumber: '',
        vendorEmail: '',
        address: '',
        vendorType: '',
        organizationId: formData.organizationId // Keep the organization ID
      });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message: string } } };
      setSubmitError(
        error.response?.data?.message || 
        'Failed to add vendor. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      vendorName: '',
      phoneNumber: '',
      vendorEmail: '',
      address: '',
      vendorType: '',
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
            Add New Vendor
          </CardTitle>
        </motion.div>
      </CardHeader>
      
      <CardContent className="p-4">
        {submitSuccess && (
          <Alert variant="default" className="bg-green-50 mb-4">
            <AlertDescription className="text-green-800">
              Vendor added successfully!
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
                  <Label htmlFor="vendorName">Vendor Name *</Label>
                  <Input
                    id="vendorName"
                    name="vendorName"
                    value={formData.vendorName}
                    onChange={handleInputChange}
                    placeholder="Enter vendor name"
                    className={errors.vendorName ? 'border-red-500' : ''}
                  />
                  {errors.vendorName && (
                    <p className="text-red-500 text-sm mt-1">{errors.vendorName}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="vendorEmail">Email *</Label>
                  <Input
                    id="vendorEmail"
                    name="vendorEmail"
                    type="email"
                    value={formData.vendorEmail}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                    className={errors.vendorEmail ? 'border-red-500' : ''}
                  />
                  {errors.vendorEmail && (
                    <p className="text-red-500 text-sm mt-1">{errors.vendorEmail}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                    className={errors.phoneNumber ? 'border-red-500' : ''}
                  />
                  {errors.phoneNumber && (
                    <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>
                  )}
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter vendor address"
                  />
                </div>

                <div>
                  <Label htmlFor="vendorType">Vendor Type *</Label>
                  <Select 
                    value={formData.vendorType} 
                    onValueChange={handleVendorTypeChange}
                  >
                    <SelectTrigger className={errors.vendorType ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select vendor type" />
                    </SelectTrigger>
                    <SelectContent>
                      {VENDOR_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.vendorType && (
                    <p className="text-red-500 text-sm mt-1">{errors.vendorType}</p>
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
                    Saving...
                  </div>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Save Vendor
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

export default AddVendorComponent;