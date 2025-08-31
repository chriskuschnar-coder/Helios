export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
}

export const stripeProducts: StripeProduct[] = [
  {
    id: 'prod_Sy48e8gkZYuxMN',
    priceId: 'price_1S280LFhEA0kH7xcHCcUrHNN',
    name: 'Investment Amount',
    description: 'Make an investment in our hedge fund',
    mode: 'payment'
  }
];

export function getProductById(id: string): StripeProduct | undefined {
  return stripeProducts.find(product => product.id === id);
}

export function getProductByPriceId(priceId: string): StripeProduct | undefined {
  return stripeProducts.find(product => product.priceId === priceId);
}