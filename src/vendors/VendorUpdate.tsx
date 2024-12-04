import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../components/ui/select';
import { Alert, AlertDescription } from '../components/ui/alert';
import { useParams, useNavigate } from 'react-router-dom';

// Vendor Type options
const VENDOR_TYPES = [
  'SUPPLIER',
  'MANUFACTURER',
  'SERVICE_PROVIDER',
  'DISTRIBUTOR',
  'OTHER'
];

// Vendor interface (matching the one in VendorTable)
interface Vendor {
  id: string;
  vendorName: string;
  phoneNumber: string;
  vendorEmail: string;
  address: string;
  vendorType: string;
  organizationId: string;
}

const VendorUpdatePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [vendor, setVendor] = useState<Vendor>({
    id: '',
    vendorName: '',
    phoneNumber: '',
    vendorEmail: '',
    address: '',
    vendorType: '',
    organizationId: ''
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');



  // Use BACKEND_URL from .env, fallback to localhost if not set
   const API_BASE_URL =  import.meta.env.VITE_BACKEND_URL  || 'http://localhost:3000'; 
  const API_ENDPOINTS = {
    vendors: '/vendors'
  };

  // Fetch vendor details when component mounts
  useEffect(() => {
    const fetchVendorDetails = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setError('Authentication token not found. Please log in again.');
          setLoading(false);
          return;
        }

        const response = await axios.get<Vendor>(`${API_BASE_URL}${API_ENDPOINTS.vendors}/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        setVendor(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching vendor details:', err);
        if (axios.isAxiosError(err)) {
          const errorMessage = err.response?.data?.message || 'Failed to fetch vendor details';
          setError(errorMessage);
        } else {
          setError('An unexpected error occurred');
        }
        setLoading(false);
      }
    };

    fetchVendorDetails();
  }, [id]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVendor(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle vendor type selection
  const handleVendorTypeChange = (value: string) => {
    setVendor(prev => ({
      ...prev,
      vendorType: value
    }));
  };

  // Submit update form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('authToken');
      const organizationData = localStorage.getItem('organization');
      
      if (!token || !organizationData) {
        setError('Authentication required. Please log in again.');
        return;
      }

      const organization = JSON.parse(organizationData);

      // Prepare update payload
      const updatePayload = {
        vendorName: vendor.vendorName,
        phoneNumber: vendor.phoneNumber,
        vendorEmail: vendor.vendorEmail,
        address: vendor.address,
        vendorType: vendor.vendorType,
        organizationId: organization.id
      };

      await axios.patch(`${API_BASE_URL}${API_ENDPOINTS.vendors}/${id}`, updatePayload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setSuccessMessage('Vendor updated successfully!');
      
      // Redirect back to vendor list after a short delay
      setTimeout(() => {
        navigate('/vendors');
      }, 1500);
    } catch (err) {
      console.error('Error updating vendor:', err);
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || 'Failed to update vendor';
        setError(errorMessage);
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Vendor Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-64">
            <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0401ff]"></span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Update Vendor</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {successMessage && (
          <Alert variant="default" className="mb-4 bg-green-50">
            <AlertDescription className="text-green-700">{successMessage}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="vendorName" className="block text-sm font-medium text-gray-700 mb-1">
              Vendor Name
            </label>
            <Input
              id="vendorName"
              name="vendorName"
              value={vendor.vendorName}
              onChange={handleInputChange}
              required
              placeholder="Enter vendor name"
            />
          </div>

          <div>
            <label htmlFor="vendorEmail" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              id="vendorEmail"
              name="vendorEmail"
              type="email"
              value={vendor.vendorEmail}
              onChange={handleInputChange}
              required
              placeholder="Enter vendor email"
            />
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              value={vendor.phoneNumber}
              onChange={handleInputChange}
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <Input
              id="address"
              name="address"
              value={vendor.address}
              onChange={handleInputChange}
              placeholder="Enter vendor address"
            />
          </div>

          <div>
            <label htmlFor="vendorType" className="block text-sm font-medium text-gray-700 mb-1">
              Vendor Type
            </label>
            <Select 
              value={vendor.vendorType}
              onValueChange={handleVendorTypeChange}
            >
              <SelectTrigger>
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
          </div>

          <div className="flex space-x-2">
            <Button type="submit" className="w-full">
              Update Vendor
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/vendors')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default VendorUpdatePage;