export interface IRentalRequestPayload {
  propertyId: string;
  tenantId: string;
  status?: "PENDING" | "APPROVED" | "REJECTED";
  message?: string;
  numberOfGuests?: number | string;
}
