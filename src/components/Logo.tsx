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
      viewBox="0 0 512 512" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Blue upward trending line */}
      <path 
        d="M128 384 L256 256 L320 320 L448 128" 
        stroke={colors.blue} 
        strokeWidth="48" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        fill="none"
      />
      
      {/* Blue arrow head */}
      <path 
        d="M384 128 L448 128 L448 192 Z" 
        fill={colors.blue}
      />
      
      {/* Black downward trending line */}
      <path 
        d="M64 128 L192 256 L256 192 L384 384" 
        stroke={colors.black} 
        strokeWidth="48" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        fill="none"
      />
      
      {/* Black arrow head */}
      <path 
        d="M320 384 L384 384 L384 320 Z" 
        fill={colors.black}
      />
    </svg>
  )
}