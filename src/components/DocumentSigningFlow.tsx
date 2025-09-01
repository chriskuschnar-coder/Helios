import React, { useState } from 'react';
import { FileText, CheckCircle, ArrowRight, ArrowLeft, X } from 'lucide-react';

interface DocumentSigningFlowProps {
  onComplete: () => void;
  onBack: () => void;
}

export function DocumentSigningFlow({ onComplete, onBack }: DocumentSigningFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [signedDocuments, setSignedDocuments] = useState<Set<number>>(new Set());
  const [signatures, setSignatures] = useState<{ [key: number]: string }>({});

  const documents = [
    {
      id: 1,
      title: 'Private Placement Memorandum',
      description: 'Confidential offering document for Global Markets Consulting, LP',
      required: true
    },
    {
      id: 2,
      title: 'Risk Disclosure',
      description: 'Important risk information and disclosures',
      required: true
    },
    {
      id: 3,
      title: 'Accredited Investor Verification',
      description: 'Verification of accredited investor status',
      required: true
    }
  ];

  const currentDocument = documents[currentStep - 1];

  const handleSignature = (signature: string) => {
    setSignatures(prev => ({
      ...prev,
      [currentDocument.id]: signature
    }));
    setSignedDocuments(prev => new Set([...prev, currentDocument.id]));
  };

  const handleNext = () => {
    if (currentStep < documents.length) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  const isCurrentDocumentSigned = signedDocuments.has(currentDocument.id);
  const allDocumentsSigned = documents.every(doc => signedDocuments.has(doc.id));

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-600">
            Step {currentStep} of {documents.length}
          </span>
          <span className="text-sm text-gray-500">
            {signedDocuments.size} of {documents.length} completed
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / documents.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Document Header */}
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
          <FileText className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            {currentDocument.title}
            {currentDocument.required && (
              <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                Required
              </span>
            )}
          </h3>
          <p className="text-gray-600">{currentDocument.description}</p>
        </div>
      </div>

      {/* Document Content */}
      <div className="bg-gray-50 rounded-lg p-8 mb-8 min-h-[400px]">
        <div className="prose max-w-none">
          {/* Sample document content based on type */}
          {currentDocument.id === 1 && (
            <div className="space-y-6 text-sm leading-relaxed">
              <div className="text-center border-b border-gray-200 pb-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2">CONFIDENTIAL PRIVATE PLACEMENT MEMORANDUM</h3>
                <h4 className="text-lg font-semibold text-gray-800">Global Markets Consulting, LP</h4>
                <p className="text-gray-600">A Delaware Limited Partnership</p>
                <p className="text-gray-600 mt-2">Offering of Limited Partnership Interests</p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-bold text-red-900 mb-2">IMPORTANT NOTICE</h4>
                <p className="text-red-800 text-xs leading-relaxed">
                  This Confidential Private Placement Memorandum (this "Memorandum") contains confidential 
                  and proprietary information regarding Global Markets Consulting, LP (the "Fund"), a Delaware 
                  limited partnership. This Memorandum is being furnished solely to qualified investors for the 
                  purpose of evaluating a potential investment in the Fund and may not be reproduced or 
                  distributed without express written consent.
                </p>
                <p className="text-red-900 font-bold text-xs mt-2">
                  THE SECURITIES OFFERED HEREBY HAVE NOT BEEN REGISTERED UNDER THE 
                  SECURITIES ACT OF 1933, AS AMENDED, OR THE SECURITIES LAWS OF ANY STATE 
                  AND ARE BEING OFFERED AND SOLD IN RELIANCE ON RULE 506(b) UNDER 
                  REGULATION D AND OTHER EXEMPTIONS FROM SUCH REGISTRATION REQUIREMENTS.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-3">1. EXECUTIVE SUMMARY</h4>
                <div className="grid md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2">
                    <p><strong>Fund Name:</strong> Global Markets Consulting, LP</p>
                    <p><strong>Fund Type:</strong> Delaware Limited Partnership</p>
                    <p><strong>General Partner:</strong> Global Markets Consulting, LLC</p>
                    <p><strong>Managing Members:</strong> Christopher Guccio and Daniel Usmanov</p>
                    <p><strong>Investment Focus:</strong> AI-driven systematic trading across digital assets, equities, and commodities</p>
                    <p><strong>Target Investors:</strong> Accredited investors, qualified institutional buyers, and family offices</p>
                  </div>
                  <div className="space-y-2">
                    <p><strong>Minimum Investment:</strong> $50,000 (GP discretion to accept less)</p>
                    <p><strong>Management Fee:</strong> 2% annually on net assets under management</p>
                    <p><strong>Performance Allocation:</strong> 20% to General Partner, 80% to Limited Partners</p>
                    <p><strong>Lock-up Period:</strong> 12 months initial, quarterly redemptions with 90-day notice</p>
                    <p><strong>Target Outcome:</strong> Attractive risk-adjusted returns above traditional benchmarks</p>
                    <p><strong>Leverage:</strong> Up to 3:1 leverage at General Partner's discretion</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-3">2. FUND OVERVIEW & INVESTMENT OBJECTIVE</h4>
                <p className="text-gray-700 text-xs">
                  Global Markets Consulting, LP seeks to generate superior risk-adjusted returns through 
                  quantitative, AI-driven systematic trading strategies across multiple asset classes. 
                  The Fund is managed by Global Markets Consulting, LLC. Jurisdiction: Delaware, with operations in Delaware and Florida.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-3">3. INVESTMENT STRATEGY & METHODOLOGY</h4>
                <p className="text-gray-700 text-xs mb-2">
                  Core strategy: proprietary machine learning models, statistical arbitrage, momentum/mean-reversion, 
                  high-frequency and medium-frequency strategies.
                </p>
                <p className="text-gray-700 text-xs">
                  Asset classes: Digital Assets (30–60%), Equities (20–40%), Commodities (10–30%), Cash (0–20%). 
                  Risk management includes real-time monitoring, dynamic rebalancing, drawdown controls, and stress testing.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-3">4. TERMS OF THE OFFERING</h4>
                <div className="text-xs space-y-1">
                  <p><strong>Securities Offered:</strong> LP interests</p>
                  <p><strong>Minimum Investment:</strong> $50,000</p>
                  <p><strong>Maximum Fund Size:</strong> $100M</p>
                  <p><strong>Capital Calls:</strong> 100% initial funding</p>
                  <p><strong>Lock-up:</strong> 12 months</p>
                  <p><strong>Redemptions:</strong> Quarterly thereafter with 90-day notice</p>
                  <p><strong>Redemption Fees:</strong> 2% if within 24 months</p>
                  <p><strong>Redemption Gates:</strong> 25% NAV per quarter</p>
                  <p className="text-red-600"><strong>Note:</strong> GP may suspend redemptions in extraordinary market conditions.</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-3">5. FEE STRUCTURE</h4>
                <div className="text-xs space-y-1">
                  <p><strong>Management Fee:</strong> 2% per annum on net assets (includes leverage/reserves)</p>
                  <p><strong>Performance Allocation:</strong> 20% of net profits after 6% preferred return, subject to high-water mark</p>
                  <p><strong>Other Fees:</strong> Operating expenses, legal, accounting, audit, technology, execution, compliance</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-3">6. RISK FACTORS</h4>
                <p className="text-gray-700 text-xs">
                  Includes: market volatility (crypto, equities, commodities), model risk, liquidity, counterparty, 
                  cybersecurity, regulatory changes, reliance on key personnel, limited operating history. 
                  LPs explicitly assume custody risk in digital assets.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-3">7. MANAGEMENT & GOVERNANCE</h4>
                <p className="text-gray-700 text-xs">
                  General Partner retains full discretion over investment/trading decisions. 
                  Advisory Board (non-binding, GP-selected) provides investor optics. 
                  Key person provisions tied to principals. 
                  Indemnification: GP not liable except in cases of willful misconduct or bad faith.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-3">8. INVESTOR RIGHTS & RESTRICTIONS</h4>
                <p className="text-gray-700 text-xs">
                  Quarterly reports, annual audited financials, monthly NAV by independent administrator. 
                  Annual investor call. Transfer restrictions: No public market, GP consent required, subject to securities law.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-3">9. TAX CONSIDERATIONS</h4>
                <p className="text-gray-700 text-xs">
                  Partnership tax treatment; investors receive K-1 forms. 
                  Income allocated whether or not distributed. 
                  Investors should consult their tax advisors.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-3">10. SUBSCRIPTION PROCESS</h4>
                <p className="text-gray-700 text-xs">
                  Accredited investors only. Subscription documents include Subscription Agreement, 
                  LPA, AML/KYC compliance, tax forms. Funds wired upon acceptance.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-3">11. REPORTING & TRANSPARENCY</h4>
                <p className="text-gray-700 text-xs">
                  Monthly NAV statements (via administrator), quarterly reports, annual audited financials. 
                  Investors may contact GP for additional inquiries.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-3">12. GENERAL PARTNER RIGHTS & PROTECTIONS</h4>
                <p className="text-gray-700 text-xs">
                  GP may modify strategies, impose capacity limits, or suspend redemptions in stress periods. 
                  Broad indemnification provided to GP. 
                  Business judgment rule protects GP decisions absent bad faith/willful misconduct.
                </p>
              </div>
            </div>
          )}
          
          {currentDocument.id === 2 && (
            <div className="space-y-6 text-sm leading-relaxed">
              <div className="text-center border-b border-gray-200 pb-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2">LIMITED PARTNERSHIP AGREEMENT</h3>
                <h4 className="text-lg font-semibold text-gray-800">GLOBAL MARKETS CONSULTING, LP</h4>
                <p className="text-gray-600">A Delaware Limited Partnership</p>
                <p className="text-gray-600 mt-2">Date: __________</p>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-3">ARTICLE I - FORMATION AND PURPOSE</h4>
                <div className="space-y-3 text-xs">
                  <div>
                    <strong>Section 1.1 Formation:</strong> The Partnership is formed as a Delaware limited partnership under the Delaware Revised Uniform Limited Partnership Act (the "Delaware Act").
                  </div>
                  <div>
                    <strong>Section 1.2 Name and Principal Place of Business:</strong> The name of the Partnership is "Global Markets Consulting, LP." The principal place of business is 500 E Las Olas Blvd, Fort Lauderdale, FL 33301, or such other location as determined by the General Partner.
                  </div>
                  <div>
                    <strong>Section 1.3 Purpose and Business:</strong> The Partnership's purpose is to engage in systematic and quantitative trading and investment activities across digital assets, equities, commodities, fixed income, foreign exchange, and alternative investments. The General Partner has full discretion to expand into other opportunities deemed appropriate.
                  </div>
                  <div>
                    <strong>Section 1.4 Powers:</strong> The Partnership shall have all powers necessary to achieve its purposes, including borrowing, leverage, derivatives, pledging assets, and other lawful activities.
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-3">ARTICLE II - TERM</h4>
                <div className="space-y-2 text-xs">
                  <div>
                    <strong>Section 2.1 Term:</strong> The Partnership shall continue in perpetuity unless terminated as provided herein.
                  </div>
                  <div>
                    <strong>Section 2.2 Continuity:</strong> The Partnership shall not dissolve upon the withdrawal, removal, death, or incapacity of any Partner, including the General Partner or its members.
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-3">ARTICLE III - CAPITAL CONTRIBUTIONS</h4>
                <div className="space-y-2 text-xs">
                  <div>
                    <strong>Section 3.1 Initial Contributions:</strong> Minimum contribution: $50,000 per Limited Partner, subject to GP discretion.
                  </div>
                  <div>
                    <strong>Section 3.2 Additional Contributions:</strong> GP may request additional contributions. Limited Partners are not obligated to contribute beyond their initial commitment unless agreed.
                  </div>
                  <div>
                    <strong>Section 3.3 No Withdrawal of Capital:</strong> Capital may not be withdrawn except as expressly provided.
                  </div>
                  <div>
                    <strong>Section 3.4 No Interest:</strong> No interest shall accrue on capital accounts.
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-3">ARTICLE IV - ALLOCATIONS AND DISTRIBUTIONS</h4>
                <div className="space-y-2 text-xs">
                  <div>
                    <strong>Section 4.1 Profits and Losses:</strong> Allocated to Partners in proportion to capital accounts, subject to performance allocation.
                  </div>
                  <div>
                    <strong>Section 4.2 Management Fee:</strong> 2% per annum of net assets under management (including leverage/reserves), payable quarterly in advance.
                  </div>
                  <div>
                    <strong>Section 4.3 Performance Allocation:</strong> 20% of net profits allocated to GP after Limited Partners receive a 6% preferred return, subject to a high-water mark.
                  </div>
                  <div>
                    <strong>Section 4.4 Distributions:</strong> Distributions made at GP discretion. GP may retain earnings for reserves and reinvestment.
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-3">ARTICLE V - MANAGEMENT AND AUTHORITY</h4>
                <div className="space-y-2 text-xs">
                  <div>
                    <strong>Section 5.1 Authority:</strong> GP has full, exclusive authority over investment, operations, and administration, including leverage, derivatives, short sales, hiring, agreements, compliance, valuation, and redemptions.
                  </div>
                  <div>
                    <strong>Section 5.2 Standard of Care:</strong> GP to act in good faith. Duties limited to those expressly stated herein.
                  </div>
                  <div>
                    <strong>Section 5.3 Business Judgment Rule:</strong> All GP decisions made in good faith are binding. LPs waive claims except for fraud or willful misconduct.
                  </div>
                  <div>
                    <strong>Section 5.4 LP Restrictions:</strong> LPs may not manage, bind, or interfere with GP authority. Rights limited to information and distributions as provided.
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-3">ARTICLE VI - REDEMPTIONS AND TRANSFERS</h4>
                <div className="space-y-2 text-xs">
                  <div>
                    <strong>Section 6.1 Lock-up:</strong> 12-month lock-up from initial contribution.
                  </div>
                  <div>
                    <strong>Section 6.2 Redemption Rights:</strong> Quarterly thereafter with 90-day notice.
                  </div>
                  <div>
                    <strong>Section 6.3 Procedures:</strong> Redemption requests are irrevocable. Processed at NAV. Payment within 30 days.
                  </div>
                  <div>
                    <strong>Section 6.4 Limitations:</strong> GP may suspend redemptions during extraordinary conditions. GP may cap redemptions at 25% NAV per quarter. GP may distribute in-kind.
                  </div>
                  <div>
                    <strong>Section 6.5 Fees:</strong> 2% redemption fee within 24 months.
                  </div>
                  <div>
                    <strong>Section 6.6 Transfers:</strong> No transfer without GP consent. Transfers subject to securities laws.
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-3">ARTICLE VII - REPRESENTATIONS, WARRANTIES AND COVENANTS</h4>
                <p className="text-xs text-gray-700">
                  LPs represent they are accredited investors, investing for their own account, aware of risks, and financially able to bear losses. LPs covenant to maintain confidentiality, comply with laws, update information, and cooperate with tax/regulatory matters.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-3">ARTICLE VIII - BOOKS, RECORDS AND REPORTING</h4>
                <p className="text-xs text-gray-700">
                  GP maintains full books, records, and accounting. LPs receive monthly NAV statements (via administrator), quarterly reports, annual audited financials, and Schedule K-1. LP inspection rights are limited to protect confidentiality.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-3">ARTICLE IX - LIABILITY, INDEMNIFICATION AND EXCULPATION</h4>
                <p className="text-xs text-gray-700">
                  LPs' liability limited to contributions. GP not liable except for fraud or willful misconduct. GP indemnified by the Partnership against claims except in cases of fraud or willful misconduct. Fiduciary duties are waived to the maximum extent permitted by Delaware law.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-3">ARTICLE X - TAX MATTERS</h4>
                <p className="text-xs text-gray-700">
                  Partnership treated as a tax partnership. GP serves as Tax Matters Partner with full authority. Income and losses allocated per Agreement and tax laws. Investors receive K-1s annually.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-3">ARTICLE XI - GENERAL PROVISIONS</h4>
                <p className="text-xs text-gray-700">
                  Amendments: GP may amend Agreement for administrative or GP-related matters. Material changes require LP majority approval. Governing law: Delaware. Disputes resolved by arbitration in Delaware. Severability applies. Agreement constitutes entire understanding.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-3">ARTICLE XII - ADDITIONAL GENERAL PARTNER RIGHTS</h4>
                <p className="text-xs text-gray-700">
                  GP may use leverage, derivatives, short sales, and private placements. GP may establish reserves, borrow, enter joint ventures, delegate, and modify strategies. GP may enter side letters with LPs regarding fees/rights. GP and affiliates may engage in other businesses, and LPs consent to conflicts of interest. Advisory Board: GP may establish a non-binding Advisory Board for optics and LP relations. Board has no management authority.
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
                <h4 className="font-bold text-gray-900 mb-3">SIGNATURE SECTION</h4>
                <p className="text-xs text-gray-700 mb-3">
                  IN WITNESS WHEREOF, the parties execute this Agreement as of the date first written above.
                </p>
                <div className="grid md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="font-medium text-gray-900 mb-2">GENERAL PARTNER:</p>
                    <p>Global Markets Consulting, LLC</p>
                    <p className="mt-2">By: Christopher Guccio, Managing Member</p>
                    <p>By: Daniel Usmanov, Managing Member</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 mb-2">LIMITED PARTNER:</p>
                    <p>Signature: _________________________</p>
                    <p>Name: _________________________</p>
                    <p>Date: _________________________</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {currentDocument.id === 3 && (
            <div className="mt-6 space-y-4">
              <h4 className="font-semibold text-gray-900">Accredited Investor Requirements:</h4>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Individual net worth exceeding $1 million</li>
                <li>Annual income exceeding $200,000 (or $300,000 joint)</li>
                <li>Qualified institutional buyer status</li>
                <li>Investment advisor with $100M+ assets under management</li>
                <li>Other SEC-defined accredited investor categories</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Digital Signature Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h4 className="font-semibold text-gray-900 mb-4">Digital Signature</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type your full name to sign
            </label>
            <input
              type="text"
              value={signatures[currentDocument.id] || ''}
              onChange={(e) => handleSignature(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Type your full name to sign"
            />
          </div>
          
          {isCurrentDocumentSigned && (
            <div className="flex items-center text-green-600">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span className="font-medium">Document signed successfully</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevious}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          {currentStep === 1 ? (
            <>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </>
          )}
        </button>

        <button
          onClick={handleNext}
          disabled={!isCurrentDocumentSigned}
          className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
        >
          {currentStep === documents.length ? (
            allDocumentsSigned ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Sign & Continue
              </>
            ) : (
              'Complete All Documents'
            )
          ) : (
            <>
              Sign & Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}