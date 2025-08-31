import React, { useState, useEffect } from 'react'
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { AlertCircle, CheckCircle, CreditCard } from 'lucide-react'

// Test Stripe promise
const stripePromise = loadStripe('pk_test_51S25DbFhEA0kH7xcn7HrWHyUNUgJfFaYiYmnAMLhBZeWE1fU9TLhiKKh6bTvJz3LF68E9qAokVRBJMHLWkiPWUR000jCr1fLmH')

function StripeDebugInner() {
  const stripe = useStripe()
  const elements = useElements()
  
  // Amount state - single source of truth
  const [investmentAmount, setInvestmentAmount] = useState(5000)
  
  // Debug states
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [cardStates, setCardStates] = useState({
    number: { ready: false, complete: false, error: null, focused: false },
    expiry: { ready: false, complete: false, error: null, focused: false },
    cvc: { ready: false, complete: false, error: null, focused: false }
  })
  
  // Derived calculations - all from single source
  const processingFee = investmentAmount * 0.029 + 0.30
  const totalCharge = investmentAmount + processingFee

  useEffect(() => {
    console.log('🔍 Stripe Debug - Component mounted')
    console.log('Stripe instance:', stripe)
    console.log('Elements instance:', elements)
    
    setDebugInfo({
      stripe: !!stripe,
      elements: !!elements,
      stripeVersion: stripe?.version || 'Not loaded',
      windowStripe: !!(window as any).Stripe,
      cardNumberElement: !!elements?.getElement(CardNumberElement),
      cardExpiryElement: !!elements?.getElement(CardExpiryElement),
      cardCvcElement: !!elements?.getElement(CardCvcElement),
      origin: window.location.origin,
      userAgent: navigator.userAgent.substring(0, 50),
      timestamp: new Date().toISOString()
    })
  }, [stripe, elements])

  const elementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#1f2937',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        lineHeight: '1.5',
        padding: '12px 0',
        '::placeholder': {
          color: '#9ca3af',
        },
      },
      invalid: {
        color: '#ef4444',
        iconColor: '#ef4444'
      },
      complete: {
        color: '#059669',
        iconColor: '#059669'
      },
    },
    disabled: false,
  }

  const handleCardChange = (elementType: string) => (event: any) => {
    console.log(`🔍 ${elementType} changed:`, {
      complete: event.complete,
      error: event.error?.message,
      empty: event.empty,
      brand: event.brand
    })
    
    setCardStates(prev => ({
      ...prev,
      [elementType]: {
        ready: true,
        complete: event.complete,
        error: event.error?.message || null,
        focused: false
      }
    }))
  }

  const handleCardFocus = (elementType: string) => () => {
    console.log(`🔍 ${elementType} focused`)
    setCardStates(prev => ({
      ...prev,
      [elementType]: { ...prev[elementType], focused: true }
    }))
  }

  const handleCardBlur = (elementType: string) => () => {
    console.log(`🔍 ${elementType} blurred`)
    setCardStates(prev => ({
      ...prev,
      [elementType]: { ...prev[elementType], focused: false }
    }))
  }

  const testCardElements = () => {
    const cardNumber = elements?.getElement(CardNumberElement)
    const cardExpiry = elements?.getElement(CardExpiryElement)
    const cardCvc = elements?.getElement(CardCvcElement)
    
    console.log('🧪 Testing card elements:')
    console.log('CardNumber element:', cardNumber)
    console.log('CardExpiry element:', cardExpiry)
    console.log('CardCvc element:', cardCvc)
    
    // Try to focus the card number element
    if (cardNumber) {
      try {
        cardNumber.focus()
        console.log('✅ Successfully focused card number element')
      } catch (error) {
        console.error('❌ Failed to focus card number element:', error)
      }
    }
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = Number(e.target.value) || 0
    console.log('💰 Amount changed:', newAmount)
    setInvestmentAmount(newAmount)
  }

  return (
    <div style={{ padding: '20px', border: '2px solid #3b82f6', margin: '20px', borderRadius: '8px' }}>
      <h2 style={{ color: '#1f2937', marginBottom: '20px' }}>🧪 Stripe Debug Test</h2>
      
      {/* Debug Information Panel */}
      <div style={{ background: '#f3f4f6', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 12px 0', color: '#374151' }}>Debug Information:</h3>
        <div style={{ fontSize: '12px', fontFamily: 'monospace' }}>
          <div>✅ Stripe Ready: {debugInfo.stripe ? 'YES' : 'NO'}</div>
          <div>✅ Elements Ready: {debugInfo.elements ? 'YES' : 'NO'}</div>
          <div>✅ Stripe Version: {debugInfo.stripeVersion}</div>
          <div>✅ Window.Stripe: {debugInfo.windowStripe ? 'YES' : 'NO'}</div>
          <div>✅ CardNumber Element: {debugInfo.cardNumberElement ? 'YES' : 'NO'}</div>
          <div>✅ CardExpiry Element: {debugInfo.cardExpiryElement ? 'YES' : 'NO'}</div>
          <div>✅ CardCvc Element: {debugInfo.cardCvcElement ? 'YES' : 'NO'}</div>
          <div>🌐 Origin: {debugInfo.origin}</div>
          <div>🕐 Timestamp: {debugInfo.timestamp}</div>
        </div>
        <button 
          onClick={testCardElements}
          style={{ 
            marginTop: '12px', 
            padding: '8px 16px', 
            background: '#3b82f6', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test Card Elements Focus
        </button>
      </div>

      {/* Amount Testing - Single Source of Truth */}
      <div style={{ background: '#fef3c7', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 12px 0', color: '#92400e' }}>💰 Amount Testing (Single Source of Truth):</h3>
        
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>
            Investment Amount:
          </label>
          <input
            type="number"
            value={investmentAmount}
            onChange={handleAmountChange}
            min="100"
            step="100"
            style={{
              padding: '12px',
              border: '2px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '18px',
              fontWeight: '600',
              width: '200px'
            }}
          />
        </div>
        
        <div style={{ fontSize: '14px', color: '#374151' }}>
          <div>💵 Investment Amount: <strong>${investmentAmount.toLocaleString()}</strong></div>
          <div>💳 Processing Fee: <strong>${processingFee.toFixed(2)}</strong></div>
          <div>💰 Total Charge: <strong>${totalCharge.toFixed(2)}</strong></div>
        </div>
      </div>

      {/* Card Elements Status */}
      <div style={{ background: '#ecfdf5', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 12px 0', color: '#065f46' }}>💳 Card Elements Status:</h3>
        <div style={{ fontSize: '12px' }}>
          {Object.entries(cardStates).map(([type, state]) => (
            <div key={type} style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
              <span style={{ width: '80px', textTransform: 'capitalize' }}>{type}:</span>
              {state.ready ? (
                <CheckCircle style={{ width: '16px', height: '16px', color: '#10b981', marginRight: '8px' }} />
              ) : (
                <AlertCircle style={{ width: '16px', height: '16px', color: '#ef4444', marginRight: '8px' }} />
              )}
              <span>Ready: {state.ready ? 'YES' : 'NO'}</span>
              <span style={{ marginLeft: '12px' }}>Complete: {state.complete ? 'YES' : 'NO'}</span>
              <span style={{ marginLeft: '12px' }}>Focused: {state.focused ? 'YES' : 'NO'}</span>
              {state.error && <span style={{ marginLeft: '12px', color: '#ef4444' }}>Error: {state.error}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Stripe Elements Test Form */}
      {!stripe || !elements ? (
        <div style={{ background: '#fef2f2', padding: '16px', borderRadius: '8px', border: '2px solid #fca5a5' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <AlertCircle style={{ width: '20px', height: '20px', color: '#dc2626', marginRight: '8px' }} />
            <span style={{ fontWeight: '600', color: '#dc2626' }}>Stripe Not Ready</span>
          </div>
          <div style={{ fontSize: '14px', color: '#7f1d1d' }}>
            Stripe: {!!stripe ? 'Loaded' : 'Loading...'}<br/>
            Elements: {!!elements ? 'Loaded' : 'Loading...'}
          </div>
        </div>
      ) : (
        <div style={{ background: '#f0f9ff', padding: '16px', borderRadius: '8px', border: '2px solid #0ea5e9' }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#0c4a6e', display: 'flex', alignItems: 'center' }}>
            <CreditCard style={{ width: '20px', height: '20px', marginRight: '8px' }} />
            Interactive Card Elements Test
          </h3>
          
          <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Card Number */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                Card Number (Try typing: 4242 4242 4242 4242)
              </label>
              <div 
                style={{
                  border: `2px solid ${cardStates.number.complete ? '#10b981' : cardStates.number.error ? '#ef4444' : '#d1d5db'}`,
                  borderRadius: '8px',
                  padding: '16px',
                  backgroundColor: 'white',
                  minHeight: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'border-color 0.2s ease',
                  cursor: 'text'
                }}
                onClick={() => {
                  const element = elements.getElement(CardNumberElement)
                  if (element) {
                    element.focus()
                    console.log('🔍 Manually focused card number element')
                  }
                }}
              >
                <CardNumberElement 
                  options={elementOptions}
                  onChange={handleCardChange('number')}
                  onFocus={handleCardFocus('number')}
                  onBlur={handleCardBlur('number')}
                />
              </div>
              <div style={{ fontSize: '12px', marginTop: '4px', color: '#6b7280' }}>
                Status: {cardStates.number.ready ? '✅ Ready' : '❌ Not Ready'} | 
                Complete: {cardStates.number.complete ? '✅ Yes' : '❌ No'} |
                Focused: {cardStates.number.focused ? '✅ Yes' : '❌ No'}
                {cardStates.number.error && <span style={{ color: '#ef4444' }}> | Error: {cardStates.number.error}</span>}
              </div>
            </div>

            {/* Card Expiry */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                Expiry Date (Try typing: 12/34)
              </label>
              <div 
                style={{
                  border: `2px solid ${cardStates.expiry.complete ? '#10b981' : cardStates.expiry.error ? '#ef4444' : '#d1d5db'}`,
                  borderRadius: '8px',
                  padding: '16px',
                  backgroundColor: 'white',
                  minHeight: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'border-color 0.2s ease',
                  cursor: 'text'
                }}
                onClick={() => {
                  const element = elements.getElement(CardExpiryElement)
                  if (element) {
                    element.focus()
                    console.log('🔍 Manually focused expiry element')
                  }
                }}
              >
                <CardExpiryElement 
                  options={elementOptions}
                  onChange={handleCardChange('expiry')}
                  onFocus={handleCardFocus('expiry')}
                  onBlur={handleCardBlur('expiry')}
                />
              </div>
              <div style={{ fontSize: '12px', marginTop: '4px', color: '#6b7280' }}>
                Status: {cardStates.expiry.ready ? '✅ Ready' : '❌ Not Ready'} | 
                Complete: {cardStates.expiry.complete ? '✅ Yes' : '❌ No'} |
                Focused: {cardStates.expiry.focused ? '✅ Yes' : '❌ No'}
                {cardStates.expiry.error && <span style={{ color: '#ef4444' }}> | Error: {cardStates.expiry.error}</span>}
              </div>
            </div>

            {/* Card CVC */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                Security Code (Try typing: 123)
              </label>
              <div 
                style={{
                  border: `2px solid ${cardStates.cvc.complete ? '#10b981' : cardStates.cvc.error ? '#ef4444' : '#d1d5db'}`,
                  borderRadius: '8px',
                  padding: '16px',
                  backgroundColor: 'white',
                  minHeight: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'border-color 0.2s ease',
                  cursor: 'text'
                }}
                onClick={() => {
                  const element = elements.getElement(CardCvcElement)
                  if (element) {
                    element.focus()
                    console.log('🔍 Manually focused CVC element')
                  }
                }}
              >
                <CardCvcElement 
                  options={elementOptions}
                  onChange={handleCardChange('cvc')}
                  onFocus={handleCardFocus('cvc')}
                  onBlur={handleCardBlur('cvc')}
                />
              </div>
              <div style={{ fontSize: '12px', marginTop: '4px', color: '#6b7280' }}>
                Status: {cardStates.cvc.ready ? '✅ Ready' : '❌ Not Ready'} | 
                Complete: {cardStates.cvc.complete ? '✅ Yes' : '❌ No'} |
                Focused: {cardStates.cvc.focused ? '✅ Yes' : '❌ No'}
                {cardStates.cvc.error && <span style={{ color: '#ef4444' }}> | Error: {cardStates.cvc.error}</span>}
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Amount Calculation Test */}
      <div style={{ background: '#f0f9ff', padding: '16px', borderRadius: '8px', border: '2px solid #0ea5e9', marginTop: '20px' }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#0c4a6e' }}>💰 Amount Calculation Test</h3>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
            Test Investment Amount:
          </label>
          <input
            type="number"
            value={investmentAmount}
            onChange={handleAmountChange}
            min="100"
            step="100"
            style={{
              padding: '12px',
              border: '2px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '18px',
              fontWeight: '600',
              width: '200px'
            }}
            placeholder="5000"
          />
        </div>
        
        <div style={{ 
          background: 'white', 
          padding: '16px', 
          borderRadius: '6px', 
          border: '1px solid #e5e7eb',
          fontSize: '14px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>Investment Amount:</span>
            <strong>${investmentAmount.toLocaleString()}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>Processing Fee (2.9% + $0.30):</span>
            <strong>${processingFee.toFixed(2)}</strong>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            paddingTop: '8px', 
            borderTop: '1px solid #e5e7eb',
            fontWeight: '600'
          }}>
            <span>Total Charge:</span>
            <strong>${totalCharge.toFixed(2)}</strong>
          </div>
        </div>
        
        <div style={{ marginTop: '12px', fontSize: '12px', color: '#6b7280' }}>
          🧮 Calculation: ${investmentAmount} + (${investmentAmount} × 0.029 + $0.30) = ${totalCharge.toFixed(2)}
        </div>
      </div>

      {/* Detailed Debug Info */}
      <details style={{ marginTop: '20px' }}>
        <summary style={{ cursor: 'pointer', fontWeight: '600', color: '#374151' }}>
          🔍 Detailed Debug Information
        </summary>
        <pre style={{ 
          background: '#1f2937', 
          color: '#f9fafb', 
          padding: '16px', 
          borderRadius: '8px', 
          fontSize: '12px',
          overflow: 'auto',
          marginTop: '8px'
        }}>
          {JSON.stringify({
            debugInfo,
            cardStates,
            amounts: {
              investment: investmentAmount,
              fee: processingFee,
              total: totalCharge
            }
          }, null, 2)}
        </pre>
      </details>

      {/* Test Instructions */}
      <div style={{ background: '#fffbeb', padding: '16px', borderRadius: '8px', border: '1px solid #fbbf24', marginTop: '20px' }}>
        <h4 style={{ margin: '0 0 8px 0', color: '#92400e' }}>🧪 Test Instructions:</h4>
        <ol style={{ margin: 0, paddingLeft: '20px', color: '#78350f' }}>
          <li>Check if all debug indicators show "YES"</li>
          <li>Try typing in each card field (4242 4242 4242 4242, 12/34, 123)</li>
          <li>Change the investment amount and verify all calculations update</li>
          <li>Watch the console for detailed logging</li>
          <li>Check if borders turn green when fields are complete</li>
        </ol>
      </div>
    </div>
  )
}

export function StripeDebugTest() {
  return (
    <Elements stripe={stripePromise}>
      <StripeDebugInner />
    </Elements>
  )
}