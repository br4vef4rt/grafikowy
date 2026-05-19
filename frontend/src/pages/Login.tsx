import { useState, useEffect, FormEvent } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { formatApiError } from '../utils/ui'

export default function Login() {
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const { login, register, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) navigate('/')
  }, [user, navigate])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      if (isRegister) {
        await register(email, password, fullName)
      } else {
        await login(email, password)
      }
      navigate('/')
    } catch (err: any) {
      setError(formatApiError(err, 'Sprawdź dane logowania i spróbuj ponownie.'))
    }
  }

  return (
    <div className="auth-shell">
      <form onSubmit={handleSubmit} className="auth-card">
        <div className="auth-brand">Grafikowy</div>
        <h1 className="auth-title">{isRegister ? 'Załóż konto' : 'Zaloguj się'}</h1>
        <p className="auth-subtitle">
          Prosty grafik nieobecności, urlopów i pracy zdalnej.
        </p>

        {isRegister && (
          <div className="form-row">
            <label className="field-label">Imię i nazwisko</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              minLength={2}
              maxLength={255}
              className="text-input"
              placeholder="Np. Dariusz Zgorzelski"
            />
          </div>
        )}

        <div className="form-row">
          <label className="field-label">E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="text-input"
            placeholder="twoj@email.pl"
          />
        </div>

        <div className="form-row">
          <label className="field-label">Hasło</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            maxLength={128}
            className="text-input"
            placeholder="Minimum 8 znaków"
          />
          <small className="field-help">Hasło musi mieć od 8 do 128 znaków.</small>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <button type="submit" className="primary-button auth-submit">
          {isRegister ? 'Utwórz konto' : 'Zaloguj się'}
        </button>

        <button type="button" onClick={() => setIsRegister(!isRegister)} className="text-button auth-switch">
          {isRegister ? 'Masz już konto? Zaloguj się' : 'Nie masz konta? Załóż je teraz'}
        </button>
      </form>
    </div>
  )
}
