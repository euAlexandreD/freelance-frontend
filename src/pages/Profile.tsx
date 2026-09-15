import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { IconUser, IconBriefcase } from '@tabler/icons-react'
import { apiFetch } from '../lib/api'
import './Profile.css'

type FieldErrors = Record<string, string[]>
type Role = 'cliente' | 'prestador'

type ProfileResponse = {
  name: string
  email: string
  avatar_url: string | null
  cidade: string | null
  uf: string | null
  telefone: string | null
  perfil_cliente: { id: number } | null
  perfil_prestador: {
    id: number
    bio: string | null
    titulo: string | null
    link_externo: string | null
  } | null
}

export function Profile() {
  const navigate = useNavigate()

  const [loadingProfile, setLoadingProfile] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Role>('cliente')
  const [bio, setBio] = useState('')
  const [titulo, setTitulo] = useState('')
  const [linkExterno, setLinkExterno] = useState('')
  const [cidade, setCidade] = useState('')
  const [uf, setUf] = useState('')
  const [telefone, setTelefone] = useState('')

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/')
      return
    }

    apiFetch('/profile')
      .then(async (response) => {
        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('token')
            navigate('/')
            return
          }
          throw new Error('Não foi possível carregar o perfil.')
        }

        const data: ProfileResponse = await response.json()
        setName(data.name)
        setEmail(data.email)
        setBio(data.perfil_prestador?.bio ?? '')
        setTitulo(data.perfil_prestador?.titulo ?? '')
        setLinkExterno(data.perfil_prestador?.link_externo ?? '')
        setCidade(data.cidade ?? '')
        setUf(data.uf ?? '')
        setTelefone(data.telefone ?? '')
        setAvatarUrl(data.avatar_url)
        setRole(data.perfil_prestador ? 'prestador' : 'cliente')
      })
      .catch(() => setGeneralError('Não foi possível conectar ao servidor.'))
      .finally(() => setLoadingProfile(false))
  }, [navigate])

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    setAvatarFile(file)
    setAvatarPreview(file ? URL.createObjectURL(file) : null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setErrors({})
    setGeneralError(null)
    setSuccess(false)

    try {
      const formData = new FormData()
      formData.append('_method', 'PUT')
      formData.append('name', name)
      formData.append('email', email)
      formData.append('tipo', role)
      formData.append('cidade', cidade)
      formData.append('uf', uf)
      formData.append('telefone', telefone)

      if (role === 'prestador') {
        formData.append('bio', bio)
        formData.append('titulo', titulo)
        formData.append('link_externo', linkExterno)
      }

      if (avatarFile) {
        formData.append('avatar', avatarFile)
      }

      const response = await apiFetch('/profile', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 422) {
          setErrors(data.errors ?? {})
        } else {
          setGeneralError(data.message ?? 'Não foi possível salvar o perfil.')
        }
        return
      }

      setAvatarUrl(data.avatar_url)
      setAvatarFile(null)
      setAvatarPreview(null)
      setSuccess(true)
    } catch {
      setGeneralError('Não foi possível conectar ao servidor.')
    } finally {
      setSaving(false)
    }
  }

  function handleLogout() {
    localStorage.removeItem('token')
    navigate('/')
  }

  if (loadingProfile) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <p className="auth-subtitle">Carregando perfil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Editar perfil</h1>
        <p className="auth-subtitle">Mantenha seus dados atualizados</p>

        {generalError && <div className="auth-alert auth-alert-error">{generalError}</div>}
        {success && <div className="auth-alert auth-alert-success">Perfil salvo com sucesso!</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="auth-field profile-avatar-field">
            <div className="profile-avatar-preview">
              {avatarPreview || avatarUrl ? (
                <img src={avatarPreview ?? avatarUrl ?? ''} alt="Foto de perfil" />
              ) : (
                <IconUser size={28} />
              )}
            </div>
            <label className="profile-avatar-upload">
              Escolher foto
              <input type="file" accept="image/*" onChange={handleAvatarChange} hidden />
            </label>
            {errors.avatar && <span className="auth-field-error">{errors.avatar[0]}</span>}
          </div>

          <div className="auth-field">
            <p className="auth-label">Nome</p>
            <input
              className="auth-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome completo"
              required
            />
            {errors.name && <span className="auth-field-error">{errors.name[0]}</span>}
          </div>

          <div className="auth-field">
            <p className="auth-label">E-mail</p>
            <input
              className="auth-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nome@email.com"
              required
            />
            {errors.email && <span className="auth-field-error">{errors.email[0]}</span>}
          </div>

          <p className="auth-divider">— tipo de conta —</p>

          <div className="auth-roles">
            <button
              type="button"
              className={`auth-role ${role === 'cliente' ? 'is-active' : ''}`}
              onClick={() => setRole('cliente')}
            >
              <IconUser size={18} className="auth-role-icon" />
              <p>Sou cliente</p>
            </button>
            <button
              type="button"
              className={`auth-role ${role === 'prestador' ? 'is-active' : ''}`}
              onClick={() => setRole('prestador')}
            >
              <IconBriefcase size={18} className="auth-role-icon" />
              <p>Sou prestador</p>
            </button>
          </div>

          {role === 'prestador' && (
            <>
              <div className="auth-field">
                <p className="auth-label">Título</p>
                <input
                  className="auth-input"
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex: Eletricista residencial e comercial"
                />
                {errors.titulo && <span className="auth-field-error">{errors.titulo[0]}</span>}
              </div>

              <div className="auth-field">
                <p className="auth-label">Bio</p>
                <textarea
                  className="auth-textarea"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Conte um pouco sobre os serviços que você presta"
                />
                {errors.bio && <span className="auth-field-error">{errors.bio[0]}</span>}
              </div>

              <div className="auth-field">
                <p className="auth-label">Link externo (portfólio, Instagram, LinkedIn)</p>
                <input
                  className="auth-input"
                  type="url"
                  value={linkExterno}
                  onChange={(e) => setLinkExterno(e.target.value)}
                  placeholder="https://"
                />
                {errors.link_externo && (
                  <span className="auth-field-error">{errors.link_externo[0]}</span>
                )}
              </div>
            </>
          )}

          <div className="profile-field-row">
            <div className="auth-field">
              <p className="auth-label">Cidade</p>
              <input
                className="auth-input"
                type="text"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                placeholder="Sua cidade"
              />
              {errors.cidade && <span className="auth-field-error">{errors.cidade[0]}</span>}
            </div>

            <div className="auth-field profile-field-uf">
              <p className="auth-label">UF</p>
              <input
                className="auth-input"
                type="text"
                value={uf}
                onChange={(e) => setUf(e.target.value.toUpperCase())}
                placeholder="SP"
                maxLength={2}
              />
              {errors.uf && <span className="auth-field-error">{errors.uf[0]}</span>}
            </div>
          </div>

          <div className="auth-field">
            <p className="auth-label">Telefone</p>
            <input
              className="auth-input"
              type="tel"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="(11) 91234-5678"
            />
            {errors.telefone && <span className="auth-field-error">{errors.telefone[0]}</span>}
          </div>

          <button type="submit" className="auth-submit" disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </form>

        <p className="auth-divider">— navegar —</p>

        <div className="profile-nav">
          <Link to="/servicos" className="profile-nav-link">
            Ver catálogo de serviços
          </Link>
          {role === 'prestador' ? (
            <>
              <Link to="/meus-servicos" className="profile-nav-link">
                Gerenciar meus serviços
              </Link>
              <Link to="/pedidos-recebidos" className="profile-nav-link">
                Pedidos recebidos
              </Link>
            </>
          ) : (
            <Link to="/meus-pedidos" className="profile-nav-link">
              Meus pedidos
            </Link>
          )}
        </div>

        <button type="button" className="profile-logout" onClick={handleLogout}>
          Sair da conta
        </button>
      </div>
    </div>
  )
}
