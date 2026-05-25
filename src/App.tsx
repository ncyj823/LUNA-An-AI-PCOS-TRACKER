import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'
import Auth from './components/Auth'
import Onboarding from './components/onboarding'
import './App.css'

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return showOnboarding ? (
    <Onboarding onComplete={() => setShowOnboarding(false)} />
  ) : session ? (
    <div className="p-8">
      <h1>Welcome to Luna</h1>
      <button onClick={() => supabase.auth.signOut()}>Logout</button>
    </div>
  ) : (
    <Auth onSignedUp={() => setShowOnboarding(true)} />
  )
}

export default App
