import { Prisma, PropertyStatus } from "../../../generated/prisma/client";
import { CreatePropertyInput } from "../landlord/landlord.interface";

// export interface PropertyQueryFilter extends Partial<CreatePropertyInput> {
//   page?: string | number;
//   limit?: string | number;
//   sortBy?: string;
//   sortOrder?: "asc" | "desc";
//   searchTerm?: string;
//   tags?: string;
//   minPrice?: string | number;
//   maxPrice?: string | number;
//   minSize?: string | number;
//   maxSize?: string | number;
//   category?: string;
// }
export interface PropertyQueryFilter {
  page?: string | number;
  limit?: string | number;
  sortBy?: string;
  sortOrder?: Prisma.SortOrder;
  searchTerm?: string;
  category?: string;
  city?: string;
  area?: string;
  minPrice?: string | number;
  maxPrice?: string | number;
  bedrooms?: string | number;
  bathrooms?: string | number;
  facing?: string;
  veranda?: string | number;
  isAvailable?: string | boolean;
  parking?: string | boolean;
  status?: string | PropertyStatus | PropertyStatus[];
  tags?: string;
}
