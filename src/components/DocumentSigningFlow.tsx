import React, { useState } from 'react'
import { X, FileText, CheckCircle } from 'lucide-react'

interface Document {
  id: string
  title: string
  type: string
  content: string
  signed: boolean
}

interface DocumentSigningFlowProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

export function DocumentSigningFlow({ isOpen, onClose, onComplete }: DocumentSigningFlowProps) {
  const [currentDocumentIndex, setCurrentDocumentIndex] = useState(0)
  const [signature, setSignature] = useState('')
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: 'investment_agreement',
      title: 'Investment Agreement',
      type: 'investment_agreement',
      content: `CONFIDENTIAL PRIVATE PLACEMENT MEMORANDUM
Global Markets Consulting, LP A Delaware Limited Partnership  
Offering of Limited Partnership Interests Date: __________

IMPORTANT NOTICE

This Confidential Private Placement Memorandum (this "Memorandum") contains confidential and proprietary information regarding Global Markets Consulting, LP (the "Fund"), a Delaware limited partnership. This Memorandum is being furnished solely to qualified investors for the purpose of evaluating a potential investment in the Fund and may not be reproduced or distributed without express written consent.

THE SECURITIES OFFERED HEREBY HAVE NOT BEEN REGISTERED UNDER THE SECURITIES ACT OF 1933, AS AMENDED, OR THE SECURITIES LAWS OF ANY STATE AND ARE BEING OFFERED AND SOLD IN RELIANCE ON RULE 506(b) UNDER REGULATION D AND OTHER EXEMPTIONS FROM SUCH REGISTRATION REQUIREMENTS.

TABLE OF CONTENTS
1. Executive Summary
2. Fund Overview & Investment Objective
3. Investment Strategy & Methodology
4. Terms of the Offering
5. Fee Structure
6. Risk Factors
7. Management & Governance
8. Investor Rights & Restrictions
9. Tax Considerations
10. Subscription Process
11. Reporting & Transparency
12. General Partner Rights & Protections

1. EXECUTIVE SUMMARY

Fund Name: Global Markets Consulting, LP 
Fund Type: Delaware Limited Partnership 
General Partner: Global Markets Consulting, LLC 
Managing Members: Christopher Guccio and Daniel Usmanov 
Investment Focus: AI-driven systematic trading across digital assets, equities, and commodities 
Target Investors: Accredited investors, qualified institutional buyers, and family offices 
Minimum Investment: $50,000 (GP discretion to accept less) 
Management Fee: 2% annually on net assets under management (including leverage and reserves) 
Performance Allocation: 20% to General Partner, 80% to Limited Partners, subject to 6% preferred return and high-water mark 
Lock-up Period: 12 months initial lock-up, followed by quarterly redemptions with 90-day notice 
Target Outcome: Attractive risk-adjusted returns above traditional benchmarks 
Leverage: Up to 3:1 leverage at General Partner's discretion

2. FUND OVERVIEW & INVESTMENT OBJECTIVE

Global Markets Consulting, LP seeks to generate superior risk-adjusted returns through quantitative, AI-driven systematic trading strategies across multiple asset classes.

The Fund is managed by Global Markets Consulting, LLC. Jurisdiction: Delaware, with operations in Delaware and Florida.

3. INVESTMENT STRATEGY & METHODOLOGY

Core strategy: proprietary machine learning models, statistical arbitrage, momentum/mean-reversion, high-frequency and medium-frequency strategies.

Asset classes: Digital Assets (30–60%), Equities (20–40%), Commodities (10–30%), Cash (0–20%). Risk management includes real-time monitoring, dynamic rebalancing, drawdown controls, and stress testing.

4. TERMS OF THE OFFERING

Securities Offered: LP interests 
Minimum Investment: $50,000 
Maximum Fund Size: $100M 
Capital Calls: 100% initial funding 
Lock-up: 12 months 
Redemptions: Quarterly thereafter with 90-day notice 
Redemption Fees: 2% if within 24 months 
Redemption Gates: 25% NAV per quarter 
GP may suspend redemptions in extraordinary market conditions.

5. FEE STRUCTURE

Management Fee: 2% per annum on net assets (includes leverage/reserves) 
Performance Allocation: 20% of net profits after 6% preferred return, subject to high-water mark 
Other Fees: Operating expenses, legal, accounting, audit, technology, execution, compliance

6. RISK FACTORS

Includes: market volatility (crypto, equities, commodities), model risk, liquidity, counterparty, cybersecurity, regulatory changes, reliance on key personnel, limited operating history.

LPs explicitly assume custody risk in digital assets.

7. MANAGEMENT & GOVERNANCE

General Partner retains full discretion over investment/trading decisions.
Advisory Board (non-binding, GP-selected) provides investor optics.
Key person provisions tied to principals.
Indemnification: GP not liable except in cases of willful misconduct or bad faith.

8. INVESTOR RIGHTS & RESTRICTIONS

Quarterly reports, annual audited financials, monthly NAV by independent administrator.
Annual investor call.
Transfer restrictions: No public market, GP consent required, subject to securities law.

9. TAX CONSIDERATIONS

Partnership tax treatment; investors receive K-1 forms.
Income allocated whether or not distributed.
Investors should consult their tax advisors.

10. SUBSCRIPTION PROCESS

Accredited investors only. Subscription documents include Subscription Agreement, LPA, AML/KYC compliance, tax forms.
Funds wired upon acceptance.

11. REPORTING & TRANSPARENCY

Monthly NAV statements (via administrator), quarterly reports, annual audited financials.
Investors may contact GP for additional inquiries.

12. GENERAL PARTNER RIGHTS & PROTECTIONS

GP may modify strategies, impose capacity limits, or suspend redemptions in stress periods.
Broad indemnification provided to GP.
Business judgment rule protects GP decisions absent bad faith/willful misconduct.

By signing below, I acknowledge that I have read and understood this Private Placement Memorandum and that I am an accredited investor as defined above.`,
      signed: false
    }
  ])

  if (!isOpen) return null

  const currentDocument = documents[currentDocumentIndex]
  const allDocumentsSigned = documents.every(doc => doc.signed)

  const handleSignDocument = () => {
    if (!signature.trim()) {
      alert('Please enter your signature')
      return
    }

    // Mark current document as signed
    const updatedDocuments = [...documents]
    updatedDocuments[currentDocumentIndex] = {
      ...currentDocument,
      signed: true
    }
    setDocuments(updatedDocuments)
    setSignature('')

    // Move to next document or complete
    if (currentDocumentIndex < documents.length - 1) {
      setCurrentDocumentIndex(currentDocumentIndex + 1)
    } else {
      // All documents signed
      onComplete()
    }
  }

  const handleCancel = () => {
    setSignature('')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header with Progress */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Global Market Consulting</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Investor Portal</span>
              <span className="text-gray-600">Trading</span>
              <span className="text-gray-600">Research</span>
              <span className="text-gray-600">Support</span>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="text-sm text-gray-600 mb-2">Step {currentDocumentIndex + 1} of {documents.length}</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentDocumentIndex + 1) / documents.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{currentDocument.title}</h2>
              <div className="flex items-center space-x-2">
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                  Required
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Document Description */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <p className="text-gray-700">Terms and conditions for your investment</p>
        </div>

        {/* Document Content Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4" style={{ maxHeight: '40vh' }}>
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 min-h-[300px]">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed">
              {currentDocument.content}
            </pre>
          </div>
        </div>

        {/* Signature Section */}
        <div className="border-t border-gray-200 p-6 bg-white">
          <div className="mb-6">
            <label className="block text-lg font-medium text-gray-900 mb-3">
              Digital Signature
            </label>
            <input
              type="text"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              placeholder="Type your full name to sign"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={handleCancel}
              className="flex items-center space-x-2 px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <X className="h-5 w-5" />
              <span>Cancel</span>
            </button>

            <button
              onClick={handleSignDocument}
              disabled={!signature.trim()}
              className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              <CheckCircle className="h-5 w-5" />
              <span>Sign & Continue</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}