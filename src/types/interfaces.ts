export interface Crop {
    id: string;
    cropName: string;
    cropCode: string;
    quantity: string | null;
    fieldName: string;
    season: string;
    organizationId: string;
  }
  
 export interface Client {
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
  
 export interface Market {
    id: string;
    marketName: string;
    marketCode: string;
    location: string;
    opened: boolean;
    openingDate: string;
    lastopenDate: string;
    organizationId: string;
  }
  
  export interface SaleLine {
    id: string;
    cropId: string;
    quantity: number;
    unitPrice: number;
    lineAmount: number;
    description?: string;
  }
  
  export interface SaleHeader {
    clientId: string;
    marketId: string;
    saleDate: Date;
    notes: string;
  }

  export interface Market{
    id: string;
    marketName: string;
    marketCode:string;
    location: string;
    opened:boolean;
    openingDate: string;
    lastopenDate:string;
    organizationId: string;
  }

 