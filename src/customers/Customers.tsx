import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '../components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { 
  Search, 
  Filter, 
  Trash2, 
  Edit, 
  Menu
} from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { useNavigate } from 'react-router-dom';
// Client Interface (copied from your provided interface)
interface Client {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  marketId: string;
  location: string;
  farmSize: string;
  status: string;
  organizationId: string;
}

// Client Status options for filtering
const CLIENT_STATUSES = [
  'ALL',
  'ACTIVE',
  'INACTIVE',
  'POTENTIAL',
  'ARCHIVED'
];

const CustomerTable: React.FC = () => {
  const [customers, setCustomers] = useState<Client[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [customerStatusFilter, setCustomerStatusFilter] = useState<string>('ALL');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);
  // Use BACKEND_URL from .env, fallback to localhost if not set
   const API_BASE_URL =  import.meta.env.VITE_BACKEND_URL  || 'http://localhost:3000'; 
  const API_ENDPOINTS = {
    customers: '/clients'
  };

  useEffect(() => {
    const orgData = localStorage.getItem('organization');
    
    if (!orgData) {
      setError('Organization data not found. Please log in again.');
      setLoading(false);
      return;
    }

    try {
      const organization = JSON.parse(orgData);
      if (!organization.id) {
        setError('Invalid organization data. Please log in again.');
        setLoading(false);
        return;
      }
      
      fetchCustomers(organization.id);
    } catch (e) {
      console.error('Error parsing organization data:', e);
      setError('Failed to parse organization data. Please log in again.');
      setLoading(false);
    }
  }, []);

  const fetchCustomers = async (orgId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }

      const response = await axios.get<Client[]>(`${API_BASE_URL}${API_ENDPOINTS.customers}`, {
        params: { 
          organizationId: orgId,
          includeOnlyOrgClients: true 
        },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Filter customers by organization ID
      const orgSpecificCustomers = response.data.filter(
        customer => customer.organizationId === orgId
      );

      setCustomers(orgSpecificCustomers);
      setFilteredCustomers(orgSpecificCustomers);
      setLoading(false);
    } catch (err) { 
      console.error('Error fetching customers:', err);
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || 'Failed to fetch customers';
        setError(errorMessage);
      } else {
        setError('An unexpected error occurred');
      }
      setLoading(false);
    }
  };

  // Apply filters whenever search term or customer status filter changes
  useEffect(() => {
    let result = customers;

    // Filter by customer status
    if (customerStatusFilter !== 'ALL') {
      result = result.filter(customer => customer.status === customerStatusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      result = result.filter(customer => 
        customer.firstName.toLowerCase().includes(searchTermLower) ||
        customer.lastName.toLowerCase().includes(searchTermLower) ||
        customer.email.toLowerCase().includes(searchTermLower) ||
        customer.phoneNumber.toLowerCase().includes(searchTermLower)
      );
    }

    setFilteredCustomers(result);
  }, [searchTerm, customerStatusFilter, customers]);

  const handleDelete = async (customerId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        return;
      }

      await axios.delete(`${API_BASE_URL}${API_ENDPOINTS.customers}/${customerId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Remove the deleted customer from the list
      setCustomers(prev => prev.filter(customer => customer.id !== customerId));
    } catch (err) {
      console.error('Error deleting customer:', err);
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || 'Failed to delete customer';
        setError(errorMessage);
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  // Mobile Customer Details Dialog
  const CustomerDetailsDialog: React.FC<{ customer: Client }> = ({ customer }) => {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">View Details</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">ID:</span>
              <span className="col-span-3 text-sm">{customer.id}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">Name:</span>
              <span className="col-span-3 text-sm">{`${customer.firstName} ${customer.lastName}`}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">Email:</span>
              <span className="col-span-3 text-sm">{customer.email}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">Phone:</span>
              <span className="col-span-3 text-sm">{customer.phoneNumber}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">Location:</span>
              <span className="col-span-3 text-sm">{customer.location}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">Farm Size:</span>
              <span className="col-span-3 text-sm">{customer.farmSize}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">Status:</span>
              <span className="col-span-3 text-sm">{customer.status}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customers</CardTitle>
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
    <Card className="w-full max-w-full mx-auto dark:bg-[#1e2024c9]">
      <CardHeader className="flex flex-col sm:flex-row justify-between items-center p-4">
        <CardTitle className="mb-4 sm:mb-0">Customers</CardTitle>
        
        {/* Mobile Filter Toggle */}
        <div className="w-full sm:hidden flex justify-end mb-4">
          <Button 
            variant="outline" 
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="flex items-center"
          >
            <Menu className="mr-2 h-4 w-4" /> Filters
          </Button>
        </div>

        {/* Mobile Filters */}
        {isMobileFilterOpen && (
          <div className="w-full sm:hidden flex flex-col space-y-2 mb-4">
            <Select 
              value={customerStatusFilter}
              onValueChange={setCustomerStatusFilter}
            >
              <SelectTrigger className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                {CLIENT_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status === 'ALL' ? 'All Statuses' : status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative w-full">
              <Input
                placeholder="Search customers"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full"
              />
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            </div>
          </div>
        )}

        {/* Desktop Filters */}
        <div className="hidden sm:flex space-x-2">
          <Select 
            value={customerStatusFilter}
            onValueChange={setCustomerStatusFilter}
          >
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              {CLIENT_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status === 'ALL' ? 'All Statuses' : status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative">
            <Input
              placeholder="Search customers"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-[200px]"
            />
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {filteredCustomers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No customers found.
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <Table className="hidden sm:table">
              <TableHeader>
                <TableRow>
                  <TableHead className='text-left'>Customer ID</TableHead>
                  <TableHead className='text-left'>First Name</TableHead>
                  <TableHead className='text-left'>Last Name</TableHead>
                  <TableHead className='text-left'>Email</TableHead>
                  <TableHead className='text-left'>Phone</TableHead>
                  <TableHead className='text-left'>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className='font-bold text-left'>{customer.id}</TableCell>
                    <TableCell className="font-medium text-left">{customer.firstName}</TableCell>
                    <TableCell className="font-medium text-left">{customer.lastName}</TableCell>
                    <TableCell className='text-left'>{customer.email}</TableCell>
                    <TableCell className='text-left'>{customer.phoneNumber}</TableCell>
                    <TableCell className='text-left'>{customer.status}</TableCell>
                    <TableCell className="text-right space-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => navigate(`/customers/edit/${customer.id}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(customer.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Mobile Card View */}
            <div className="sm:hidden space-y-4">
              {filteredCustomers.map((customer) => (
                <Card key={customer.id} className="w-full">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-[#1812ff]">{customer.id}</span>
                      <span className="text-sm text-gray-500 capitalize">
                        {customer.status.toLowerCase()}
                      </span>
                    </div>
                    <div className="mb-2">
                      <h3 className="font-medium text-lg">{`${customer.firstName} ${customer.lastName}`}</h3>
                      <p className="text-sm text-gray-600">{customer.email}</p>
                      <p className="text-sm text-gray-600">{customer.phoneNumber}</p>
                    </div>
                    <div className="flex space-x-2">
                      <CustomerDetailsDialog customer={customer} />
                      <Button 
                        variant="destructive" 
                        className="w-full"
                        onClick={() => handleDelete(customer.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerTable;