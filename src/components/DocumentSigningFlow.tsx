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
  const [formData, setFormData] = useState({
    capitalContribution: '',
    fullName: '',
    email: '',
    phone: '',
    mailingAddress: '',
    taxId: '',
    investorType: '',
    accreditedStatus: [] as string[],
    beneficialOwner1Name: '',
    beneficialOwner1Percentage: '',
    beneficialOwner2Name: '',
    beneficialOwner2Percentage: ''
  });

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

  const handleFormChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isDocument3FormValid = () => {
    const required = [
      'capitalContribution',
      'fullName', 
      'email',
      'phone',
      'mailingAddress',
      'taxId',
      'investorType'
    ];
    
    // Check if all required fields are filled
    const allRequiredFilled = required.every(field => 
      formData[field as keyof typeof formData] && 
      String(formData[field as keyof typeof formData]).trim() !== ''
    );
    
    // Check if at least one accredited status is selected
    const hasAccreditedStatus = formData.accreditedStatus.length > 0;
    
    // Check capital contribution is at least $50,000
    const capitalAmount = parseFloat(formData.capitalContribution) || 0;
    const validCapitalAmount = capitalAmount >= 50000;
    
    return allRequiredFilled && hasAccreditedStatus && validCapitalAmount;
  };
  const handleNext = () => {
    // For document 3, check if form is completely filled out
    if (currentDocument.id === 3 && !isDocument3FormValid()) {
      alert('Please complete all required fields before proceeding.');
      return;
    }
    
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
  const canProceed = () => {
    if (!isCurrentDocumentSigned) return false;
    if (currentDocument.id === 3) {
      return isDocument3FormValid();
    }
    return true;
  };

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
            <div className="space-y-6 text-sm leading-relaxed">
              <div className="text-center border-b border-gray-200 pb-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2">SUBSCRIPTION AGREEMENT</h3>
                <h4 className="text-lg font-semibold text-gray-800">GLOBAL MARKETS CONSULTING, LP</h4>
                <p className="text-gray-600">A Delaware Limited Partnership</p>
                <p className="text-gray-600 mt-2">CONFIDENTIAL – FOR QUALIFIED INVESTORS ONLY</p>
                <p className="text-gray-600">Date: _______________</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-xs">
                  <strong>TO:</strong> Global Markets Consulting, LLC, as General Partner of Global Markets Consulting, LP<br/>
                  <strong>FROM:</strong> The undersigned prospective Limited Partner ("Subscriber")
                </p>
                <p className="text-blue-800 text-xs mt-2">
                  The undersigned hereby subscribes for a limited partnership interest in Global Markets Consulting, LP (the "Partnership" or "Fund") subject to the terms and conditions set forth below and in the Limited Partnership Agreement.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-3">SECTION 1 – SUBSCRIPTION DETAILS</h4>
                <div className="space-y-3 text-xs">
                  <div>
                    <strong>1.1 Capital Commitment:</strong> The Subscriber hereby subscribes for Partnership interests in the amount of:
                    <div className="mt-2 p-3 bg-gray-50 rounded border">
                      Capital Contribution: $__________________<br/>
                      Minimum Investment: $50,000 (subject to General Partner discretion for lesser amounts)
                    </div>
                  </div>
                  <div>
                    <strong>1.2 Payment Instructions:</strong> Payment shall be made by wire transfer according to instructions provided by the General Partner. Investment will not be effective until funds are received and cleared.
                  </div>
                  <div>
                    <strong>1.3 Acceptance:</strong> This subscription is subject to acceptance by the General Partner in its sole discretion. The General Partner reserves the right to reject any subscription for any reason. Admission shall be effective as of the date designated by the General Partner.
                  </div>
                  <div>
                    <strong>1.4 Effective Date of Interest:</strong> Subscriber acknowledges that Interests shall be deemed issued, and all rights and obligations shall commence, only after clearance of funds and execution of this Agreement by the General Partner.
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-3">SECTION 2 – INVESTOR INFORMATION</h4>
                <div className="space-y-4 text-xs">
                  <div>
                    <strong>2.1 Subscriber Details:</strong>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center">
                        <span className="w-32 text-gray-600">Name/Entity Name:</span>
                        <div className="flex-1 border-b border-gray-300 ml-2">_________________________________________________</div>
                      </div>
                      <div className="flex items-center">
                        <span className="w-32 text-gray-600">Mailing Address:</span>
                        <div className="flex-1 border-b border-gray-300 ml-2">_________________________________________________</div>
                      </div>
                      <div className="flex items-center">
                        <span className="w-32 text-gray-600">Email Address:</span>
                        <div className="flex-1 border-b border-gray-300 ml-2">_________________________________________________</div>
                      </div>
                      <div className="flex items-center">
                        <span className="w-32 text-gray-600">Phone Number:</span>
                        <div className="flex-1 border-b border-gray-300 ml-2">_________________________________________________</div>
                      </div>
                      <div className="flex items-center">
                        <span className="w-32 text-gray-600">Tax ID/SSN:</span>
                        <div className="flex-1 border-b border-gray-300 ml-2">_________________________________________________</div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <strong>2.2 Type of Investor:</strong>
                    <div className="mt-2 flex flex-wrap gap-4">
                      <label className="flex items-center"><input type="checkbox" className="mr-1"/> Individual</label>
                      <label className="flex items-center"><input type="checkbox" className="mr-1"/> Corporation</label>
                      <label className="flex items-center"><input type="checkbox" className="mr-1"/> Partnership</label>
                      <label className="flex items-center"><input type="checkbox" className="mr-1"/> Trust</label>
                      <label className="flex items-center"><input type="checkbox" className="mr-1"/> LLC</label>
                      <label className="flex items-center"><input type="checkbox" className="mr-1"/> Other: ___________________</label>
                    </div>
                  </div>
                  
                  <div>
                    <strong>2.3 Beneficial Ownership (if entity):</strong>
                    <p className="text-gray-600 mb-2">If Subscriber is an entity, list all persons owning 25% or more:</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-4">
                        <span>Name:</span>
                        <div className="border-b border-gray-300 flex-1">_________________________</div>
                        <span>Ownership %:</span>
                        <div className="border-b border-gray-300 w-20">_________</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span>Name:</span>
                        <div className="border-b border-gray-300 flex-1">_________________________</div>
                        <span>Ownership %:</span>
                        <div className="border-b border-gray-300 w-20">_________</div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <strong>2.4 Tax Documentation:</strong> Subscriber agrees to provide a valid IRS Form W-9 (U.S. investors) or IRS Form W-8BEN (non-U.S. investors) and update such forms as required.
                  </div>
                  
                  <div>
                    <strong>2.5 Notices and Communications:</strong> Subscriber consents to receive all notices, reports, statements, and communications electronically (via email or secure portal), unless otherwise required by law.
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-3">SECTION 3 – INVESTOR QUALIFICATION</h4>
                <p className="text-xs text-gray-700 mb-3">
                  The Subscriber qualifies for this investment under Rule 506(b) by meeting ONE of the following criteria:
                </p>
                <div className="space-y-3 text-xs">
                  <div>
                    <strong>3.1 Accredited Investor Certification (Rule 501(a)):</strong>
                    <div className="mt-2 space-y-1">
                      <label className="flex items-start"><input type="checkbox" className="mr-2 mt-1"/> Individual net worth exceeding $1 million (excluding primary residence)</label>
                      <label className="flex items-start"><input type="checkbox" className="mr-2 mt-1"/> Annual income exceeding $200,000 ($300,000 joint) for past 2 years</label>
                      <label className="flex items-start"><input type="checkbox" className="mr-2 mt-1"/> Qualified institutional buyer</label>
                      <label className="flex items-start"><input type="checkbox" className="mr-2 mt-1"/> Investment advisor with $100M+ assets under management</label>
                      <label className="flex items-start"><input type="checkbox" className="mr-2 mt-1"/> Other SEC-defined accredited investor category</label>
                    </div>
                  </div>
                  
                  <div>
                    <strong>3.2 Sophisticated Non-Accredited Investor Certification:</strong>
                    <div className="mt-2">
                      <label className="flex items-start">
                        <input type="checkbox" className="mr-2 mt-1"/>
                        I do not meet accredited investor standards above, BUT I have sufficient knowledge and experience in financial and business matters to evaluate the merits and risks of this investment.
                      </label>
                      <div className="mt-3 space-y-2 ml-6">
                        <div>
                          <span className="text-gray-600">Investment Experience:</span>
                          <div className="border-b border-gray-300 mt-1">_________________________________________________</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Financial Background:</span>
                          <div className="border-b border-gray-300 mt-1">_________________________________________________</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Professional Qualifications:</span>
                          <div className="border-b border-gray-300 mt-1">_________________________________________________</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-3">SECTION 4 – REPRESENTATIONS, WARRANTIES, AND ACKNOWLEDGMENTS</h4>
                <div className="space-y-3 text-xs">
                  <div>
                    <strong>4.1 Financial Capability:</strong>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700">
                      <li>Subscriber has adequate means to bear the economic risk of this investment</li>
                      <li>Subscriber can afford to lose the entire investment without material adverse effect</li>
                      <li>This investment does not represent more than 20% of Subscriber's net worth or investable assets</li>
                    </ul>
                  </div>
                  
                  <div>
                    <strong>4.2 Investment Experience and Sophistication:</strong>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700">
                      <li>Subscriber has sufficient knowledge and experience in financial matters to evaluate risks</li>
                      <li>Subscriber understands the speculative nature of the Fund's strategy</li>
                      <li>Subscriber has consulted with professional advisors as deemed necessary</li>
                    </ul>
                  </div>
                  
                  <div>
                    <strong>4.3 Investment Purpose:</strong>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700">
                      <li>Investment is for Subscriber's own account for investment purposes only</li>
                      <li>No present intention to resell, distribute, or otherwise dispose of the Interests</li>
                      <li>Interests not acquired with a view to distribution</li>
                    </ul>
                  </div>
                  
                  <div>
                    <strong>4.4 Access to Information:</strong>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700">
                      <li>Subscriber has received and carefully reviewed the PPM and LPA</li>
                      <li>Subscriber has had the opportunity to ask questions and receive answers</li>
                      <li>All information provided by Subscriber is true and accurate</li>
                    </ul>
                  </div>
                  
                  <div>
                    <strong>4.6 Risk Acknowledgment:</strong>
                    <div className="bg-red-50 border border-red-200 rounded p-3 mt-2">
                      <p className="text-red-800 font-medium mb-2">Subscriber acknowledges:</p>
                      <ul className="list-disc list-inside space-y-1 text-red-700">
                        <li><strong>INVESTMENT INVOLVES SUBSTANTIAL RISK OF LOSS</strong></li>
                        <li>Past performance does not guarantee future results</li>
                        <li>No assurance can be given that objectives will be achieved</li>
                        <li>The Fund may use leverage, derivatives, and complex trading strategies</li>
                        <li>Market volatility may result in significant losses</li>
                        <li>Limited liquidity and long lock-up periods apply</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-3">SECTION 5 – LOCK-UP AND REDEMPTION ACKNOWLEDGMENT</h4>
                <div className="space-y-2 text-xs">
                  <div>
                    <strong>6.1 Lock-up Period:</strong>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700">
                      <li>No redemptions for 12 months following initial contribution</li>
                      <li>After lock-up, quarterly redemptions with 90-day notice</li>
                      <li>GP may suspend redemptions during market stress</li>
                    </ul>
                  </div>
                  <div>
                    <strong>6.2 Redemption Procedures:</strong>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700">
                      <li>Requests must be in writing and are irrevocable once submitted</li>
                      <li>Redemptions processed at NAV as determined by GP</li>
                      <li>2% redemption fee applies within 24 months of investment</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-3">SECTION 6 – EXECUTION</h4>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="grid md:grid-cols-2 gap-6 text-xs">
                    <div>
                      <p className="font-medium text-gray-900 mb-3">SUBSCRIBER SIGNATURE:</p>
                      <div className="space-y-2">
                        <div>Print Name: _________________________________</div>
                        <div>Signature: _________________________________</div>
                        <div>Date: _____________________</div>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 mb-3">ACCEPTANCE BY GENERAL PARTNER:</p>
                      <p className="mb-2">Global Markets Consulting, LLC</p>
                      <div className="space-y-1">
                        <div>By: Christopher Guccio, Managing Member</div>
                        <div>By: Daniel Usmanov, Managing Member</div>
                        <div>Date: _____________________</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-bold text-xs">
                  IMPORTANT NOTICE: This investment has not been registered under federal or state securities laws and involves substantial risk. Consult your legal, tax, and financial advisors before investing.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Form Fields for Document 3 (Subscription Agreement) */}
      {currentDocument.id === 3 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h4 className="font-semibold text-gray-900 mb-4">Complete Subscription Information</h4>
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Required:</strong> All fields below must be completed to proceed with your investment.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capital Contribution Amount <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  min="50000"
                  step="1000"
                  value={formData.capitalContribution}
                  onChange={(e) => handleFormChange('capitalContribution', e.target.value)}
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="50,000"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Minimum: $50,000</p>
              {formData.capitalContribution && parseFloat(formData.capitalContribution) < 50000 && (

                  <>
                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">SECTION 5 – ADDITIONAL COVENANTS</h3>
                    <p className="text-gray-700 mb-4">
                      <strong>5.1 Confidentiality</strong><br />
                      Subscriber agrees to maintain strict confidentiality of all non-public information.<br /><br />
                      
                      <strong>5.2 Compliance with Partnership Terms</strong><br />
                      Subscriber agrees to be bound by all terms of the LPA and to execute additional documents if reasonably requested.<br /><br />
                      
                      <strong>5.3 Updates and Notices</strong><br />
                      Subscriber agrees to promptly notify the GP of changes to provided information and supply further documents as requested.<br /><br />
                      
                      <strong>5.4 Side Letters</strong><br />
                      Subscriber acknowledges the GP may enter into side letters granting certain investors different rights and waives any claim to such rights absent explicit written agreement.
                    </p>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">SECTION 6 – LOCK-UP AND REDEMPTION ACKNOWLEDGMENT</h3>
                    <p className="text-gray-700 mb-4">
                      <strong>6.1 Lock-up Period:</strong><br />
                      • No redemptions for 12 months following initial contribution<br />
                      • After lock-up, quarterly redemptions with 90-day notice<br />
                      • GP may suspend redemptions during market stress<br /><br />
                      
                      <strong>6.2 Redemption Procedures:</strong><br />
                      • Requests must be in writing and are irrevocable once submitted<br />
                      • Redemptions processed at NAV as determined by GP<br />
                      • 2% redemption fee applies within 24 months of investment
                    </p>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">SECTION 7 – TAX MATTERS</h3>
                    <p className="text-gray-700 mb-4">
                      <strong>7.1 Tax Documentation</strong><br />
                      Subscriber shall provide valid IRS Form W-9 (U.S.) or Form W-8BEN (non-U.S.) and update as necessary.<br /><br />
                      
                      <strong>7.2 Tax Responsibility</strong><br />
                      Subscriber is responsible for its own tax consequences and compliance obligations.
                    </p>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">SECTION 8 – DISPUTE RESOLUTION</h3>
                    <p className="text-gray-700 mb-4">
                      <strong>8.1 Governing Law</strong><br />
                      This Agreement shall be governed by Delaware law.<br /><br />
                      
                      <strong>8.2 Arbitration</strong><br />
                      Any disputes shall be resolved by binding arbitration in New York, New York, under the Commercial Arbitration Rules of the AAA.<br /><br />
                      
                      <strong>8.3 Jury Trial Waiver</strong><br />
                      Each party knowingly waives the right to a jury trial.
                    </p>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">SECTION 9 – ENTIRE AGREEMENT</h3>
                    <p className="text-gray-700 mb-4">
                      This Agreement, together with the PPM and LPA, constitutes the entire agreement of the parties.
                    </p>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">SECTION 10 – EXECUTION</h3>
                    <div className="bg-gray-50 p-6 rounded-lg mb-6">
                      <div className="grid md:grid-cols-2 gap-8">
                        <div>
                          <h4 className="font-bold text-gray-900 mb-4">SUBSCRIBER SIGNATURE:</h4>
                          <div className="space-y-3">
                            <div>
                              <strong>Individual Subscriber:</strong><br />
                              Print Name: _________________________________<br />
                              Signature: _________________________________<br />
                              Date: _____________________
                            </div>
                            <div className="mt-4">
                              <strong>Entity Subscriber:</strong><br />
                              Entity Name: _________________________________<br />
                              By: _________________________________<br />
                              Name: _________________________________<br />
                              Title: _________________________________<br />
                              Date: _____________________
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-bold text-gray-900 mb-4">ACCEPTANCE BY GENERAL PARTNER:</h4>
                          <div className="space-y-3">
                            <div>
                              <strong>Global Markets Consulting, LLC</strong><br />
                              <em>as General Partner of Global Markets Consulting, LP</em>
                            </div>
                            <div className="mt-4">
                              By: _________________________________<br />
                              Name: Christopher Guccio<br />
                              Title: Managing Member<br />
                              Date: _____________________
                            </div>
                            <div className="mt-4">
                              By: _________________________________<br />
                              Name: Daniel Usmanov<br />
                              Title: Managing Member<br />
                              Date: _____________________
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-sm text-red-700">
                        <strong>IMPORTANT NOTICE:</strong> This investment has not been registered under federal or state securities laws and involves substantial risk. Consult your legal, tax, and financial advisors before investing.
                      </p>
                    </div>
                    <p className="text-xs text-red-500 mt-1">Amount must be at least $50,000</p>
                  </>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Legal Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleFormChange('fullName', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your full legal name"
                required
              />
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleFormChange('email', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your.email@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleFormChange('phone', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="(555) 123-4567"
                required
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mailing Address <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={formData.mailingAddress}
              onChange={(e) => handleFormChange('mailingAddress', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your complete mailing address"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tax ID/SSN <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.taxId}
              onChange={(e) => handleFormChange('taxId', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="XXX-XX-XXXX or XX-XXXXXXX"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Investor Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <label className="flex items-center text-sm">
                <input 
                  type="radio" 
                  name="investorType" 
                  value="individual"
                  checked={formData.investorType === 'individual'}
                  onChange={(e) => handleFormChange('investorType', e.target.value)}
                  className="mr-2"
                />
                Individual
              </label>
              <label className="flex items-center text-sm">
                <input 
                  type="radio" 
                  name="investorType" 
                  value="corporation"
                  checked={formData.investorType === 'corporation'}
                  onChange={(e) => handleFormChange('investorType', e.target.value)}
                  className="mr-2"
                />
                Corporation
              </label>
              <label className="flex items-center text-sm">
                <input 
                  type="radio" 
                  name="investorType" 
                  value="partnership"
                  checked={formData.investorType === 'partnership'}
                  onChange={(e) => handleFormChange('investorType', e.target.value)}
                  className="mr-2"
                />
                Partnership
              </label>
              <label className="flex items-center text-sm">
                <input 
                  type="radio" 
                  name="investorType" 
                  value="trust"
                  checked={formData.investorType === 'trust'}
                  onChange={(e) => handleFormChange('investorType', e.target.value)}
                  className="mr-2"
                />
                Trust
              </label>
              <label className="flex items-center text-sm">
                <input 
                  type="radio" 
                  name="investorType" 
                  value="llc"
                  checked={formData.investorType === 'llc'}
                  onChange={(e) => handleFormChange('investorType', e.target.value)}
                  className="mr-2"
                />
                LLC
              </label>
              <label className="flex items-center text-sm">
                <input 
                  type="radio" 
                  name="investorType" 
                  value="other"
                  checked={formData.investorType === 'other'}
                  onChange={(e) => handleFormChange('investorType', e.target.value)}
                  className="mr-2"
                />
                Other
              </label>
            </div>
          </div>
          
          {/* Beneficial Ownership (only show for entities) */}
          {['corporation', 'partnership', 'trust', 'llc', 'other'].includes(formData.investorType) && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Beneficial Ownership (25% or more)
              </label>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Owner Name</label>
                    <input
                      type="text"
                      value={formData.beneficialOwner1Name}
                      onChange={(e) => handleFormChange('beneficialOwner1Name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Ownership %</label>
                    <input
                      type="number"
                      min="25"
                      max="100"
                      value={formData.beneficialOwner1Percentage}
                      onChange={(e) => handleFormChange('beneficialOwner1Percentage', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="25"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Owner Name (if applicable)</label>
                    <input
                      type="text"
                      value={formData.beneficialOwner2Name}
                      onChange={(e) => handleFormChange('beneficialOwner2Name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Ownership %</label>
                    <input
                      type="number"
                      min="25"
                      max="100"
                      value={formData.beneficialOwner2Percentage}
                      onChange={(e) => handleFormChange('beneficialOwner2Percentage', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="25"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Accredited Investor Status <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-600 mb-3">Select at least one that applies to you:</p>
            <div className="space-y-2">
              <label className="flex items-start text-sm">
                <input 
                  type="checkbox" 
                  checked={formData.accreditedStatus.includes('net_worth')}
                  onChange={(e) => {
                    const newStatus = e.target.checked 
                      ? [...formData.accreditedStatus, 'net_worth']
                      : formData.accreditedStatus.filter(s => s !== 'net_worth');
                    handleFormChange('accreditedStatus', newStatus);
                  }}
                  className="mr-2 mt-1"
                />
                Net worth exceeding $1 million (excluding primary residence)
              </label>
              <label className="flex items-start text-sm">
                <input 
                  type="checkbox" 
                  checked={formData.accreditedStatus.includes('income')}
                  onChange={(e) => {
                    const newStatus = e.target.checked 
                      ? [...formData.accreditedStatus, 'income']
                      : formData.accreditedStatus.filter(s => s !== 'income');
                    handleFormChange('accreditedStatus', newStatus);
                  }}
                  className="mr-2 mt-1"
                />
                Annual income exceeding $200,000 ($300,000 joint) for past 2 years
              </label>
              <label className="flex items-start text-sm">
                <input 
                  type="checkbox" 
                  checked={formData.accreditedStatus.includes('institutional')}
                  onChange={(e) => {
                    const newStatus = e.target.checked 
                      ? [...formData.accreditedStatus, 'institutional']
                      : formData.accreditedStatus.filter(s => s !== 'institutional');
                    handleFormChange('accreditedStatus', newStatus);
                  }}
                  className="mr-2 mt-1"
                />
                Qualified institutional buyer
              </label>
              <label className="flex items-start text-sm">
                <input 
                  type="checkbox" 
                  checked={formData.accreditedStatus.includes('other')}
                  onChange={(e) => {
                    const newStatus = e.target.checked 
                      ? [...formData.accreditedStatus, 'other']
                      : formData.accreditedStatus.filter(s => s !== 'other');
                    handleFormChange('accreditedStatus', newStatus);
                  }}
                  className="mr-2 mt-1"
                />
                Other accredited investor category
              </label>
            </div>
            {formData.accreditedStatus.length === 0 && (
              <p className="text-xs text-red-500 mt-2">Please select at least one accredited investor qualification</p>
            )}
          </div>
        </div>
      )}

      {/* Digital Signature Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h4 className="font-semibold text-gray-900 mb-4">Digital Signature</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type your full name to sign <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={signatures[currentDocument.id] || ''}
              onChange={(e) => handleSignature(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Type your full name to sign"
              required
            />
            {!signatures[currentDocument.id] && (
              <p className="text-xs text-red-500 mt-1">Signature is required to proceed</p>
            )}
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
          disabled={!canProceed()}
          className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
        >
          {currentStep === documents.length ? (
            canProceed() ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Sign & Continue
              </>
            ) : (
              'Complete All Required Fields'
            )
          ) : (
            <>
              Sign & Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </button>
      </div>
      
      {/* Form Validation Summary for Document 3 */}
      {currentDocument.id === 3 && !isDocument3FormValid() && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800 font-medium mb-2">Please complete the following:</p>
          <ul className="text-xs text-red-700 space-y-1">
            {!formData.capitalContribution && <li>• Capital contribution amount</li>}
            {parseFloat(formData.capitalContribution) < 50000 && formData.capitalContribution && <li>• Capital contribution must be at least $50,000</li>}
            {!formData.fullName && <li>• Full legal name</li>}
            {!formData.email && <li>• Email address</li>}
            {!formData.phone && <li>• Phone number</li>}
            {!formData.mailingAddress && <li>• Mailing address</li>}
            {!formData.taxId && <li>• Tax ID/SSN</li>}
            {!formData.investorType && <li>• Investor type selection</li>}
            {formData.accreditedStatus.length === 0 && <li>• At least one accredited investor qualification</li>}
            {!signatures[currentDocument.id] && <li>• Digital signature</li>}
          </ul>
        </div>
      )}
    </div>
  );
}