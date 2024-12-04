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
import { useParams, useNavigate } from 'react-router-dom';
import { format, parseISO, isValid } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { Market } from '../types/interfaces';

const MarketUpdatePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [market, setMarket] = useState<Market>({
    id: '',
    marketName: '',
    marketCode: '',
    location: '',
    opened: false,
    openingDate: '',
    lastopenDate: '',
    organizationId: ''
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [openingDate, setOpeningDate] = useState<Date | undefined>();
  const [lastOpenDate, setLastOpenDate] = useState<Date | undefined>();


  // Use BACKEND_URL from .env, fallback to localhost if not set
   const API_BASE_URL =  import.meta.env.VITE_BACKEND_URL  || 'http://localhost:3000'; 
  const API_ENDPOINTS = {
    markets: '/market'
  };

  // Safe date parsing function
  const safeParseDateString = (dateString: string | null | undefined): Date | undefined => {
    if (!dateString) return undefined;
    
    try {
      const parsedDate = parseISO(dateString);
      return isValid(parsedDate) ? parsedDate : undefined;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      console.warn('Invalid date string:', dateString);
      return undefined;
    }
  };

  // Fetch market details when component mounts
  useEffect(() => {
    const fetchMarketDetails = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setError('Authentication token not found. Please log in again.');
          setLoading(false);
          return;
        }

        const response = await axios.get<Market>(`${API_BASE_URL}${API_ENDPOINTS.markets}/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const marketData = response.data;
        setMarket(marketData);
        
        // Safely parse dates
        const safeOpeningDate = safeParseDateString(marketData.openingDate);
        const safeLastOpenDate = safeParseDateString(marketData.lastopenDate);
        
        setOpeningDate(safeOpeningDate);
        setLastOpenDate(safeLastOpenDate);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching market details:', err);
        if (axios.isAxiosError(err)) {
          const errorMessage = err.response?.data?.message || 'Failed to fetch market details';
          setError(errorMessage);
        } else {
          setError('An unexpected error occurred');
        }
        setLoading(false);
      }
    };

    fetchMarketDetails();
  }, [id]);

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
      lastopenDate: checked ? new Date().toISOString() : ''
    }));
    
    // Update last open date if market is being opened
    if (checked) {
      const now = new Date();
      setLastOpenDate(now);
    } else {
      setLastOpenDate(undefined);
    }
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

      // Prepare update payload with null checks
      const updatePayload = {
        marketName: market.marketName,
        marketCode: market.marketCode,
        location: market.location,
        opened: market.opened,
        openingDate: openingDate && isValid(openingDate) ? openingDate.toISOString() : null,
        lastopenDate: lastOpenDate && isValid(lastOpenDate) ? lastOpenDate.toISOString() : null,
        organizationId: organization.id
      };

      await axios.patch(`${API_BASE_URL}${API_ENDPOINTS.markets}/${id}`, updatePayload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setSuccessMessage('Market updated successfully!');
      
      // Redirect back to market list after a short delay
      setTimeout(() => {
        navigate('/markets');
      }, 1500);
    } catch (err) {
      console.error('Error updating market:', err);
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || 'Failed to update market';
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
          <CardTitle>Loading Market Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-64">
            <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Update Market</CardTitle>
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
                    !openingDate && 'text-muted-foreground'
                  )}
                >
                  {openingDate && isValid(openingDate) ? (
                    format(openingDate, 'PPP')
                  ) : (
                    <span>Pick a date</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={openingDate}
                  onSelect={setOpeningDate}
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
                value={lastOpenDate && isValid(lastOpenDate) ? format(lastOpenDate, 'PPP') : ''}
                readOnly
                className="bg-gray-100 cursor-not-allowed"
              />
            </div>
          )}

          <div className="flex space-x-2">
            <Button type="submit" className="w-full">
              Update Market
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

export default MarketUpdatePage;