import { ArrowRight, Play, TrendingUp } from 'lucide-react'
import { useEffect } from 'react'

export function Hero() {
  useEffect(() => {
    // Ensure video plays on component mount
    const video = document.querySelector('video')
    if (video) {
      video.play().catch(error => {
        console.log('Video autoplay prevented:', error)
      })
    }
  }, [])

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700">
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full">
        <video
          ref={(video) => {
            if (video) {
              video.play().catch(error => {
                console.log('Video autoplay prevented:', error)
              })
            }
          }}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        >
          <source src="https://videos.pexels.com/video-files/8201410/8201410-uhd_2560_1440_25fps.mp4" type="video/mp4" />
          <source src="https://videos.pexels.com/video-files/8201410/8201410-hd_1920_1080_25fps.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900/80 via-navy-800/60 to-navy-700/80"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Navigating Global Markets with Precision and Insight
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed">
            Global Markets Consulting delivers sophisticated investment research and systematic strategies 
            to discerning investors seeking alpha in complex market environments.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <a href="#" onClick={(e) => { e.preventDefault(); window.location.hash = ''; window.dispatchEvent(new CustomEvent('navigate-to-login')); }} className="bg-gold-600 hover:bg-gold-700 text-navy-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center space-x-2 hover:scale-105 shadow-lg cursor-pointer">
              <TrendingUp className="h-5 w-5" />
              <span>Professional Portal</span>
              <ArrowRight className="h-5 w-5" />
            </a>
            
            <a href="#approach" className="border-2 border-white text-white hover:bg-white hover:text-navy-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center space-x-2">
              <Play className="h-5 w-5" />
              <span>Our Approach</span>
            </a>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  )
}