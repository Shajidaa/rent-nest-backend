export interface ILandlord {
  id: string;
  landlordId: string;

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
  facing: string;
  floor: number;
  veranda: number | null;
  images: string[];
  video?: string | null;
  size: number;
  sizeUnit: string;
  utilities: string[];
  preferredTenant: string;
  parking: boolean;

  status: string;
  isFurnished: string;
  isAvailable: boolean;
}
