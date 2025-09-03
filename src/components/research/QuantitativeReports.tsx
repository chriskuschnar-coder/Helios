import React, { useState } from 'react'
import { FileText, Download, Eye, Calendar, TrendingUp, BarChart3, Brain, Target, ExternalLink, Play, Users } from 'lucide-react'

interface ResearchReport {
  id: string
  title: string
  type: 'monthly' | 'quarterly' | 'special' | 'academic'
  date: string
  summary: string
  keyFindings: string[]
  downloadUrl: string
  videoUrl?: string
  readTime: string
  tags: string[]
  author: string
  views: number
  featured: boolean
}

export function QuantitativeReports() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'monthly' | 'quarterly' | 'special' | 'academic'>('all')
  const [selectedReport, setSelectedReport] = useState<ResearchReport | null>(null)
  const [showModal, setShowModal] = useState(false)

  const reports: ResearchReport[] = [
    {
      id: 'jan-2025-performance',
      title: 'January 2025 Performance Attribution Analysis',
      type: 'monthly',
      date: '2025-01-31',
      summary: 'Comprehensive analysis of our quantitative strategies performance during January 2025, including factor attribution, regime analysis, and forward-looking positioning adjustments.',
      keyFindings: [
        'Momentum factor contributed +4.2% to monthly returns',
        'Mean reversion strategies underperformed by -1.1% due to trending markets',
        'Volatility targeting reduced drawdown by 35% during mid-month correction',
        'Cross-asset momentum signals showed 89% accuracy rate'
      ],
      downloadUrl: '/reports/jan-2025-performance.pdf',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      readTime: '12 min',
      tags: ['Performance', 'Attribution', 'Momentum', 'Risk Management'],
      author: 'Dr. Sarah Chen, CFA',
      views: 1247,
      featured: true
    },
    {
      id: 'q4-2024-letter',
      title: 'Q4 2024 Quantitative Investment Letter',
      type: 'quarterly',
      date: '2025-01-15',
      summary: 'Quarterly review of market conditions, strategy performance, and outlook for 2025. Includes detailed analysis of regime changes and positioning for the new year.',
      keyFindings: [
        'Q4 delivered +18.7% returns vs +5.2% for S&P 500',
        'Successfully navigated 3 distinct market regimes',
        'Sharpe ratio improved to 2.94 from 2.71 in Q3',
        'Added new cryptocurrency momentum strategies'
      ],
      downloadUrl: '/reports/q4-2024-letter.pdf',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      readTime: '18 min',
      tags: ['Quarterly', 'Strategy', 'Outlook', 'Crypto'],
      author: 'Michael Rodriguez, PhD',
      views: 2156,
      featured: true
    },
    {
      id: 'vpin-implementation',
      title: 'VPIN Implementation: Detecting Informed Trading',
      type: 'academic',
      date: '2025-01-10',
      summary: 'Technical deep-dive into our Volume-Synchronized Probability of Informed Trading implementation, including machine learning enhancements and practical applications.',
      keyFindings: [
        'VPIN model achieved 76% accuracy in predicting adverse price moves',
        'Machine learning enhancement improved detection by 23%',
        'Reduced execution costs by average of 12 basis points',
        'Successfully identified 89% of major institutional flow events'
      ],
      downloadUrl: '/reports/vpin-implementation.pdf',
      readTime: '25 min',
      tags: ['VPIN', 'Machine Learning', 'Execution', 'Academic'],
      author: 'Dr. James Liu, Quantitative Research',
      views: 892,
      featured: false
    },
    {
      id: 'crypto-momentum-study',
      title: 'Cryptocurrency Momentum: A Quantitative Analysis',
      type: 'special',
      date: '2024-12-20',
      summary: 'Comprehensive study of momentum effects in cryptocurrency markets, including cross-sectional momentum, time-series momentum, and risk-adjusted performance metrics.',
      keyFindings: [
        'Crypto momentum strategies show 2.3x higher Sharpe ratios than traditional assets',
        'Optimal rebalancing frequency is 3-5 days for maximum alpha',
        'Bitcoin dominance cycles create systematic momentum opportunities',
        'Risk-adjusted returns improve 45% with volatility targeting'
      ],
      downloadUrl: '/reports/crypto-momentum-study.pdf',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      readTime: '22 min',
      tags: ['Cryptocurrency', 'Momentum', 'Alpha', 'Volatility'],
      author: 'Dr. Sarah Chen, CFA',
      views: 1834,
      featured: true
    },
    {
      id: 'regime-detection-hmm',
      title: 'Market Regime Detection Using Hidden Markov Models',
      type: 'academic',
      date: '2024-11-30',
      summary: 'Mathematical framework for real-time market regime identification using 4-state Hidden Markov Models with Gaussian emissions and Baum-Welch parameter estimation.',
      keyFindings: [
        '4-state model outperforms 2-state by 34% in regime classification',
        'Regime persistence averages 23 trading days with 85% accuracy',
        'Transition probabilities provide 5-day forward guidance',
        'Model reduces strategy drawdowns by average of 28%'
      ],
      downloadUrl: '/reports/regime-detection-hmm.pdf',
      readTime: '30 min',
      tags: ['HMM', 'Regime Detection', 'Mathematics', 'Risk Management'],
      author: 'Dr. James Liu, Quantitative Research',
      views: 1456,
      featured: false
    },
    {
      id: 'statistical-arbitrage-framework',
      title: 'Statistical Arbitrage: Ornstein-Uhlenbeck Implementation',
      type: 'academic',
      date: '2024-10-15',
      summary: 'Detailed implementation of statistical arbitrage strategies using Ornstein-Uhlenbeck mean reversion processes and Johansen cointegration testing.',
      keyFindings: [
        'OU process calibration improves pair selection by 67%',
        'Johansen methodology identifies 23% more stable relationships',
        'Dynamic hedge ratios reduce portfolio volatility by 31%',
        'Strategy generates consistent alpha across market conditions'
      ],
      downloadUrl: '/reports/statistical-arbitrage-framework.pdf',
      readTime: '28 min',
      tags: ['Statistical Arbitrage', 'Cointegration', 'Mean Reversion', 'Pairs Trading'],
      author: 'Dr. Michael Rodriguez, PhD',
      views: 1123,
      featured: false
    }
  ]

  const getFilteredReports = () => {
    if (selectedCategory === 'all') return reports
    return reports.filter(report => report.type === selectedCategory)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'monthly': return <Calendar className="h-4 w-4" />
      case 'quarterly': return <BarChart3 className="h-4 w-4" />
      case 'special': return <TrendingUp className="h-4 w-4" />
      case 'academic': return <Brain className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'monthly': return 'bg-blue-100 text-blue-800'
      case 'quarterly': return 'bg-green-100 text-green-800'
      case 'special': return 'bg-purple-100 text-purple-800'
      case 'academic': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const categories = [
    { id: 'all', name: 'All Reports', icon: FileText },
    { id: 'monthly', name: 'Monthly', icon: Calendar },
    { id: 'quarterly', name: 'Quarterly', icon: BarChart3 },
    { id: 'special', name: 'Special', icon: TrendingUp },
    { id: 'academic', name: 'Academic', icon: Brain }
  ]

  const handleReportClick = (report: ResearchReport) => {
    setSelectedReport(report)
    setShowModal(true)
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-navy-100 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-navy-600" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-navy-900">Quantitative Research</h3>
              <p className="text-sm text-gray-600">
                Proprietary analysis & academic research
              </p>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id as any)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                selectedCategory === category.id
                  ? 'bg-navy-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <category.icon className="h-4 w-4" />
              <span>{category.name}</span>
            </button>
          ))}
        </div>

        {/* Reports Grid */}
        <div className="space-y-4">
          {getFilteredReports().map((report) => (
            <div 
              key={report.id}
              onClick={() => handleReportClick(report)}
              className={`p-4 rounded-lg border transition-all hover:shadow-md cursor-pointer group ${
                report.featured ? 'border-navy-200 bg-navy-50' : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(report.type)}`}>
                    {getTypeIcon(report.type)}
                    <span className="capitalize">{report.type}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-navy-600 transition-colors">
                      {report.title}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {report.summary}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>{report.date}</span>
                      <span>{report.readTime}</span>
                      <span>{report.views.toLocaleString()} views</span>
                      <span>By {report.author}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                  {report.videoUrl && (
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                      <Play className="h-3 w-3 text-red-600" />
                    </div>
                  )}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="h-4 w-4 text-navy-600" />
                  </div>
                </div>
              </div>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {report.tags.slice(0, 4).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-white border border-gray-200 rounded text-xs font-medium text-gray-700"
                  >
                    {tag}
                  </span>
                ))}
                {report.tags.length > 4 && (
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-500">
                    +{report.tags.length - 4}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Report Detail Modal */}
      {showModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(selectedReport.type)}`}>
                  {getTypeIcon(selectedReport.type)}
                  <span className="capitalize">{selectedReport.type} Report</span>
                </div>
                {selectedReport.featured && (
                  <div className="px-2 py-1 bg-gold-100 text-gold-800 rounded-full text-xs font-medium">
                    FEATURED
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ExternalLink className="h-6 w-6 text-gray-600 rotate-45" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(95vh-80px)]">
              <div className="p-6 space-y-6">
                {/* Header */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">{selectedReport.title}</h2>
                  <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{selectedReport.date}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{selectedReport.author}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>{selectedReport.views.toLocaleString()} views</span>
                    </div>
                    <span>{selectedReport.readTime} read</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{selectedReport.summary}</p>
                </div>

                {/* Key Findings */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Target className="h-5 w-5 mr-2 text-navy-600" />
                    Key Findings
                  </h3>
                  <ul className="space-y-3">
                    {selectedReport.keyFindings.map((finding, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-navy-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-navy-600 font-bold text-sm">{index + 1}</span>
                        </div>
                        <span className="text-gray-700">{finding}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tags */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Research Topics</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedReport.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-navy-100 text-navy-800 rounded-full text-sm font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <a
                    href={selectedReport.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-2 p-4 bg-navy-600 hover:bg-navy-700 text-white rounded-lg transition-colors"
                  >
                    <Download className="h-5 w-5" />
                    <span className="font-medium">Download PDF</span>
                  </a>
                  
                  {selectedReport.videoUrl && (
                    <a
                      href={selectedReport.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center space-x-2 p-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      <Play className="h-5 w-5" />
                      <span className="font-medium">Watch Video</span>
                    </a>
                  )}
                  
                  <button
                    onClick={() => {
                      // Share functionality
                      if (navigator.share) {
                        navigator.share({
                          title: selectedReport.title,
                          text: selectedReport.summary,
                          url: window.location.href
                        })
                      } else {
                        // Fallback: copy to clipboard
                        navigator.clipboard.writeText(`${selectedReport.title} - ${window.location.href}`)
                      }
                    }}
                    className="flex items-center justify-center space-x-2 p-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  >
                    <ExternalLink className="h-5 w-5" />
                    <span className="font-medium">Share</span>
                  </button>
                </div>

                {/* Author Bio */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">About the Author</h4>
                  <p className="text-sm text-gray-600">
                    {selectedReport.author.includes('Dr. Sarah Chen') && 
                      'Dr. Sarah Chen is our Chief Quantitative Strategist with 15+ years experience in systematic trading. PhD in Financial Mathematics from Stanford, former Goldman Sachs VP.'
                    }
                    {selectedReport.author.includes('Michael Rodriguez') && 
                      'Dr. Michael Rodriguez leads our quantitative research team. PhD in Econometrics from MIT, published 40+ papers on market microstructure and algorithmic trading.'
                    }
                    {selectedReport.author.includes('Dr. James Liu') && 
                      'Dr. James Liu specializes in machine learning applications to finance. PhD in Computer Science from Carnegie Mellon, former Two Sigma researcher.'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}