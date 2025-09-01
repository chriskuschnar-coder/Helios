import React from 'react'
import { AlertCircle, Database, ExternalLink } from 'lucide-react'

export function SupabaseConnectionBanner() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  
  // Don't show banner if Supabase is configured
  if (supabaseUrl && supabaseKey) {
    return null
  }

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">
            Supabase Not Connected
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p className="mb-2">
              For cross-device login and real database functionality, connect to Supabase:
            </p>
            <ol className="list-decimal list-inside space-y-1 mb-3">
              <li>Click "Connect to Supabase" button in the top right of Bolt</li>
              <li>Create or connect your Supabase project</li>
              <li>Environment variables will be automatically configured</li>
            </ol>
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4" />
              <span className="font-medium">Current mode:</span>
              <span>localStorage demo (single device only)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}