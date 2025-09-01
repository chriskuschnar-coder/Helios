import React, { useState, useEffect } from 'react';
import { User, TrendingUp, FileText, Settings, LogOut, DollarSign, PieChart, Calendar, Download, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from './auth/AuthProvider';

interface SignedDocument {
  id: string;
  document_title: string;
  document_type: string;
  signed_at: string;
}

export function InvestorDashboard() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [signedDocuments, setSignedDocuments] = useState<SignedDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSignedDocuments();
  }, []);

  const fetchSignedDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('signed_documents')
        .select('id, document_title, document_type, signed_at')
        .order('signed_at', { ascending: false });

      if (error) throw error;
      setSignedDocuments(data || []);
    } catch (error) {
      console.error('Error fetching signed documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Portfolio Overview', icon: PieChart },
    { id: 'performance', label: 'Performance', icon: TrendingUp },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'settings', label: 'Account Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-navy-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-navy-900">Global Markets</h1>
                <p className="text-sm text-gray-600">Institutional Investment Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Welcome back,</p>
                <p className="font-medium text-navy-900">{user?.email}</p>
              </div>
              <button
                onClick={signOut}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-navy-500 text-navy-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Portfolio Value */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-navy-900">Portfolio Value</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Last updated: Today</span>
                  </div>
                </div>
                <div className="text-center py-12">
                  <DollarSign className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-xl font-medium text-gray-900 mb-2">$0.00</h4>
                  <p className="text-gray-600 mb-6">Your portfolio is ready for funding</p>
                </div>
              </div>
            </div>

            {/* Account Summary */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h4 className="font-medium text-navy-900 mb-4">Account Summary</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Value</span>
                    <span className="font-medium">$0.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Available Cash</span>
                    <span className="font-medium">$0.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Return</span>
                    <span className="font-medium text-green-600">+0.00%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h4 className="font-medium text-navy-900 mb-4">Account Status</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">Documents Signed</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 rounded-full border-2 border-gray-300"></div>
                    <span className="text-sm text-gray-500">Account Funded</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 rounded-full border-2 border-gray-300"></div>
                    <span className="text-sm text-gray-500">Trading Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-navy-900 mb-6">Performance Analytics</h3>
            <div className="text-center py-12">
              <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-xl font-medium text-gray-900 mb-2">Performance Tracking</h4>
              <p className="text-gray-600">Performance data will appear once your account is funded</p>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-navy-900 mb-6">Executed Documents</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-700">
                Your signed onboarding documents are stored securely and available for download at any time.
              </p>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading documents...</p>
              </div>
            ) : signedDocuments.length > 0 ? (
              <div className="space-y-3">
                {signedDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="font-medium text-green-900">{doc.document_title}</div>
                        <div className="text-sm text-green-700">
                          Signed on {new Date(doc.signed_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <button className="text-green-600 hover:text-green-700 font-medium text-sm px-3 py-1 rounded border border-green-300 hover:bg-green-100 transition-colors">
                      <Download className="h-4 w-4 inline mr-1" />
                      Download
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-xl font-medium text-gray-900 mb-2">No Documents Yet</h4>
                <p className="text-gray-600">Complete your onboarding to see signed documents here</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-navy-900 mb-6">Account Settings</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
                <input
                  type="text"
                  value="Individual Investment Account"
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}