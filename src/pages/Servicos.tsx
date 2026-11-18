import { useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'
import type { CategoriaServico, Servico } from '../lib/types'
import { ServicoCard } from '../components/ServicoCard'
import { SolicitarServico } from '../components/SolicitarServico'
import './Servicos.css'

export function Servicos() {
  const [categorias, setCategorias] = useState<CategoriaServico[]>([])
  const [categoriaId, setCategoriaId] = useState<string>('')
  const [servicos, setServicos] = useState<Servico[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  return (
    <div className="catalog-page">
      <h1 className="catalog-title">Serviços disponíveis</h1>

      <div className="catalog-chips" role="group" aria-label="Filtrar por categoria">
        {[{ id: '', nome: 'Todas' }, ...categorias].map((categoria) => {
          const valor = String(categoria.id)
          return (
            <button
              key={valor || 'todas'}
              type="button"
              className={`catalog-chip${categoriaId === valor ? ' is-active' : ''}`}
              aria-pressed={categoriaId === valor}
              onClick={() => setCategoriaId(valor)}
            >
              {categoria.nome}
            </button>
          )
        })}
      </div>

      {error && <p className="catalog-message">{error}</p>}
      {!error && loading && <p className="catalog-message">Carregando...</p>}
      {!error && !loading && servicos.length === 0 && (
        <p className="catalog-message">Nenhum serviço encontrado.</p>
      )}

      <div className="catalog-list">
        {servicos.map((servico) => (
          <ServicoCard key={servico.id} servico={servico}>
            <SolicitarServico servicoId={servico.id} />
          </ServicoCard>
        ))}
      </div>
    </div>
  )
}
