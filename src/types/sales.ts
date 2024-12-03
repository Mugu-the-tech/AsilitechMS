export interface SalesLine {
    id: string;
    cropId: string;
    quantity: number;
    unitPrice: number;
    lineAmount: number;
    description?: string;
  }
  
  export interface Sale {
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