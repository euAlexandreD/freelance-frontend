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
      <header className="catalog-header">
        <div className="catalog-logo">
          <span className="auth-logo-accent">F</span>
          <span>reelance</span>
        </div>
        <Link to="/perfil" className="catalog-profile-link">
          Meu perfil
        </Link>
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
          </article>
        ))}
      </div>
    </div>
  )
}
