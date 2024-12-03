import  { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../components/ui/button';
import SalesDashboard from '../components/SalesTable';
import SaleDetails from '../sales/Salesdetails';
import NewSaleForm from '../sales/Salescard';
import { Sale} from '../types/sales';
import {
  Dialog,
  DialogContent,
} from "../components/ui/dialog";
import { DialogTitle } from '@radix-ui/react-dialog';
const SalesPage = () => {
    const [showNewSale, setShowNewSale] = useState(false);
    const [selectedSale] = useState<Sale | null>(null);
    const [showDetails, setShowDetails] = useState(false);
  
    {/*const handleViewDetails = (sale: Sale) => {
      setSelectedSale(sale);
      setShowDetails(true);
    };*/}
  
    return (
      <div className="space-y-4">
        <div className="flex justify-end mb-1">
          <Button 
            onClick={() => setShowNewSale(true)}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            New Sale
          </Button>
        </div>
  
        <SalesDashboard />
        
        <SaleDetails 
          sale={selectedSale}
          open={showDetails}
          onOpenChange={setShowDetails}
        />
  
        <Dialog open={showNewSale} onOpenChange={setShowNewSale}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogTitle className='font-bold text-[#394dff]'>Add A New Sale</DialogTitle>
            <NewSaleForm />
          </DialogContent>
        </Dialog>
      </div>
    );
  };
  
  export default SalesPage;