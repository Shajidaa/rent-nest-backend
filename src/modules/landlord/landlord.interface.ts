export interface CreatePropertyInput {
  title: string;
  description: string;
  city: string;
  area: string;
  fullAddress: string;
  price_per_month: number;
  securityDeposit: number;
  categoryId: string;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  facing: any;
  veranda?: number;
  images: string[];
  size: number;
  sizeUnit: any;
  utilities: string[];
  preferredTenant: any;
  parking?: boolean;
}
