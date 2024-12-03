import React from 'react';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { ScrollArea } from "../components/ui/scroll-area";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

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
  marketId: string;
  userId: string;
  status: 'DRAFT' | 'CONFIRMED' | 'INVOICED' | 'PAID' | 'CANCELLED';
  totalAmount: number;
  notes?: string;
  organizationId: string;
  lines: SalesLine[];
}

interface SaleDetailsProps {
  sale: Sale | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SaleDetails: React.FC<SaleDetailsProps> = ({ sale, open, onOpenChange }) => {
  if (!sale) return null;

  const getStatusColor = (status: Sale['status']) => {
    const colors = {
      DRAFT: 'bg-gray-100 text-gray-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      INVOICED: 'bg-yellow-100 text-yellow-800',
      PAID: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800'
    };
    return colors[status];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl font-bold">
              Sale Details #{sale.id}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <ScrollArea className="flex-grow">
          <div className="space-y-6 p-4">
            {/* Sale Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-500">Sale Date</p>
                <p className="text-base">{new Date(sale.saleDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <Badge className={getStatusColor(sale.status)}>
                  {sale.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Client ID</p>
                <p className="text-base">{sale.clientId}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Market ID</p>
                <p className="text-base">{sale.marketId}</p>
              </div>
            </div>

            {/* Sale Lines Table */}
            <div className="border rounded-lg">
              <div className="bg-gray-50 p-4 border-b">
                <h3 className="font-semibold">Sale Lines</h3>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Crop ID</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Line Amount</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sale.lines.map((line) => (
                    <TableRow key={line.id}>
                      <TableCell className="font-medium">{line.cropId}</TableCell>
                      <TableCell className="text-right">{line.quantity}</TableCell>
                      <TableCell className="text-right">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD'
                        }).format(line.unitPrice)}
                      </TableCell>
                      <TableCell className="text-right">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD'
                        }).format(line.lineAmount)}
                      </TableCell>
                      <TableCell>{line.description || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Notes Section */}
            {sale.notes && (
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Notes</h3>
                <p className="text-gray-700">{sale.notes}</p>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="border-t p-4">
          <div className="flex justify-between items-center w-full">
            <div className="text-sm text-gray-500">
              Total Lines: {sale.lines.length}
            </div>
            <div className="text-lg font-semibold">
              Total Amount:{' '}
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
              }).format(sale.totalAmount)}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaleDetails;