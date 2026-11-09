import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { IconExternalLink, IconMapPin } from '@tabler/icons-react'
import { apiFetch } from '../lib/api'
import { formatData, notaMedia } from '../lib/format'
import type { PrestadorPublico } from '../lib/types'
import { Avatar } from '../components/Avatar'
import { Estrelas } from '../components/Estrelas'
import { ServicoCard } from '../components/ServicoCard'
import { SolicitarServico } from '../components/SolicitarServico'
import './PrestadorPerfil.css'

export function PrestadorPerfil() {
  const { id } = useParams()

  const [prestador, setPrestador] = useState<PrestadorPublico | null>(null)
  const [estado, setEstado] = useState<'carregando' | 'ok' | 'nao-encontrado' | 'erro'>('carregando')

  useEffect(() => {
    let ativo = true

    apiFetch(`/prestadores/${id}`)
      .then(async (res) => {
        if (!ativo) return
        if (res.status === 404) return setEstado('nao-encontrado')
        if (!res.ok) throw new Error()
        setPrestador(await res.json())
        setEstado('ok')
      })
      .catch(() => ativo && setEstado('erro'))

    return () => {
      ativo = false
    }
  }, [id])

  const voltar = (
    <Link to="/servicos" className="catalog-profile-link">
      ← Catálogo
    </Link>
  )

  if (estado !== 'ok' || !prestador) {
    const mensagem = {
      carregando: 'Carregando...',
      'nao-encontrado': 'Prestador não encontrado.',
      erro: 'Não foi possível carregar o perfil.',
      ok: '',
    }[estado]

    return (
      <div className="catalog-page">
        <header className="catalog-header">{voltar}</header>
        <p className="catalog-message">{mensagem}</p>
      </div>
    )
  }

  const { user } = prestador
  const nota = notaMedia(prestador.nota_media)

  return (
    <div className="catalog-page">
      <header className="catalog-header">{voltar}</header>

      <section className="prestador-hero">
        <Avatar nome={user.name} url={user.avatar_url} tamanho={88} />
        <div className="prestador-hero-info">
          <h1 className="prestador-nome">{user.name}</h1>
          {prestador.titulo && <p className="prestador-titulo">{prestador.titulo}</p>}
          <Estrelas nota={nota} total={prestador.avaliacoes_count} tamanho={16} />
          <ul className="prestador-meta">
            {user.cidade && (
              <li>
                <IconMapPin size={14} />
                {user.cidade}
                {user.uf && `/${user.uf}`}
              </li>
            )}
            <li>{prestador.pedidos_concluidos} serviço(s) concluído(s)</li>
            <li>Na plataforma desde {formatData(prestador.membro_desde)}</li>
          </ul>
          {prestador.link_externo && (
            <a
              className="prestador-link"
              href={prestador.link_externo}
              target="_blank"
              rel="noopener noreferrer nofollow"
            >
              Portfólio <IconExternalLink size={14} />
            </a>
          )}
        </div>
      </section>

      {prestador.bio && (
        <section className="prestador-secao">
          <h2 className="prestador-secao-titulo">Sobre</h2>
          <p className="prestador-bio">{prestador.bio}</p>
        </section>
      )}

      <section className="prestador-secao">
        <h2 className="prestador-secao-titulo">Serviços ({prestador.servicos.length})</h2>
        {prestador.servicos.length === 0 ? (
          <p className="catalog-message">Nenhum serviço disponível no momento.</p>
        ) : (
          <div className="catalog-list">
            {prestador.servicos.map((servico) => (
              <ServicoCard key={servico.id} servico={servico} semPrestador>
                <SolicitarServico servicoId={servico.id} />
              </ServicoCard>
            ))}
          </div>
        )}
      </section>

      <section className="prestador-secao">
        <h2 className="prestador-secao-titulo">Avaliações ({prestador.avaliacoes_count})</h2>
        {prestador.avaliacoes.length === 0 ? (
          <p className="catalog-message">Este prestador ainda não recebeu avaliações.</p>
        ) : (
          <ul className="prestador-avaliacoes">
            {prestador.avaliacoes.map((avaliacao) => (
              <li key={avaliacao.id} className="prestador-avaliacao">
                <div className="prestador-avaliacao-topo">
                  <Estrelas nota={avaliacao.nota} />
                  <span className="prestador-avaliacao-data">
                    {new Date(avaliacao.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                {avaliacao.comentario && (
                  <p className="prestador-avaliacao-comentario">{avaliacao.comentario}</p>
                )}
                <p className="prestador-avaliacao-autor">
                  {avaliacao.cliente}
                  {avaliacao.servico && ` · ${avaliacao.servico.titulo}`}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
