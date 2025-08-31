import React, { useState, useEffect } from 'react'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

// Test Stripe promise
const stripePromise = loadStripe('pk_test_51S25DbFhEA0kH7xcn7HrWHyUNUgJfFaYiYmnAMLhBZeWE1fU9TLhiKKh6bTvJz3LF68E9qAokVRBJMHLWkiPWUR000jCr1fLmH')

function StripeTestInner() {
  const stripe = useStripe()
  const elements = useElements()
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    setDebugInfo({
      stripe: !!stripe,
      elements: !!elements,
      stripeVersion: stripe?.version || 'Not loaded',
      windowStripe: !!(window as any).Stripe,
      cardElement: !!elements?.getElement(CardElement)
    })
  }, [stripe, elements])

  return (
    <div style={{ padding: '20px', border: '2px solid red', margin: '20px' }}>
      <h3>Stripe Debug Test</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <h4>Debug Info:</h4>
        <pre style={{ background: '#f0f0f0', padding: '10px', fontSize: '12px' }}>
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4>Environment Check:</h4>
        <div>Origin: {window.location.origin}</div>
        <div>User Agent: {navigator.userAgent.substring(0, 50)}...</div>
        <div>Script loaded: {document.querySelector('script[src*="stripe"]') ? 'Yes' : 'No'}</div>
      </div>

      {!stripe || !elements ? (
        <div style={{ background: 'yellow', padding: '10px' }}>
          Stripe not ready: stripe={!!stripe}, elements={!!elements}
        </div>
      ) : (
        <div>
          <h4>CardElement Test:</h4>
          <div 
            style={{ 
              border: '2px solid blue', 
              padding: '20px', 
              minHeight: '80px',
              background: 'white',
              margin: '10px 0'
            }}
          >
            <CardElement 
              options={{
                style: {
                  base: {
                    fontSize: '18px',
                    color: '#000000',
                    '::placeholder': {
                      color: '#999999',
                    },
                  },
                },
              }}
            />
          </div>
          <button 
            onClick={() => {
              const card = elements.getElement(CardElement)
              console.log('CardElement found:', !!card)
              alert('CardElement found: ' + !!card)
            }}
            style={{ padding: '10px', background: 'green', color: 'white' }}
          >
            Test CardElement
          </button>
        </div>
      )}
    </div>
  )
}

export function StripeDebugTest() {
  return (
    <Elements stripe={stripePromise}>
      <StripeTestInner />
    </Elements>
  )
}