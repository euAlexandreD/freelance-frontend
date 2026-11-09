import { useState } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch } from '../lib/api'

/** Botão "Solicitar serviço" com campo de observação. Pede login a quem não entrou. */
export function SolicitarServico({ servicoId }: { servicoId: number }) {
  const [aberto, setAberto] = useState(false)
  const [descricao, setDescricao] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [feedback, setFeedback] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null)

  if (!localStorage.getItem('token')) {
    return (
      <Link to="/" className="meus-servicos-btn catalog-request-btn catalog-request-link">
        Entre para solicitar
      </Link>
    )
  }

  async function enviar() {
    setEnviando(true)
    setFeedback(null)

    try {
      const res = await apiFetch('/pedidos', {
        method: 'POST',
        body: JSON.stringify({ servico_id: servicoId, descricao_pedido: descricao || null }),
      })
      const data = await res.json()

      if (!res.ok) {
        setFeedback({ tipo: 'erro', texto: data.message ?? 'Não foi possível enviar a solicitação.' })
        return
      }

      setFeedback({ tipo: 'ok', texto: 'Solicitação enviada! Acompanhe em "Meus pedidos".' })
      setAberto(false)
      setDescricao('')
    } catch {
      setFeedback({ tipo: 'erro', texto: 'Não foi possível conectar ao servidor.' })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <>
      {aberto ? (
        <div className="catalog-request-form">
          <textarea
            className="auth-textarea"
            placeholder="Conte o que você precisa, prazo, local... (opcional)"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />
          <div className="meus-servicos-actions">
            <button type="button" className="meus-servicos-btn" onClick={enviar} disabled={enviando}>
              {enviando ? 'Enviando...' : 'Confirmar solicitação'}
            </button>
            <button
              type="button"
              className="meus-servicos-btn meus-servicos-btn-ghost"
              onClick={() => setAberto(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="meus-servicos-btn catalog-request-btn"
          onClick={() => {
            setAberto(true)
            setFeedback(null)
          }}
        >
          Solicitar serviço
        </button>
      )}

      {feedback && (
        <p className={`catalog-request-feedback${feedback.tipo === 'erro' ? ' is-error' : ''}`}>
          {feedback.texto}
        </p>
      )}
    </>
  )
}
