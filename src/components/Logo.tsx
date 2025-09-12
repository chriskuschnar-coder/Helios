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
        return { blue: '#2563eb', black: '#1f2937' }
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
        d="M25 75 L50 50 L60 60 L85 25" 
        stroke={colors.blue} 
        strokeWidth="12" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        fill="none"
      />
      
      {/* Blue triangle/arrow head */}
      <path 
        d="M75 25 L85 25 L85 35 Z" 
        fill={colors.blue}
      />
      
      {/* Black downward trending line */}
      <path 
        d="M15 25 L40 50 L50 40 L75 75" 
        stroke={colors.black} 
        strokeWidth="12" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        fill="none"
      />
      
      {/* Black triangle/arrow head */}
      <path 
        d="M65 75 L75 75 L75 65 Z" 
        fill={colors.black}
      />
    </svg>
  )
}