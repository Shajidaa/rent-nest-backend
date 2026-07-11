export interface ICreateCheckoutSessionInput {
  userId: string;
  rentalRequestId: string;
}

export interface IStripeSessionMetadata {
  rentalRequestId: string;
  userId: string;
}
