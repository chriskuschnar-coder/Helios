import { useState } from 'react'
import Hero from './components/Hero'
import About from './components/About'
import Services from './components/Services'
import Performance from './components/Performance'
import Contact from './components/Contact'
import Footer from './components/Footer'

export default function App() {
  return (
    <div className="min-h-screen">
      <Hero />
      <About />
      <Services />
      <Performance />
      <Contact />
      <Footer />
    </div>
  )
}