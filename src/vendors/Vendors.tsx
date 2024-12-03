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

// Define Vendor interface
interface Vendor {
  id: string;
  vendorName: string;
  phoneNumber: string;
  vendorEmail: string;
  address: string;
  vendorType: string;
  organizationId: string;
}

// Vendor Type options for filtering
const VENDOR_TYPES = [
  'ALL',
  'SUPPLIER',
  'MANUFACTURER',
  'SERVICE_PROVIDER',
  'DISTRIBUTOR',
  'OTHER'
];

const VendorTable: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentOrganizationId, setCurrentOrganizationId] = useState<string>('');
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [vendorTypeFilter, setVendorTypeFilter] = useState<string>('ALL');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);
  const API_BASE_URL = 'http://localhost:3000';
  const API_ENDPOINTS = {
    vendors: '/vendors'
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
      
      // Explicitly set the current organization ID
      setCurrentOrganizationId(organization.id);
      fetchVendors(organization.id);
    } catch (e) {
      console.error('Error parsing organization data:', e);
      setError('Failed to parse organization data. Please log in again.');
      setLoading(false);
    }
  }, []);

  const fetchVendors = async (orgId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }

      const response = await axios.get<Vendor[]>(`${API_BASE_URL}${API_ENDPOINTS.vendors}`, {
        params: { 
          organizationId: orgId,
          // Add additional parameters if needed by your backend
          includeOnlyOrgVendors: true 
        },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // IMPORTANT: Manually filter vendors by organization ID
      const orgSpecificVendors = response.data.filter(
        vendor => vendor.organizationId === orgId
      );

      //console.log('Fetched Vendors:', response.data);
      //console.log('Organization-Specific Vendors:', orgSpecificVendors);

      setVendors(orgSpecificVendors);
      setFilteredVendors(orgSpecificVendors);
      setLoading(false);
    } catch (err)
    { 
      console.error('Error fetching vendors:', err);
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || 'Failed to fetch vendors';
        setError(errorMessage);
      } else {
        setError('An unexpected error occurred');
      }
      setLoading(false);
    }
  };

  // Apply filters whenever search term or vendor type filter changes
  useEffect(() => {
    let result = vendors;

    // Filter by vendor type
    if (vendorTypeFilter !== 'ALL') {
      result = result.filter(vendor => vendor.vendorType === vendorTypeFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      result = result.filter(vendor => 
        vendor.vendorName.toLowerCase().includes(searchTermLower) ||
        vendor.vendorEmail.toLowerCase().includes(searchTermLower) ||
        vendor.phoneNumber.toLowerCase().includes(searchTermLower)
      );
    }

    setFilteredVendors(result);
  }, [searchTerm, vendorTypeFilter, vendors]);

  const handleDelete = async (vendorId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        return;
      }

      await axios.delete(`${API_BASE_URL}${API_ENDPOINTS.vendors}/${vendorId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Remove the deleted vendor from the list
      setVendors(prev => prev.filter(vendor => vendor.id !== vendorId));
    } catch (err) {
      console.error('Error deleting vendor:', err);
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || 'Failed to delete vendor';
        setError(errorMessage);
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  
  // Mobile Vendor Details Dialog
  const VendorDetailsDialog: React.FC<{ vendor: Vendor }> = ({ vendor }) => {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">View Details</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Vendor Details</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">ID:</span>
              <span className="col-span-3 text-sm">{vendor.id}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">Name:</span>
              <span className="col-span-3 text-sm">{vendor.vendorName}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">Email:</span>
              <span className="col-span-3 text-sm">{vendor.vendorEmail}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">Phone:</span>
              <span className="col-span-3 text-sm">{vendor.phoneNumber}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">Type:</span>
              <span className="col-span-3 text-sm">{vendor.vendorType.replace('_', ' ')}</span>
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
          <CardTitle>Vendors</CardTitle>
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
    <Card className="w-full max-w-full  mx-auto  dark:bg-[#1e2024c9]">
      <CardHeader className="flex flex-col sm:flex-row justify-between items-center p-4">
        <CardTitle className="mb-4 sm:mb-0">Vendors</CardTitle>
        
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
              value={vendorTypeFilter}
              onValueChange={setVendorTypeFilter}
            >
              <SelectTrigger className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by Type" />
              </SelectTrigger>
              <SelectContent>
                {VENDOR_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type === 'ALL' ? 'All Types' : type.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative w-full">
              <Input
                placeholder="Search vendors"
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
            value={vendorTypeFilter}
            onValueChange={setVendorTypeFilter}
          >
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by Type" />
            </SelectTrigger>
            <SelectContent>
              {VENDOR_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type === 'ALL' ? 'All Types' : type.replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative">
            <Input
              placeholder="Search vendors"
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

        {filteredVendors.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No vendors found.
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <Table className="hidden sm:table ">
              <TableHeader className=''>
                <TableRow>
                  <TableHead className='text-left'>Vendor ID</TableHead>
                  <TableHead className='text-left'>Vendor Name</TableHead>
                  <TableHead className='text-left'>Email</TableHead>
                  <TableHead className='text-left'>Phone</TableHead>
                  <TableHead className='text-left'>Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVendors.map((vendor) => (
                  <TableRow key={vendor.id}>
                    <TableCell className='font-bold text-left'>{vendor.id}</TableCell>
                    <TableCell className="font-medium text-left">{vendor.vendorName}</TableCell>
                    <TableCell className='text-left'>{vendor.vendorEmail}</TableCell>
                    <TableCell className='text-left'>{vendor.phoneNumber}</TableCell>
                    <TableCell className='text-left'>{vendor.vendorType.replace('_', ' ')}</TableCell>
                    <TableCell className="text-right space-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => navigate(`/vendors/edit/${vendor.id}`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(vendor.id)}
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
              {filteredVendors.map((vendor) => (
                <Card key={vendor.id} className="w-full">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-[#1812ff]">{vendor.id}</span>
                      <span className="text-sm text-gray-500 capitalize">
                        {vendor.vendorType.replace('_', ' ').toLowerCase()}
                      </span>
                    </div>
                    <div className="mb-2">
                      <h3 className="font-medium text-lg">{vendor.vendorName}</h3>
                      <p className="text-sm text-gray-600">{vendor.vendorEmail}</p>
                      <p className="text-sm text-gray-600">{vendor.phoneNumber}</p>
                    </div>
                    <div className="flex space-x-2">
                      <VendorDetailsDialog vendor={vendor} />
                      <Button 
                        variant="destructive" 
                        className="w-full"
                        onClick={() => handleDelete(vendor.id)}
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

export default VendorTable;