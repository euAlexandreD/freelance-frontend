import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconUser, IconBriefcase } from '@tabler/icons-react'
import { apiFetch } from '../lib/api'
import './Profile.css'

type FieldErrors = Record<string, string[]>
type Role = 'cliente' | 'prestador'

type ProfileResponse = {
  name: string
  email: string
  perfil_cliente: { id: number } | null
  perfil_prestador: { id: number; bio: string | null } | null
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
        setRole(data.perfil_prestador ? 'prestador' : 'cliente')
      })
      .catch(() => setGeneralError('Não foi possível conectar ao servidor.'))
      .finally(() => setLoadingProfile(false))
  }, [navigate])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setErrors({})
    setGeneralError(null)
    setSuccess(false)

    try {
      const response = await apiFetch('/profile', {
        method: 'PUT',
        body: JSON.stringify({
          name,
          email,
          tipo: role,
          bio: role === 'prestador' ? bio : null,
        }),
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
          )}

          <button type="submit" className="auth-submit" disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </form>

        <button type="button" className="profile-logout" onClick={handleLogout}>
          Sair da conta
        </button>
      </div>
    </div>
  )
}
