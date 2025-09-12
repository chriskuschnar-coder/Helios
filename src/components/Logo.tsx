import React from 'react'

interface LogoProps {
  className?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'white' | 'dark'
}

export function Logo({ className = '', size = 'md', variant = 'default' }: LogoProps) {
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6', 
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  const getColors = () => {
    switch (variant) {
      case 'white':
        return { blue: '#ffffff', black: '#ffffff' }
      case 'dark':
        return { blue: '#1e40af', black: '#000000' }
      default:
        return { blue: '#2563eb', black: '#000000' }
    }
  }

  const colors = getColors()

  return (
    <svg 
      className={`${sizeClasses[size]} ${className}`}
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Blue upward trending arrow */}
      <path 
        d="M20 80 L50 40 L65 55 L80 20" 
        stroke={colors.blue} 
        strokeWidth="12" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        fill="none"
      />
      
      {/* Black downward trending line */}
      <path 
        d="M20 20 L35 35 L50 60 L80 80" 
        stroke={colors.black} 
        strokeWidth="12" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        fill="none"
      />
      
      {/* Blue triangle/arrow head */}
      <path 
        d="M65 20 L80 20 L80 35 Z" 
        fill={colors.blue}
      />
    </svg>
  )
}