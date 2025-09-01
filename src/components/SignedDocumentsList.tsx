import React, { useState, useEffect } from 'react'
import { FileText, Download, CheckCircle, Calendar, User } from 'lucide-react'
import { useAuth } from './auth/AuthProvider'
import { supabaseClient } from '../lib/supabase-client'

interface SignedDocument {
  id: string
  document_id: string
  document_title: string
  document_type: string
  signature: string
  signed_at: string
  ip_address?: string
  created_at: string
}

export function SignedDocumentsList() {
  const { user } = useAuth()
  const [signedDocuments, setSignedDocuments] = useState<SignedDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      loadSignedDocuments()
    }
  }, [user])

  const loadSignedDocuments = async () => {
    try {
      const { data, error } = await supabaseClient
        .from('signed_documents')
        .select('*')
        .eq('user_id', user?.id)
        .order('signed_at', { ascending: false })

      if (error) {
        console.error('Error loading signed documents:', error)
        setError('Failed to load signed documents')
      } else {
        setSignedDocuments(data || [])
      }
    } catch (err) {
      console.error('Error:', err)
      setError('Failed to load signed documents')
    } finally {
      setLoading(false)
    }
  }

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'investment_agreement': return 'Investment Agreement'
      case 'risk_disclosure': return 'Risk Disclosure'
      case 'accredited_investor': return 'Accredited Investor'
      default: return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-gray-200 rounded"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    )
  }

  if (signedDocuments.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h4 className="font-medium text-gray-900 mb-2">No Signed Documents</h4>
        <p className="text-sm text-gray-600">
          Complete the onboarding process to see your executed investment documents here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {signedDocuments.map((doc) => (
        <div key={doc.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h5 className="font-medium text-green-900 mb-1">
                  {doc.document_title}
                </h5>
                <div className="space-y-1 text-sm text-green-700">
                  <div className="flex items-center space-x-2">
                    <User className="h-3 w-3" />
                    <span>Signed by: {doc.signature}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-3 w-3" />
                    <span>Executed: {formatDate(doc.signed_at)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileText className="h-3 w-3" />
                    <span>Type: {getDocumentTypeLabel(doc.document_type)}</span>
                  </div>
                </div>
              </div>
            </div>
            <button className="text-green-600 hover:text-green-700 font-medium text-sm px-3 py-1 rounded border border-green-300 hover:bg-green-100 transition-colors flex items-center space-x-1">
              <Download className="h-3 w-3" />
              <span>Download</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}