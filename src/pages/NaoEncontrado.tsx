import { Link } from 'react-router-dom'
import './Login.css'

/** Qualquer endereço que não corresponde a uma tela. */
export function NaoEncontrado() {
  const logado = localStorage.getItem('token') !== null

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo">
            <span className="auth-logo-accent">F</span>
            <span>reelance</span>
          </div>
        </div>

        <h1 className="auth-title">Página não encontrada</h1>
        <p className="auth-intro">
          O endereço que você abriu não existe ou foi removido.
        </p>

        <Link to={logado ? '/servicos' : '/'} className="auth-submit auth-submit-link">
          {logado ? 'Ver serviços' : 'Ir para o login'}
        </Link>
      </div>
    </div>
  )
}
