import { useState } from 'react'
import { TrendingUp, ArrowRight, Play, Shield, Award, CheckCircle } from 'lucide-react'

export default function Hero() {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
          onLoadedData={() => setIsVideoLoaded(true)}
        >
          <source src="https://images.pexels.com/videos/3195394/pexels-video-3195394.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-navy-900 bg-opacity-40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Institutional Investment Excellence
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed">
            Advanced quantitative strategies and systematic risk management 
            delivering consistent alpha for sophisticated investors.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button className="bg-gold-600 hover:bg-gold-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105">
              <TrendingUp className="w-6 h-6" />
              View Performance
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <button className="bg-white bg-opacity-10 backdrop-blur-sm hover:bg-opacity-20 text-white border-2 border-white border-opacity-30 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center gap-3">
              <Play className="w-5 h-5" />
              Watch Overview
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-3 text-white">
              <Shield className="w-6 h-6 text-gold-400" />
              <span className="font-medium">SEC Registered</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-white">
              <Award className="w-6 h-6 text-gold-400" />
              <span className="font-medium">SIPC Protected</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-white">
              <CheckCircle className="w-6 h-6 text-gold-400" />
              <span className="font-medium">Institutional Grade</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="w-6 h-10 border-2 border-white border-opacity-50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white bg-opacity-70 rounded-full mt-2 animate-bounce"></div>
        </div>
      </div>
    </section>
  )
}