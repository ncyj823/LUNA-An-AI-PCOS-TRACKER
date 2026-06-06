import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'
import Auth from './components/Auth'
import Onboarding from './components/onboarding'
import Dashboard from './components/Dashboard'
import './App.css'

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isCheckingProfile, setIsCheckingProfile] = useState(true)

  const checkProfile = async (userId: string) => {
    const { data, error } = await supabase.from('profiles').select('id').eq('id', userId).maybeSingle()

    if (error) {
      setShowOnboarding(false)
      setIsCheckingProfile(false)
      return
    }

    setShowOnboarding(!data)
    setIsCheckingProfile(false)
  }

  useEffect(() => {
    let isMounted = true

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return

      setSession(session)

      if (session) {
        void checkProfile(session.user.id)
      } else {
        setIsCheckingProfile(false)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)

      if (session) {
        void checkProfile(session.user.id)
      } else {
        setShowOnboarding(false)
        setIsCheckingProfile(false)
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  if (isCheckingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50 text-pink-700">
        Loading...
      </div>
    )
  }

  return showOnboarding ? (
    <Onboarding onComplete={() => setShowOnboarding(false)} />
  ) : session ? (
    <Dashboard />
  ) : (
    <Auth />
  )
}

export default App
