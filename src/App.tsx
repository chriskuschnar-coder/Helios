import React from 'react'
import { AuthProvider } from './components/auth/AuthProvider'
import { Hero } from './components/Hero'
import { About } from './components/About'
import { Services } from './components/Services'
import { Performance } from './components/Performance'
import { Contact } from './components/Contact'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { InvestmentPlatform } from './components/InvestmentPlatform'

function App() {
  const [showPortal, setShowPortal] = React.useState(false)

  if (showPortal) {
    return (
      <AuthProvider>
        <InvestmentPlatform />
      </AuthProvider>
    )
  }

  return (
    <main className="min-h-screen bg-white">
      <Header onNavigateToLogin={() => setShowPortal(true)} />
      <Hero />
      <About />
      <Services />
      <Performance />
      <Contact />
      <Footer />
    </main>
  )
}

export default App