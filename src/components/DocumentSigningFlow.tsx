import React, { useState } from 'react';
import { FileText, CheckCircle, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth } from './auth/AuthProvider';

interface DocumentSigningFlowProps {
  onComplete: () => void;
  onBack: () => void;
}

export function DocumentSigningFlow({ onComplete, onBack }: DocumentSigningFlowProps) {
  const { user, saveSignedDocument, markDocumentsComplete } = useAuth();
  const [currentDocument, setCurrentDocument] = useState(0);
  const [signatures, setSignatures] = useState<{ [key: number]: string }>({});
  const [formData, setFormData] = useState({
    capitalContribution: '',
    fullName: '',
    email: user?.email || '',
    phone: '',
    mailingAddress: '',
    taxId: '',
    investorType: '',
    accreditedQualifications: [] as string[],
    beneficialOwnership: {
      entityName: '',
      entityType: '',
      ownershipPercentage: '',
      controllingPerson: ''
    }
  });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(false);

  const documents = [
    {
      title: 'Investment Agreement',
      type: 'investment_agreement',
      content: `INVESTMENT AGREEMENT

This Investment Agreement ("Agreement") is entered into between Global Market Consulting ("Fund") and the undersigned investor ("Investor").

TERMS AND CONDITIONS:

1. INVESTMENT COMMITMENT
The Investor agrees to invest in the Fund's quantitative trading strategies as outlined in the Private Placement Memorandum.

2. RISK ACKNOWLEDGMENT
The Investor acknowledges that investments involve substantial risk and may result in complete loss of capital.

3. QUALIFIED INVESTOR STATUS
The Investor represents that they meet all applicable qualified investor requirements.

4. GOVERNING LAW
This Agreement shall be governed by the laws of Delaware.

By signing below, the Investor agrees to all terms and conditions set forth in this Agreement.`,
      requiredFields: ['signature']
    },
    {
      title: 'Risk Disclosure Statement',
      type: 'risk_disclosure',
      content: `RISK DISCLOSURE STATEMENT

IMPORTANT: Please read this Risk Disclosure Statement carefully before investing.

INVESTMENT RISKS:

1. MARKET RISK
Quantitative strategies may experience significant losses during adverse market conditions.

2. LEVERAGE RISK
The Fund may use leverage, which can amplify both gains and losses.

3. LIQUIDITY RISK
Investments may be subject to lock-up periods and withdrawal restrictions.

4. OPERATIONAL RISK
Technology failures or model errors could result in substantial losses.

5. REGULATORY RISK
Changes in regulations may adversely affect the Fund's operations.

ACKNOWLEDGMENT:
I acknowledge that I have read and understand these risks and that past performance does not guarantee future results.`,
      requiredFields: ['signature']
    },
    {
      title: 'Subscription Agreement',
      type: 'subscription_agreement',
      content: `SUBSCRIPTION AGREEMENT

INVESTOR INFORMATION AND SUBSCRIPTION DETAILS

This Subscription Agreement must be completed in full to process your investment in Global Market Consulting Fund.

INVESTMENT DETAILS:
Your capital contribution will be allocated according to our quantitative investment strategies as outlined in the Private Placement Memorandum.

INVESTOR REPRESENTATIONS:
By completing this form, you represent that all information provided is accurate and complete, and that you meet all applicable investor qualification requirements.

COMPLIANCE REQUIREMENTS:
This information is required for regulatory compliance and anti-money laundering purposes.`,
      requiredFields: ['capitalContribution', 'fullName', 'email', 'phone', 'mailingAddress', 'taxId', 'investorType', 'accreditedQualifications', 'signature']
    }
  ];

  const accreditedOptions = [
    'Net worth exceeds $1 million (excluding primary residence)',
    'Annual income exceeds $200,000 ($300,000 joint) for past 2 years',
    'Professional knowledge and experience in financial matters',
    'Entity with assets exceeding $5 million',
    'Investment advisor representative',
    'Other qualified institutional investor'
  ];

  const calculateValidationErrors = () => {
    const doc = documents[currentDocument];
    const errors: string[] = [];

    // Check required fields for current document
    doc.requiredFields.forEach(field => {
      if (field === 'signature') {
        if (!signatures[currentDocument]) {
          errors.push('Digital signature is required');
        }
      } else if (field === 'capitalContribution') {
        const amount = parseFloat(formData.capitalContribution);
        if (!formData.capitalContribution || isNaN(amount) || amount < 50000) {
          errors.push('Capital contribution must be at least $50,000');
        }
      } else if (field === 'accreditedQualifications') {
        if (formData.accreditedQualifications.length === 0) {
          errors.push('At least one accredited investor qualification must be selected');
        }
      } else if (field === 'investorType') {
        if (!formData.investorType) {
          errors.push('Investor type must be selected');
        }
      } else {
        const value = formData[field as keyof typeof formData];
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          errors.push(`${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`);
        }
      }
    });

    // Additional validation for entity investors
    if (currentDocument === 2 && formData.investorType === 'entity') {
      if (!formData.beneficialOwnership.entityName) {
        errors.push('Entity name is required');
      }
      if (!formData.beneficialOwnership.entityType) {
        errors.push('Entity type is required');
      }
      if (!formData.beneficialOwnership.ownershipPercentage) {
        errors.push('Ownership percentage is required');
      }
      if (!formData.beneficialOwnership.controllingPerson) {
        errors.push('Controlling person is required');
      }
    }

    return errors;
  };

  // Validate form whenever dependencies change
  React.useEffect(() => {
    const errors = calculateValidationErrors();
    setValidationErrors(errors);
    setIsValid(errors.length === 0);
  }, [currentDocument, signatures, formData]);

  const handleSignature = (signature: string) => {
    setSignatures(prev => ({
      ...prev,
      [currentDocument]: signature
    }));
  };

  const handleFormChange = (field: string, value: any) => {
    if (field.startsWith('beneficialOwnership.')) {
      const subField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        beneficialOwnership: {
          ...prev.beneficialOwnership,
          [subField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleAccreditedChange = (qualification: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      accreditedQualifications: checked
        ? [...prev.accreditedQualifications, qualification]
        : prev.accreditedQualifications.filter(q => q !== qualification)
    }));
  };

  const handleNext = async () => {
    if (!isValid) {
      return;
    }

    try {
      // Save the current document
      await saveSignedDocument({
        document_id: `doc_${currentDocument + 1}_${Date.now()}`,
        document_title: documents[currentDocument].title,
        document_type: documents[currentDocument].type,
        signature: signatures[currentDocument],
        ip_address: 'demo_ip',
        user_agent: navigator.userAgent
      });

      if (currentDocument < documents.length - 1) {
        setCurrentDocument(currentDocument + 1);
      } else {
        // All documents completed
        await markDocumentsComplete();
        onComplete();
      }
    } catch (error) {
      console.error('Error saving document:', error);
      setValidationErrors(['Failed to save document. Please try again.']);
    }
  };

  const handlePrevious = () => {
    if (currentDocument > 0) {
      setCurrentDocument(currentDocument - 1);
    } else {
      onBack();
    }
  };

  const currentDoc = documents[currentDocument];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-600">
            Document {currentDocument + 1} of {documents.length}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(((currentDocument + 1) / documents.length) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-navy-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentDocument + 1) / documents.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Document Content */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 mb-6">
        <div className="flex items-center space-x-3 mb-6">
          <FileText className="h-6 w-6 text-navy-600" />
          <h3 className="text-xl font-bold text-gray-900">{currentDoc.title}</h3>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-6 max-h-60 overflow-y-auto">
          <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed">
            {currentDoc.content}
          </pre>
        </div>

        {/* Form Fields for Subscription Agreement */}
        {currentDocument === 2 && (
          <div className="space-y-6 mb-6">
            <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Investor Information
            </h4>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capital Contribution Amount <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={formData.capitalContribution}
                    onChange={(e) => handleFormChange('capitalContribution', e.target.value)}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                    placeholder="50,000"
                    min="50000"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Minimum: $50,000</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Legal Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleFormChange('fullName', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                  placeholder="Enter your full legal name"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFormChange('email', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleFormChange('phone', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mailing Address <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.mailingAddress}
                onChange={(e) => handleFormChange('mailingAddress', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                rows={3}
                placeholder="Street address, city, state, ZIP code"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tax ID (SSN/EIN) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.taxId}
                onChange={(e) => handleFormChange('taxId', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                placeholder="XXX-XX-XXXX or XX-XXXXXXX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Investor Type <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="investorType"
                    value="individual"
                    checked={formData.investorType === 'individual'}
                    onChange={(e) => handleFormChange('investorType', e.target.value)}
                    className="mr-2"
                  />
                  <span>Individual Investor</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="investorType"
                    value="entity"
                    checked={formData.investorType === 'entity'}
                    onChange={(e) => handleFormChange('investorType', e.target.value)}
                    className="mr-2"
                  />
                  <span>Entity (Corporation, LLC, Trust, etc.)</span>
                </label>
              </div>
            </div>

            {/* Entity-specific fields */}
            {formData.investorType === 'entity' && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <h5 className="font-medium text-gray-900">Beneficial Ownership Information</h5>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Entity Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.beneficialOwnership.entityName}
                      onChange={(e) => handleFormChange('beneficialOwnership.entityName', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                      placeholder="Legal entity name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Entity Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.beneficialOwnership.entityType}
                      onChange={(e) => handleFormChange('beneficialOwnership.entityType', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                    >
                      <option value="">Select entity type</option>
                      <option value="corporation">Corporation</option>
                      <option value="llc">LLC</option>
                      <option value="partnership">Partnership</option>
                      <option value="trust">Trust</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ownership Percentage <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.beneficialOwnership.ownershipPercentage}
                      onChange={(e) => handleFormChange('beneficialOwnership.ownershipPercentage', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                      placeholder="25"
                      min="0"
                      max="100"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Controlling Person <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.beneficialOwnership.controllingPerson}
                      onChange={(e) => handleFormChange('beneficialOwnership.controllingPerson', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                      placeholder="Name of controlling person"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Accredited Investor Qualifications <span className="text-red-500">*</span>
              </label>
              <p className="text-sm text-gray-600 mb-3">
                Select all that apply to verify your accredited investor status:
              </p>
              <div className="space-y-2">
                {accreditedOptions.map((option, index) => (
                  <label key={index} className="flex items-start">
                    <input
                      type="checkbox"
                      checked={formData.accreditedQualifications.includes(option)}
                      onChange={(e) => handleAccreditedChange(option, e.target.checked)}
                      className="mt-1 mr-3"
                    />
                    <span className="text-sm text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Digital Signature */}
        <div className="border-t border-gray-200 pt-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Digital Signature <span className="text-red-500">*</span>
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="text"
              value={signatures[currentDocument] || ''}
              onChange={(e) => handleSignature(e.target.value)}
              className="w-full text-center text-lg font-script border-none outline-none bg-transparent"
              placeholder="Type your full legal name here"
            />
            <p className="text-sm text-gray-500 mt-2">
              By typing your name, you agree to sign this document electronically
            </p>
          </div>
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="font-medium text-red-900">Please complete the following:</span>
            </div>
            <ul className="text-sm text-red-700 space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={handlePrevious}
          className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Previous</span>
        </button>

        <button
          onClick={handleNext}
          disabled={!isValid}
          className="flex items-center space-x-2 px-6 py-3 bg-navy-600 hover:bg-navy-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
        >
          <span>
            {currentDocument === documents.length - 1 ? 'Complete Documents' : 'Sign & Continue'}
          </span>
          {currentDocument === documents.length - 1 ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}