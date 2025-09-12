import React, { useState, useEffect } from 'react'
import { Shield, Smartphone, Key, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuth } from './auth/AuthProvider'
import { TwoFactorSetup } from './auth/TwoFactorSetup'

interface SecuritySettingsProps {
  onBack: () => void
}

export const SecuritySettings: React.FC<SecuritySettingsProps> = ({ onBack }) => {
  const { user, profile, refreshProfile } = useAuth()
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleEnable2FA = () => {
    setShowTwoFactorSetup(true)
  }

  const handleDisable2FA = async () => {
    if (!confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
      return
    }

    setLoading(true)
    try {
      const { supabaseClient } = await import('../lib/supabase-client')
      const { error } = await supabaseClient
        .from('users')
        .update({ two_factor_enabled: false })
        .eq('id', user?.id)

      if (error) {
        throw error
      }

      // Clear any stored biometric credentials
      localStorage.removeItem('biometric_credential_id')
      
      await refreshProfile()
      setError('')
    } catch (error) {
      console.error('Error disabling 2FA:', error)
      setError('Failed to disable 2FA. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handle2FASetupComplete = () => {
    setShowTwoFactorSetup(false)
    refreshProfile()
  }

  if (showTwoFactorSetup) {
    return (
      <TwoFactorSetup 
        onComplete={handle2FASetupComplete}
        onCancel={() => setShowTwoFactorSetup(false)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 safe-area-top shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-navy-100 rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-navy-600" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Security Settings</h1>
                  <p className="text-sm text-gray-600">Manage your account security</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Two-Factor Authentication */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Smartphone className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Two-Factor Authentication
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Add an extra layer of security to your account by requiring a verification code from your phone.
                  </p>
                  
                  <div className="flex items-center space-x-2 mb-4">
                    {profile?.two_factor_enabled ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-green-700 font-medium">Enabled</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-5 w-5 text-amber-500" />
                        <span className="text-amber-700 font-medium">Disabled</span>
                      </>
                    )}
                  </div>

                  {profile?.two_factor_enabled ? (
                    <button
                      onClick={handleDisable2FA}
                      disabled={loading}
                      className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      {loading ? 'Disabling...' : 'Disable 2FA'}
                    </button>
                  ) : (
                    <button
                      onClick={handleEnable2FA}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Enable 2FA
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Password Management */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Key className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Password
                </h3>
                <p className="text-gray-600 mb-4">
                  Keep your account secure with a strong password.
                </p>
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                  Change Password
                </button>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-gray-900">{user?.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <p className="text-gray-900">{profile?.full_name || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Status</label>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-green-700 font-medium">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}