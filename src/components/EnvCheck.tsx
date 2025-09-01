import React, { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle, Key, Globe } from 'lucide-react'

export function EnvCheck() {
  const [envVars, setEnvVars] = useState<Record<string, any>>({})

  useEffect(() => {
    // Log all environment variables for debugging
    console.log('🔍 All environment variables:', import.meta.env)
    setEnvVars(import.meta.env)
  }, [])

  const requiredVars = [
    { key: 'VITE_SUPABASE_URL', value: import.meta.env.VITE_SUPABASE_URL },
    { key: 'VITE_SUPABASE_ANON_KEY', value: import.meta.env.VITE_SUPABASE_ANON_KEY },
    { key: 'VITE_STRIPE_PUBLISHABLE_KEY', value: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY }
  ]

  const missingVars = requiredVars.filter(v => !v.value)
  const hasAllRequired = missingVars.length === 0

  if (hasAllRequired) {
    return null // Don't show anything if all vars are present
  }

  return (
    <div className="fixed top-4 right-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-sm z-50">
      <div className="flex items-center space-x-2 mb-2">
        <AlertCircle className="h-5 w-5 text-yellow-600" />
        <span className="font-medium text-yellow-900">Environment Variables Missing</span>
      </div>
      <div className="text-sm text-yellow-700 space-y-1">
        {missingVars.map(v => (
          <div key={v.key} className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>{v.key}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-yellow-600 mt-2">
        Add these in Bolt project settings and redeploy
      </p>
    </div>
  )
}