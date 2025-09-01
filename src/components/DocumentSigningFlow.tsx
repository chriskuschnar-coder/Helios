import React, { useState } from 'react';
import { FileText, CheckCircle, ArrowLeft, ArrowRight, Download } from 'lucide-react';

interface DocumentSigningFlowProps {
  onComplete: () => void;
  onBack: () => void;
}

export function DocumentSigningFlow({ onComplete, onBack }: DocumentSigningFlowProps) {
  const [currentDocument, setCurrentDocument] = useState(0);
  const [signedDocuments, setSignedDocuments] = useState<boolean[]>([false, false, false]);
  const [investmentAmount, setInvestmentAmount] = useState('');

  const documents = [
    {
      title: 'Private Placement Memorandum',
      description: 'Investment overview and risk disclosures',
      content: 'ppm'
    },
    {
      title: 'Risk Disclosure Statement',
      description: 'Comprehensive risk factors and warnings',
      content: 'risk'
    },
    {
      title: 'Subscription Agreement',
      description: 'Investment terms and investor qualifications',
      content: 'subscription'
    }
  ];

  const handleSign = () => {
    const newSignedDocuments = [...signedDocuments];
    newSignedDocuments[currentDocument] = true;
    setSignedDocuments(newSignedDocuments);

    if (currentDocument < documents.length - 1) {
      setCurrentDocument(currentDocument + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentDocument > 0) {
      setCurrentDocument(currentDocument - 1);
    } else {
      onBack();
    }
  };

  const allDocumentsSigned = signedDocuments.every(signed => signed);
  const currentDocumentSigned = signedDocuments[currentDocument];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Document Review & Signing</h2>
          <div className="text-sm text-gray-600">
            {currentDocument + 1} of {documents.length}
          </div>
        </div>
        <div className="flex space-x-2">
          {documents.map((_, index) => (
            <div
              key={index}
              className={`flex-1 h-2 rounded-full ${
                index <= currentDocument ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Document Content */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{documents[currentDocument].title}</h3>
            <p className="text-gray-600">{documents[currentDocument].description}</p>
          </div>
          <div className="flex items-center space-x-2">
            <FileText className="h-6 w-6 text-blue-600" />
            {signedDocuments[currentDocument] && (
              <CheckCircle className="h-6 w-6 text-green-600" />
            )}
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-6 bg-gray-50">
          {documents[currentDocument].content === 'ppm' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">PRIVATE PLACEMENT MEMORANDUM</h1>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">GLOBAL MARKETS CONSULTING, LP</h2>
                <p className="text-gray-600">A Delaware Limited Partnership</p>
                <p className="text-sm text-red-600 font-medium mt-4">CONFIDENTIAL – FOR QUALIFIED INVESTORS ONLY</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900">EXECUTIVE SUMMARY</h3>
                <p className="text-gray-700">
                  Global Markets Consulting, LP (the "Fund") is a Delaware limited partnership that employs 
                  quantitative investment strategies to generate superior risk-adjusted returns. The Fund 
                  utilizes advanced mathematical models, market microstructure analysis, and systematic 
                  trading approaches across global financial markets.
                </p>

                <h3 className="text-lg font-bold text-gray-900 mt-6">INVESTMENT STRATEGY</h3>
                <p className="text-gray-700">
                  The Fund implements a multi-strategy quantitative approach including:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Statistical arbitrage and pairs trading</li>
                  <li>Market microstructure exploitation</li>
                  <li>Momentum and mean reversion strategies</li>
                  <li>Risk parity and volatility targeting</li>
                  <li>Alternative data integration</li>
                </ul>

                <h3 className="text-lg font-bold text-gray-900 mt-6">TERMS</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
                  <div>
                    <strong>Minimum Investment:</strong> $50,000<br />
                    <strong>Management Fee:</strong> 2% annually<br />
                    <strong>Performance Fee:</strong> 20% of net profits<br />
                    <strong>Lock-up Period:</strong> 12 months
                  </div>
                  <div>
                    <strong>Redemption:</strong> Quarterly with 90-day notice<br />
                    <strong>Domicile:</strong> Delaware, USA<br />
                    <strong>Administrator:</strong> Third-party administrator<br />
                    <strong>Auditor:</strong> Big Four accounting firm
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
                  <h4 className="font-bold text-red-900 mb-2">RISK FACTORS</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• Investment involves substantial risk of loss</li>
                    <li>• Past performance does not guarantee future results</li>
                    <li>• Use of leverage may amplify losses</li>
                    <li>• Limited liquidity and redemption restrictions</li>
                    <li>• Regulatory and operational risks</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {documents[currentDocument].content === 'risk' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">RISK DISCLOSURE STATEMENT</h1>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">GLOBAL MARKETS CONSULTING, LP</h2>
                <p className="text-sm text-red-600 font-medium">IMPORTANT: READ CAREFULLY BEFORE INVESTING</p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-red-900 mb-4">PRINCIPAL RISKS</h3>
                <div className="space-y-3 text-red-800">
                  <p><strong>Market Risk:</strong> The Fund's investments are subject to market volatility and may decline in value.</p>
                  <p><strong>Leverage Risk:</strong> Use of leverage amplifies both gains and losses and may result in total loss of capital.</p>
                  <p><strong>Liquidity Risk:</strong> Investments may be difficult to sell quickly, and redemptions are subject to restrictions.</p>
                  <p><strong>Operational Risk:</strong> Technology failures, human error, or system disruptions may cause losses.</p>
                  <p><strong>Regulatory Risk:</strong> Changes in laws or regulations may adversely affect the Fund's operations.</p>
                </div>
              </div>

              <h3 className="text-lg font-bold text-gray-900">QUANTITATIVE STRATEGY RISKS</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Model risk: Mathematical models may fail to predict market behavior</li>
                <li>Data risk: Reliance on historical data that may not reflect future conditions</li>
                <li>Technology risk: System failures may prevent execution of strategies</li>
                <li>Concentration risk: Strategies may be concentrated in specific markets or instruments</li>
                <li>Counterparty risk: Risk of default by brokers, banks, or other counterparties</li>
              </ul>

              <h3 className="text-lg font-bold text-gray-900 mt-6">SUITABILITY REQUIREMENTS</h3>
              <p className="text-gray-700">
                This investment is suitable only for sophisticated investors who:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Meet accredited investor or sophisticated investor criteria</li>
                <li>Can afford to lose their entire investment</li>
                <li>Understand complex financial instruments and strategies</li>
                <li>Have experience with alternative investments</li>
                <li>Can commit capital for extended periods</li>
              </ul>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
                <p className="text-yellow-800 text-sm">
                  <strong>IMPORTANT:</strong> You should consult with your legal, tax, and financial advisors 
                  before making this investment. Do not invest unless you fully understand and can bear the risks.
                </p>
              </div>
            </div>
          )}

          {documents[currentDocument].content === 'subscription' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">SUBSCRIPTION AGREEMENT</h1>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">GLOBAL MARKETS CONSULTING, LP</h2>
                <p className="text-gray-600">A Delaware Limited Partnership</p>
                <p className="text-sm text-red-600 font-medium mt-4">CONFIDENTIAL – FOR QUALIFIED INVESTORS ONLY</p>
                <p className="text-sm text-gray-600 mt-2">Date: _______________</p>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-gray-700 mb-4">
                    <strong>TO:</strong> Global Markets Consulting, LLC, as General Partner of Global Markets Consulting, LP<br />
                    <strong>FROM:</strong> The undersigned prospective Limited Partner ("Subscriber")
                  </p>
                  <p className="text-gray-700">
                    The undersigned hereby subscribes for a limited partnership interest in Global Markets Consulting, LP 
                    (the "Partnership" or "Fund") subject to the terms and conditions set forth below and in the Limited Partnership Agreement.
                  </p>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">SECTION 1 – SUBSCRIPTION DETAILS</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">1.1 Capital Commitment</h4>
                    <p className="text-gray-700 mb-4">
                      The Subscriber hereby subscribes for Partnership interests in the amount of:
                    </p>
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <label className="font-medium text-gray-900">Capital Contribution: $</label>
                        <input
                          type="text"
                          value={investmentAmount}
                          onChange={(e) => setInvestmentAmount(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter amount"
                        />
                      </div>
                      {investmentAmount && parseFloat(investmentAmount.replace(/[^0-9.]/g, '')) < 50000 && (
                        <p className="text-xs text-red-500 mt-1">Amount must be at least $50,000</p>
                      )}
                    </div>
                    <p className="text-gray-700 mt-2">
                      <strong>Minimum Investment:</strong> $50,000 (subject to General Partner discretion for lesser amounts)
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">1.2 Payment Instructions</h4>
                    <p className="text-gray-700">
                      Payment shall be made by wire transfer according to instructions provided by the General Partner. 
                      Investment will not be effective until funds are received and cleared.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">1.3 Acceptance</h4>
                    <p className="text-gray-700">
                      This subscription is subject to acceptance by the General Partner in its sole discretion. 
                      The General Partner reserves the right to reject any subscription for any reason. 
                      Admission shall be effective as of the date designated by the General Partner.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">1.4 Effective Date of Interest</h4>
                    <p className="text-gray-700">
                      Subscriber acknowledges that Interests shall be deemed issued, and all rights and obligations 
                      shall commence, only after clearance of funds and execution of this Agreement by the General Partner.
                    </p>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">SECTION 2 – INVESTOR INFORMATION</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">2.1 Subscriber Details</h4>
                    <div className="space-y-2 text-gray-700">
                      <div>Name/Entity Name: _________________________________________________</div>
                      <div>Mailing Address: _________________________________________________</div>
                      <div>Email Address: _________________________________________________</div>
                      <div>Phone Number: _________________________________________________</div>
                      <div>Tax ID/SSN: _________________________________________________</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">2.2 Type of Investor</h4>
                    <div className="space-y-1 text-gray-700">
                      <div>☐ Individual   ☐ Corporation   ☐ Partnership   ☐ Trust   ☐ LLC   ☐ Other: ___________________</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">2.3 Beneficial Ownership (if entity)</h4>
                    <p className="text-gray-700 mb-2">If Subscriber is an entity, list all persons owning 25% or more:</p>
                    <div className="space-y-1 text-gray-700">
                      <div>Name: _________________________   Ownership %: _________</div>
                      <div>Name: _________________________   Ownership %: _________</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">2.4 Tax Documentation</h4>
                    <p className="text-gray-700">
                      Subscriber agrees to provide a valid IRS Form W-9 (U.S. investors) or IRS Form W-8BEN 
                      (non-U.S. investors) and update such forms as required.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">2.5 Notices and Communications</h4>
                    <p className="text-gray-700">
                      Subscriber consents to receive all notices, reports, statements, and communications 
                      electronically (via email or secure portal), unless otherwise required by law.
                    </p>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">SECTION 3 – INVESTOR QUALIFICATION</h3>
                <p className="text-gray-700 mb-4">
                  The Subscriber qualifies for this investment under Rule 506(b) by meeting ONE of the following criteria:
                </p>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">3.1 Accredited Investor Certification (Rule 501(a))</h4>
                    <div className="space-y-2 text-gray-700">
                      <div>☐ Individual with net worth exceeding $1,000,000 (excluding primary residence)</div>
                      <div>☐ Individual with income exceeding $200,000 ($300,000 joint) in each of the two most recent years</div>
                      <div>☐ Entity with assets exceeding $5,000,000</div>
                      <div>☐ Bank, insurance company, registered investment company, business development company, or small business investment company</div>
                      <div>☐ Employee benefit plan with assets exceeding $5,000,000</div>
                      <div>☐ Trust with assets exceeding $5,000,000 managed by sophisticated person</div>
                      <div>☐ Entity owned entirely by accredited investors</div>
                      <div>☐ Investment advisor registered with SEC or state</div>
                      <div>☐ Rural business investment company</div>
                      <div>☐ Organization described in Section 501(c)(3) with assets exceeding $5,000,000</div>
                      <div>☐ Director, executive officer, or general partner of the issuer</div>
                      <div>☐ Natural person holding professional certifications, designations, or credentials from an accredited educational institution</div>
                      <div>☐ "Knowledgeable employee" of the fund</div>
                      <div>☐ Family client of family office with assets under management exceeding $5,000,000</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">3.2 Sophisticated Non-Accredited Investor Certification</h4>
                    <div className="space-y-2 text-gray-700">
                      <div>☐ I do not meet accredited investor standards above, BUT I have sufficient knowledge and experience in financial and business matters to evaluate the merits and risks of this investment.</div>
                    </div>
                    <div className="mt-4 space-y-2 text-gray-700">
                      <div>If checking sophisticated non-accredited, complete the following:</div>
                      <div>Investment Experience: _________________________________________________</div>
                      <div>Financial Background: _________________________________________________</div>
                      <div>Professional Qualifications: _________________________________________________</div>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">SECTION 4 – REPRESENTATIONS, WARRANTIES, AND ACKNOWLEDGMENTS</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">4.1 Financial Capability</h4>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                      <li>Subscriber has adequate means to bear the economic risk of this investment</li>
                      <li>Subscriber can afford to lose the entire investment without material adverse effect</li>
                      <li>This investment does not represent more than 20% of Subscriber's net worth or investable assets</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">4.2 Investment Experience and Sophistication</h4>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                      <li>Subscriber has sufficient knowledge and experience in financial matters to evaluate risks</li>
                      <li>Subscriber understands the speculative nature of the Fund's strategy</li>
                      <li>Subscriber has consulted with professional advisors as deemed necessary</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">4.3 Investment Purpose</h4>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                      <li>Investment is for Subscriber's own account for investment purposes only</li>
                      <li>No present intention to resell, distribute, or otherwise dispose of the Interests</li>
                      <li>Interests not acquired with a view to distribution</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">4.4 Access to Information</h4>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                      <li>Subscriber has received and carefully reviewed the PPM and LPA</li>
                      <li>Subscriber has had the opportunity to ask questions and receive answers</li>
                      <li>All information provided by Subscriber is true and accurate</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">4.5 Legal and Regulatory Compliance</h4>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                      <li>Investment complies with applicable laws and regulations</li>
                      <li>Subscriber is not subject to backup withholding under the IRC</li>
                      <li>Subscriber will comply with AML and "know your customer" requirements</li>
                    </ul>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-bold text-red-900 mb-2">4.6 Risk Acknowledgment</h4>
                    <p className="text-red-800 mb-2">Subscriber acknowledges:</p>
                    <ul className="list-disc list-inside text-red-700 space-y-1 ml-4">
                      <li>INVESTMENT INVOLVES SUBSTANTIAL RISK OF LOSS</li>
                      <li>Past performance does not guarantee future results</li>
                      <li>No assurance can be given that objectives will be achieved</li>
                      <li>The Fund may use leverage, derivatives, and complex trading strategies</li>
                      <li>Market volatility may result in significant losses</li>
                      <li>Limited liquidity and long lock-up periods apply</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">4.7 Regulatory Exemption</h4>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                      <li>Offering relies on Rule 506(b) of Reg D</li>
                      <li>Securities not registered under federal or state law</li>
                      <li>No public market exists for Interests</li>
                      <li>Transfers restricted under the LPA</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">4.8 OFAC/Patriot Act Compliance</h4>
                    <p className="text-gray-700">
                      Subscriber is not listed on OFAC lists, not resident in sanctioned jurisdictions, 
                      not acting for prohibited entities.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">4.9 ERISA Representation</h4>
                    <p className="text-gray-700">
                      If Subscriber is a benefit plan, participation will not cause the Fund's assets 
                      to be deemed "plan assets" under ERISA.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">4.10 No Reliance on Projections</h4>
                    <p className="text-gray-700">
                      Subscriber is not relying on projections or forward-looking statements.
                    </p>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">SECTION 5 – ADDITIONAL COVENANTS</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">5.1 Confidentiality</h4>
                    <p className="text-gray-700">
                      Subscriber agrees to maintain strict confidentiality of all non-public information.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">5.2 Compliance with Partnership Terms</h4>
                    <p className="text-gray-700">
                      Subscriber agrees to be bound by all terms of the LPA and to execute additional documents if reasonably requested.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">5.3 Updates and Notices</h4>
                    <p className="text-gray-700">
                      Subscriber agrees to promptly notify the GP of changes to provided information and supply further documents as requested.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">5.4 Side Letters</h4>
                    <p className="text-gray-700">
                      Subscriber acknowledges the GP may enter into side letters granting certain investors different rights 
                      and waives any claim to such rights absent explicit written agreement.
                    </p>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">SECTION 6 – LOCK-UP AND REDEMPTION ACKNOWLEDGMENT</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">6.1 Lock-up Period</h4>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                      <li>No redemptions for 12 months following initial contribution</li>
                      <li>After lock-up, quarterly redemptions with 90-day notice</li>
                      <li>GP may suspend redemptions during market stress</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">6.2 Redemption Procedures</h4>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                      <li>Requests must be in writing and are irrevocable once submitted</li>
                      <li>Redemptions processed at NAV as determined by GP</li>
                      <li>2% redemption fee applies within 24 months of investment</li>
                    </ul>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">SECTION 7 – TAX MATTERS</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">7.1 Tax Documentation</h4>
                    <p className="text-gray-700">
                      Subscriber shall provide valid IRS Form W-9 (U.S.) or Form W-8BEN (non-U.S.) and update as necessary.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">7.2 Tax Responsibility</h4>
                    <p className="text-gray-700">
                      Subscriber is responsible for its own tax consequences and compliance obligations.
                    </p>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">SECTION 8 – DISPUTE RESOLUTION</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">8.1 Governing Law</h4>
                    <p className="text-gray-700">
                      This Agreement shall be governed by Delaware law.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">8.2 Arbitration</h4>
                    <p className="text-gray-700">
                      Any disputes shall be resolved by binding arbitration in New York, New York, 
                      under the Commercial Arbitration Rules of the AAA.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">8.3 Jury Trial Waiver</h4>
                    <p className="text-gray-700">
                      Each party knowingly waives the right to a jury trial.
                    </p>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">SECTION 9 – ENTIRE AGREEMENT</h3>
                <p className="text-gray-700">
                  This Agreement, together with the PPM and LPA, constitutes the entire agreement of the parties.
                </p>

                <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">SECTION 10 – EXECUTION</h3>
                <div className="bg-gray-50 p-6 rounded-lg mb-6">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-bold text-gray-900 mb-4">SUBSCRIBER SIGNATURE:</h4>
                      <div className="space-y-4">
                        <div>
                          <strong>Individual Subscriber:</strong><br />
                          Print Name: _________________________________<br />
                          Signature: _________________________________<br />
                          Date: _____________________
                        </div>
                        <div>
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
                      <div className="space-y-4">
                        <div>
                          <strong>Global Markets Consulting, LLC</strong><br />
                          <em>as General Partner of Global Markets Consulting, LP</em>
                        </div>
                        <div>
                          By: _________________________________<br />
                          Name: Christopher Guccio<br />
                          Title: Managing Member<br />
                          Date: _____________________
                        </div>
                        <div>
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
                    <strong>IMPORTANT NOTICE:</strong> This investment has not been registered under federal or state securities laws 
                    and involves substantial risk. Consult your legal, tax, and financial advisors before investing.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6">
          <button
            onClick={handlePrevious}
            className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">
              <Download className="h-4 w-4" />
              <span>Download PDF</span>
            </button>
            
            <button
              onClick={handleSign}
              disabled={currentDocumentSigned}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                currentDocumentSigned
                  ? 'bg-green-100 text-green-700 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {currentDocumentSigned ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span>Signed</span>
                </>
              ) : (
                <>
                  <span>Sign Document</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="font-medium text-gray-900 mb-4">Document Progress</h3>
        <div className="space-y-2">
          {documents.map((doc, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-gray-700">{doc.title}</span>
              {signedDocuments[index] ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />
              )}
            </div>
          ))}
        </div>
        
        {allDocumentsSigned && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">
              All documents have been signed. You can now proceed to complete your investment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}