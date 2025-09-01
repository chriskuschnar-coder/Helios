// KYC/AML Integration with Jumio
export interface KYCVerification {
  id: string
  user_id: string
  provider: 'jumio' | 'onfido' | 'manual'
  verification_type: 'identity' | 'address' | 'income' | 'accredited_investor'
  status: 'pending' | 'approved' | 'rejected' | 'expired'
  data: Record<string, any>
  created_at: string
}

export interface JumioConfig {
  apiToken: string
  apiSecret: string
  baseUrl: string
  userReference: string
  successUrl: string
  errorUrl: string
}

export interface IdentityVerification {
  firstName: string
  lastName: string
  dateOfBirth: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  documentType: 'passport' | 'drivers_license' | 'id_card'
  documentNumber: string
  ssn?: string
}

export interface AccreditedInvestorVerification {
  verificationType: 'income' | 'net_worth' | 'professional'
  annualIncome?: number
  netWorth?: number
  professionalCertification?: string
  verificationDocuments: string[]
}

// KYC verification levels
export const KYC_LEVELS = {
  BASIC: {
    name: 'Basic Verification',
    requirements: ['Email verification', 'Phone verification'],
    limits: { deposit: 1000, withdrawal: 500 },
    description: 'Basic account access with limited functionality'
  },
  ENHANCED: {
    name: 'Enhanced Verification',
    requirements: ['Identity document', 'Address verification'],
    limits: { deposit: 50000, withdrawal: 25000 },
    description: 'Full platform access with standard limits'
  },
  ACCREDITED: {
    name: 'Accredited Investor',
    requirements: ['Income verification', 'Net worth verification', 'Professional certification'],
    limits: { deposit: 1000000, withdrawal: 500000 },
    description: 'Access to exclusive investment products'
  }
}

// Risk assessment factors
export interface RiskAssessment {
  score: number
  level: 'low' | 'medium' | 'high'
  factors: {
    geolocation: string
    deviceFingerprint: string
    transactionPattern: string
    velocityCheck: string
  }
  recommendations: string[]
}

export const createJumioVerification = async (config: JumioConfig): Promise<string> => {
  // This would integrate with actual Jumio API
  const mockVerificationUrl = `${config.baseUrl}/verification/${config.userReference}`
  return mockVerificationUrl
}

export const checkKYCStatus = async (verificationId: string): Promise<KYCVerification> => {
  // Mock implementation - would integrate with actual KYC provider
  return {
    id: verificationId,
    user_id: 'user-123',
    provider: 'jumio',
    verification_type: 'identity',
    status: 'pending',
    data: {},
    created_at: new Date().toISOString()
  }
}

// AML screening
export interface AMLScreening {
  user_id: string
  screening_type: 'sanctions' | 'pep' | 'adverse_media'
  status: 'clear' | 'flagged' | 'review_required'
  matches: Array<{
    name: string
    type: string
    confidence: number
    source: string
  }>
  created_at: string
}

export const performAMLScreening = async (userData: IdentityVerification): Promise<AMLScreening> => {
  // Mock implementation - would integrate with actual AML screening service
  return {
    user_id: 'user-123',
    screening_type: 'sanctions',
    status: 'clear',
    matches: [],
    created_at: new Date().toISOString()
  }
}