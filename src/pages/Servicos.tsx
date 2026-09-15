import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { IconBriefcase } from '@tabler/icons-react'
import { apiFetch } from '../lib/api'
import type { CategoriaServico, Servico } from '../lib/types'
import './Servicos.css'

export function Servicos() {
  const [categorias, setCategorias] = useState<CategoriaServico[]>([])
  const [categoriaId, setCategoriaId] = useState<string>('')
  const [servicos, setServicos] = useState<Servico[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [openRequestId, setOpenRequestId] = useState<number | null>(null)
  const [requestDescricao, setRequestDescricao] = useState('')
  const [requesting, setRequesting] = useState(false)
  const [requestFeedback, setRequestFeedback] = useState<Record<number, string>>({})

  useEffect(() => {
    apiFetch('/categorias-servico')
      .then((res) => res.json())
      .then(setCategorias)
      .catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    setError(null)

    const query = categoriaId ? `?categoria_servico_id=${categoriaId}` : ''

    apiFetch(`/servicos${query}`)
      .then(async (res) => {
        if (!res.ok) throw new Error()
        setServicos(await res.json())
      })
      .catch(() => setError('Não foi possível carregar os serviços.'))
      .finally(() => setLoading(false))
  }, [categoriaId])

  function toggleRequest(servicoId: number) {
    setOpenRequestId((current) => (current === servicoId ? null : servicoId))
    setRequestDescricao('')
  }

  async function handleRequest(servicoId: number) {
    setRequesting(true)

    try {
      const res = await apiFetch('/pedidos', {
        method: 'POST',
        body: JSON.stringify({
          servico_id: servicoId,
          descricao_pedido: requestDescricao || null,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setRequestFeedback((prev) => ({
          ...prev,
          [servicoId]: data.message ?? 'Não foi possível enviar a solicitação.',
        }))
        return
      }

      setRequestFeedback((prev) => ({ ...prev, [servicoId]: 'Solicitação enviada!' }))
      setOpenRequestId(null)
    } catch {
      setRequestFeedback((prev) => ({
        ...prev,
        [servicoId]: 'Não foi possível conectar ao servidor.',
      }))
    } finally {
      setRequesting(false)
    }
  }

  return (
    <div className="catalog-page">
      <header className="catalog-header">
        <div className="catalog-logo">
          <span className="auth-logo-accent">F</span>
          <span>reelance</span>
        </div>
        <div className="catalog-header-links">
          <Link to="/meus-pedidos" className="catalog-profile-link">
            Meus pedidos
          </Link>
          <Link to="/perfil" className="catalog-profile-link">
            Meu perfil
          </Link>
        </div>
      </header>

      <h1 className="catalog-title">Serviços disponíveis</h1>

      <select
        className="catalog-filter"
        value={categoriaId}
        onChange={(e) => setCategoriaId(e.target.value)}
      >
        <option value="">Todas as categorias</option>
        {categorias.map((categoria) => (
          <option key={categoria.id} value={categoria.id}>
            {categoria.nome}
          </option>
        ))}
      </select>

      {error && <p className="catalog-message">{error}</p>}
      {!error && loading && <p className="catalog-message">Carregando...</p>}
      {!error && !loading && servicos.length === 0 && (
        <p className="catalog-message">Nenhum serviço encontrado.</p>
      )}

      <div className="catalog-list">
        {servicos.map((servico) => (
          <article key={servico.id} className="catalog-card">
            <span className="catalog-card-categoria">{servico.categoria_servico.nome}</span>
            <p className="catalog-card-descricao">{servico.descricao}</p>
            <div className="catalog-card-prestador">
              <IconBriefcase size={16} className="catalog-card-icon" />
              <p>{servico.perfil_prestador.user.name}</p>
            </div>

            {openRequestId === servico.id ? (
              <div className="catalog-request-form">
                <textarea
                  className="auth-textarea"
                  placeholder="Alguma observação para o prestador? (opcional)"
                  value={requestDescricao}
                  onChange={(e) => setRequestDescricao(e.target.value)}
                />
                <div className="meus-servicos-actions">
                  <button
                    type="button"
                    className="meus-servicos-btn"
                    onClick={() => handleRequest(servico.id)}
                    disabled={requesting}
                  >
                    {requesting ? 'Enviando...' : 'Confirmar solicitação'}
                  </button>
                  <button
                    type="button"
                    className="meus-servicos-btn meus-servicos-btn-ghost"
                    onClick={() => toggleRequest(servico.id)}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="meus-servicos-btn catalog-request-btn"
                onClick={() => toggleRequest(servico.id)}
              >
                Solicitar serviço
              </button>
            )}

            {requestFeedback[servico.id] && (
              <p className="catalog-request-feedback">{requestFeedback[servico.id]}</p>
            )}
          </article>
        ))}
      </div>
    </div>
  )
}
