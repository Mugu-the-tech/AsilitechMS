import  { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Check, X } from 'lucide-react';
import axios from 'axios';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Market, Client, SaleHeader, Crop, SaleLine } from '../types/interfaces';
import dotenv from "dotenv";
interface Organization {
  id: string;
  name: string;
  slug: string;
  role: string;
}

interface User {
  id: string; 
}

type SaleStatus = 'DRAFT' | 'APPROVED' | 'REJECTED';

const NewSaleForm = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [organizationId, setOrganizationId] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [saleId, setSaleId] = useState<string | null>(null);
  const [saleStatus, setSaleStatus] = useState<SaleStatus>('DRAFT');
  const [saleHeader, setSaleHeader] = useState<SaleHeader>({
    clientId: '',
    marketId: '',
    saleDate: new Date(),
    notes: '',
  });

  const [saleLines, setSaleLines] = useState<SaleLine[]>([]);
  
  dotenv.config();

  // Use BACKEND_URL from .env, fallback to localhost if not set
   const API_BASE_URL =  import.meta.env.VITE_BACKEND_URL  || 'http://localhost:3000'; 

  useEffect(() => {
    // Get and validate organization data from localStorage
    const orgData = localStorage.getItem('organization');
    const userId = localStorage.getItem('user');
    if (!userId) {
      setError('User not authenticated');
      return;
    }

    if (!orgData) {
      setError('Organization data not found. Please log in again.');
      return;
    }
    try {
      const organization = JSON.parse(orgData) as Organization;
      if (!organization.id) {
        setError('Invalid organization data. Please log in again.');
        return;
      }
      setOrganizationId(organization.id);
      const user = JSON.parse(userId) as User;
      if (!user) {
        setError("Invalid User");
        return;
      }
      setUserId(user.id);



      const fetchInitialData = async () => {
        try {
          const token = localStorage.getItem('authToken');
          if (!token) {
            setError('Authentication token not found. Please log in again.');
            return;
          }

          const headers = { Authorization: `Bearer ${token}` };
          
          // Fetch all data
          const [clientsRes, marketsRes, cropsRes] = await Promise.all([
            axios.get<Client[]>(`${API_BASE_URL}/clients`, { headers }),
            axios.get<Market[]>(`${API_BASE_URL}/market`, { headers }),
            axios.get<Crop[]>(`${API_BASE_URL}/crops`, { headers })
          ]);

          setClients(clientsRes.data);
          setMarkets(marketsRes.data);
          setCrops(cropsRes.data);
        } catch (err) {
          console.error('Error fetching data:', err);
          setError('Failed to fetch initial data');
        }
      };

      fetchInitialData();
    } catch (e) {
      console.error('Error parsing organization data:', e);
      setError('Failed to parse organization data. Please log in again.');
    }
    
  }, []);

  const addNewLine = () => {
    const newLine: SaleLine = {
      id: `temp-${Date.now()}`,
      cropId: '',
      quantity: 0,
      unitPrice: 0,
      lineAmount: 0
    };
    setSaleLines([...saleLines, newLine]);
  };

  const updateLine = (
    index: number,
    field: keyof SaleLine,
    value: string | number
  ) => {
    setSaleLines(prevLines => {
      const updatedLines = [...prevLines];
      const line = { ...updatedLines[index] };

      // Type-safe field updates
      if (field === 'cropId' && typeof value === 'string') {
        const crop = crops.find(c => c.id === value);
        if (crop) {
          line.cropId = value;
        {/*}  line.unitPrice = crop.price || 0;
          line.lineAmount = line.quantity * (crop.price || 0);*/}
        }
      } 
      else if (field === 'quantity' && typeof value === 'number') {
        line.quantity = value;
        line.lineAmount = line.unitPrice * value;
      } 
      else if (field === 'unitPrice' && typeof value === 'number') {
        line.unitPrice = value;
        line.lineAmount = line.quantity * value;
      } 
      else if (field === 'lineAmount' && typeof value === 'number') {
        line.lineAmount = value;
      } 
      else if (field === 'description' && typeof value === 'string') {
        line.description = value;
      }
      else if (field === 'id' && typeof value === 'string') {
        line.id = value;
      }

      updatedLines[index] = line;
      return updatedLines;
    });
  };

  const removeLine = (index: number) => {
    setSaleLines(saleLines.filter((_, i) => i !== index));
  };

  const getTotalAmount = () => {
    return saleLines.reduce((sum, line) => sum + line.lineAmount, 0);
  };

  const updateSaleStatus = async (status: SaleStatus) => {
    if (!saleId) {
      setError('Sale not found. Please save the sale first.');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars

      setSaleStatus(status);
      setSuccess(`Sale ${status.toLowerCase()} successfully`);
    } catch (err) {
      console.error('Sale status update error:', err);
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || 'Failed to update sale status';
        setError(errorMessage);
      } else {
        setError('Failed to update sale status');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      if (!saleHeader.clientId || !saleHeader.marketId || saleLines.length === 0) {
        setError('Please fill in all required fields and add at least one line item');
        return;
      }

      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        return;
      }

      const saleData = {
        saleDate: saleHeader.saleDate,
        clientId: saleHeader.clientId,
        marketId: saleHeader.marketId,
        userId: userId,
        status: 'DRAFT',
        totalAmount: getTotalAmount(),
        notes: saleHeader.notes || '',
        organizationId: organizationId,
        lines: saleLines.map(line => ({
          cropId: line.cropId,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          lineAmount: line.lineAmount,
          description: line.description || ''
        }))
      };

      const response = await axios.post(`${API_BASE_URL}/sales`, saleData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.data) {
        throw new Error('No data received from server');
      }

      // Store the new sale ID
      setSaleId(response.data.id);

      setSuccess('Sale created successfully');
      // Reset form logic remains the same
    } catch (err) {
      console.error('Sale creation error:', err);
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || 'Failed to create sale';
        setError(errorMessage);
      } else {
        setError('Failed to create sale');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader className="flex flex-col sm:flex-row justify-between items-center">
        <CardTitle>New Sale</CardTitle>
        {saleId && (
          <div className="flex space-x-2 mt-2 sm:mt-0">
            <Button 
              onClick={() => updateSaleStatus('APPROVED')} 
              variant="default"
              disabled={saleStatus !== 'DRAFT' || loading}
              className="flex items-center"
            >
              <Check className="h-4 w-4 mr-2" />
              Approve
            </Button>
            <Button 
              onClick={() => updateSaleStatus('REJECTED')} 
              variant="destructive"
              disabled={saleStatus !== 'DRAFT' || loading}
              className="flex items-center"
            >
              <X className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert variant="default">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        
        {/* Sale Header - Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="client-select">Client</label>
            <Select
              value={saleHeader.clientId}
              onValueChange={(value) => {
                setSaleHeader(prev => ({ ...prev, clientId: value }));
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map(client => (
                  <SelectItem key={client.id} value={client.id}>
                    {`${client.firstName} ${client.lastName}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="market-select">Market</label>
            <Select
              value={saleHeader.marketId}
              onValueChange={(value) => {
                setSaleHeader(prev => ({ ...prev, marketId: value }));
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Market" />
              </SelectTrigger>
              <SelectContent>
                {markets.map(market => (
                  <SelectItem key={market.id} value={market.id}>
                    {market.marketName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="sale-date">Sale Date</label>
            <Input
              id="sale-date"
              type="date"
              value={saleHeader.saleDate instanceof Date 
                ? saleHeader.saleDate.toISOString().split('T')[0] 
                : saleHeader.saleDate}
              onChange={(e) => 
                setSaleHeader(prev => ({ 
                  ...prev, 
                  saleDate: new Date(e.target.value) 
                }))
              }
            />
          </div>
        </div>

        <Textarea
          placeholder="Notes"
          value={saleHeader.notes}
          onChange={(e) => 
            setSaleHeader(prev => ({ ...prev, notes: e.target.value }))
          }
        />

        {/* Sale Lines Table - Responsive */}
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/5">Crop</TableHead>
                <TableHead className="w-1/5">Quantity</TableHead>
                <TableHead className="w-1/5">Unit Price</TableHead>
                <TableHead className="w-1/5">Line Amount</TableHead>
                <TableHead className="w-1/5">Description</TableHead>
                <TableHead className="w-1/5 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {saleLines.map((line, index) => (
                <TableRow key={line.id}>
                  <TableCell>
                    <Select
                      value={line.cropId}
                      onValueChange={(value) => updateLine(index, 'cropId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Crop" />
                      </SelectTrigger>
                      <SelectContent>
                        {crops.map(crop => (
                          <SelectItem key={crop.id} value={crop.id}>
                            {crop.cropName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={line.quantity}
                      onChange={(e) => 
                        updateLine(index, 'quantity', Number(e.target.value))
                      }
                      min="0"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={line.unitPrice}
                      readOnly
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={line.lineAmount}
                      readOnly
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={line.description || ''}
                      onChange={(e) => 
                        updateLine(index, 'description', e.target.value)
                      }
                      placeholder="Description"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeLine(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-between items-center">
          <Button onClick={addNewLine} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Line
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
        <div className="text-lg font-semibold w-full sm:w-auto text-center sm:text-left">
          Total Amount: {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
          }).format(getTotalAmount())}
        </div>
        <div className="flex space-x-2 w-full sm:w-auto justify-center sm:justify-end">
          <Button onClick={handleSubmit} disabled={loading} className="w-full sm:w-auto">
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Sale'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default NewSaleForm;