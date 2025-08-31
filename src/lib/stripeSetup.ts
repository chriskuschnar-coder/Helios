import { loadStripe } from '@stripe/stripe-js'

// Create stripePromise once at module level - NEVER recreate inside components
export const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 
  'pk_test_51S25DbFhEA0kH7xcn7HrWHyUNUgJfFaYiYmnAMLhBZeWE1fU9TLhiKKh6bTvJz3LF68E9qAokVRBJMHLWkiPWUR000jCr1fLmH'
)

console.log('🔍 Stripe Setup:')
console.log('Publishable Key:', import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ? 'From env ✅' : 'Using fallback ⚠️')
console.log('Stripe Promise Created:', !!stripePromise ? '✅' : '❌')