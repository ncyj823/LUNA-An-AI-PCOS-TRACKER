import { useState } from 'react'
import { supabase } from '../supabase'

interface AuthProps {
  onSignedUp: () => void
}

export default function Auth({ onSignedUp }: AuthProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAuth = async () => {
    setLoading(true)
    setError('')
    
    const { error } = isLogin
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password })

    if (error) {
      setError(error.message)
    } else if (!isLogin) {
      onSignedUp()
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-pink-50">
      <div className="bg-white p-8 rounded-2xl shadow-md w-96">
        <h1 className="text-2xl font-bold text-pink-600 mb-6">
          {isLogin ? 'Welcome back' : 'Join Luna'}
        </h1>
        
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full border rounded-lg p-3 mb-3"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full border rounded-lg p-3 mb-4"
        />
        
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        
        <button
          onClick={handleAuth}
          disabled={loading}
          className="w-full bg-pink-500 text-white py-3 rounded-lg font-medium"
        >
          {loading ? 'Loading...' : isLogin ? 'Login' : 'Sign Up'}
        </button>
        
        <p
          onClick={() => setIsLogin(!isLogin)}
          className="text-center text-sm text-pink-500 mt-4 cursor-pointer"
        >
          {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
        </p>
      </div>
    </div>
  )
}