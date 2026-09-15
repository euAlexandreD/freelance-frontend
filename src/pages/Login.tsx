import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconUser, IconBriefcase } from '@tabler/icons-react'
import { apiFetch } from '../lib/api'
import './Login.css'

type FieldErrors = Record<string, string[]>
type Tab = 'login' | 'register'
type Role = 'cliente' | 'prestador'

export function Login() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('login')
  const [role, setRole] = useState<Role>('cliente')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  function switchTab(next: Tab) {
    setTab(next)
    setErrors({})
    setGeneralError(null)
    setSuccess(false)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setErrors({})
    setGeneralError(null)
    setSuccess(false)

    const endpoint = tab === 'login' ? 'login' : 'register'
    const body =
      tab === 'login'
        ? { email, password }
        : {
            name,
            email,
            password,
            password_confirmation: passwordConfirmation,
          }

    try {
      const response = await apiFetch(`/${endpoint}`, {
        method: 'POST',
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 422) {
          setErrors(data.errors ?? {})
        } else {
          setGeneralError(data.message ?? 'Não foi possível concluir a ação.')
        }
        return
      }

      localStorage.setItem('token', data.token)
      setSuccess(true)
      navigate('/servicos')
    } catch {
      setGeneralError('Não foi possível conectar ao servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo">
            <span className="auth-logo-accent">F</span>
            <span>reelance</span>
          </div>
          <p className="auth-tagline">O SERVIÇO QUE VOCÊ PRECISA, AQUI</p>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${tab === 'login' ? 'is-active' : ''}`}
            onClick={() => switchTab('login')}
          >
            Entrar
          </button>
          <button
            type="button"
            className={`auth-tab ${tab === 'register' ? 'is-active' : ''}`}
            onClick={() => switchTab('register')}
          >
            Criar conta
          </button>
        </div>

        {generalError && <div className="auth-alert auth-alert-error">{generalError}</div>}
        {success && (
          <div className="auth-alert auth-alert-success">
            {tab === 'login' ? 'Login realizado com sucesso!' : 'Conta criada com sucesso!'}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {tab === 'register' && (
            <div className="auth-field">
              <p className="auth-label">Nome</p>
              <input
                className="auth-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome completo"
                required
              />
              {errors.name && <span className="auth-field-error">{errors.name[0]}</span>}
            </div>
          )}

          <div className="auth-field">
            <p className="auth-label">E-mail</p>
            <input
              className="auth-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nome@email.com"
              required
            />
            {errors.email && <span className="auth-field-error">{errors.email[0]}</span>}
          </div>

          <div className="auth-field">
            <p className="auth-label">Senha</p>
            <input
              className="auth-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            {errors.password && (
              <span className="auth-field-error">{errors.password[0]}</span>
            )}
          </div>

          {tab === 'register' && (
            <div className="auth-field">
              <p className="auth-label">Confirmar senha</p>
              <input
                className="auth-input"
                type="password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          )}

          {tab === 'login' && (
            <p className="auth-forgot">Esqueci minha senha</p>
          )}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Aguarde...' : tab === 'login' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>

        <p className="auth-divider">— ou continue como —</p>

        <div className="auth-roles">
          <button
            type="button"
            className={`auth-role ${role === 'cliente' ? 'is-active' : ''}`}
            onClick={() => setRole('cliente')}
          >
            <IconUser size={18} className="auth-role-icon" />
            <p>Sou cliente</p>
          </button>
          <button
            type="button"
            className={`auth-role ${role === 'prestador' ? 'is-active' : ''}`}
            onClick={() => setRole('prestador')}
          >
            <IconBriefcase size={18} className="auth-role-icon" />
            <p>Sou prestador</p>
          </button>
        </div>
      </div>
    </div>
  )
}
