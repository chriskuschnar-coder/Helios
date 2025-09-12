import React, { useState } from "react"
import {
  ExternalLink,
  Zap,
  Activity,
  ArrowRight,
  Loader2,
  Monitor,
  Shield,
  TrendingUp,
} from "lucide-react"

interface HeliosTradingTerminalProps {
  isFullscreen?: boolean
}

export function HeliosTradingTerminal({
  isFullscreen = false,
}: HeliosTradingTerminalProps) {
  const [loading, setLoading] = useState(false)

  const handleEnterTerminal = () => {
    setLoading(true)
    // Redirect user in the SAME tab for a seamless experience
    window.location.href = "https://helios.luminarygrow.com/"
  }

  return (
    <div
      className={`min-h-[calc(100vh-120px)] ${
        isFullscreen ? "min-h-screen" : ""
      } bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4`}
    >
      <main className="max-w-2xl w-full text-center">
        {/* Terminal Icon */}
        <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
          <Monitor className="h-12 w-12 text-white" aria-hidden="true" />
        </div>

        {/* Main Card */}
        <section className="bg-white dark:bg-neutral-950 rounded-2xl shadow-2xl border border-gray-200 dark:border-neutral-800 p-8 md:p-12 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Helios Trading Terminal
          </h1>

          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            You're about to access the Helios Trading Terminal — our advanced
            trading platform with real-time market data, professional charting
            tools, and institutional-grade execution.
          </p>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Feature
              icon={<TrendingUp className="h-6 w-6 text-blue-600" />}
              title="Live Market Data"
              description="Real-time quotes and advanced charting"
            />
            <Feature
              icon={<Zap className="h-6 w-6 text-green-600" />}
              title="Fast Execution"
              description="Institutional-grade order management"
            />
            <Feature
              icon={<Activity className="h-6 w-6 text-purple-600" />}
              title="Advanced Tools"
              description="Professional trading indicators"
            />
          </div>

          {/* Security Notice */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8 text-left">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="font-medium text-blue-900 dark:text-blue-300">
                Secure Trading Environment
              </span>
            </div>
            <p className="text-sm text-blue-800 dark:text-blue-300">
              The terminal will open in this tab with encrypted connections and
              secure authentication. Your GMC session will remain active.
            </p>
          </div>

          {/* Enter Button */}
          <button
            onClick={handleEnterTerminal}
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:hover:scale-100 transition-all duration-300 inline-flex items-center space-x-3 w-full justify-center"
            aria-label="Enter Helios Trading Terminal"
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <Monitor className="w-6 h-6" />
                <span>Enter Terminal</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </section>

        {/* Footer Info */}
        <footer className="text-center">
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
            The terminal opens in this tab for optimal performance and security.
          </p>
          <StatusIndicators />
        </footer>
      </main>
    </div>
  )
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 bg-gray-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center mx-auto mb-3">
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
        {title}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  )
}

function StatusIndicators() {
  return (
    <div className="flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
      <StatusDot color="bg-green-500" text="Secure Connection" />
      <StatusDot color="bg-blue-500" text="Real-Time Data" />
      <StatusDot color="bg-purple-500" text="Professional Tools" />
    </div>
  )
}

function StatusDot({ color, text }: { color: string; text: string }) {
  return (
    <div className="flex items-center gap-1">
      <span className={`w-2 h-2 rounded-full ${color}`} />
      <span>{text}</span>
    </div>
  )
}
