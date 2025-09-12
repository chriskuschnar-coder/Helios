import React, { useState, useEffect } from 'react'
import { 
  Shield, 
  Smartphone, 
  Key, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  Monitor, 
  MapPin, 
  Clock, 
  Eye,
  EyeOff,
  Download,
  Bell,
  Wifi,
  LogOut,
  RefreshCw,
  Lock,
  Unlock,
  Settings,
  Globe,
  Mail,
  MessageSquare,
  QrCode,
  Copy,
  X,
  Plus,
  Trash2
} from 'lucide-react'
import { useAuth } from './auth/AuthProvider'
import { TwoFactorSetup } from './auth/TwoFactorSetup'

interface SecuritySettingsProps {
  onBack: () => void
}

interface ActiveSession {
  id: string
  device: string
  browser: string
  ip: string
  location: string
  lastActive: string
  current: boolean
}

interface SecurityAlert {
  id: string
  type: 'login_success' | 'login_failed' | 'password_change' | '2fa_enabled' | '2fa_disabled'
  message: string
  timestamp: string
  ip: string
  location: string
  device: string
}

interface BackupCode {
  code: string
  used: boolean
}

export const SecuritySettings: React.FC<SecuritySettingsProps> = ({ onBack }) => {
  const { user, profile, refreshProfile } = useAuth()
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([])
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([])
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [backupCodes, setBackupCodes] = useState<BackupCode[]>([])
  const [showBackupCodes, setShowBackupCodes] = useState(false)
  const [selectedTwoFactorMethod, setSelectedTwoFactorMethod] = useState<'email' | 'sms' | 'authenticator'>('email')

  // Calculate security score
  const calculateSecurityScore = () => {
    let score = 30 // Base score
    
    if (profile?.two_factor_enabled) score += 40
    if (passwordData.new && getPasswordStrength(passwordData.new) >= 4) score += 20
    if (emailNotifications) score += 10
    
    return Math.min(score, 100)
  }

  const securityScore = calculateSecurityScore()

  // Generate mock data for demo
  useEffect(() => {
    generateMockSessions()
    generateMockAlerts()
    generateMockBackupCodes()
  }, [])

  const generateMockSessions = () => {
    const sessions: ActiveSession[] = [
      {
        id: '1',
        device: 'MacBook Pro',
        browser: 'Chrome 120.0',
        ip: '192.168.1.100',
        location: 'Miami, FL, US',
        lastActive: new Date().toISOString(),
        current: true
      },
      {
        id: '2',
        device: 'iPhone 15 Pro',
        browser: 'Safari Mobile',
        ip: '10.0.0.45',
        location: 'Miami, FL, US',
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        current: false
      },
      {
        id: '3',
        device: 'Windows PC',
        browser: 'Edge 119.0',
        ip: '203.0.113.45',
        location: 'New York, NY, US',
        lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        current: false
      }
    ]
    setActiveSessions(sessions)
  }

  const generateMockAlerts = () => {
    const alerts: SecurityAlert[] = [
      {
        id: '1',
        type: 'login_success',
        message: 'Successful login from new device',
        timestamp: new Date().toISOString(),
        ip: '192.168.1.100',
        location: 'Miami, FL, US',
        device: 'MacBook Pro'
      },
      {
        id: '2',
        type: 'login_success',
        message: 'Successful login',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        ip: '10.0.0.45',
        location: 'Miami, FL, US',
        device: 'iPhone 15 Pro'
      },
      {
        id: '3',
        type: 'login_failed',
        message: 'Failed login attempt',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        ip: '203.0.113.99',
        location: 'Unknown',
        device: 'Unknown'
      }
    ]
    setSecurityAlerts(alerts)
  }

  const generateMockBackupCodes = () => {
    const codes: BackupCode[] = [
      { code: 'ABC123DEF', used: false },
      { code: 'GHI456JKL', used: false },
      { code: 'MNO789PQR', used: true },
      { code: 'STU012VWX', used: false },
      { code: 'YZA345BCD', used: false },
      { code: 'EFG678HIJ', used: false },
      { code: 'KLM901NOP', used: false },
      { code: 'QRS234TUV', used: false }
    ]
    setBackupCodes(codes)
  }

  const getPasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[a-z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++
    return strength
  }

  const getPasswordStrengthLabel = (strength: number) => {
    switch (strength) {
      case 0:
      case 1: return { label: 'Very Weak', color: 'text-red-600 bg-red-50' }
      case 2: return { label: 'Weak', color: 'text-orange-600 bg-orange-50' }
      case 3: return { label: 'Fair', color: 'text-yellow-600 bg-yellow-50' }
      case 4: return { label: 'Good', color: 'text-blue-600 bg-blue-50' }
      case 5: return { label: 'Strong', color: 'text-green-600 bg-green-50' }
      default: return { label: 'Unknown', color: 'text-gray-600 bg-gray-50' }
    }
  }

  const getSecurityScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-200'
    if (score >= 75) return 'text-blue-600 bg-blue-50 border-blue-200'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'login_success': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'login_failed': return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'password_change': return <Key className="h-4 w-4 text-blue-600" />
      case '2fa_enabled': return <Shield className="h-4 w-4 text-green-600" />
      case '2fa_disabled': return <Shield className="h-4 w-4 text-orange-600" />
      default: return <Bell className="h-4 w-4 text-gray-600" />
    }
  }

  const getTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    return 'Just now'
  }

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
        .update({ 
          two_factor_enabled: false,
          two_factor_method: null,
          two_factor_backup_codes: []
        })
        .eq('id', user?.id)

      if (error) {
        throw error
      }

      localStorage.removeItem('biometric_credential_id')
      await refreshProfile()
      setSuccess('Two-factor authentication has been disabled')
      setError('')
    } catch (error) {
      console.error('Error disabling 2FA:', error)
      setError('Failed to disable 2FA. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.new !== passwordData.confirm) {
      setError('New passwords do not match')
      return
    }

    if (getPasswordStrength(passwordData.new) < 3) {
      setError('Password is too weak. Please choose a stronger password.')
      return
    }

    setLoading(true)
    try {
      const { supabaseClient } = await import('../lib/supabase-client')
      const { error } = await supabaseClient.auth.updateUser({
        password: passwordData.new
      })

      if (error) {
        throw error
      }

      setSuccess('Password updated successfully')
      setPasswordData({ current: '', new: '', confirm: '' })
      setShowPasswordChange(false)
      setError('')
    } catch (error) {
      console.error('Error changing password:', error)
      setError('Failed to change password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogoutAllSessions = async () => {
    if (!confirm('This will log you out of all devices. You will need to sign in again. Continue?')) {
      return
    }

    setLoading(true)
    try {
      const { supabaseClient } = await import('../lib/supabase-client')
      await supabaseClient.auth.signOut({ scope: 'global' })
      // This will trigger a page reload via the auth state change
    } catch (error) {
      console.error('Error logging out all sessions:', error)
      setError('Failed to log out all sessions')
      setLoading(false)
    }
  }

  const handle2FASetupComplete = () => {
    setShowTwoFactorSetup(false)
    refreshProfile()
    setSuccess('Two-factor authentication has been enabled successfully!')
  }

  const copyBackupCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setSuccess('Backup code copied to clipboard')
  }

  const downloadBackupCodes = () => {
    const codesText = backupCodes
      .filter(code => !code.used)
      .map(code => code.code)
      .join('\n')
    
    const blob = new Blob([`Global Markets Consulting - Backup Codes\n\nGenerated: ${new Date().toLocaleString()}\n\n${codesText}\n\nKeep these codes safe and secure. Each code can only be used once.`], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'gmc-backup-codes.txt'
    a.click()
    URL.revokeObjectURL(url)
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
      {/* Header */}
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
                  <h1 className="text-xl font-semibold text-gray-900">Security Center</h1>
                  <p className="text-sm text-gray-600">Manage your account security</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => window.location.reload()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center animate-in fade-in duration-500">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span>{success}</span>
            <button
              onClick={() => setSuccess('')}
              className="ml-auto text-green-600 hover:text-green-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center animate-in fade-in duration-500">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
            <button
              onClick={() => setError('')}
              className="ml-auto text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Security Score */}
        <div className={`rounded-xl p-6 mb-8 border-2 ${getSecurityScoreColor(securityScore)}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <Shield className="h-6 w-6 text-navy-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Security Score</h2>
                <p className="text-sm opacity-80">Your account security rating</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{securityScore}%</div>
              <div className="text-sm opacity-80">
                {securityScore >= 90 ? 'Excellent' : 
                 securityScore >= 75 ? 'Good' : 
                 securityScore >= 60 ? 'Fair' : 'Needs Improvement'}
              </div>
            </div>
          </div>
          
          <div className="w-full bg-white bg-opacity-50 rounded-full h-3 overflow-hidden">
            <div 
              className="h-3 rounded-full transition-all duration-1000 ease-out"
              style={{ 
                width: `${securityScore}%`,
                background: securityScore >= 90 ? '#10b981' : 
                           securityScore >= 75 ? '#3b82f6' : 
                           securityScore >= 60 ? '#f59e0b' : '#ef4444'
              }}
            ></div>
          </div>
          
          {securityScore < 90 && (
            <div className="mt-4 p-3 bg-white bg-opacity-50 rounded-lg">
              <p className="text-sm font-medium mb-2">Improve your security:</p>
              <ul className="text-sm space-y-1">
                {!profile?.two_factor_enabled && <li>• Enable two-factor authentication (+40 points)</li>}
                {(!passwordData.new || getPasswordStrength(passwordData.new) < 4) && <li>• Use a stronger password (+20 points)</li>}
                {!emailNotifications && <li>• Enable security notifications (+10 points)</li>}
              </ul>
            </div>
          )}
        </div>

        {/* 2FA Warning Banner */}
        {!profile?.two_factor_enabled && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 animate-in fade-in duration-500">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div className="flex-1">
                <h3 className="font-medium text-yellow-900">Two-Factor Authentication Recommended</h3>
                <p className="text-sm text-yellow-700">Protect your account with an additional layer of security.</p>
              </div>
              <button
                onClick={handleEnable2FA}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Enable Now
              </button>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Two-Factor Authentication */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Smartphone className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {profile?.two_factor_enabled ? (
                    <>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-green-700 font-medium text-sm">Enabled</span>
                      </div>
                      <button
                        onClick={handleDisable2FA}
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                      >
                        {loading ? 'Disabling...' : 'Disable'}
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-red-700 font-medium text-sm">Disabled</span>
                      </div>
                      <button
                        onClick={handleEnable2FA}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                      >
                        Enable 2FA
                      </button>
                    </>
                  )}
                </div>
              </div>

              {profile?.two_factor_enabled && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-900">2FA Active</span>
                    </div>
                    <p className="text-sm text-green-700">
                      Method: {profile.two_factor_method === 'email' ? 'Email Verification' : 
                               profile.two_factor_method === 'sms' ? 'SMS Verification' : 
                               'Biometric Authentication'}
                    </p>
                  </div>

                  {/* Backup Codes */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Key className="h-4 w-4 text-gray-600" />
                        <span className="font-medium text-gray-900">Backup Codes</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setShowBackupCodes(!showBackupCodes)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          {showBackupCodes ? 'Hide' : 'Show'} Codes
                        </button>
                        <button
                          onClick={downloadBackupCodes}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    {showBackupCodes && (
                      <div className="grid grid-cols-2 gap-2">
                        {backupCodes.map((backup, index) => (
                          <div
                            key={index}
                            className={`p-2 rounded border text-center font-mono text-sm ${
                              backup.used 
                                ? 'bg-gray-100 text-gray-500 line-through' 
                                : 'bg-gray-50 text-gray-900 hover:bg-gray-100 cursor-pointer'
                            }`}
                            onClick={() => !backup.used && copyBackupCode(backup.code)}
                          >
                            {backup.code}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-500 mt-2">
                      {backupCodes.filter(c => !c.used).length} unused codes remaining
                    </p>
                  </div>
                </div>
              )}

              {!profile?.two_factor_enabled && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button
                      onClick={() => setSelectedTwoFactorMethod('email')}
                      className={`p-4 border-2 rounded-lg text-center transition-all ${
                        selectedTwoFactorMethod === 'email'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Mail className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                      <div className="font-medium text-gray-900">Email</div>
                      <div className="text-xs text-gray-600">Verification codes via email</div>
                    </button>
                    
                    <button
                      onClick={() => setSelectedTwoFactorMethod('sms')}
                      className={`p-4 border-2 rounded-lg text-center transition-all ${
                        selectedTwoFactorMethod === 'sms'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <MessageSquare className="h-6 w-6 mx-auto mb-2 text-green-600" />
                      <div className="font-medium text-gray-900">SMS</div>
                      <div className="text-xs text-gray-600">Text message codes</div>
                    </button>
                    
                    <button
                      onClick={() => setSelectedTwoFactorMethod('authenticator')}
                      className={`p-4 border-2 rounded-lg text-center transition-all ${
                        selectedTwoFactorMethod === 'authenticator'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <QrCode className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                      <div className="font-medium text-gray-900">Authenticator</div>
                      <div className="text-xs text-gray-600">Google Authenticator, Authy</div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Password Management */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Key className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Password Management</h3>
                    <p className="text-sm text-gray-600">Keep your account secure with a strong password</p>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowPasswordChange(!showPasswordChange)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Change Password
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Last Changed</div>
                  <div className="font-medium text-gray-900">
                    {new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Password Strength</div>
                  <div className="font-medium text-green-600">Strong</div>
                </div>
              </div>

              {showPasswordChange && (
                <form onSubmit={handlePasswordChange} className="space-y-4 border-t border-gray-200 pt-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordData.current}
                        onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter current password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordData.new}
                        onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter new password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    
                    {passwordData.new && (
                      <div className="mt-2">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm text-gray-600">Strength:</span>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPasswordStrengthLabel(getPasswordStrength(passwordData.new)).color}`}>
                            {getPasswordStrengthLabel(getPasswordStrength(passwordData.new)).label}
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div 
                            className="h-1 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${(getPasswordStrength(passwordData.new) / 5) * 100}%`,
                              backgroundColor: getPasswordStrength(passwordData.new) >= 4 ? '#10b981' : 
                                             getPasswordStrength(passwordData.new) >= 3 ? '#3b82f6' : 
                                             getPasswordStrength(passwordData.new) >= 2 ? '#f59e0b' : '#ef4444'
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordData.confirm}
                        onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Confirm new password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    
                    {passwordData.confirm && (
                      <div className="mt-2 flex items-center text-xs">
                        {passwordData.new === passwordData.confirm ? (
                          <>
                            <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                            <span className="text-green-600">Passwords match</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-3 w-3 text-red-500 mr-2" />
                            <span className="text-red-600">Passwords do not match</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={loading || !passwordData.current || !passwordData.new || !passwordData.confirm || passwordData.new !== passwordData.confirm}
                      className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      {loading ? 'Updating...' : 'Update Password'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordChange(false)
                        setPasswordData({ current: '', new: '', confirm: '' })
                      }}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Security Notifications */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Bell className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Security Notifications</h3>
                    <p className="text-sm text-gray-600">Get notified about account security events</p>
                  </div>
                </div>
                
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-900">Login Alerts</span>
                  </div>
                  <div className={`text-xs font-medium ${emailNotifications ? 'text-green-600' : 'text-gray-500'}`}>
                    {emailNotifications ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-gray-900">Security Changes</span>
                  </div>
                  <div className={`text-xs font-medium ${emailNotifications ? 'text-green-600' : 'text-gray-500'}`}>
                    {emailNotifications ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-gray-900">Suspicious Activity</span>
                  </div>
                  <div className={`text-xs font-medium ${emailNotifications ? 'text-green-600' : 'text-gray-500'}`}>
                    {emailNotifications ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Active Sessions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Monitor className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Active Sessions</h3>
                    <p className="text-sm text-gray-600">Manage your logged-in devices</p>
                  </div>
                </div>
                
                <button
                  onClick={handleLogoutAllSessions}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                >
                  {loading ? 'Logging Out...' : 'Log Out All'}
                </button>
              </div>

              <div className="space-y-3">
                {activeSessions.map((session) => (
                  <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Monitor className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">{session.device}</span>
                            {session.current && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                Current
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">{session.browser}</div>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            <div className="flex items-center space-x-1">
                              <Globe className="h-3 w-3" />
                              <span>{session.ip}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span>{session.location}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{getTimeAgo(session.lastActive)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {!session.current && (
                        <button
                          onClick={() => {
                            setActiveSessions(prev => prev.filter(s => s.id !== session.id))
                            setSuccess('Session terminated successfully')
                          }}
                          className="text-red-600 hover:text-red-700 p-1"
                          title="Terminate session"
                        >
                          <LogOut className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Security Alerts */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <Eye className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Recent Security Activity</h3>
                    <p className="text-sm text-gray-600">Monitor login attempts and security events</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {securityAlerts.map((alert) => (
                  <div key={alert.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="mt-0.5">
                        {getAlertIcon(alert.type)}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{alert.message}</div>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{getTimeAgo(alert.timestamp)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Globe className="h-3 w-3" />
                            <span>{alert.ip}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>{alert.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Monitor className="h-3 w-3" />
                            <span>{alert.device}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Account Information</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <p className="text-gray-900 font-medium">{user?.email}</p>
              <p className="text-xs text-green-600 mt-1">✓ Verified</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <p className="text-gray-900 font-medium">{profile?.full_name || 'Not provided'}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Status</label>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-green-700 font-medium">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security Best Practices */}
        <div className="bg-gradient-to-r from-navy-50 to-blue-50 rounded-xl border border-navy-200 p-6 mt-8">
          <h3 className="text-lg font-semibold text-navy-900 mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Security Best Practices
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <span className="text-sm text-navy-800">Use a unique, strong password</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <span className="text-sm text-navy-800">Enable two-factor authentication</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <span className="text-sm text-navy-800">Keep backup codes in a safe place</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <span className="text-sm text-navy-800">Monitor active sessions regularly</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <span className="text-sm text-navy-800">Enable security notifications</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <span className="text-sm text-navy-800">Log out from public devices</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}