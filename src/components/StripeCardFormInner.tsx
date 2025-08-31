import React, { useState } from 'react'
import { useStripe, useElements, CardNumberElement, CardExpiryElement, CardCvcElement } from '@stripe/react-stripe-js'
import { CreditCard, Lock, AlertCircle, CheckCircle } from 'lucide-react'

interface StripeCardFormInnerProps {
  amount: number
  onSuccess: (result: any) => void
  onError: (error: string) => void
  onClose: () => void
}

export function StripeCardFormInner({ amount, onSuccess, onError, onClose }: StripeCardFormInnerProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [cardErrors, setCardErrors] = useState({
    number: '',
    expiry: '',
    cvc: ''
  })
  const [cardComplete, setCardComplete] = useState({
    number: false,
    expiry: false,
    cvc: false
  })
  const [processing, setProcessing] = useState(false)

  // Stripe element options with professional styling
  const elementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#1f2937',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        lineHeight: '1.5',
        '::placeholder': {
          color: '#9ca3af',
        },
        ':-webkit-autofill': {
          color: '#1f2937',
        }
      },
      invalid: {
        color: '#ef4444',
        iconColor: '#ef4444'
      },
      complete: {
        color: '#059669',
        iconColor: '#059669'
      },
    }
  }

  const handleElementChange = (elementType: 'number' | 'expiry' | 'cvc') => (event: any) => {
    setCardErrors(prev => ({
      ...prev,
      [elementType]: event.error ? event.error.message : ''
    }))
    
    setCardComplete(prev => ({
      ...prev,
      [elementType]: event.complete
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!stripe || !elements) {
      onError('Payment system not ready')
      return
    }

    const cardNumberElement = elements.getElement(CardNumberElement)
    if (!cardNumberElement) {
      onError('Card information is required')
      return
    }

    setProcessing(true)

    try {
      console.log('💳 Creating payment token...')
      
      const { token, error: tokenError } = await stripe.createToken(cardNumberElement, {
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

  const isFormValid = cardComplete.number && cardComplete.expiry && cardComplete.cvc
  const hasErrors = Object.values(cardErrors).some(error => error)

  return (
    <div>
      {/* Security Notice */}
      <div style={{
        backgroundColor: '#dbeafe',
        border: '1px solid #93c5fd',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <Lock style={{ width: '20px', height: '20px', color: '#2563eb' }} />
        <div>
          <div style={{ fontWeight: '600', color: '#1e40af', marginBottom: '4px' }}>
            Secure Payment Processing
          </div>
          <div style={{ fontSize: '14px', color: '#1d4ed8' }}>
            Your payment information is encrypted and secure. Powered by Stripe.
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Card Number */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            fontWeight: '500', 
            marginBottom: '8px',
            color: '#374151',
            fontSize: '14px'
          }}>
            Card Number
          </label>
          <div style={{
            border: cardErrors.number ? '2px solid #ef4444' : cardComplete.number ? '2px solid #059669' : '1px solid #d1d5db',
            borderRadius: '8px',
            padding: '12px',
            backgroundColor: 'white',
            minHeight: '48px',
            display: 'flex',
            alignItems: 'center',
            transition: 'border-color 0.2s'
          }}>
            <CardNumberElement 
              options={elementOptions}
              onChange={handleElementChange('number')}
            />
          </div>
          {cardErrors.number && (
            <div style={{ 
              color: '#ef4444', 
              fontSize: '12px', 
              marginTop: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <AlertCircle style={{ width: '14px', height: '14px' }} />
              {cardErrors.number}
            </div>
          )}
        </div>

        {/* Expiry and CVC Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          {/* Expiry */}
          <div>
            <label style={{ 
              display: 'block', 
              fontWeight: '500', 
              marginBottom: '8px',
              color: '#374151',
              fontSize: '14px'
            }}>
              Expiry Date
            </label>
            <div style={{
              border: cardErrors.expiry ? '2px solid #ef4444' : cardComplete.expiry ? '2px solid #059669' : '1px solid #d1d5db',
              borderRadius: '8px',
              padding: '12px',
              backgroundColor: 'white',
              minHeight: '48px',
              display: 'flex',
              alignItems: 'center',
              transition: 'border-color 0.2s'
            }}>
              <CardExpiryElement 
                options={elementOptions}
                onChange={handleElementChange('expiry')}
              />
            </div>
            {cardErrors.expiry && (
              <div style={{ 
                color: '#ef4444', 
                fontSize: '12px', 
                marginTop: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <AlertCircle style={{ width: '14px', height: '14px' }} />
                {cardErrors.expiry}
              </div>
            )}
          </div>

          {/* CVC */}
          <div>
            <label style={{ 
              display: 'block', 
              fontWeight: '500', 
              marginBottom: '8px',
              color: '#374151',
              fontSize: '14px'
            }}>
              Security Code
            </label>
            <div style={{
              border: cardErrors.cvc ? '2px solid #ef4444' : cardComplete.cvc ? '2px solid #059669' : '1px solid #d1d5db',
              borderRadius: '8px',
              padding: '12px',
              backgroundColor: 'white',
              minHeight: '48px',
              display: 'flex',
              alignItems: 'center',
              transition: 'border-color 0.2s'
            }}>
              <CardCvcElement 
                options={elementOptions}
                onChange={handleElementChange('cvc')}
              />
            </div>
            {cardErrors.cvc && (
              <div style={{ 
                color: '#ef4444', 
                fontSize: '12px', 
                marginTop: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <AlertCircle style={{ width: '14px', height: '14px' }} />
                {cardErrors.cvc}
              </div>
            )}
          </div>
        </div>

        {/* Amount Summary */}
        <div style={{ 
          backgroundColor: '#f9fafb', 
          border: '1px solid #e5e7eb', 
          borderRadius: '8px', 
          padding: '16px', 
          marginBottom: '24px' 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#6b7280' }}>Investment Amount:</span>
            <span style={{ fontWeight: 'bold', color: '#111827' }}>${amount.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>Processing fee (2.9% + $0.30):</span>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>${((amount * 0.029) + 0.30).toFixed(2)}</span>
          </div>
          <div style={{ 
            borderTop: '1px solid #e5e7eb', 
            paddingTop: '8px', 
            marginTop: '8px',
            display: 'flex', 
            justifyContent: 'space-between' 
          }}>
            <span style={{ fontWeight: '600', color: '#111827' }}>Total charge:</span>
            <span style={{ fontWeight: 'bold', color: '#111827' }}>${(amount + (amount * 0.029) + 0.30).toFixed(2)}</span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!stripe || processing || !isFormValid || hasErrors}
          style={{
            width: '100%',
            backgroundColor: (!stripe || processing || !isFormValid || hasErrors) ? '#9ca3af' : '#2563eb',
            color: 'white',
            padding: '16px',
            borderRadius: '8px',
            border: 'none',
            fontWeight: '600',
            fontSize: '16px',
            cursor: (!stripe || processing || !isFormValid || hasErrors) ? 'not-allowed' : 'pointer',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'background-color 0.2s'
          }}
        >
          {processing ? (
            <>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid transparent',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              Processing Investment...
            </>
          ) : (
            <>
              <CreditCard style={{ width: '20px', height: '20px' }} />
              Secure Investment - ${amount.toLocaleString()}
            </>
          )}
        </button>
        
        {/* Test Card Instructions */}
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

        {/* Security Footer */}
        <div style={{ 
          textAlign: 'center', 
          fontSize: '12px', 
          color: '#6b7280', 
          marginTop: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px'
        }}>
          <Lock style={{ width: '12px', height: '12px' }} />
          Your payment information is encrypted and secure
        </div>
      </form>

      {/* Add CSS animation for spinner */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}