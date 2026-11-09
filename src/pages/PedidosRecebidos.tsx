import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiFetch } from '../lib/api'
import type { Pedido } from '../lib/types'
import { Estrelas } from '../components/Estrelas'
import './MeusPedidos.css'

const STATUS_LABEL: Record<Pedido['status'], string> = {
  pendente: 'Pendente',
  aceito: 'Aceito',
  recusado: 'Recusado',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
}

export function PedidosRecebidos() {
  const navigate = useNavigate()

  const [checkingRole, setCheckingRole] = useState(true)
  const [isPrestador, setIsPrestador] = useState(false)

  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actingId, setActingId] = useState<number | null>(null)

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/')
      return
    }

    apiFetch('/profile')
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem('token')
            navigate('/')
          }
          return
        }
        const data = await res.json()
        setIsPrestador(Boolean(data.perfil_prestador))
      })
      .finally(() => setCheckingRole(false))
  }, [navigate])

  useEffect(() => {
    if (!isPrestador) return
    loadPedidos()
  }, [isPrestador])

  function loadPedidos() {
    setLoading(true)
    setError(null)

    apiFetch('/pedidos-recebidos')
      .then(async (res) => {
        if (!res.ok) throw new Error()
        setPedidos(await res.json())
      })
      .catch(() => setError('Não foi possível carregar os pedidos.'))
      .finally(() => setLoading(false))
  }

  async function handleAction(id: number, acao: 'aceitar' | 'recusar' | 'concluir') {
    setActingId(id)
    setError(null)

    try {
      const res = await apiFetch(`/pedidos/${id}/${acao}`, { method: 'PUT' })
      if (!res.ok) throw new Error()

      const atualizado: Pedido = await res.json()
      setPedidos((prev) => prev.map((p) => (p.id === id ? { ...p, ...atualizado } : p)))
    } catch {
      setError('Não foi possível atualizar o pedido.')
    } finally {
      setActingId(null)
    }
  }

  if (checkingRole) {
    return <div className="meus-servicos-page" />
  }

  if (!isPrestador) {
    return (
      <div className="meus-servicos-page">
        <p className="meus-servicos-message">
          Esta área é só para prestadores. Vá até seu{' '}
          <Link to="/perfil">perfil</Link> e mude o tipo de conta para
          "prestador" pra receber pedidos.
        </p>
      </div>
    )
  }

  return (
    <div className="meus-servicos-page">
      <header className="meus-servicos-header">
        <h1 className="meus-servicos-title">Pedidos recebidos</h1>
        <Link to="/meus-servicos" className="catalog-profile-link">
          Meus serviços
        </Link>
      </header>

      {error && <p className="meus-servicos-message meus-servicos-error">{error}</p>}
      {loading && <p className="meus-servicos-message">Carregando...</p>}
      {!loading && pedidos.length === 0 && (
        <p className="meus-servicos-message">Você ainda não recebeu nenhum pedido.</p>
      )}

      <div className="catalog-list">
        {pedidos.map((pedido) => (
          <article key={pedido.id} className="catalog-card">
            <span className={`pedido-status pedido-status-${pedido.status}`}>
              {STATUS_LABEL[pedido.status]}
            </span>
            <span className="catalog-card-categoria">{pedido.servico.categoria_servico.nome}</span>
            <h2 className="pedido-titulo">{pedido.servico.titulo}</h2>
            <p className="pedido-prestador">Cliente: {pedido.perfil_cliente?.user.name}</p>
            {pedido.descricao_pedido && (
              <p className="pedido-observacao">"{pedido.descricao_pedido}"</p>
            )}

            {pedido.avaliacao && (
              <div className="pedido-avaliacao">
                <span>Avaliação do cliente:</span>
                <Estrelas nota={pedido.avaliacao.nota} />
                {pedido.avaliacao.comentario && (
                  <p className="pedido-observacao">"{pedido.avaliacao.comentario}"</p>
                )}
              </div>
            )}

            {pedido.status === 'pendente' && (
              <div className="meus-servicos-actions">
                <button
                  type="button"
                  className="meus-servicos-btn"
                  onClick={() => handleAction(pedido.id, 'aceitar')}
                  disabled={actingId === pedido.id}
                >
                  Aceitar
                </button>
                <button
                  type="button"
                  className="meus-servicos-btn meus-servicos-btn-danger"
                  onClick={() => handleAction(pedido.id, 'recusar')}
                  disabled={actingId === pedido.id}
                >
                  Recusar
                </button>
              </div>
            )}

            {pedido.status === 'aceito' && (
              <div className="meus-servicos-actions">
                <button
                  type="button"
                  className="meus-servicos-btn"
                  onClick={() => handleAction(pedido.id, 'concluir')}
                  disabled={actingId === pedido.id}
                >
                  Marcar como concluído
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  )
}
