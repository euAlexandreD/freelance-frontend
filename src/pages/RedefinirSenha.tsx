import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { apiFetch } from '../lib/api'
import './Login.css'

type FieldErrors = Record<string, string[]>

/** Tela aberta pelo link do e-mail: /redefinir-senha?token=...&email=... */
export function RedefinirSenha() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const email = params.get('email') ?? ''

  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [erroGeral, setErroGeral] = useState<string | null>(null)
  const [concluido, setConcluido] = useState<string | null>(null)

  const linkValido = token !== '' && email !== ''

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setErrors({})
    setErroGeral(null)

    try {
      const response = await apiFetch('/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          token,
          email,
          password,
          password_confirmation: passwordConfirmation,
        }),
      })
      const data = await response.json()

      if (response.ok) {
        setConcluido(data.message)
      } else if (response.status === 422) {
        setErrors(data.errors ?? {})
      } else if (response.status === 429) {
        setErroGeral('Muitas tentativas. Aguarde um minuto e tente de novo.')
      } else {
        setErroGeral(data.message ?? 'Não foi possível alterar a senha.')
      }
    } catch {
      setErroGeral('Não foi possível conectar ao servidor.')
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
        </div>

        <h1 className="auth-title">Criar nova senha</h1>

        {!linkValido ? (
          <div className="auth-alert auth-alert-error">
            Link incompleto. Abra de novo o link do e-mail ou{' '}
            <Link to="/esqueci-senha">peça um novo</Link>.
          </div>
        ) : concluido ? (
          <div className="auth-alert auth-alert-success">{concluido}</div>
        ) : (
          <>
            <p className="auth-intro">Conta: {email}</p>

            {erroGeral && <div className="auth-alert auth-alert-error">{erroGeral}</div>}
            {errors.email && (
              <div className="auth-alert auth-alert-error">
                {errors.email[0]} <Link to="/esqueci-senha">Pedir novo link</Link>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="auth-field">
                <p className="auth-label">Nova senha</p>
                <input
                  className="auth-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo de 8 caracteres"
                  autoComplete="new-password"
                  required
                />
                {errors.password && (
                  <span className="auth-field-error">{errors.password[0]}</span>
                )}
              </div>

              <div className="auth-field">
                <p className="auth-label">Confirmar nova senha</p>
                <input
                  className="auth-input"
                  type="password"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                />
              </div>

              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar nova senha'}
              </button>
            </form>
          </>
        )}

        <p className="auth-back">
          <Link to="/">{concluido ? 'Ir para o login' : 'Voltar para o login'}</Link>
        </p>
      </div>
    </div>
  )
}
