import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiFetch } from '../lib/api'
import type { Pedido } from '../lib/types'
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

  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actingId, setActingId] = useState<number | null>(null)

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/')
      return
    }

    loadPedidos()
  }, [navigate])

  function loadPedidos() {
    setLoading(true)
    setError(null)

    apiFetch('/meus-pedidos')
      .then(async (res) => {
        if (!res.ok) throw new Error()
        setPedidos(await res.json())
      })
      .catch(() => setError('Não foi possível carregar seus pedidos.'))
      .finally(() => setLoading(false))
  }

  async function handleCancelar(id: number) {
    setActingId(id)
    setError(null)

    try {
      const res = await apiFetch(`/pedidos/${id}/cancelar`, { method: 'PUT' })
      if (!res.ok) throw new Error()

      const atualizado: Pedido = await res.json()
      setPedidos((prev) => prev.map((p) => (p.id === id ? atualizado : p)))
    } catch {
      setError('Não foi possível cancelar o pedido.')
    } finally {
      setActingId(null)
    }
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
          <article key={pedido.id} className="catalog-card">
            <span className={`pedido-status pedido-status-${pedido.status}`}>
              {STATUS_LABEL[pedido.status]}
            </span>
            <span className="catalog-card-categoria">{pedido.servico.categoria_servico.nome}</span>
            <p className="catalog-card-descricao">{pedido.servico.descricao}</p>
            <p className="pedido-prestador">
              Prestador: {pedido.servico.perfil_prestador.user.name}
            </p>
            {pedido.descricao_pedido && (
              <p className="pedido-observacao">"{pedido.descricao_pedido}"</p>
            )}

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
          </article>
        ))}
      </div>
    </div>
  )
}
