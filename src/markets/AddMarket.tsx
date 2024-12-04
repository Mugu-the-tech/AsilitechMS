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
import { Switch } from '../components/ui/switch';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Alert, AlertDescription } from '../components/ui/alert';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import dotenv from "dotenv";
interface MarketFormData {
  marketName: string;
  marketCode: string;
  location: string;
  opened: boolean;
  openingDate: Date | undefined;
  lastopenDate: Date | undefined;
  organizationId: string;
}

const AddMarketComponent: React.FC = () => {
  const navigate = useNavigate();
  const [market, setMarket] = useState<MarketFormData>({
    marketName: '',
    marketCode: '',
    location: '',
    opened: false,
    openingDate: undefined,
    lastopenDate: undefined,
    organizationId: ''
  });

  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  dotenv.config();

  // Use BACKEND_URL from .env, fallback to localhost if not set
   const API_BASE_URL =  import.meta.env.VITE_BACKEND_URL  || 'http://localhost:3000'; 
  const API_ENDPOINTS = {
    markets: '/markets'
  };

  // Load organization ID on component mount
  useEffect(() => {
    const organizationData = localStorage.getItem('organization');
    
    if (!organizationData) {
      setError('Organization data not found. Please log in again.');
      return;
    }

    try {
      const organization = JSON.parse(organizationData);
      if (!organization.id) {
        setError('Invalid organization data. Please log in again.');
        return;
      }
      
      setMarket(prev => ({
        ...prev,
        organizationId: organization.id
      }));
    } catch (e) {
      console.error('Error parsing organization data:', e);
      setError('Failed to parse organization data. Please log in again.');
    }
  }, []);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMarket(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle market opened status toggle
  const handleMarketOpenedToggle = (checked: boolean) => {
    setMarket(prev => ({
      ...prev,
      opened: checked,
      lastopenDate: checked ? new Date() : undefined
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
      if (!market.marketName || !market.marketCode || !market.location) {
        setError('Please fill in all required fields.');
        return;
      }

      // Prepare submission payload
      const submissionPayload = {
        marketName: market.marketName,
        marketCode: market.marketCode,
        location: market.location,
        opened: market.opened,
        openingDate: market.openingDate ? market.openingDate.toISOString() : null,
        lastopenDate: market.lastopenDate ? market.lastopenDate.toISOString() : null,
        organizationId: market.organizationId
      };

      await axios.post(`${API_BASE_URL}${API_ENDPOINTS.markets}`, submissionPayload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setSuccessMessage('Market added successfully!');
      
      // Redirect to markets list after a short delay
      setTimeout(() => {
        navigate('/markets');
      }, 1500);
    } catch (err) {
      console.error('Error adding market:', err);
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || 'Failed to add market';
        setError(errorMessage);
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Add New Market</CardTitle>
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
            <label htmlFor="marketName" className="block text-sm font-medium text-gray-700 mb-1">
              Market Name
            </label>
            <Input
              id="marketName"
              name="marketName"
              value={market.marketName}
              onChange={handleInputChange}
              required
              placeholder="Enter market name"
            />
          </div>

          <div>
            <label htmlFor="marketCode" className="block text-sm font-medium text-gray-700 mb-1">
              Market Code
            </label>
            <Input
              id="marketCode"
              name="marketCode"
              value={market.marketCode}
              onChange={handleInputChange}
              required
              placeholder="Enter market code"
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <Input
              id="location"
              name="location"
              value={market.location}
              onChange={handleInputChange}
              placeholder="Enter market location"
            />
          </div>

          <div className="flex items-center space-x-2">
            <label htmlFor="opened" className="text-sm font-medium text-gray-700">
              Market Status
            </label>
            <Switch
              id="opened"
              checked={market.opened}
              onCheckedChange={handleMarketOpenedToggle}
            />
            <span className="text-sm text-gray-600">
              {market.opened ? 'Open' : 'Closed'}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Opening Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full pl-3 text-left font-normal',
                    !market.openingDate && 'text-muted-foreground'
                  )}
                >
                  {market.openingDate ? (
                    format(market.openingDate, 'PPP')
                  ) : (
                    <span>Pick a date</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={market.openingDate}
                  onSelect={(date) => setMarket(prev => ({...prev, openingDate: date}))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {market.opened && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Open Date
              </label>
              <Input
                value={market.lastopenDate ? format(market.lastopenDate, 'PPP') : ''}
                readOnly
                className="bg-gray-100 cursor-not-allowed"
              />
            </div>
          )}

          <div className="flex space-x-2">
            <Button type="submit" className="w-full">
              Add Market
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/markets')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddMarketComponent;