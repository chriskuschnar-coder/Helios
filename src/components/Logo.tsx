import React from 'react'

interface LogoProps {
  size?: 'small' | 'medium' | 'large' | 'xl'
  className?: string
  showText?: boolean
  variant?: 'default' | 'white' | 'dark'
}

export function Logo({ 
  size = 'medium', 
  className = '', 
  showText = false,
  variant = 'default' 
}: LogoProps) {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8', 
    large: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  const getColors = () => {
    switch (variant) {
      case 'white':
        return { blue: '#ffffff', black: '#e5e7eb' }
      case 'dark':
        return { blue: '#1E7EF7', black: '#1f2937' }
      default:
        return { blue: '#1E7EF7', black: '#000000' }
    }
  }

  const colors = getColors()

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <svg 
        className={sizeClasses[size]}
        viewBox="0 0 512 512" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Blue upward trending arrow */}
        <path 
          d="M128 384 L256 256 L320 320 L448 128 L448 192 L384 128 Z" 
          fill={colors.blue} 
          stroke="none"
        />
        
        {/* Black downward trending arrow */}
        <path 
          d="M64 128 L192 256 L256 192 L384 384 L384 320 L320 384 Z" 
          fill={colors.black} 
          stroke="none"
        />
      </svg>
      
      {showText && (
        <span className="font-serif text-xl font-bold text-navy-900">
          GMC
        </span>
      )}
    </div>
  )
}