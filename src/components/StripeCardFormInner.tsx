import React, { useState } from 'react'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'

interface StripeCardFormInnerProps {
  amount: number
  onSuccess: (result: any) => void
  onError: (error: string) => void
  onClose: () => void
}

export function StripeCardFormInner({ amount, onSuccess, onError, onClose }: StripeCardFormInnerProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [cardError, setCardError] = useState('')
  const [processing, setProcessing] = useState(false)

  // Show loading state while Stripe initializes
  if (!stripe || !elements) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div>Initializing payment form...</div>
        <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
          Loading Stripe Elements...
        </div>
      </div>
    )
  }

  const handleCardChange = (event: any) => {
    if (event.error) {
      setCardError(event.error.message)
    } else {
      setCardError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!stripe || !elements) {
      onError('Payment system not ready. Please wait a moment and try again.')
      return
    }

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      onError('Card information is required')
      return
    }

    setProcessing(true)
    setCardError('')

    try {
      console.log('💳 Creating payment token...')
      
      // Create token (frontend-only, no backend required)
      const { token, error: tokenError } = await stripe.createToken(cardElement, {
        name: 'Investment Account Funding',
      })
      
      if (tokenError) {
        console.error('❌ Token creation failed:', tokenError.message)
        onError(tokenError.message)
        return
      }

      console.log('✅ Payment token created successfully:', token.id)
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Call success handler
      onSuccess({
        id: token.id,
        amount: amount,
        method: 'card',
        status: 'completed',
        token: token,
        last4: token.card?.last4,
        brand: token.card?.brand
      })
      
    } catch (err) {
      console.error('❌ Payment processing error:', err)
      onError('Payment failed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      {/* Success indicator */}
      <div style={{ 
        backgroundColor: '#f0f9ff', 
        border: '1px solid #bae6fd', 
        borderRadius: '8px', 
        padding: '16px', 
        marginBottom: '24px' 
      }}>
        <div style={{ fontWeight: '600', color: '#0c4a6e', marginBottom: '8px' }}>
          🔒 Secure Payment System Ready
        </div>
        <div style={{ fontSize: '14px', color: '#075985' }}>
          Your payment information is encrypted and secure. Powered by Stripe.
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <label style={{ 
          display: 'block', 
          fontWeight: '500', 
          marginBottom: '12px',
          color: '#374151'
        }}>
          Card Information
        </label>
        
        {/* CRITICAL: Guaranteed visible container for CardElement */}
        <div
          style={{
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            padding: '16px',
            backgroundColor: 'white',
            minHeight: '60px',
            display: 'flex',
            alignItems: 'center',
            marginBottom: '16px'
          }}
        >
          <div style={{ width: '100%' }}>
            <CardElement
              onChange={handleCardChange}
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#1f2937',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    '::placeholder': {
                      color: '#9ca3af',
                    },
                  },
                  invalid: {
                    color: '#ef4444',
                  },
                  complete: {
                    color: '#059669',
                  },
                }
              }}
            />
          </div>
        </div>
        
        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '16px' }}>
          Enter your card number, expiry date (MM/YY), and security code (CVC)
        </div>
        
        {cardError && (
          <div style={{ 
            color: '#ef4444', 
            fontSize: '14px', 
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center'
          }}>
            ⚠️ {cardError}
          </div>
        )}

        {/* Amount Summary */}
        <div style={{ 
          backgroundColor: '#f9fafb', 
          border: '1px solid #e5e7eb', 
          borderRadius: '8px', 
          padding: '16px', 
          marginBottom: '24px' 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>Investment Amount:</span>
            <span style={{ fontWeight: 'bold' }}>${amount.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>Processing fee (2.9% + $0.30):</span>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>${((amount * 0.029) + 0.30).toFixed(2)}</span>
          </div>
          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '8px', marginTop: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: '500' }}>Total charge:</span>
              <span style={{ fontWeight: 'bold' }}>${(amount + (amount * 0.029) + 0.30).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={!stripe || !elements || processing}
          style={{
            width: '100%',
            backgroundColor: processing ? '#9ca3af' : '#2563eb',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '8px',
            border: 'none',
            fontWeight: '600',
            cursor: processing ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}
        >
          {processing ? (
            <>
              <div style={{ 
                width: '16px', 
                height: '16px', 
                border: '2px solid white', 
                borderTop: '2px solid transparent', 
                borderRadius: '50%', 
                animation: 'spin 1s linear infinite',
                marginRight: '8px'
              }}></div>
              Processing Investment...
            </>
          ) : (
            `💳 Invest $${amount.toLocaleString()} Capital`
          )}
        </button>
        
        <div style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center', marginBottom: '16px' }}>
          Your payment information is encrypted and secure. Powered by Stripe.
        </div>
      </form>
      
      {/* Test card info */}
      <div style={{ 
        backgroundColor: '#fefce8', 
        border: '1px solid \'#fde047', 
        borderRadius: '8px', 
        padding: '12px' 
      }}>
        <div style={{ fontSize: '12px', color: '#a16207' }}>
          <strong>Test Card:</strong> Use 4242 4242 4242 4242 with any future date and any 3-digit CVC
        </div>
      </div>

      {/* Add spinning animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}