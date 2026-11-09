import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { apiFetch } from '../lib/api'
import { formatPreco } from '../lib/format'
import type { Pedido } from '../lib/types'
import { AvaliarPedido } from '../components/AvaliarPedido'
import { Estrelas } from '../components/Estrelas'
import { ConversaPedido } from '../components/ConversaPedido'
import './MeusPedidos.css'

const STATUS_LABEL: Record<Pedido['status'], string> = {
  pendente: 'Pendente',
  aceito: 'Aceito',
  recusado: 'Recusado',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
}

export function MeusPedidos() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  /** Pedido vindo do link do e-mail (?pedido=ID): abre a conversa e rola até ele. */
  const pedidoDestaque = Number(searchParams.get('pedido')) || null

  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (loading || !pedidoDestaque) return
    document.getElementById(`pedido-${pedidoDestaque}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [loading, pedidoDestaque])
  const [actingId, setActingId] = useState<number | null>(null)

  const loadPedidos = useCallback(() => {
    setLoading(true)
    setError(null)

    apiFetch('/meus-pedidos')
      .then(async (res) => {
        if (!res.ok) throw new Error()
        setPedidos(await res.json())
      })
      .catch(() => setError('Não foi possível carregar seus pedidos.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/')
      return
    }

    loadPedidos()
  }, [navigate, loadPedidos])

  async function handleCancelar(id: number) {
    setActingId(id)
    setError(null)

    try {
      const res = await apiFetch(`/pedidos/${id}/cancelar`, { method: 'PUT' })
      if (!res.ok) throw new Error()

      const atualizado: Pedido = await res.json()
      setPedidos((prev) => prev.map((p) => (p.id === id ? { ...p, ...atualizado } : p)))
    } catch {
      setError('Não foi possível cancelar o pedido.')
    } finally {
      setActingId(null)
    }
  }

  function marcarLidas(id: number) {
    setPedidos((prev) =>
      prev.map((p) => (p.id === id && p.mensagens_nao_lidas ? { ...p, mensagens_nao_lidas: 0 } : p)),
    )
  }

  return (
    <div className="meus-servicos-page">
      <header className="meus-servicos-header">
        <h1 className="meus-servicos-title">Meus pedidos</h1>
        <Link to="/servicos" className="catalog-profile-link">
          Catálogo
        </Link>
      </header>

      {error && <p className="meus-servicos-message meus-servicos-error">{error}</p>}
      {loading && <p className="meus-servicos-message">Carregando...</p>}
      {!loading && pedidos.length === 0 && (
        <p className="meus-servicos-message">Você ainda não fez nenhum pedido.</p>
      )}

      <div className="catalog-list">
        {pedidos.map((pedido) => (
          <article
            key={pedido.id}
            id={`pedido-${pedido.id}`}
            className={`catalog-card${pedido.id === pedidoDestaque ? ' is-destaque' : ''}`}
          >
            <span className={`pedido-status pedido-status-${pedido.status}`}>
              {STATUS_LABEL[pedido.status]}
            </span>
            <span className="catalog-card-categoria">{pedido.servico.categoria_servico.nome}</span>
            <h2 className="pedido-titulo">{pedido.servico.titulo}</h2>
            <p className="pedido-preco">{formatPreco(pedido.servico)}</p>
            <p className="pedido-prestador">
              Prestador:{' '}
              <Link to={`/prestadores/${pedido.servico.perfil_prestador.id}`}>
                {pedido.servico.perfil_prestador.user.name}
              </Link>
            </p>
            {pedido.descricao_pedido && (
              <p className="pedido-observacao">"{pedido.descricao_pedido}"</p>
            )}

            {pedido.status === 'concluido' &&
              (pedido.avaliacao ? (
                <div className="pedido-avaliacao">
                  <span>Sua avaliação:</span>
                  <Estrelas nota={pedido.avaliacao.nota} />
                  {pedido.avaliacao.comentario && (
                    <p className="pedido-observacao">"{pedido.avaliacao.comentario}"</p>
                  )}
                </div>
              ) : (
                <AvaliarPedido
                  pedidoId={pedido.id}
                  onAvaliado={(avaliacao) =>
                    setPedidos((prev) => prev.map((p) => (p.id === pedido.id ? { ...p, avaliacao } : p)))
                  }
                />
              ))}

            {(pedido.status === 'pendente' || pedido.status === 'aceito') && (
              <div className="meus-servicos-actions">
                <button
                  type="button"
                  className="meus-servicos-btn meus-servicos-btn-danger"
                  onClick={() => handleCancelar(pedido.id)}
                  disabled={actingId === pedido.id}
                >
                  {actingId === pedido.id ? 'Cancelando...' : 'Cancelar pedido'}
                </button>
              </div>
            )}

            <ConversaPedido
              pedidoId={pedido.id}
              naoLidas={pedido.mensagens_nao_lidas}
              abertaInicialmente={pedido.id === pedidoDestaque}
              onLidas={() => marcarLidas(pedido.id)}
            />
          </article>
        ))}
      </div>
    </div>
  )
}
