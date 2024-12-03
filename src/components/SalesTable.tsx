import React, { useState, useEffect, useCallback } from 'react';
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
  Menu,
  Download,
  RefreshCw
} from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { toast } from '../hooks/use-toast';

// Define Sale interface
interface SalesLine {
  id: string;
  cropId: string;
  quantity: number;
  unitPrice: number;
  lineAmount: number;
  description?: string;
}

interface Sale {
  id: string;
  saleDate: string;
  clientId: string;
  clientName: string;
  marketId: string;
  userId: string;
  status: 'DRAFT' | 'CONFIRMED' | 'INVOICED' | 'PAID' | 'CANCELLED';
  totalAmount: number;
  notes?: string;
  organizationId: string;
  lines: SalesLine[];
}

// Sales Status options for filtering
const SALE_STATUSES = [
  'ALL',
  'DRAFT',
  'CONFIRMED',
  'INVOICED',
  'PAID',
  'CANCELLED'
];

const SalesDashboard: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [saleStatusFilter, setSaleStatusFilter] = useState<string>('ALL');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);
  

  const API_BASE_URL = 'http://localhost:3000';
  const API_ENDPOINTS = {
    sales: '/sales'
  };

  useEffect(() => {
    fetchSales();
  }, []);

  

  // Apply filters whenever search term or sale status filter changes
  useEffect(() => {
    let result = sales;

    // Filter by sale status
    if (saleStatusFilter !== 'ALL') {
      result = result.filter(sale => sale.status === saleStatusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      result = result.filter(sale => 
        sale.id.toLowerCase().includes(searchTermLower) ||
        sale.clientName.toLowerCase().includes(searchTermLower) ||
        sale.status.toLowerCase().includes(searchTermLower)
      );
    }

    setFilteredSales(result);
  }, [searchTerm, saleStatusFilter, sales]);

  const handleDelete = async (saleId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        return;
      }

      await axios.delete(`${API_BASE_URL}${API_ENDPOINTS.sales}/${saleId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Remove the deleted sale from the list
      setSales(prev => prev.filter(sale => sale.id !== saleId));
    } catch (err) {
      console.error('Error deleting sale:', err);
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || 'Failed to delete sale';
        setError(errorMessage);
      } else {
        setError('An unexpected error occurred');
      }
    }
  };


    // Advanced Fetch Sales with Refresh Options
    const fetchSales = useCallback(async (options: { 
      silent?: boolean 
      forceRefresh?: boolean 
    } = {}) => {
      try {
        // Only show loading spinner if not a silent refresh
        if (!options.silent) {
          setLoading(true);
        }
        
        // For force refresh, add a cache-busting timestamp
        const timestamp = options.forceRefresh ? `?t=${Date.now()}` : '';
        
        const token = localStorage.getItem('authToken');
        
        const response = await axios.get<Sale[]>(`${API_BASE_URL}${API_ENDPOINTS.sales}${timestamp}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Cache-Control': options.forceRefresh ? 'no-cache' : 'default'
          }
        });
        
        setSales(response.data);
        setFilteredSales(response.data);
        
        if (!options.silent) {
          setLoading(false);
          toast({
            title: "Sales Refreshed",
            description: `Loaded ${response.data.length} sales records.`
          });
        }
      } catch (err) {
        console.error('Error fetching sales:', err);
        if (axios.isAxiosError(err)) {
          const errorMessage = err.response?.data?.message || 'Failed to fetch sales';
          setError(errorMessage);
          
          toast({
            title: "Refresh Failed",
            description: errorMessage,
            variant: "destructive"
          });
        } else {
          setError('An unexpected error occurred');
        }
        
        if (!options.silent) {
          setLoading(false);
        }
      }
    }, [API_ENDPOINTS.sales]);
  
    // Initial fetch
    useEffect(() => {
      fetchSales();
    }, [fetchSales]);
  
    // Periodic Auto-Refresh
    useEffect(() => {
      const refreshInterval = setInterval(() => {
        fetchSales({ silent: true });
      }, 5 * 60 * 1000); // Refresh every 5 minutes
  
      return () => clearInterval(refreshInterval);
    }, [fetchSales]);
  
    // Manual Refresh Handler
    const handleManualRefresh = async () => {
      setRefreshing(true);
      try {
        await fetchSales({ forceRefresh: true });
      } finally {
        setRefreshing(false);
      }
    };
  
    // Export to CSV Function
    const exportToCSV = () => {
      try {
        // Ensure filteredSales exists and is an array
        if (!filteredSales || !Array.isArray(filteredSales) || filteredSales.length === 0) {
          toast({
            title: "Export Failed",
            description: "No sales data available to export.",
            variant: "destructive"
          });
          return;
        }
    
        // Safe data extraction with default values
        const csvData = filteredSales.map(sale => {
          // Ensure each field is safely converted to string
          return [
            sale.id?.toString() || 'N/A',
            sale.clientName?.toString() || 'N/A',
            (sale.totalAmount !== undefined 
              ? sale.totalAmount.toFixed(2) 
              : 'N/A'),
            sale.status?.toString() || 'N/A',
            sale.saleDate?.toString() || 'N/A',
            sale.notes?.toString() || ''
          ];
        });
    
        // Headers remain the same
        const headers = [
          'Sale ID', 
          'Client Name', 
          'Total Amount', 
          'Status', 
          'Sale Date', 
          'Notes'
        ];
    
        // Combine headers and data with proper escaping
        const csvContent = [
          headers.join(','),
          ...csvData.map(row => row.map(value => 
            // Robust escaping of commas, quotes, and potential undefined values
            `"${String(value).replace(/"/g, '""')}"` 
          ).join(','))
        ].join('\n');
    
        // Create and download CSV
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `sales_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        
        link.click();
        
        // Clean up
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    
        toast({
          title: "Export Successful",
          description: `Exported ${filteredSales.length} sales records to CSV.`
        });
      } catch (error) {
        console.error('CSV Export Error:', error);
        toast({
          title: "Export Failed",
          description: "An unexpected error occurred during export.",
          variant: "destructive"
        });
      }
    };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Sales Details Dialog
  const SaleDetailsDialog: React.FC<{ sale: Sale }> = ({ sale }) => {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">View Details</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Sale Details</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">ID:</span>
              <span className="col-span-3 text-sm">{sale.id}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">Client:</span>
              <span className="col-span-3 text-sm">{sale.clientName}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">Total:</span>
              <span className="col-span-3 text-sm">{formatCurrency(sale.totalAmount)}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">Status:</span>
              <span className="col-span-3 text-sm">{sale.status}</span>
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
          <CardTitle>Sales</CardTitle>
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
    <Card className="w-full max-w-full  mx-auto">
    <CardHeader className="flex flex-col sm:flex-row justify-between items-center p-4">
      <div className="flex items-center space-x-2">
        <CardTitle className="mb-4 sm:mb-0">Sales</CardTitle>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleManualRefresh}
          disabled={refreshing}
          className=''
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
        <Button 
          variant="outline" 
          onClick={exportToCSV}
          className="flex items-center bg-[#0401ff] text-white hover:bg-[#1812ff] hover:text-white"
        >
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>
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
              value={saleStatusFilter}
              onValueChange={setSaleStatusFilter}
            >
              <SelectTrigger className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                {SALE_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status === 'ALL' ? 'All Statuses' : status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative w-full">
              <Input
                placeholder="Search sales"
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
            value={saleStatusFilter}
            onValueChange={setSaleStatusFilter}
          >
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              {SALE_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status === 'ALL' ? 'All Statuses' : status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative">
            <Input
              placeholder="Search sales"
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

        {filteredSales.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No sales found.
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <Table className="hidden sm:table ">
              <TableHeader>
                <TableRow>
                  <TableHead>Sale ID</TableHead>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className='font-bold text-[#1812ff]'>{sale.id}</TableCell>
                    <TableCell className="font-medium">{sale.clientName}</TableCell>
                    <TableCell>{formatCurrency(sale.totalAmount)}</TableCell>
                    <TableCell>{sale.status}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(sale.id)}
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
              {filteredSales.map((sale) => (
                <Card key={sale.id} className="w-full">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-[#1812ff]">{sale.id}</span>
                      <span className="text-sm text-gray-500 uppercase">
                        {sale.status}
                      </span>
                    </div>
                    <div className="mb-2">
                      <h3 className="font-medium text-lg">{sale.clientName}</h3>
                      <p className="text-sm text-gray-600">{formatCurrency(sale.totalAmount)}</p>
                    </div>
                    <div className="flex space-x-2">
                      <SaleDetailsDialog sale={sale} />
                      <Button 
                        variant="destructive" 
                        className="w-full"
                        onClick={() => handleDelete(sale.id)}
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

export default SalesDashboard;