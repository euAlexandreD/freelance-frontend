import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { IconPhotoPlus } from '@tabler/icons-react'
import { apiFetch } from '../lib/api'
import type { CategoriaServico, Servico } from '../lib/types'
import { ServicoCard } from '../components/ServicoCard'
import { ServicoForm, type ServicoFormValues } from '../components/ServicoForm'
import { FotosServico } from '../components/FotosServico'
import { MAX_FOTOS, enviarFotos } from '../lib/fotos'
import './MeusServicos.css'

type ErrosValidacao = Record<string, string[]>

/** Lê a resposta de erro do backend: erros por campo (422) ou uma mensagem geral. */
async function lerErro(res: Response, padrao: string): Promise<{ mensagem: string; erros: ErrosValidacao }> {
  const data = await res.json().catch(() => ({}))
  return { mensagem: data.message ?? padrao, erros: data.errors ?? {} }
}

export function MeusServicos() {
  const navigate = useNavigate()

  const [checkingRole, setCheckingRole] = useState(true)
  const [isPrestador, setIsPrestador] = useState(false)
  const [perfilPrestadorId, setPerfilPrestadorId] = useState<number | null>(null)

  const [categorias, setCategorias] = useState<CategoriaServico[]>([])
  const [servicos, setServicos] = useState<Servico[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [creating, setCreating] = useState(false)
  const [createErros, setCreateErros] = useState<ErrosValidacao>({})
  const [novasFotos, setNovasFotos] = useState<File[]>([])
  const [formKey, setFormKey] = useState(0)

  const [editingId, setEditingId] = useState<number | null>(null)
  const [editErros, setEditErros] = useState<ErrosValidacao>({})
  const [saving, setSaving] = useState(false)

  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

  const loadServicos = useCallback(() => {
    setLoading(true)
    setError(null)

    apiFetch('/meus-servicos')
      .then(async (res) => {
        if (!res.ok) throw new Error()
        setServicos(await res.json())
      })
      .catch(() => setError('Não foi possível carregar seus serviços.'))
      .finally(() => setLoading(false))
  }, [])

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
        setPerfilPrestadorId(data.perfil_prestador?.id ?? null)
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
  }, [isPrestador, loadServicos])

  function atualizarServico(atualizado: Servico) {
    setServicos((prev) => prev.map((s) => (s.id === atualizado.id ? atualizado : s)))
  }

  async function handleCreate(valores: ServicoFormValues) {
    setCreating(true)
    setError(null)
    setCreateErros({})

    try {
      const res = await apiFetch('/servicos', { method: 'POST', body: JSON.stringify(valores) })

      if (!res.ok) {
        const { mensagem, erros } = await lerErro(res, 'Não foi possível cadastrar o serviço.')
        setCreateErros(erros)
        if (Object.keys(erros).length === 0) setError(mensagem)
        return
      }

      let criado: Servico = await res.json()

      if (novasFotos.length > 0) {
        try {
          criado = { ...criado, fotos: await enviarFotos(criado.id, novasFotos) }
        } catch (e) {
          setError(`Serviço cadastrado, mas as fotos não foram enviadas: ${(e as Error).message}`)
        }
      }

      setServicos((prev) => [criado, ...prev])
      setNovasFotos([])
      setFormKey((k) => k + 1)
    } catch {
      setError('Não foi possível conectar ao servidor.')
    } finally {
      setCreating(false)
    }
  }

  async function handleSaveEdit(id: number, valores: ServicoFormValues) {
    setSaving(true)
    setError(null)
    setEditErros({})

    try {
      const res = await apiFetch(`/servicos/${id}`, { method: 'PUT', body: JSON.stringify(valores) })

      if (!res.ok) {
        const { mensagem, erros } = await lerErro(res, 'Não foi possível salvar as alterações.')
        setEditErros(erros)
        if (Object.keys(erros).length === 0) setError(mensagem)
        return
      }

      atualizarServico(await res.json())
      setEditingId(null)
    } catch {
      setError('Não foi possível conectar ao servidor.')
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
      atualizarServico(await res.json())
    } catch {
      setError('Não foi possível atualizar o status do serviço.')
    }
  }

  async function handleDelete(id: number) {
    setError(null)

    try {
      const res = await apiFetch(`/servicos/${id}`, { method: 'DELETE' })

      if (!res.ok) {
        const { mensagem } = await lerErro(res, 'Não foi possível excluir o serviço.')
        setError(mensagem)
        setConfirmDeleteId(null)
        return
      }

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
        <div className="catalog-header-links">
          {perfilPrestadorId && (
            <Link to={`/prestadores/${perfilPrestadorId}`} className="catalog-profile-link">
              Ver meu perfil público
            </Link>
          )}
          <Link to="/perfil" className="catalog-profile-link">
            Meu perfil
          </Link>
        </div>
      </header>

      <section className="meus-servicos-form">
        <h2 className="meus-servicos-subtitle">Novo serviço</h2>
        <ServicoForm
          key={formKey}
          categorias={categorias}
          enviando={creating}
          textoBotao="Cadastrar serviço"
          erros={createErros}
          onSubmit={handleCreate}
          extra={
            <NovasFotos arquivos={novasFotos} onChange={setNovasFotos} />
          }
        />
      </section>

      {error && <p className="meus-servicos-message meus-servicos-error">{error}</p>}
      {loading && <p className="meus-servicos-message">Carregando...</p>}
      {!loading && servicos.length === 0 && (
        <p className="meus-servicos-message">Você ainda não cadastrou nenhum serviço.</p>
      )}

      <div className="catalog-list">
        {servicos.map((servico) =>
          editingId === servico.id ? (
            <article key={servico.id} className="catalog-card">
              <ServicoForm
                categorias={categorias}
                inicial={servico}
                enviando={saving}
                textoBotao="Salvar"
                erros={editErros}
                onSubmit={(valores) => handleSaveEdit(servico.id, valores)}
                onCancel={() => {
                  setEditingId(null)
                  setEditErros({})
                }}
              />
            </article>
          ) : (
            <ServicoCard
              key={servico.id}
              servico={servico}
              semPrestador
              etiqueta={servico.ativo ? undefined : 'pausado'}
            >
              <FotosServico
                servicoId={servico.id}
                fotos={servico.fotos}
                onChange={(fotos) => atualizarServico({ ...servico, fotos })}
              />

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
                    onClick={() => {
                      setEditingId(servico.id)
                      setEditErros({})
                    }}
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
            </ServicoCard>
          ),
        )}
      </div>
    </div>
  )
}

