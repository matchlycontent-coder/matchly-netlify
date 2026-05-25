import { useState } from 'react'
import { supabase } from './supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      })

      if (error) {
        setError(error.message)
      } else {
        console.log('Login succesvol!', data)
        // Redirect naar app of update state
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      })

      if (error) {
        setError(error.message)
      } else {
        console.log('Signup succesvol!', data)
        setError('Check je email voor bevestiging!')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto' }}>
      <h1>Login / Sign Up</h1>

      <form>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
            required
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <input
            type="password"
            placeholder="Wachtwoord"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
            required
          />
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '10px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Bezig...' : 'Login'}
        </button>

        <button
          onClick={handleSignup}
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Bezig...' : 'Sign Up'}
        </button>
      </form>
    </div>
  )
}
