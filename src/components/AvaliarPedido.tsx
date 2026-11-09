import { useState } from 'react'
import { apiFetch } from '../lib/api'
import type { Avaliacao } from '../lib/types'
import { EstrelasInput } from './Estrelas'

type AvaliarPedidoProps = {
  pedidoId: number
  onAvaliado: (avaliacao: Avaliacao) => void
}

/** Formulário de nota e comentário para um pedido concluído. */
export function AvaliarPedido({ pedidoId, onAvaliado }: AvaliarPedidoProps) {
  const [aberto, setAberto] = useState(false)
  const [nota, setNota] = useState(0)
  const [comentario, setComentario] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  if (!aberto) {
    return (
      <div className="meus-servicos-actions">
        <button type="button" className="meus-servicos-btn" onClick={() => setAberto(true)}>
          Avaliar serviço
        </button>
      </div>
    )
  }

  async function enviar() {
    if (nota === 0) {
      setErro('Escolha uma nota de 1 a 5 estrelas.')
      return
    }

    setEnviando(true)
    setErro(null)

    try {
      const res = await apiFetch(`/pedidos/${pedidoId}/avaliacao`, {
        method: 'POST',
        body: JSON.stringify({ nota, comentario: comentario.trim() || null }),
      })
      const data = await res.json()

      if (!res.ok) {
        setErro(data.message ?? 'Não foi possível enviar a avaliação.')
        return
      }

      onAvaliado(data)
    } catch {
      setErro('Não foi possível conectar ao servidor.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="avaliar-pedido">
      <p className="auth-label">Como foi o serviço?</p>
      <EstrelasInput valor={nota} onChange={setNota} />
      <textarea
        className="auth-textarea"
        placeholder="Conte como foi sua experiência (opcional)"
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        maxLength={1000}
      />
      {erro && <p className="auth-field-error">{erro}</p>}
      <div className="meus-servicos-actions">
        <button type="button" className="meus-servicos-btn" onClick={enviar} disabled={enviando}>
          {enviando ? 'Enviando...' : 'Enviar avaliação'}
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
  )
}
