export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
  amount?: number;
  currency?: string;
}

export const stripeProducts: StripeProduct[] = [
  {
    id: 'investment_amount',
    priceId: 'price_1S280LFhEA0kH7xcHCcUrHNN',
    name: 'Investment Amount',
    description: 'Make an investment in our hedge fund with flexible amounts starting from $100',
    mode: 'payment',
    amount: 10000, // Default amount in cents ($100.00)
    currency: 'usd'
  }
];

export function getProductById(id: string): StripeProduct | undefined {
  return stripeProducts.find(product => product.id === id);
}

export function getProductByPriceId(priceId: string): StripeProduct | undefined {
  return stripeProducts.find(product => product.priceId === priceId);
}