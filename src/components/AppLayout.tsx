import { useCallback, useEffect, useState, type ComponentType } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import {
  IconBriefcase,
  IconClipboardList,
  IconInbox,
  IconSearch,
  IconUserCircle,
  type IconProps,
} from '@tabler/icons-react'
import { apiFetch } from '../lib/api'
import { ContaContext, type Conta } from '../lib/conta'
import { Avatar } from './Avatar'
import './AppLayout.css'

type ItemNav = {
  to: string
  rotulo: string
  Icone: ComponentType<IconProps>
}

function itensDeNavegacao(conta: Conta | null): ItemNav[] {
  const itens: ItemNav[] = [{ to: '/servicos', rotulo: 'Explorar', Icone: IconSearch }]

  if (conta?.perfil_cliente || !conta?.perfil_prestador) {
    itens.push({ to: '/meus-pedidos', rotulo: 'Meus pedidos', Icone: IconClipboardList })
  }
  if (conta?.perfil_prestador) {
    itens.push({ to: '/pedidos-recebidos', rotulo: 'Recebidos', Icone: IconInbox })
    itens.push({ to: '/meus-servicos', rotulo: 'Meus serviços', Icone: IconBriefcase })
  }

  itens.push({ to: '/perfil', rotulo: 'Perfil', Icone: IconUserCircle })

  return itens
}

/**
 * Moldura das telas internas: cabeçalho com a marca, menu no topo a partir do tablet
 * e barra de abas fixa embaixo no celular (onde o polegar alcança).
 */
export function AppLayout() {
  const [logado, setLogado] = useState(() => localStorage.getItem('token') !== null)
  const [conta, setConta] = useState<Conta | null>(null)

  const recarregarConta = useCallback(async () => {
    if (!localStorage.getItem('token')) return

    try {
      const res = await apiFetch('/profile')
      if (res.ok) {
        setConta(await res.json())
      } else if (res.status === 401) {
        setLogado(false)
      }
    } catch {
      // sem conexão: o menu continua com o que já tinha
    }
  }, [])

  useEffect(() => {
    void recarregarConta()
  }, [recarregarConta])

  const itens = itensDeNavegacao(conta)

  return (
    <ContaContext.Provider value={{ conta, recarregarConta }}>
      <div className={`app-shell${logado ? ' has-tabbar' : ''}`}>
        <header className="app-header">
          <div className="app-header-inner">
            <Link to="/servicos" className="app-logo" aria-label="Freelance, ir para o catálogo">
              <span className="app-logo-accent">F</span>reelance
            </Link>

            {logado && (
              <nav className="app-nav-desktop" aria-label="Navegação principal">
                {itens
                  .filter((item) => item.to !== '/perfil')
                  .map(({ to, rotulo, Icone }) => (
                    <NavLink key={to} to={to} className="app-nav-link">
                      <Icone size={18} stroke={1.75} />
                      {rotulo}
                    </NavLink>
                  ))}
              </nav>
            )}

            {logado ? (
              <NavLink to="/perfil" className="app-header-conta" aria-label="Meu perfil">
                <span className="app-header-nome">{conta?.name.split(' ')[0]}</span>
                <Avatar nome={conta?.name ?? ''} url={conta?.avatar_url ?? null} tamanho={34} />
              </NavLink>
            ) : (
              <Link to="/" className="app-header-entrar">
                Entrar
              </Link>
            )}
          </div>
        </header>

        <main className="app-main">
          <Outlet />
        </main>

        {logado && (
          <nav className="app-tabbar" aria-label="Navegação principal">
            {itens.map(({ to, rotulo, Icone }) => (
              <NavLink key={to} to={to} className="app-tab">
                <Icone size={22} stroke={1.75} />
                <span>{rotulo}</span>
              </NavLink>
            ))}
          </nav>
        )}
      </div>
    </ContaContext.Provider>
  )
}
