import React from 'react'
import { useAuth } from './auth/AuthProvider'
import { Crown, Clock, AlertCircle, CheckCircle } from 'lucide-react'
import { getProductByPriceId } from '../stripe-config'

export function SubscriptionStatus() {
  const { subscription, loading } = useAuth()

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="animate-pulse flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!subscription) {
    return (
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <AlertCircle className="h-6 w-6 text-gray-400" />
          <div>
            <p className="font-medium text-gray-900">No Active Subscription</p>
            <p className="text-sm text-gray-600">Subscribe to access premium features</p>
          </div>
        </div>
      </div>
    )
  }

  const product = subscription.price_id ? getProductByPriceId(subscription.price_id) : null
  const statusConfig = getStatusConfig(subscription.subscription_status)

  return (
    <div className={`rounded-lg border p-4 ${statusConfig.bgColor} ${statusConfig.borderColor}`}>
      <div className="flex items-center space-x-3">
        <statusConfig.icon className={`h-6 w-6 ${statusConfig.iconColor}`} />
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <p className={`font-medium ${statusConfig.textColor}`}>
              {product?.name || 'Subscription'}
            </p>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusConfig.badgeColor}`}>
              {subscription.subscription_status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <p className={`text-sm ${statusConfig.subtextColor}`}>
            {getStatusMessage(subscription)}
          </p>
        </div>
      </div>
    </div>
  )
}

function getStatusConfig(status: string) {
  switch (status) {
    case 'active':
      return {
        icon: CheckCircle,
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        iconColor: 'text-green-600',
        textColor: 'text-green-900',
        subtextColor: 'text-green-700',
        badgeColor: 'bg-green-100 text-green-800'
      }
    case 'trialing':
      return {
        icon: Clock,
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        iconColor: 'text-blue-600',
        textColor: 'text-blue-900',
        subtextColor: 'text-blue-700',
        badgeColor: 'bg-blue-100 text-blue-800'
      }
    case 'past_due':
    case 'unpaid':
      return {
        icon: AlertCircle,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        iconColor: 'text-red-600',
        textColor: 'text-red-900',
        subtextColor: 'text-red-700',
        badgeColor: 'bg-red-100 text-red-800'
      }
    case 'canceled':
      return {
        icon: AlertCircle,
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        iconColor: 'text-gray-600',
        textColor: 'text-gray-900',
        subtextColor: 'text-gray-700',
        badgeColor: 'bg-gray-100 text-gray-800'
      }
    default:
      return {
        icon: Crown,
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        iconColor: 'text-yellow-600',
        textColor: 'text-yellow-900',
        subtextColor: 'text-yellow-700',
        badgeColor: 'bg-yellow-100 text-yellow-800'
      }
  }
}

function getStatusMessage(subscription: any): string {
  const { subscription_status, current_period_end, cancel_at_period_end } = subscription

  switch (subscription_status) {
    case 'active':
      if (cancel_at_period_end && current_period_end) {
        const endDate = new Date(current_period_end * 1000).toLocaleDateString()
        return `Cancels on ${endDate}`
      }
      if (current_period_end) {
        const renewDate = new Date(current_period_end * 1000).toLocaleDateString()
        return `Renews on ${renewDate}`
      }
      return 'Active subscription'
    
    case 'trialing':
      if (current_period_end) {
        const trialEndDate = new Date(current_period_end * 1000).toLocaleDateString()
        return `Trial ends on ${trialEndDate}`
      }
      return 'Free trial active'
    
    case 'past_due':
      return 'Payment failed - please update your payment method'
    
    case 'unpaid':
      return 'Payment required to continue service'
    
    case 'canceled':
      return 'Subscription has been cancelled'
    
    case 'incomplete':
      return 'Payment confirmation required'
    
    case 'not_started':
      return 'Ready to subscribe'
    
    default:
      return 'Subscription status unknown'
  }
}