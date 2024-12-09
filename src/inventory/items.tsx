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

// Items Interface
export interface Items {
  id: string;
  itemName: string;
  quantity: bigint;
  remainingquantity: bigint;
  organizationid: string;
}

// Quantity Status Categories
const QUANTITY_STATUSES = [
  'LOW_STOCK',
  'IN_STOCK',
  'OUT_OF_STOCK'
] as const;

// Status color mapping
const QUANTITY_STATUS_COLORS = {
  LOW_STOCK: 'bg-yellow-100 text-yellow-800',
  IN_STOCK: 'bg-green-100 text-green-800',
  OUT_OF_STOCK: 'bg-red-100 text-red-800'
};

const InventoryTable: React.FC = () => {
  const [items, setItems] = useState<Items[]>([]);
  const [filteredItems, setFilteredItems] = useState<Items[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [quantityStatusFilter, setQuantityStatusFilter] = useState<string>('ALL');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  // Use BACKEND_URL from .env, fallback to localhost if not set
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
  const API_ENDPOINTS = {
    items: '/items'
  };

  // Determine Quantity Status
  const getQuantityStatus = (item: Items): (typeof QUANTITY_STATUSES)[number] => {
    const remainingQuantity = Number(item.remainingquantity);
    const totalQuantity = Number(item.quantity);
    
    if (remainingQuantity === 0) return 'OUT_OF_STOCK';
    if (remainingQuantity <= totalQuantity * 0.2) return 'LOW_STOCK';
    return 'IN_STOCK';
  };

  // Status Badge Component
  const QuantityStatusBadge: React.FC<{ item: Items }> = ({ item }) => {
    const status = getQuantityStatus(item);
    const colorClass = QUANTITY_STATUS_COLORS[status];
    
    return (
      <span 
        className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${colorClass}`}
      >
        {status.replace('_', ' ').toLowerCase()}
      </span>
    );
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
      
      fetchItems(organization.id);
    } catch (e) {
      console.error('Error parsing organization data:', e);
      setError('Failed to parse organization data. Please log in again.');
      setLoading(false);
    }
  }, []);

  const fetchItems = async (orgId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }

      const response = await axios.get<Items[]>(`${API_BASE_URL}${API_ENDPOINTS.items}`, {
        params: { 
          organizationId: orgId,
          includeOnlyOrgItems: true 
        },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Filter items by organization ID
      const orgSpecificItems = response.data.filter(
        item => item.organizationid === orgId
      );

      setItems(orgSpecificItems);
      setFilteredItems(orgSpecificItems);
      setLoading(false);
    } catch (err) { 
      console.error('Error fetching items:', err);
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || 'Failed to fetch items';
        setError(errorMessage);
      } else {
        setError('An unexpected error occurred');
      }
      setLoading(false);
    }
  };

  // Apply filters whenever search term or quantity status filter changes
  useEffect(() => {
    let result = items;

    // Filter by quantity status
    if (quantityStatusFilter !== 'ALL') {
      result = result.filter(item => 
        getQuantityStatus(item) === quantityStatusFilter
      );
    }

    // Filter by search term
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      result = result.filter(item => 
        item.itemName.toLowerCase().includes(searchTermLower)
      );
    }

    setFilteredItems(result);
  }, [searchTerm, quantityStatusFilter, items]);

  const handleDelete = async (itemId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        return;
      }

      await axios.delete(`${API_BASE_URL}${API_ENDPOINTS.items}/${itemId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Remove the deleted item from the list
      setItems(prev => prev.filter(item => item.id !== itemId));
    } catch (err) {
      console.error('Error deleting item:', err);
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || 'Failed to delete item';
        setError(errorMessage);
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  // Mobile Item Details Dialog
  const ItemDetailsDialog: React.FC<{ item: Items }> = ({ item }) => {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">View Details</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Item Details</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">ID:</span>
              <span className="col-span-3 text-sm">{item.id}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">Item Name:</span>
              <span className="col-span-3 text-sm">{item.itemName}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">Total Quantity:</span>
              <span className="col-span-3 text-sm">{item.quantity.toString()}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">Remaining Quantity:</span>
              <span className="col-span-3 text-sm">{item.remainingquantity.toString()}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">Status:</span>
              <span className="col-span-3 text-sm">
                <QuantityStatusBadge item={item} />
              </span>
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
          <CardTitle>Inventory</CardTitle>
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
        <CardTitle className="mb-4 sm:mb-0">Inventory</CardTitle>
        
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
              value={quantityStatusFilter}
              onValueChange={setQuantityStatusFilter}
            >
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                {QUANTITY_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative w-full">
              <Input
                placeholder="Search items"
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
            value={quantityStatusFilter}
            onValueChange={setQuantityStatusFilter}
          >
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              {QUANTITY_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative">
            <Input
              placeholder="Search items"
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

        {filteredItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No items found.
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <Table className="hidden sm:table">
              <TableHeader>
                <TableRow>
                  <TableHead className='text-left'>Item ID</TableHead>
                  <TableHead className='text-left'>Item Name</TableHead>
                  <TableHead className='text-left'>Total Quantity</TableHead>
                  <TableHead className='text-left'>Remaining Quantity</TableHead>
                  <TableHead className='text-left'>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className='font-bold text-left'>{item.id}</TableCell>
                    <TableCell className="font-medium text-left">{item.itemName}</TableCell>
                    <TableCell className='text-left'>{item.quantity.toString()}</TableCell>
                    <TableCell className='text-left'>{item.remainingquantity.toString()}</TableCell>
                    <TableCell className='text-left'>
                      <QuantityStatusBadge item={item} />
                    </TableCell>
                    <TableCell className="text-right space-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => navigate(`/inventory/edit/${item.id}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                </TableBody>
                </Table>


                <div className="sm:hidden space-y-4">
                    {filteredItems.map((item)=>(
                        <Card key={item.id} className="w-full">
                             <CardContent className="p-4">
                             <div className="flex justify-between items-center mb-2">

                             </div>
                             <div className="flex space-x-2">
                      <ItemDetailsDialog item={item} />
                      <Button 
                        variant="destructive" 
                        className="w-full"
                        onClick={() => handleDelete(item.id)}
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
export default InventoryTable;