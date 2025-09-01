import React from 'react';
import { useState } from 'react';
import { Hero } from './components/Hero'
import { About } from './components/About'
import { Services } from './components/Services'
import { Performance } from './components/Performance'
import { Contact } from './components/Contact'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { LoginPage } from './components/LoginPage'
import { HeliosDashboard } from './components/HeliosDashboard'

function App() {
  const [currentView, setCurrentView] = useState<'home' | 'login' | 'dashboard'>('home')
  const [user, setUser] = useState<{ email: string; password: string } | null>(null)

  const handleLogin = (credentials: { email: string; password: string }) => {
    setUser(credentials)
    setCurrentView('dashboard')
  }

  const handleLogout = () => {
    setUser(null)
    setCurrentView('home')
  }

  const handleNavigateToLogin = () => {
    setCurrentView('login')
  }

  const handleBackToHome = () => {
    setCurrentView('home')
  }

  if (currentView === 'login') {
    return <LoginPage onLogin={handleLogin} onBack={handleBackToHome} />
  }

  if (currentView === 'dashboard' && user) {
    return <HeliosDashboard />
  }

  return (
    <main className="min-h-screen bg-white">
      <Header onNavigateToLogin={handleNavigateToLogin} />
      <Hero />
      <About />
      <Services />
      <Performance />
      <Contact />
      <Footer />
    </main>
  );
}

export default App;
