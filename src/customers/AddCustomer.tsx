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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Alert, AlertDescription } from '../components/ui/alert';
import { useNavigate } from 'react-router-dom';

// Client Status options
const CLIENT_STATUSES = [
  'ACTIVE',
  'INACTIVE',
  'POTENTIAL',
  'ARCHIVED'
] as const;

interface ClientFormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  marketId: string;
  location: string;
  farmSize: string;
  status: typeof CLIENT_STATUSES[number];
  organizationId: string;
}

const AddCustomerComponent: React.FC = () => {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<ClientFormData>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    marketId: '',
    location: '',
    farmSize: '',
    status: 'POTENTIAL', // Default status
    organizationId: ''
  });

  const [markets, setMarkets] = useState<Array<{id: string, marketName: string}>>([]);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Use BACKEND_URL from .env, fallback to localhost if not set
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
  const API_ENDPOINTS = {
    customers: '/clients',
    markets: '/market'
  };

  // Load organization and markets data on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load organization data
        const organizationData = localStorage.getItem('organization');
        if (!organizationData) {
          setError('Organization data not found. Please log in again.');
          return;
        }

        const organization = JSON.parse(organizationData);
        if (!organization.id) {
          setError('Invalid organization data. Please log in again.');
          return;
        }

        // Fetch markets for this organization
        const token = localStorage.getItem('authToken');
        if (!token) {
          setError('Authentication required. Please log in again.');
          return;
        }

        const marketsResponse = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.markets}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          params: {
            organizationId: organization.id
          }
        });

        setMarkets(marketsResponse.data);
        setCustomer(prev => ({
          ...prev,
          organizationId: organization.id
        }));
      } catch (e) {
        console.error('Error loading initial data:', e);
        setError('Failed to load initial data. Please try again.');
      }
    };

    loadInitialData();
  }, []);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomer(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle status change
  const handleStatusChange = (value: typeof CLIENT_STATUSES[number]) => {
    setCustomer(prev => ({
      ...prev,
      status: value
    }));
  };

  // Handle market selection
  const handleMarketChange = (value: string) => {
    setCustomer(prev => ({
      ...prev,
      marketId: value
    }));
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setError('Authentication required. Please log in again.');
        return;
      }

      // Validate required fields
      const requiredFields: (keyof ClientFormData)[] = ['firstName', 'lastName', 'phoneNumber', 'email', 'marketId'];
      const missingFields = requiredFields.filter(field => !customer[field]);
      
      if (missingFields.length > 0) {
        setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
        return;
      }

      await axios.post(`${API_BASE_URL}${API_ENDPOINTS.customers}`, customer, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setSuccessMessage('Customer added successfully!');
      
      // Redirect to customers list after a short delay
      setTimeout(() => {
        navigate('/clients');
      }, 1500);
    } catch (err) {
      console.error('Error adding customer:', err);
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || 'Failed to add customer';
        setError(errorMessage);
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Add New Customer</CardTitle>
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <Input
                id="firstName"
                name="firstName"
                value={customer.firstName}
                onChange={handleInputChange}
                required
                placeholder="Enter first name"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <Input
                id="lastName"
                name="lastName"
                value={customer.lastName}
                onChange={handleInputChange}
                required
                placeholder="Enter last name"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              value={customer.email}
              onChange={handleInputChange}
              required
              placeholder="Enter email address"
            />
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              value={customer.phoneNumber}
              onChange={handleInputChange}
              required
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <label htmlFor="marketId" className="block text-sm font-medium text-gray-700 mb-1">
              Market
            </label>
            <Select 
              value={customer.marketId} 
              onValueChange={handleMarketChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select market" />
              </SelectTrigger>
              <SelectContent>
                {markets.map((market) => (
                  <SelectItem key={market.id} value={market.id}>
                    {market.marketName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <Input
              id="location"
              name="location"
              value={customer.location}
              onChange={handleInputChange}
              placeholder="Enter customer location"
            />
          </div>

          <div>
            <label htmlFor="farmSize" className="block text-sm font-medium text-gray-700 mb-1">
              Farm Size
            </label>
            <Input
              id="farmSize"
              name="farmSize"
              value={customer.farmSize}
              onChange={handleInputChange}
              placeholder="Enter farm size"
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Customer Status
            </label>
            <Select 
              value={customer.status} 
              onValueChange={handleStatusChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {CLIENT_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex space-x-2">
            <Button type="submit" className="w-full">
              Add Customer
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/customers')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddCustomerComponent;