import React, { useState } from 'react'
import { Shield, Smartphone, Key, AlertTriangle, CheckCircle, Settings, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from './auth/AuthProvider'
import { TwoFactorSetup } from './auth/TwoFactorSetup'

export function SecuritySettings() {
  const { user, enableTwoFactor, disableTwoFactor } = useAuth()
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showDisableConfirm, setShowDisableConfirm] = useState(false)

  const handleEnable2FA = () => {
    setShowTwoFactorSetup(true)
  }

  const handleDisable2FA = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const result = await disableTwoFactor()
      
      if (result.success) {
        setSuccess('Two-factor authentication has been disabled')
        setShowDisableConfirm(false)
      } else {
        setError(result.error || 'Failed to disable 2FA')
      }
    } catch (err) {
      setError('Failed to disable 2FA')
    } finally {
      setLoading(false)
    }
  }

  const handle2FASuccess = () => {
    setShowTwoFactorSetup(false)
    setSuccess('Two-factor authentication has been enabled successfully!')
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Shield className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Security Settings</h3>
            <p className="text-sm text-gray-600">Manage your account security preferences</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="text-red-900 font-medium">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-900 font-medium">{success}</span>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Two-Factor Authentication */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  user?.two_factor_enabled ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <Smartphone className={`h-4 w-4 ${
                    user?.two_factor_enabled ? 'text-green-600' : 'text-gray-600'
                  }`} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Two-Factor Authentication</h4>
                  <p className="text-sm text-gray-600">
                    Add an extra layer of security with authenticator app codes
                  </p>
                </div>
              </div>
              
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                user?.two_factor_enabled 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {user?.two_factor_enabled ? 'Enabled' : 'Disabled'}
              </div>
            </div>

            <div className="space-y-4">
              {user?.two_factor_enabled ? (
                <div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-green-900 font-medium">
                        Two-factor authentication is active
                      </span>
                    </div>
                    <p className="text-sm text-green-700 mt-2">
                      Your account is protected with TOTP-based two-factor authentication.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowDisableConfirm(true)}
                    disabled={loading}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    {loading ? 'Disabling...' : 'Disable 2FA'}
                  </button>
                </div>
              ) : (
                <div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <span className="text-yellow-900 font-medium">
                        Two-factor authentication is not enabled
                      </span>
                    </div>
                    <p className="text-sm text-yellow-700 mt-2">
                      Enable 2FA to add an extra layer of security to your account.
                    </p>
                  </div>

                  <button
                    onClick={handleEnable2FA}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Enable 2FA
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Password Security */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <Lock className="h-4 w-4 text-gray-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Password</h4>
                <p className="text-sm text-gray-600">
                  Change your account password
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                // TODO: Implement password change flow
                setError('Password change functionality coming soon')
              }}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Change Password
            </button>
          </div>

          {/* Session Management */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <Settings className="h-4 w-4 text-gray-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Active Sessions</h4>
                <p className="text-sm text-gray-600">
                  Manage your active login sessions
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Current Session</div>
                  <div className="text-sm text-gray-600">
                    {navigator.userAgent.includes('Chrome') ? 'Chrome' : 
                     navigator.userAgent.includes('Firefox') ? 'Firefox' : 
                     navigator.userAgent.includes('Safari') ? 'Safari' : 'Browser'} • 
                    {new Date().toLocaleDateString()}
                  </div>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Disable 2FA Confirmation Modal */}
      {showDisableConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Disable Two-Factor Authentication?
              </h3>
              <p className="text-gray-600">
                This will make your account less secure. Are you sure you want to continue?
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowDisableConfirm(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDisable2FA}
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-medium transition-colors"
              >
                {loading ? 'Disabling...' : 'Disable 2FA'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Two-Factor Setup Modal */}
      {showTwoFactorSetup && (
        <TwoFactorSetup
          onClose={() => setShowTwoFactorSetup(false)}
          onSuccess={handle2FASuccess}
        />
      )}
    </>
  )
}