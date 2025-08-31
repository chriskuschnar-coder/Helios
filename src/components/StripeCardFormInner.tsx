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

  // This should never happen now due to loading guard, but keep as safety
  if (!stripe || !elements) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div>Payment system not ready...</div>
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
    
    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      onError('Card information is required')
      return
    }

    setProcessing(true)
    setCardError('')

    try {
      console.log('💳 Creating payment token...')
      
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
    <form onSubmit={handleSubmit}>
      <label style={{ 
        display: 'block', 
        fontWeight: '500', 
        marginBottom: '12px',
        color: '#374151'
      }}>
        Card Information
      </label>
      
      {/* CRITICAL: Guaranteed visible container with actual CardElement */}
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
        <CardElement
          onChange={handleCardChange}
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#fa755a',
              },
              complete: {
                color: '#059669',
              },
            },
          }}
        />
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
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: '500' }}>Total charge:</span>
          <span style={{ fontWeight: 'bold' }}>${(amount + (amount * 0.029) + 0.30).toFixed(2)}</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={processing}
        style={{
          width: '100%',
          backgroundColor: processing ? '#9ca3af' : '#2563eb',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '8px',
          border: 'none',
          fontWeight: '600',
          cursor: processing ? 'not-allowed' : 'pointer',
          marginBottom: '16px'
        }}
      >
        {processing ? 'Processing...' : `Invest $${amount.toLocaleString()}`}
      </button>
      
      <div style={{ 
        backgroundColor: '#fefce8', 
        border: '1px solid #fde047', 
        borderRadius: '8px', 
        padding: '12px' 
      }}>
        <div style={{ fontSize: '12px', color: '#a16207' }}>
          <strong>Test Card:</strong> Use 4242 4242 4242 4242 with any future date and any 3-digit CVC
        </div>
      </div>
    </form>
  )
}