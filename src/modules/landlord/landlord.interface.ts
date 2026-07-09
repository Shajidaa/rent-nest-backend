import {
  FacingDirection,
  PreferredTenant,
  PropertyStatus,
  SizeUnit,
} from "../../../generated/prisma/client";

export interface CreatePropertyInput {
  id: string;
  title: string;
  description: string;
  city: string;
  area: string;
  fullAddress: string;
  categoryId: string;
  landlordId: string;
  price_per_month: number;
  securityDeposit: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  facing: FacingDirection;
  veranda: number | null;
  images: string[];
  video: string | null;
  size: number;
  sizeUnit: SizeUnit;
  utilities: string[];
  preferredTenant: PreferredTenant;
  parking: boolean;
  status: PropertyStatus;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}
