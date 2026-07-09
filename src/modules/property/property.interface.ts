import { CreatePropertyInput } from "../landlord/landlord.interface";

export interface PropertyQueryFilter extends Partial<CreatePropertyInput> {
  page?: string | number;
  limit?: string | number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  searchTerm?: string;
  tags?: string;
}
