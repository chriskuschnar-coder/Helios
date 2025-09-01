import React, { useState, useEffect } from 'react'
import { FileText, Download, CheckCircle, Calendar } from 'lucide-react'
import { useAuth } from './auth/AuthProvider'
import { supabaseClient } from '../lib/supabase-client'

interface SignedDocument {
  id: string
  document_id: string
  document_title: string
  document_type: string
  signature: string
  signed_at: string
  created_at: string
}

export function SignedDocumentsList() {
  const { user } = useAuth()
  const [documents, setDocuments] = useState<SignedDocument[]>([])
  const [loading, setLoading] = useState(true)

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
      } else {
        setDocuments(data || [])
      }
    } catch (error) {
      console.error('Error loading signed documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'investment_agreement': return 'Investment Agreement'
      case 'subscription_agreement': return 'Subscription Agreement'
      case 'accredited_investor': return 'Accredited Investor'
      case 'risk_disclosure': return 'Risk Disclosure'
      case 'privacy_policy': return 'Privacy Policy'
      default: return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3 flex-1">
                <div className="w-5 h-5 bg-gray-300 rounded"></div>
                <div>
                  <div className="h-4 bg-gray-300 rounded w-48 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-32"></div>
                </div>
              </div>
              <div className="w-20 h-8 bg-gray-300 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Signed Documents</h3>
        <p className="text-gray-600">
          Complete the investment onboarding process to see your signed documents here.
        </p>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {documents.map((doc) => (
        <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <div className="flex items-center space-x-3 flex-1">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">{doc.document_title}</div>
              <div className="text-sm text-gray-600 flex items-center space-x-2">
                <span>{getDocumentTypeLabel(doc.document_type)}</span>
                <span>•</span>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>Signed {formatDate(doc.signed_at)}</span>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Signature: {doc.signature}
              </div>
            </div>
          </div>
          <button className="text-navy-600 hover:text-navy-700 font-medium text-sm px-3 py-1 rounded border border-navy-200 hover:bg-navy-50 transition-colors flex items-center space-x-1">
            <Download className="h-4 w-4" />
            <span>Download</span>
          </button>
        </div>
      ))}
    </div>
  )
}