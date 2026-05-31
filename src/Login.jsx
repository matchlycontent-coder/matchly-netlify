import { useState } from 'react'
import { supabase } from './supabaseClient'

const GRAD = 'linear-gradient(135deg,#4f46e5 0%,#a855f7 50%,#ec4899 100%)'
const INP = { width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.16)', background: 'rgba(255,255,255,0.04)', color: '#f0f0ff', fontSize: 15, outline: 'none', boxSizing: 'border-box', marginBottom: 12, fontFamily: 'Barlow, sans-serif' }

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [error, setError] = useState(null)
  const [info, setInfo] = useState(null)

  const submit = async () => {
    if (!email || !password) return
    setLoading(true); setError(null); setInfo(null)
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) setError('Inloggen mislukt. Controleer je e-mail en wachtwoord.')
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) setError(error.message)
        else setInfo('Account aangemaakt! Check je e-mail om te bevestigen en log daarna in.')
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const disabled = loading || !email || !password

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(135% 55% at 50% 0%, rgba(168,85,247,0.18) 0%, rgba(79,70,229,0.06) 34%, transparent 62%), #050208', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'Barlow, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 42, fontWeight: 800, letterSpacing: 3, background: GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent', lineHeight: 1 }}>MATCHLY</div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, letterSpacing: 1, marginTop: 6 }}>Documenteer · Genereer · Deel</div>
        </div>
        <input type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} style={INP} />
        <input type="password" placeholder="Wachtwoord" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') submit() }} style={INP} />
        {error && <div style={{ color: '#ff6b6b', fontSize: 13, marginBottom: 12 }}>{error}</div>}
        {info && <div style={{ color: '#00e676', fontSize: 13, marginBottom: 12 }}>{info}</div>}
        <button onClick={submit} disabled={disabled} style={{ width: '100%', padding: 15, borderRadius: 100, border: 'none', background: disabled ? 'rgba(255,255,255,0.06)' : GRAD, color: disabled ? 'rgba(255,255,255,0.4)' : '#fff', fontWeight: 800, fontSize: 15, cursor: disabled ? 'default' : 'pointer', letterSpacing: 0.5, fontFamily: "'Barlow Condensed', sans-serif", textTransform: 'uppercase' }}>
          {loading ? 'Bezig...' : (mode === 'login' ? 'Inloggen' : 'Account aanmaken')}
        </button>
        <div style={{ textAlign: 'center', marginTop: 18, color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
          {mode === 'login' ? 'Nog geen account? ' : 'Al een account? '}
          <span onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); setInfo(null) }} style={{ color: '#a855f7', cursor: 'pointer', fontWeight: 700 }}>
            {mode === 'login' ? 'Aanmaken' : 'Inloggen'}
          </span>
        </div>
      </div>
    </div>
  )
}
