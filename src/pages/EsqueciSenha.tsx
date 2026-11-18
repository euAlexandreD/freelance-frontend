import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch } from '../lib/api'
import './Login.css'

/** Pede o link de redefinição de senha por e-mail. */
export function EsqueciSenha() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [erroCampo, setErroCampo] = useState<string | null>(null)
  const [erroGeral, setErroGeral] = useState<string | null>(null)
  const [enviado, setEnviado] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setErroCampo(null)
    setErroGeral(null)

    try {
      const response = await apiFetch('/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      })
      const data = await response.json()

      if (response.ok) {
        setEnviado(data.message)
      } else if (response.status === 422) {
        setErroCampo(data.errors?.email?.[0] ?? 'Confira o e-mail informado.')
      } else if (response.status === 429) {
        setErroGeral('Muitas tentativas. Aguarde um minuto e tente de novo.')
      } else {
        setErroGeral(data.message ?? 'Não foi possível enviar o link.')
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

        <h1 className="auth-title">Esqueci minha senha</h1>

        {enviado ? (
          <div className="auth-alert auth-alert-success">
            {enviado} Confira também a caixa de spam.
          </div>
        ) : (
          <>
            <p className="auth-intro">
              Informe o e-mail da sua conta. Vamos enviar um link para você criar uma senha nova.
            </p>

            {erroGeral && <div className="auth-alert auth-alert-error">{erroGeral}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <div className="auth-field">
                <p className="auth-label">E-mail</p>
                <input
                  className="auth-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nome@email.com"
                  autoComplete="email"
                  required
                />
                {erroCampo && <span className="auth-field-error">{erroCampo}</span>}
              </div>

              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar link'}
              </button>
            </form>
          </>
        )}

        <p className="auth-back">
          <Link to="/">Voltar para o login</Link>
        </p>
      </div>
    </div>
  )
}
