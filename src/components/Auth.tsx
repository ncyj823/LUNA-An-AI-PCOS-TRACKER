import { useState } from 'react'
import { supabase } from '../supabase'

interface AuthProps {
  onSignedUp?: () => void
}

export default function Auth({ onSignedUp }: AuthProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  const handleAuth = async () => {
    setLoading(true)
    setError('')
    setInfo('')

    const { data, error } = isLogin
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password })

    if (error) {
      setError(error.message)
    } else if (!isLogin && data.session) {
      onSignedUp?.()
    } else if (!isLogin) {
      setInfo('Check your email to confirm your account.')
    }

    setLoading(false)
  }

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })
  }

  const features = [
    { icon: 'ti-chart-line', title: 'PCOS risk scoring', desc: 'Weighted algorithm analyzes your symptoms and flags PCOS patterns.' },
    { icon: 'ti-sparkles', title: 'AI-powered insights', desc: 'Gemini analyzes 30+ days of data and explains patterns in plain language.' },
    { icon: 'ti-lock', title: 'Private by design', desc: 'Row-level security ensures your health data is visible only to you.' },
    { icon: 'ti-calendar', title: 'Cycle prediction', desc: 'Predicts your next period based on your personal cycle history.' },
  ]

  return (
    <div style={{ minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff7fb', padding: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', maxWidth: '900px', width: '100%', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(159,63,106,0.15)' }}>

        <div style={{ background: '#9f3f6a', padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem' }}>
              <span style={{ fontSize: '28px' }}>🌙</span>
              <span style={{ fontSize: '22px', fontWeight: 600, color: '#fff' }}>Luna</span>
            </div>
            <p style={{ fontSize: '26px', fontWeight: 600, color: '#fff', lineHeight: 1.3, margin: '0 0 0.75rem' }}>
              Understand your body,<br />take control of your health.
            </p>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)', margin: 0 }}>
              AI-powered PCOS tracking and cycle insights.
            </p>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', padding: '13px 16px', borderRadius: '12px', border: 'none', fontSize: '15px', marginBottom: '10px' }}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', padding: '13px 16px', borderRadius: '12px', border: 'none', fontSize: '15px', marginBottom: '10px' }}
            />
            {error && <p style={{ color: '#ffc2d4', fontSize: '13px', margin: '0 0 8px' }}>{error}</p>}
            {info && <p style={{ color: '#ffeef5', fontSize: '13px', margin: '0 0 8px' }}>{info}</p>}
            <button
              onClick={handleAuth}
              disabled={loading}
              style={{ width: '100%', padding: '13px', borderRadius: '12px', background: '#fff', border: 'none', fontSize: '15px', fontWeight: 600, color: '#9f3f6a', cursor: 'pointer', marginBottom: '10px' }}
            >
              {loading ? 'Loading...' : isLogin ? 'Login' : 'Sign up'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div style={{ flex: 1, height: '0.5px', background: 'rgba(255,255,255,0.3)' }} />
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>or</span>
              <div style={{ flex: 1, height: '0.5px', background: 'rgba(255,255,255,0.3)' }} />
            </div>

            <button
              onClick={handleGoogle}
              style={{ width: '100%', padding: '13px', borderRadius: '12px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', fontSize: '15px', fontWeight: 500, color: '#fff', cursor: 'pointer', marginBottom: '12px' }}
            >
              Continue with Google
            </button>

            <p
              onClick={() => setIsLogin(!isLogin)}
              style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', textAlign: 'center', cursor: 'pointer', margin: 0 }}
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
            </p>
          </div>
        </div>

        <div style={{ background: '#fff', padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1.5rem' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, color: '#b14b72', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Why Luna?</p>
          {features.map(f => (
            <div key={f.title} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#fbeaf0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className={`ti ${f.icon}`} style={{ fontSize: '20px', color: '#9f3f6a' }} />
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#231923', margin: '0 0 4px' }}>{f.title}</p>
                <p style={{ fontSize: '13px', color: '#6d5d67', margin: 0, lineHeight: 1.5 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}