/** Seleção de fotos no cadastro: as fotos só sobem depois que o serviço é criado. */
function NovasFotos({ arquivos, onChange }: { arquivos: File[]; onChange: (arquivos: File[]) => void }) {
  const [previas, setPrevias] = useState<string[]>([])

  useEffect(() => {
    const urls = arquivos.map((arquivo) => URL.createObjectURL(arquivo))
    setPrevias(urls)
    return () => urls.forEach((url) => URL.revokeObjectURL(url))
  }, [arquivos])

  return (
    <div className="auth-field">
      <p className="auth-label">Fotos (opcional, até {MAX_FOTOS})</p>
      <div className="fotos-servico-grade">
        {previas.map((url, indice) => (
          <div key={url} className="fotos-servico-item">
            <img src={url} alt="" />
            <button
              type="button"
              className="fotos-servico-remover"
              onClick={() => onChange(arquivos.filter((_, i) => i !== indice))}
              aria-label="Remover foto"
            >
              ×
            </button>
          </div>
        ))}
        {arquivos.length < MAX_FOTOS && (
          <label className="fotos-servico-adicionar">
            <IconPhotoPlus size={20} />
            <span>Adicionar</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              hidden
              onChange={(e) => {
                const novos = Array.from(e.target.files ?? [])
                onChange([...arquivos, ...novos].slice(0, MAX_FOTOS))
                e.target.value = ''
              }}
            />
          </label>
        )}
      </div>
    </div>
  )
}
