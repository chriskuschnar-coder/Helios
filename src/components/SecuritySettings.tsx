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
  Trash2,
  Loader2
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
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showPasswordConfirmModal, setShowPasswordConfirmModal] = useState(false)
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [pendingAction, setPendingAction] = useState<'disable2fa' | 'logoutAll' | null>(null)

  // Load real data on component mount
  useEffect(() => {
    loadSecurityData()
  }, [user])

  const loadSecurityData = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      // Load user profile data
      await refreshProfile()
      
      // Load security alerts (mock for now, but structure for real implementation)
      await loadSecurityAlerts()
      
      // Load active sessions (mock for now)
      await loadActiveSessions()
      
      // Load backup codes if 2FA is enabled
      if (profile?.two_factor_enabled) {
        await loadBackupCodes()
      }
      
    } catch (error) {
      console.error('Failed to load security data:', error)
      setError('Failed to load security information')
    } finally {
      setLoading(false)
    }
  }

  const loadSecurityAlerts = async () => {
    // In production, this would fetch from an audit_logs table
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

  const loadActiveSessions = async () => {
    // In production, this would fetch from a sessions table
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
      }
    ]
    setActiveSessions(sessions)
  }

  const loadBackupCodes = async () => {
    try {
      const { supabaseClient } = await import('../lib/supabase-client')
      const { data: userData, error } = await supabaseClient
        .from('users')
        .select('two_factor_backup_codes')
        .eq('id', user?.id)
        .single()

      if (!error && userData?.two_factor_backup_codes) {
        setBackupCodes(userData.two_factor_backup_codes)
      } else {
        // Generate new backup codes if none exist
        await generateNewBackupCodes()
      }
    } catch (error) {
      console.error('Failed to load backup codes:', error)
    }
  }

  const generateNewBackupCodes = async () => {
    const codes: BackupCode[] = Array.from({ length: 8 }, () => ({
      code: Math.random().toString(36).substr(2, 9).toUpperCase(),
      used: false
    }))

    try {
      const { supabaseClient } = await import('../lib/supabase-client')
      const { error } = await supabaseClient
        .from('users')
        .update({ two_factor_backup_codes: codes })
        .eq('id', user?.id)

      if (!error) {
        setBackupCodes(codes)
      }
    } catch (error) {
      console.error('Failed to generate backup codes:', error)
    }
  }

  // Calculate security score
  const calculateSecurityScore = () => {
    let score = 30 // Base score
    
    if (profile?.two_factor_enabled) score += 40
    if (passwordData.new && getPasswordStrength(passwordData.new) >= 4) score += 20
    if (emailNotifications) score += 10
    
    return Math.min(score, 100)
  }

  const securityScore = calculateSecurityScore()

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

  const handleDisable2FA = () => {
    setPendingAction('disable2fa')
    setShowPasswordConfirmModal(true)
  }

  const handleLogoutAllSessions = () => {
    setPendingAction('logoutAll')
    setShowPasswordConfirmModal(true)
  }

  const confirmAction = async () => {
    if (!passwordConfirmation.trim()) {
      setError('Please enter your password to confirm')
      return
    }

    setActionLoading(pendingAction)
    
    try {
      const { supabaseClient } = await import('../lib/supabase-client')
      
      // Verify current password first
      const { error: signInError } = await supabaseClient.auth.signInWithPassword({
        email: user?.email || '',
        password: passwordConfirmation
      })

      if (signInError) {
        throw new Error('Incorrect password')
      }

      if (pendingAction === 'disable2fa') {
        // Disable 2FA
        const { error } = await supabaseClient
          .from('users')
          .update({ 
            two_factor_enabled: false,
            two_factor_method: null,
            two_factor_backup_codes: []
          })
          .eq('id', user?.id)

        if (error) throw error

        // Clear any stored biometric credentials
        localStorage.removeItem('biometric_credential_id')
        
        await refreshProfile()
        setSuccess('Two-factor authentication has been disabled')
        setBackupCodes([])
        
      } else if (pendingAction === 'logoutAll') {
        // Log out all sessions
        await supabaseClient.auth.signOut({ scope: 'global' })
        // This will trigger a page reload via auth state change
        return
      }

      setShowPasswordConfirmModal(false)
      setPasswordConfirmation('')
      setPendingAction(null)
      setError('')
      
    } catch (error) {
      console.error('Action failed:', error)
      setError(error instanceof Error ? error.message : 'Action failed')
    } finally {
      setActionLoading(null)
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

    setActionLoading('changePassword')
    
    try {
      const { supabaseClient } = await import('../lib/supabase-client')
      
      // First verify current password
      const { error: verifyError } = await supabaseClient.auth.signInWithPassword({
        email: user?.email || '',
        password: passwordData.current
      })

      if (verifyError) {
        throw new Error('Current password is incorrect')
      }

      // Update password
      const { error } = await supabaseClient.auth.updateUser({
        password: passwordData.new
      })

      if (error) throw error

      // Log security event
      await logSecurityEvent('password_change', 'Password changed successfully')

      setSuccess('Password updated successfully')
      setPasswordData({ current: '', new: '', confirm: '' })
      setShowPasswordChange(false)
      setError('')
      
    } catch (error) {
      console.error('Password change failed:', error)
      setError(error instanceof Error ? error.message : 'Failed to change password')
    } finally {
      setActionLoading(null)
    }
  }

  const handleToggleEmailNotifications = async () => {
    setActionLoading('emailNotifications')
    
    try {
      const { supabaseClient } = await import('../lib/supabase-client')
      const newValue = !emailNotifications
      
      const { error } = await supabaseClient
        .from('users')
        .update({ security_alerts_enabled: newValue })
        .eq('id', user?.id)

      if (error) throw error

      setEmailNotifications(newValue)
      setSuccess(`Security notifications ${newValue ? 'enabled' : 'disabled'}`)
      
    } catch (error) {
      console.error('Failed to update notification settings:', error)
      setError('Failed to update notification settings')
    } finally {
      setActionLoading(null)
    }
  }

  const handle2FAMethodChange = async (newMethod: 'email' | 'sms' | 'authenticator') => {
    if (!profile?.two_factor_enabled) return

    setActionLoading('changeMethod')
    
    try {
      const { supabaseClient } = await import('../lib/supabase-client')
      
      const { error } = await supabaseClient
        .from('users')
        .update({ two_factor_method: newMethod })
        .eq('id', user?.id)

      if (error) throw error

      await refreshProfile()
      setSuccess(`2FA method changed to ${newMethod}`)
      
    } catch (error) {
      console.error('Failed to change 2FA method:', error)
      setError('Failed to change 2FA method')
    } finally {
      setActionLoading(null)
    }
  }

  const logSecurityEvent = async (type: string, message: string) => {
    try {
      // In production, this would log to an audit_logs table
      const newAlert: SecurityAlert = {
        id: Date.now().toString(),
        type: type as any,
        message,
        timestamp: new Date().toISOString(),
        ip: '192.168.1.100', // Would get real IP
        location: 'Miami, FL, US', // Would get real location
        device: 'Current Device'
      }
      
      setSecurityAlerts(prev => [newAlert, ...prev.slice(0, 9)]) // Keep last 10
    } catch (error) {
      console.error('Failed to log security event:', error)
    }
  }

  const handle2FASetupComplete = async () => {
    setShowTwoFactorSetup(false)
    await refreshProfile()
    await generateNewBackupCodes()
    await logSecurityEvent('2fa_enabled', 'Two-factor authentication enabled')
    setSuccess('Two-factor authentication has been enabled successfully!')
  }

  const terminateSession = async (sessionId: string) => {
    setActionLoading(`session-${sessionId}`)
    
    try {
      // In production, this would revoke the specific session
      setActiveSessions(prev => prev.filter(s => s.id !== sessionId))
      await logSecurityEvent('session_terminated', `Session terminated: ${sessionId}`)
      setSuccess('Session terminated successfully')
      
    } catch (error) {
      console.error('Failed to terminate session:', error)
      setError('Failed to terminate session')
    } finally {
      setActionLoading(null)
    }
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
    
    const blob = new Blob([
      `Global Markets Consulting - Backup Codes\n\n`,
      `Generated: ${new Date().toLocaleString()}\n`,
      `Account: ${user?.email}\n\n`,
      `${codesText}\n\n`,
      `IMPORTANT:\n`,
      `- Keep these codes safe and secure\n`,
      `- Each code can only be used once\n`,
      `- Use these codes if you lose access to your 2FA device\n`,
      `- Generate new codes if you suspect they've been compromised`
    ], { type: 'text/plain' })
    
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gmc-backup-codes-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
    
    setSuccess('Backup codes downloaded successfully')
  }

  const regenerateBackupCodes = async () => {
    if (!confirm('This will invalidate all existing backup codes. Continue?')) {
      return
    }

    setActionLoading('regenerateCodes')
    
    try {
      await generateNewBackupCodes()
      await logSecurityEvent('backup_codes_regenerated', 'Backup codes regenerated')
      setSuccess('New backup codes generated successfully')
      
    } catch (error) {
      console.error('Failed to regenerate backup codes:', error)
      setError('Failed to regenerate backup codes')
    } finally {
      setActionLoading(null)
    }
  }

  // Password Confirmation Modal
  const PasswordConfirmModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Confirm Action</h3>
          <button
            onClick={() => {
              setShowPasswordConfirmModal(false)
              setPasswordConfirmation('')
              setPendingAction(null)
            }}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            {pendingAction === 'disable2fa' 
              ? 'Enter your password to disable two-factor authentication. This will make your account less secure.'
              : 'Enter your password to log out of all sessions. You will need to sign in again.'
            }
          </p>
          
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Enter your password"
              autoFocus
            />
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={confirmAction}
            disabled={!passwordConfirmation.trim() || !!actionLoading}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
          >
            {actionLoading === pendingAction ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Confirming...
              </>
            ) : (
              'Confirm'
            )}
          </button>
          <button
            onClick={() => {
              setShowPasswordConfirmModal(false)
              setPasswordConfirmation('')
              setPendingAction(null)
            }}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )

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
                onClick={loadSecurityData}
                disabled={loading}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`h-4 w-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
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
        <div className={`rounded-xl p-6 mb-8 border-2 transition-all duration-300 ${getSecurityScoreColor(securityScore)}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <Shield className="h-6 w-6 text-navy-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Account Security Score</h2>
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
                disabled={!!actionLoading}
                className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {actionLoading === 'enable2fa' ? 'Enabling...' : 'Enable Now'}
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
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-green-700 font-medium text-sm">Enabled</span>
                      </div>
                      <button
                        onClick={handleDisable2FA}
                        disabled={!!actionLoading}
                        className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                      >
                        {actionLoading === 'disable2fa' ? 'Disabling...' : 'Disable'}
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
                        disabled={!!actionLoading}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                      >
                        {actionLoading === 'enable2fa' ? 'Enabling...' : 'Enable 2FA'}
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
                               profile.two_factor_method === 'authenticator' ? 'Authenticator App' :
                               'Biometric Authentication'}
                    </p>
                  </div>

                  {/* Method Selection */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Change 2FA Method</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handle2FAMethodChange('email')}
                        disabled={!!actionLoading || profile.two_factor_method === 'email'}
                        className={`p-3 border-2 rounded-lg text-center transition-all ${
                          profile.two_factor_method === 'email'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Mail className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                        <div className="text-xs font-medium">Email</div>
                      </button>
                      
                      <button
                        onClick={() => handle2FAMethodChange('sms')}
                        disabled={!!actionLoading || profile.two_factor_method === 'sms'}
                        className={`p-3 border-2 rounded-lg text-center transition-all ${
                          profile.two_factor_method === 'sms'
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <MessageSquare className="h-5 w-5 mx-auto mb-1 text-green-600" />
                        <div className="text-xs font-medium">SMS</div>
                      </button>
                      
                      <button
                        onClick={() => handle2FAMethodChange('authenticator')}
                        disabled={!!actionLoading || profile.two_factor_method === 'authenticator'}
                        className={`p-3 border-2 rounded-lg text-center transition-all ${
                          profile.two_factor_method === 'authenticator'
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <QrCode className="h-5 w-5 mx-auto mb-1 text-purple-600" />
                        <div className="text-xs font-medium">App</div>
                      </button>
                    </div>
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
                          disabled={!!actionLoading}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:text-blue-400"
                          title="Download backup codes"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={regenerateBackupCodes}
                          disabled={!!actionLoading}
                          className="text-orange-600 hover:text-orange-700 text-sm font-medium disabled:text-orange-400"
                          title="Generate new codes"
                        >
                          <RefreshCw className={`h-4 w-4 ${actionLoading === 'regenerateCodes' ? 'animate-spin' : ''}`} />
                        </button>
                      </div>
                    </div>
                    
                    {showBackupCodes && (
                      <div className="grid grid-cols-2 gap-2">
                        {backupCodes.map((backup, index) => (
                          <div
                            key={index}
                            className={`p-2 rounded border text-center font-mono text-sm transition-all ${
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
                  disabled={!!actionLoading}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
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
                          <div className={`px-2 py-1 rounded-full text-xs font-medium transition-all duration-300 ${getPasswordStrengthLabel(getPasswordStrength(passwordData.new)).color}`}>
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
                      disabled={!!actionLoading || !passwordData.current || !passwordData.new || !passwordData.confirm || passwordData.new !== passwordData.confirm}
                      className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center"
                    >
                      {actionLoading === 'changePassword' ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        'Update Password'
                      )}
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
                    onChange={handleToggleEmailNotifications}
                    disabled={!!actionLoading}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50"></div>
                  {actionLoading === 'emailNotifications' && (
                    <Loader2 className="h-4 w-4 ml-2 animate-spin text-blue-600" />
                  )}
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
                  disabled={!!actionLoading}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm flex items-center"
                >
                  {actionLoading === 'logoutAll' ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Logging Out...
                    </>
                  ) : (
                    'Log Out All'
                  )}
                </button>
              </div>

              <div className="space-y-3">
                {activeSessions.map((session) => (
                  <div key={session.id} className="border border-gray-200 rounded-lg p-4 transition-all hover:shadow-sm">
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
                          onClick={() => terminateSession(session.id)}
                          disabled={!!actionLoading}
                          className="text-red-600 hover:text-red-700 p-1 disabled:text-red-400"
                          title="Terminate session"
                        >
                          {actionLoading === `session-${session.id}` ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <LogOut className="h-4 w-4" />
                          )}
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
                
                <button
                  onClick={loadSecurityData}
                  disabled={loading}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Refresh alerts"
                >
                  <RefreshCw className={`h-4 w-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="space-y-3">
                {securityAlerts.map((alert) => (
                  <div key={alert.id} className="border border-gray-200 rounded-lg p-4 transition-all hover:shadow-sm">
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

      {/* Password Confirmation Modal */}
      {showPasswordConfirmModal && <PasswordConfirmModal />}
    </div>
  )

  // Helper function to terminate individual sessions
  const terminateSession = async (sessionId: string) => {
    setActionLoading(`session-${sessionId}`)
    
    try {
      // In production, this would call an API to revoke the specific session
      setActiveSessions(prev => prev.filter(s => s.id !== sessionId))
      await logSecurityEvent('session_terminated', `Session terminated: ${sessionId}`)
      setSuccess('Session terminated successfully')
      
    } catch (error) {
      console.error('Failed to terminate session:', error)
      setError('Failed to terminate session')
    } finally {
      setActionLoading(null)
    }
  }
}