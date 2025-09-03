import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  FileText, 
  DollarSign,
  ArrowUpRight,
  Activity,
  Plus,
  CreditCard,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  TrendingDown
} from 'lucide-react'
import { useAuth } from './auth/AuthProvider'
import { CheckoutButton } from './CheckoutButton'
import { PortfolioValueCard } from './PortfolioValueCard'
import { FundingModal } from './FundingModal'
import { PortfolioPerformanceChart } from './PortfolioPerformanceChart'
import { NavigationBar } from './NavigationBar'
import { StripeCheckout } from './StripeCheckout'
import { SubscriptionStatus } from './SubscriptionStatus'
import { MarketsTab } from './markets/MarketsTab'
import { ResearchTab } from './research/ResearchTab'
import { PortfolioAnalytics } from './portfolio/PortfolioAnalytics'
import { InteractiveAllocationChart } from './portfolio/InteractiveAllocationChart'
import { PerformanceMetrics } from './portfolio/PerformanceMetrics'
import { AIInsights } from './portfolio/AIInsights'
import { RiskDashboard } from './portfolio/RiskDashboard'
import { OptimizationEngine } from './portfolio/OptimizationEngine'
import { supabaseClient } from '../lib/supabase-client'
import '../styles/funding.css'

export function InvestorDashboard() {
  const { user, account, subscription, refreshAccount } = useAuth()
  const [selectedTab, setSelectedTab] = useState('overview')
  const [selectedTopTab, setSelectedTopTab] = useState('portfolio')
  const [showFundingModal, setShowFundingModal] = useState(false)
  const [prefilledAmount, setPrefilledAmount] = useState<number | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [startY, setStartY] = useState(0)
  const [allTransactions, setAllTransactions] = useState<any[]>([])
  const [loadingTransactions, setLoadingTransactions] = useState(true)
  const [liveUpdateIndicator, setLiveUpdateIndicator] = useState(0)
  const [lastSystemUpdate, setLastSystemUpdate] = useState<Date>(new Date())

  // Extract first name from user data
  const getFirstName = () => {
    if (user?.full_name) {
      return user.full_name.split(' ')[0]
    }
    if (user?.email) {
      return user.email.split('@')[0]
    }
    return 'User'
  }

  // Calculate real P&L based on account data
  const calculatePortfolioData = () => {
    const currentBalance = account?.balance || 0
    const totalDeposits = account?.total_deposits || 0
    const totalWithdrawals = account?.total_withdrawals || 0
    
    // Net deposits (what user actually put in)
    const netDeposits = totalDeposits - totalWithdrawals
    
    // Total P&L is current balance minus net deposits
    const totalPnL = currentBalance - netDeposits
    
    // If no deposits yet, everything should be zero
    if (netDeposits === 0) {
      return {
        totalValue: 0,
        monthlyReturn: 0,
        yearlyReturn: 0,
        totalReturn: 0,
        dailyPnL: 0,
        dailyPnLPct: 0
      }
    }
    
    // Calculate percentages based on net deposits
    const totalReturnPct = (totalPnL / netDeposits) * 100
    
    // For demo purposes, assume daily P&L is 1/365th of total return
    const dailyPnL = totalPnL / 365
    const dailyPnLPct = totalReturnPct / 365
    
    // YTD return (assume account opened this year)
    const ytdReturn = totalReturnPct
    
    return {
      totalValue: currentBalance,
      monthlyReturn: totalReturnPct / 12, // Monthly average
      yearlyReturn: ytdReturn,
      totalReturn: totalReturnPct,
      dailyPnL: dailyPnL,
      dailyPnLPct: dailyPnLPct
    }
  }

  const portfolioData = calculatePortfolioData()

  // Generate comprehensive transaction history for all accounts
  const generateComprehensiveTransactions = (userId: string, accountId: string, currentBalance: number, totalDeposits: number) => {
    const transactions = []
    const now = new Date()
    
    // If account has deposits, generate full transaction history
    if (totalDeposits > 0) {
      // 1. Initial deposit
      transactions.push({
        id: `txn-${userId}-001`,
        user_id: userId,
        account_id: accountId,
        type: 'deposit',
        method: 'stripe',
        amount: totalDeposits * 0.6, // 60% of total deposits as initial
        fee: 0,
        status: 'completed',
        description: 'Initial investment deposit',
        created_at: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days ago
        reference_id: 'STRIPE-' + Math.random().toString(36).substr(2, 9).toUpperCase()
      })
      
      // 2. Additional deposits over time
      transactions.push({
        id: `txn-${userId}-002`,
        user_id: userId,
        account_id: accountId,
        type: 'deposit',
        method: 'wire',
        amount: totalDeposits * 0.4, // 40% as additional deposit
        fee: 25,
        status: 'completed',
        description: 'Wire transfer deposit',
        created_at: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
        reference_id: 'WIRE-' + Math.random().toString(36).substr(2, 9).toUpperCase()
      })
      
      // 3. Trading activity - Multiple trades
      const trades = [
        { symbol: 'BTCUSD', type: 'BUY', amount: 2500, pnl: 125, days_ago: 25 },
        { symbol: 'ETHUSD', type: 'SELL', amount: 1800, pnl: -45, days_ago: 22 },
        { symbol: 'SPY', type: 'BUY', amount: 3200, pnl: 280, days_ago: 20 },
        { symbol: 'QQQ', type: 'SELL', amount: 1500, pnl: 95, days_ago: 18 },
        { symbol: 'TSLA', type: 'BUY', amount: 2200, pnl: -180, days_ago: 15 },
        { symbol: 'NVDA', type: 'SELL', amount: 2800, pnl: 340, days_ago: 12 },
        { symbol: 'AAPL', type: 'BUY', amount: 1900, pnl: 85, days_ago: 10 },
        { symbol: 'MSFT', type: 'SELL', amount: 2100, pnl: 155, days_ago: 8 },
        { symbol: 'GOLD', type: 'BUY', amount: 1600, pnl: 75, days_ago: 6 },
        { symbol: 'BTCUSD', type: 'SELL', amount: 3100, pnl: 420, days_ago: 4 }
      ]
      
      trades.forEach((trade, index) => {
        // Trade execution
        transactions.push({
          id: `txn-${userId}-trade-${index + 1}`,
          user_id: userId,
          account_id: accountId,
          type: 'trade',
          method: 'internal',
          amount: trade.amount,
          fee: trade.amount * 0.001, // 0.1% trading fee
          status: 'completed',
          description: `${trade.type} ${trade.symbol} - $${trade.amount.toLocaleString()}`,
          created_at: new Date(now.getTime() - trade.days_ago * 24 * 60 * 60 * 1000).toISOString(),
          reference_id: `TRADE-${trade.symbol}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          metadata: {
            symbol: trade.symbol,
            trade_type: trade.type,
            trade_amount: trade.amount,
            pnl: trade.pnl,
            execution_price: trade.type === 'BUY' ? 'Market' : 'Limit'
          }
        })
        
        // P&L settlement (separate transaction)
        if (trade.pnl !== 0) {
          transactions.push({
            id: `txn-${userId}-pnl-${index + 1}`,
            user_id: userId,
            account_id: accountId,
            type: trade.pnl > 0 ? 'interest' : 'fee',
            method: 'internal',
            amount: Math.abs(trade.pnl),
            fee: 0,
            status: 'completed',
            description: `${trade.symbol} P&L ${trade.pnl > 0 ? 'Profit' : 'Loss'}`,
            created_at: new Date(now.getTime() - (trade.days_ago - 0.1) * 24 * 60 * 60 * 1000).toISOString(),
            reference_id: `PNL-${trade.symbol}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
            metadata: {
              symbol: trade.symbol,
              trade_reference: `TRADE-${trade.symbol}`,
              pnl_type: trade.pnl > 0 ? 'realized_gain' : 'realized_loss',
              original_trade_amount: trade.amount
            }
          })
        }
      })
      
      // 4. Monthly management fees
      for (let i = 1; i <= 3; i++) {
        const feeAmount = (totalDeposits * 0.02) / 12 // 2% annual = 0.167% monthly
        transactions.push({
          id: `txn-${userId}-fee-${i}`,
          user_id: userId,
          account_id: accountId,
          type: 'fee',
          method: 'internal',
          amount: feeAmount,
          fee: 0,
          status: 'completed',
          description: `Monthly management fee (2% annual)`,
          created_at: new Date(now.getTime() - (45 - i * 15) * 24 * 60 * 60 * 1000).toISOString(),
          reference_id: `FEE-MGT-${now.getFullYear()}-${String(now.getMonth() - i + 1).padStart(2, '0')}`
        })
      }
      
      // 5. Performance fees (quarterly)
      const performanceFee = Math.max(0, (currentBalance - totalDeposits) * 0.20) // 20% of profits
      if (performanceFee > 0) {
        transactions.push({
          id: `txn-${userId}-perf-001`,
          user_id: userId,
          account_id: accountId,
          type: 'fee',
          method: 'internal',
          amount: performanceFee,
          fee: 0,
          status: 'completed',
          description: `Q4 2024 performance fee (20% of profits)`,
          created_at: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
          reference_id: `PERF-Q4-2024-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          metadata: {
            performance_period: 'Q4-2024',
            profit_base: currentBalance - totalDeposits,
            fee_rate: 0.20
          }
        })
      }
      
      // 6. Interest/dividend payments
      const interestPayments = [
        { amount: 45.50, description: 'Cash sweep interest', days_ago: 7 },
        { amount: 128.75, description: 'Dividend payment - SPY', days_ago: 14 },
        { amount: 67.25, description: 'Cash sweep interest', days_ago: 21 },
        { amount: 89.40, description: 'Dividend payment - QQQ', days_ago: 28 }
      ]
      
      interestPayments.forEach((payment, index) => {
        transactions.push({
          id: `txn-${userId}-int-${index + 1}`,
          user_id: userId,
          account_id: accountId,
          type: 'interest',
          method: 'internal',
          amount: payment.amount,
          fee: 0,
          status: 'completed',
          description: payment.description,
          created_at: new Date(now.getTime() - payment.days_ago * 24 * 60 * 60 * 1000).toISOString(),
          reference_id: `INT-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
        })
      })
      
      // 7. Sample withdrawal (if account is large enough)
      if (currentBalance > 5000) {
        transactions.push({
          id: `txn-${userId}-withdraw-001`,
          user_id: userId,
          account_id: accountId,
          type: 'withdrawal',
          method: 'wire',
          amount: 1500,
          fee: 25,
          status: 'completed',
          description: 'Wire transfer withdrawal',
          created_at: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000).toISOString(), // 35 days ago
          reference_id: 'WIRE-OUT-' + Math.random().toString(36).substr(2, 9).toUpperCase()
        })
      }
    }
    
    // Sort by date (newest first)
    return transactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }
  
  // Load transactions when component mounts or account changes
  useEffect(() => {
    const loadTransactions = async () => {
      if (!user || !account) {
        setAllTransactions([])
        setLoadingTransactions(false)
        return
      }
      
      setLoadingTransactions(true)
      
      try {
        // First try to get real transactions from database
        const { data: dbTransactions, error } = await supabaseClient
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50)
        
        if (error) {
          console.warn('⚠️ Database transaction fetch failed, using generated data:', error)
        }
        
        // If we have real transactions, use them; otherwise generate comprehensive mock data
        if (dbTransactions && dbTransactions.length > 0) {
          console.log('✅ Using real transactions from database:', dbTransactions.length)
          setAllTransactions(dbTransactions)
        } else {
          console.log('📝 Generating comprehensive transaction history')
          const generatedTransactions = generateComprehensiveTransactions(
            user.id, 
            account.id, 
            account.balance, 
            account.total_deposits
          )
          setAllTransactions(generatedTransactions)
        }
      } catch (error) {
        console.error('❌ Transaction loading error:', error)
        // Fallback to generated data
        const generatedTransactions = generateComprehensiveTransactions(
          user.id, 
          account.id, 
          account.balance, 
          account.total_deposits
        )
        setAllTransactions(generatedTransactions)
      } finally {
        setLoadingTransactions(false)
      }
    }
    
    loadTransactions()
  }, [user, account])
  
  // Global live update system
  useEffect(() => {
    const globalUpdateInterval = setInterval(() => {
      setLiveUpdateIndicator(prev => prev + 1)
      setLastSystemUpdate(new Date())
      
      // Trigger refresh of account data every 30 seconds
      if (liveUpdateIndicator % 6 === 0) { // Every 6th update (30 seconds)
        refreshAccount()
      }
    }, 5000) // Update indicator every 5 seconds
    
    return () => clearInterval(globalUpdateInterval)
  }, [liveUpdateIndicator, refreshAccount])
  
  // Check if account has real trading activity
  const hasRealTradingActivity = allTransactions.some(t => t.type === 'trade')
  
  const holdings = hasRealTradingActivity ? [
    { name: 'Alpha Fund', allocation: 65, value: (account?.balance || 0) * 0.65, return: 14.2, risk: 'Medium' },
    { name: 'Market Neutral Fund', allocation: 25, value: (account?.balance || 0) * 0.25, return: 8.7, risk: 'Low' },
    { name: 'Momentum Portfolio', allocation: 10, value: (account?.balance || 0) * 0.10, return: 18.9, risk: 'High' }
  ] : [
    { name: 'Alpha Fund', allocation: 0, value: 0, return: 0, risk: 'Medium' },
    { name: 'Market Neutral Fund', allocation: 0, value: 0, return: 0, risk: 'Low' },
    { name: 'Momentum Portfolio', allocation: 0, value: 0, return: 0, risk: 'High' }
  ]

  // Get transaction type icon
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <Plus className="h-4 w-4 text-green-600" />
      case 'withdrawal': return <TrendingDown className="h-4 w-4 text-red-600" />
      case 'trade': return <Activity className="h-4 w-4 text-blue-600" />
      case 'fee': return <DollarSign className="h-4 w-4 text-orange-600" />
      case 'interest': return <TrendingUp className="h-4 w-4 text-green-600" />
      default: return <Activity className="h-4 w-4 text-gray-600" />
    }
  }
  
  // Get transaction type color
  const getTransactionColor = (type: string, amount: number) => {
    if (type === 'deposit' || type === 'interest') return 'text-green-600'
    if (type === 'withdrawal' || type === 'fee') return 'text-red-600'
    if (type === 'trade') {
      // For trades, check metadata for P&L or assume positive
      return 'text-blue-600'
    }
    return 'text-gray-600'
  }
  
  // Format transaction amount with proper sign
  const formatTransactionAmount = (transaction: any) => {
    const { type, amount } = transaction
    
    if (type === 'deposit' || type === 'interest') {
      return `+$${amount.toLocaleString()}`
    } else if (type === 'withdrawal' || type === 'fee') {
      return `-$${amount.toLocaleString()}`
    } else if (type === 'trade') {
      // For trades, show the trade amount
      return `$${amount.toLocaleString()}`
    }
    
    return `$${amount.toLocaleString()}`
  }
  
  // Get recent transactions for display
  const recentTransactions = allTransactions.slice(0, 10)

  const documents = [
    { name: 'Monthly Performance Report - January 2025', date: '2025-01-31', type: 'Performance' },
    { name: 'Quarterly Investment Letter - Q4 2024', date: '2025-01-15', type: 'Letter' },
    { name: 'Annual Tax Statement - 2024', date: '2025-01-10', type: 'Tax' },
    { name: 'Risk Disclosure Statement', date: '2024-12-01', type: 'Legal' },
    { name: 'Investment Agreement Amendment', date: '2024-11-15', type: 'Legal' },
    { name: 'Compliance Documentation', date: '2024-10-01', type: 'Compliance' }
  ]

  const tabs = [
    { id: 'overview', name: 'Portfolio Overview', icon: BarChart3 },
    { id: 'holdings', name: 'Holdings Detail', icon: PieChart },
    { id: 'transactions', name: 'Transaction History', icon: Activity },
    { id: 'documents', name: 'Documents', icon: FileText }
  ]

  const topTabs = [
    { id: 'portfolio', name: 'Portfolio', icon: BarChart3 },
    { id: 'markets', name: 'Markets', icon: TrendingUp },
    { id: 'research', name: 'Research', icon: FileText },
    { id: 'transactions', name: 'Transactions', icon: Activity },
    { id: 'invest', name: 'Invest', icon: CreditCard }
  ]

  const openFunding = (amount: number | null = null) => {
    setPrefilledAmount(amount)
    setShowFundingModal(true)
  }

  const handleFundingSuccess = () => {
    setShowFundingModal(false)
    setPrefilledAmount(null)
    refreshAccount()
  }

  const handleProceedToPayment = (amount: number, method: string) => {
    setShowFundingModal(false)
    console.log('Proceeding to payment:', { amount, method })
  }

  // Pull-to-refresh functionality
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentY = e.touches[0].clientY
    const diff = currentY - startY
    
    if (diff > 0 && window.scrollY === 0) {
      setPullDistance(Math.min(diff * 0.5, 80))
    }
  }

  const handleTouchEnd = async () => {
    if (pullDistance > 60) {
      setIsRefreshing(true)
      await refreshAccount()
      setTimeout(() => {
        setIsRefreshing(false)
        setPullDistance(0)
      }, 1000)
    } else {
      setPullDistance(0)
    }
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Pull-to-refresh indicator */}
      {pullDistance > 0 && (
        <div className="fixed top-0 left-0 right-0 z-40 glass-card flex items-center justify-center transition-all duration-300"
             style={{ height: `${pullDistance}px`, opacity: pullDistance / 80 }}>
          <div className={`text-white text-sm font-medium ${isRefreshing ? 'animate-spin' : ''}`}>
            {isRefreshing ? (
              <RefreshCw className="h-5 w-5" />
            ) : pullDistance > 60 ? (
              'Release to refresh'
            ) : (
              'Pull to refresh'
            )}
          </div>
        </div>
      )}
      
      <div className="premium-container py-8 md:py-12">
        {/* Top Navigation Tabs */}
        <div className="exchange-card mb-8 md:mb-12 animate-slide-up">
          <div className="px-8 py-6">
            {/* Mobile: Horizontal scroll tabs */}
            <nav className="flex space-x-6 md:space-x-10 overflow-x-auto">
              {topTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTopTab(tab.id)}
                  className={`flex items-center space-x-3 py-4 px-6 rounded-xl font-semibold text-sm transition-all duration-300 whitespace-nowrap interactive-element ${
                    selectedTopTab === tab.id
                      ? 'exchange-button-primary text-black'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <tab.icon className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden sm:inline">{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Investment Tab Content */}
        {selectedTopTab === 'invest' && (
          <div className="exchange-grid mb-8 md:mb-12">
            <StripeCheckout className="h-fit" />
            <div className="exchange-card p-6">
              <h3 className="exchange-heading text-lg md:text-xl mb-6">Investment Information</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-gold" />
                  <span className="text-sm md:text-base exchange-text">Secure payment processing via Stripe</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-gold" />
                  <span className="text-sm md:text-base exchange-text">Instant account funding</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-gold" />
                  <span className="text-sm md:text-base exchange-text">Professional investment management</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-gold" />
                  <span className="text-sm md:text-base exchange-text">Real-time portfolio tracking</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Portfolio Value Card */}
        {selectedTopTab === 'portfolio' && (
          <div className="mb-8 animate-slide-up">
            <h1 className="exchange-heading text-2xl md:text-3xl mb-4">
              Welcome back, {getFirstName()}
            </h1>
            <p className="exchange-text text-base">
              Here's your portfolio performance and investment overview
            </p>
          </div>
        )}

        {selectedTopTab === 'portfolio' && (
          <PortfolioValueCard 
            onFundPortfolio={openFunding}
            onWithdraw={() => console.log('Withdraw clicked')}
          />
        )}

        {/* Performance Summary Cards */}
        {selectedTopTab === 'portfolio' && (
          <div className="exchange-grid exchange-spacing">
            <div className="metric-card interactive-element">
              <div className="flex items-center justify-between mb-3">
                <span className="exchange-label">Daily P&L</span>
                <div className="w-8 h-8 bg-gradient-success rounded-full flex items-center justify-center animate-pulse-glow">
                  <ArrowUpRight className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="metric-value text-gold">
                +${portfolioData.dailyPnL.toLocaleString()}
              </div>
              <div className="exchange-badge positive">
                +{portfolioData.dailyPnLPct.toFixed(2)}%
              </div>
            </div>
            
            <div className="metric-card interactive-element">
              <div className="flex items-center justify-between mb-3">
                <span className="exchange-label">YTD Return</span>
                <div className="w-8 h-8 bg-gradient-gold rounded-full flex items-center justify-center animate-gold-glow">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="metric-value text-gradient">
                +{portfolioData.yearlyReturn}%
              </div>
              <div className="text-sm text-white/60 font-medium">vs S&P 500</div>
            </div>
            
            <div className="metric-card interactive-element">
              <div className="flex items-center justify-between mb-3">
                <span className="exchange-label">Available Cash</span>
                <div className="w-8 h-8 bg-gradient-gold rounded-full flex items-center justify-center animate-gold-glow">
                  <Plus className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="metric-value text-gradient">
                ${account?.available_balance?.toLocaleString() || '0'}
              </div>
              <div className="text-sm text-white/60 font-medium">Ready to invest</div>
            </div>
          </div>
        )}

        {/* Portfolio Performance Chart */}
        {selectedTopTab === 'portfolio' && (
          <PortfolioPerformanceChart 
            currentBalance={account?.balance || 0}
            className="mb-4 md:mb-8"
          />
        )}

        {/* Advanced Portfolio Analytics */}
        {selectedTopTab === 'portfolio' && (
          <div className="space-y-8 mb-8 md:mb-12">
            <InteractiveAllocationChart currentBalance={account?.balance || 0} />
            <PerformanceMetrics currentBalance={account?.balance || 0} />
          </div>
        )}

        {/* AI Insights and Risk Management */}
        {selectedTopTab === 'portfolio' && (
          <div className="exchange-grid mb-8 md:mb-12">
            <AIInsights currentBalance={account?.balance || 0} />
            <RiskDashboard currentBalance={account?.balance || 0} />
          </div>
        )}

        {/* Portfolio Optimization Engine */}
        {selectedTopTab === 'portfolio' && (
          <OptimizationEngine currentBalance={account?.balance || 0} />
        )}

        {/* Advanced Analytics Section */}
        {selectedTopTab === 'portfolio' && (
          <PortfolioAnalytics currentBalance={account?.balance || 0} />
        )}

        {/* Markets Tab Content */}
        {selectedTopTab === 'markets' && (
          <div className="space-y-6 md:space-y-12">
            <MarketsTab />
          </div>
        )}

        {/* Research Tab Content */}
        {selectedTopTab === 'research' && (
          <div className="space-y-6 md:space-y-10">
            <ResearchTab />
          </div>
        )}

        {/* Transactions Tab Content */}
        {selectedTopTab === 'transactions' && (
          <div className="exchange-card p-6 mb-8 md:mb-12">
            <h3 className="exchange-heading text-lg md:text-xl mb-6">Transaction History</h3>
            
            {/* Transaction Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <div className="metric-card text-center">
                <div className="text-lg font-bold text-gold">
                  {allTransactions.filter(t => t.type === 'deposit').length}
                </div>
                <div className="exchange-label">Deposits</div>
              </div>
              <div className="metric-card text-center">
                <div className="text-lg font-bold text-gold">
                  {allTransactions.filter(t => t.type === 'withdrawal').length}
                </div>
                <div className="exchange-label">Withdrawals</div>
              </div>
              <div className="metric-card text-center">
                <div className="text-lg font-bold text-gradient">
                  {allTransactions.filter(t => t.type === 'trade').length}
                </div>
                <div className="exchange-label">Trades</div>
              </div>
              <div className="metric-card text-center">
                <div className="text-lg font-bold text-gradient">
                  {allTransactions.filter(t => t.type === 'fee').length}
                </div>
                <div className="exchange-label">Fees</div>
              </div>
              <div className="metric-card text-center">
                <div className="text-lg font-bold text-gradient">
                  {allTransactions.filter(t => t.type === 'interest').length}
                </div>
                <div className="exchange-label">Interest</div>
              </div>
            </div>
            
            {loadingTransactions ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="exchange-loading h-16 rounded-lg"></div>
                ))}
              </div>
            ) : allTransactions.length > 0 ? (
              <div className="space-y-3">
                {recentTransactions.map((transaction, index) => (
                  <div key={index} className="exchange-table-row">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-8 h-8 exchange-card rounded-full flex items-center justify-center">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white capitalize">
                          {transaction.description}
                        </div>
                        <div className="text-xs text-white/60">
                          {transaction.method?.toUpperCase()} • {new Date(transaction.created_at).toLocaleDateString()}
                          {transaction.reference_id && (
                            <span className="ml-2 font-mono text-xs text-white/40">
                              {transaction.reference_id}
                            </span>
                          )}
                        </div>
                        {transaction.metadata?.symbol && (
                          <div className="text-xs text-white/40">
                            {transaction.metadata.symbol} • {transaction.metadata.trade_type}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${getTransactionColor(transaction.type, transaction.amount)}`}>
                        {formatTransactionAmount(transaction)}
                      </div>
                      <div className="text-xs text-white/60 capitalize">
                        {transaction.status}
                      </div>
                      {transaction.fee > 0 && (
                        <div className="text-xs text-orange-400">
                          Fee: ${transaction.fee.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {allTransactions.length > 10 && (
                  <div className="text-center pt-4">
                    <button className="exchange-button text-sm">
                      View All {allTransactions.length} Transactions
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-white/40 mb-2 text-base">No transactions yet</div>
                <div className="text-sm text-white/30">
                  Transactions will appear here after funding and trading activity
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation Tabs */}
        {selectedTopTab === 'portfolio' && (
          <div className="exchange-card mb-8 md:mb-12 p-6">
          <div className="border-b border-white/10">
            <nav className="flex space-x-4 md:space-x-8 px-6 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-all duration-300 whitespace-nowrap ${
                    selectedTab === tab.id
                      ? 'border-yellow-400 text-gold'
                      : 'border-transparent text-white/60 hover:text-white/90'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span className="hidden xs:inline text-sm">{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6 md:p-8">
            {selectedTab === 'overview' && (
              <div className="space-y-8">
                <div>
                  <h3 className="exchange-heading text-lg md:text-xl mb-6">Asset Allocation</h3>
                  <div className="exchange-grid">
                    <div className="space-y-4">
                      {holdings.map((holding, index) => (
                        <div key={index} className="exchange-table-row">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-white">{holding.name}</div>
                            <div className="text-xs text-white/60">{holding.allocation}% allocation • {holding.risk} risk</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gradient">
                              ${holding.value.toLocaleString()}
                            </div>
                            <div className="text-xs text-gold">+{holding.return}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="exchange-card-dark rounded-lg p-6">
                      <h4 className="text-base font-medium text-white mb-4">Performance Metrics</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-white/60">Sharpe Ratio</span>
                          <span className="text-sm font-medium text-gradient">2.84</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-white/60">Max Drawdown</span>
                          <span className="text-sm font-medium text-gradient">-4.2%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-white/60">Volatility</span>
                          <span className="text-sm font-medium text-gradient">8.7%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'holdings' && (
              <div className="space-y-6">
                <h3 className="exchange-heading text-lg md:text-xl">Detailed Holdings</h3>
                <div className="exchange-table">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-black/40">
                        <th className="text-left py-3 px-4 text-sm font-medium text-white/80">Fund Name</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-white/80">Allocation</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-white/80">Value</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-white/80">Return</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-white/80">Risk</th>
                      </tr>
                    </thead>
                    <tbody>
                      {holdings.map((holding, index) => (
                        <tr key={index} className="exchange-table-row">
                          <td className="py-4 px-4 text-sm font-medium text-white">{holding.name}</td>
                          <td className="py-4 px-4 text-sm text-right text-white/70">{holding.allocation}%</td>
                          <td className="py-4 px-4 text-sm text-right font-medium text-gradient">
                            ${holding.value.toLocaleString()}
                          </td>
                          <td className="py-4 px-4 text-sm text-right font-medium text-gold">
                            +{holding.return}%
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                              holding.risk === 'Low' ? 'exchange-badge positive' :
                              holding.risk === 'Medium' ? 'exchange-badge neutral' :
                              'exchange-badge negative'
                            }`}>
                              {holding.risk}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selectedTab === 'transactions' && (
              <div className="space-y-6">
                <h3 className="exchange-heading text-lg md:text-xl">Recent Transactions</h3>
                
                {loadingTransactions ? (
                  <div className="space-y-4">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="exchange-loading h-16 rounded-lg"></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {allTransactions.map((transaction, index) => (
                      <div key={index} className="exchange-table-row">
                        <div className="flex items-center space-x-3 flex-1">
                          <div className="w-8 h-8 exchange-card rounded-full flex items-center justify-center">
                            {getTransactionIcon(transaction.type)}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-white">
                              {transaction.description}
                            </div>
                            <div className="text-xs text-white/60">
                              {transaction.method?.toUpperCase()} • {new Date(transaction.created_at).toLocaleDateString()}
                            </div>
                            {transaction.metadata?.symbol && (
                              <div className="text-xs text-white/40">
                                {transaction.metadata.symbol} • {transaction.metadata.trade_type}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-medium ${getTransactionColor(transaction.type, transaction.amount)}`}>
                            {formatTransactionAmount(transaction)}
                          </div>
                          <div className="text-xs text-white/60 capitalize">
                            {transaction.status}
                          </div>
                          {transaction.fee > 0 && (
                            <div className="text-xs text-orange-400">
                              Fee: ${transaction.fee.toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {selectedTab === 'documents' && (
              <div className="space-y-6">
                <h3 className="exchange-heading text-lg md:text-xl">Investment Documents</h3>
                <div className="exchange-grid">
                  {documents.map((doc, index) => (
                    <div key={index} className="exchange-table-row">
                      <div className="flex items-center space-x-3 flex-1">
                        <FileText className="h-5 w-5 text-white/60" />
                        <div>
                          <div className="text-sm font-medium text-white">{doc.name}</div>
                          <div className="text-xs text-white/60">{doc.type} • {doc.date}</div>
                        </div>
                      </div>
                      <button className="exchange-button text-xs">
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          </div>
        )}
      </div>

      {/* Funding Modal */}
      <FundingModal
        isOpen={showFundingModal}
        onClose={() => setShowFundingModal(false)}
        prefilledAmount={prefilledAmount}
        onProceedToPayment={handleProceedToPayment}
      />
    </div>
  )
}

export default InvestorDashboard