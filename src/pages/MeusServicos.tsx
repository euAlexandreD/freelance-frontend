import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiFetch } from '../lib/api'
import type { CategoriaServico, Servico } from '../lib/types'
import './MeusServicos.css'

export function MeusServicos() {
  const navigate = useNavigate()

  const [checkingRole, setCheckingRole] = useState(true)
  const [isPrestador, setIsPrestador] = useState(false)

  const [categorias, setCategorias] = useState<CategoriaServico[]>([])
  const [servicos, setServicos] = useState<Servico[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [novaCategoria, setNovaCategoria] = useState('')
  const [novaDescricao, setNovaDescricao] = useState('')
  const [creating, setCreating] = useState(false)

  const [editingId, setEditingId] = useState<number | null>(null)
  const [editCategoria, setEditCategoria] = useState('')
  const [editDescricao, setEditDescricao] = useState('')
  const [saving, setSaving] = useState(false)

  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

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

    apiFetch('/categorias-servico')
      .then((res) => res.json())
      .then(setCategorias)
      .catch(() => {})

    loadServicos()
  }, [isPrestador])

  function loadServicos() {
    setLoading(true)
    setError(null)

    apiFetch('/meus-servicos')
      .then(async (res) => {
        if (!res.ok) throw new Error()
        setServicos(await res.json())
      })
      .catch(() => setError('Não foi possível carregar seus serviços.'))
      .finally(() => setLoading(false))
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setCreating(true)
    setError(null)

    try {
      const res = await apiFetch('/servicos', {
        method: 'POST',
        body: JSON.stringify({
          categoria_servico_id: Number(novaCategoria),
          descricao: novaDescricao,
        }),
      })

      if (!res.ok) throw new Error()

      const criado: Servico = await res.json()
      setServicos((prev) => [criado, ...prev])
      setNovaCategoria('')
      setNovaDescricao('')
    } catch {
      setError('Não foi possível cadastrar o serviço.')
    } finally {
      setCreating(false)
    }
  }

  function startEdit(servico: Servico) {
    setEditingId(servico.id)
    setEditCategoria(String(servico.categoria_servico_id))
    setEditDescricao(servico.descricao)
  }

  async function handleSaveEdit(id: number) {
    setSaving(true)
    setError(null)

    try {
      const res = await apiFetch(`/servicos/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          categoria_servico_id: Number(editCategoria),
          descricao: editDescricao,
        }),
      })

      if (!res.ok) throw new Error()

      const atualizado: Servico = await res.json()
      setServicos((prev) => prev.map((s) => (s.id === id ? atualizado : s)))
      setEditingId(null)
    } catch {
      setError('Não foi possível salvar as alterações.')
    } finally {
      setSaving(false)
    }
  }

  async function toggleAtivo(servico: Servico) {
    setError(null)

    try {
      const res = await apiFetch(`/servicos/${servico.id}`, {
        method: 'PUT',
        body: JSON.stringify({ ativo: !servico.ativo }),
      })

      if (!res.ok) throw new Error()

      const atualizado: Servico = await res.json()
      setServicos((prev) => prev.map((s) => (s.id === servico.id ? atualizado : s)))
    } catch {
      setError('Não foi possível atualizar o status do serviço.')
    }
  }

  async function handleDelete(id: number) {
    setError(null)

    try {
      const res = await apiFetch(`/servicos/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()

      setServicos((prev) => prev.filter((s) => s.id !== id))
      setConfirmDeleteId(null)
    } catch {
      setError('Não foi possível excluir o serviço.')
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
          "prestador" pra cadastrar serviços.
        </p>
      </div>
    )
  }

  return (
    <div className="meus-servicos-page">
      <header className="meus-servicos-header">
        <h1 className="meus-servicos-title">Meus serviços</h1>
        <Link to="/perfil" className="catalog-profile-link">
          Meu perfil
        </Link>
      </header>

      <form className="meus-servicos-form" onSubmit={handleCreate}>
        <select
          className="catalog-filter"
          value={novaCategoria}
          onChange={(e) => setNovaCategoria(e.target.value)}
          required
        >
          <option value="" disabled>
            Selecione a categoria
          </option>
          {categorias.map((categoria) => (
            <option key={categoria.id} value={categoria.id}>
              {categoria.nome}
            </option>
          ))}
        </select>

        <textarea
          className="auth-textarea"
          placeholder="Descreva o serviço que você oferece"
          value={novaDescricao}
          onChange={(e) => setNovaDescricao(e.target.value)}
          required
        />

        <button type="submit" className="auth-submit" disabled={creating}>
          {creating ? 'Cadastrando...' : 'Cadastrar serviço'}
        </button>
      </form>

      {error && <p className="meus-servicos-message meus-servicos-error">{error}</p>}
      {loading && <p className="meus-servicos-message">Carregando...</p>}
      {!loading && servicos.length === 0 && (
        <p className="meus-servicos-message">Você ainda não cadastrou nenhum serviço.</p>
      )}

      <div className="catalog-list">
        {servicos.map((servico) => (
          <article key={servico.id} className="catalog-card">
            {editingId === servico.id ? (
              <>
                <select
                  className="catalog-filter"
                  value={editCategoria}
                  onChange={(e) => setEditCategoria(e.target.value)}
                >
                  {categorias.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nome}
                    </option>
                  ))}
                </select>
                <textarea
                  className="auth-textarea"
                  value={editDescricao}
                  onChange={(e) => setEditDescricao(e.target.value)}
                />
                <div className="meus-servicos-actions">
                  <button
                    type="button"
                    className="meus-servicos-btn"
                    onClick={() => handleSaveEdit(servico.id)}
                    disabled={saving}
                  >
                    {saving ? 'Salvando...' : 'Salvar'}
                  </button>
                  <button
                    type="button"
                    className="meus-servicos-btn meus-servicos-btn-ghost"
                    onClick={() => setEditingId(null)}
                  >
                    Cancelar
                  </button>
                </div>
              </>
            ) : (
              <>
                <span className="catalog-card-categoria">
                  {servico.categoria_servico.nome}
                  {!servico.ativo && ' · pausado'}
                </span>
                <p className="catalog-card-descricao">{servico.descricao}</p>

                {confirmDeleteId === servico.id ? (
                  <div className="meus-servicos-actions">
                    <span className="meus-servicos-confirm">Excluir este serviço?</span>
                    <button
                      type="button"
                      className="meus-servicos-btn meus-servicos-btn-danger"
                      onClick={() => handleDelete(servico.id)}
                    >
                      Sim
                    </button>
                    <button
                      type="button"
                      className="meus-servicos-btn meus-servicos-btn-ghost"
                      onClick={() => setConfirmDeleteId(null)}
                    >
                      Não
                    </button>
                  </div>
                ) : (
                  <div className="meus-servicos-actions">
                    <button
                      type="button"
                      className="meus-servicos-btn"
                      onClick={() => startEdit(servico)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="meus-servicos-btn meus-servicos-btn-ghost"
                      onClick={() => toggleAtivo(servico)}
                    >
                      {servico.ativo ? 'Pausar' : 'Ativar'}
                    </button>
                    <button
                      type="button"
                      className="meus-servicos-btn meus-servicos-btn-danger"
                      onClick={() => setConfirmDeleteId(servico.id)}
                    >
                      Excluir
                    </button>
                  </div>
                )}
              </>
            )}
          </article>
        ))}
      </div>
    </div>
  )
}
