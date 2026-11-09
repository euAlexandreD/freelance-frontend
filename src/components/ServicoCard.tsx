import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { IconPhoto } from '@tabler/icons-react'
import { formatPreco, notaMedia } from '../lib/format'
import type { Servico } from '../lib/types'
import { Avatar } from './Avatar'
import { Estrelas } from './Estrelas'
import './ServicoCard.css'

type ServicoCardProps = {
  servico: Servico
  /** Esconde o rodapé com o prestador (na página do próprio prestador ele é redundante). */
  semPrestador?: boolean
  /** Etiqueta extra ao lado da categoria, como "pausado". */
  etiqueta?: string
  children?: ReactNode
}

export function ServicoCard({ servico, semPrestador, etiqueta, children }: ServicoCardProps) {
  const [fotoAtual, setFotoAtual] = useState(0)
  const fotos = servico.fotos ?? []
  const capa = fotos[Math.min(fotoAtual, fotos.length - 1)]
  const prestador = servico.perfil_prestador

  return (
    <article className="catalog-card servico-card">
      <div className="servico-card-capa">
        {capa ? (
          <img src={capa.url} alt={servico.titulo} loading="lazy" />
        ) : (
          <div className="servico-card-sem-foto" aria-hidden="true">
            <IconPhoto size={28} />
          </div>
        )}
      </div>

      {fotos.length > 1 && (
        <div className="servico-card-miniaturas">
          {fotos.map((foto, indice) => (
            <button
              key={foto.id}
              type="button"
              className={`servico-card-miniatura${indice === fotoAtual ? ' is-active' : ''}`}
              onClick={() => setFotoAtual(indice)}
              aria-label={`Ver foto ${indice + 1}`}
            >
              <img src={foto.url} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}

      <div className="servico-card-corpo">
        <span className="catalog-card-categoria">
          {servico.categoria_servico.nome}
          {etiqueta && ` · ${etiqueta}`}
        </span>
        <h2 className="servico-card-titulo">{servico.titulo}</h2>
        <p className="servico-card-preco">{formatPreco(servico)}</p>
        <Estrelas nota={notaMedia(servico.nota_media)} total={servico.avaliacoes_count} />
        <p className="catalog-card-descricao servico-card-descricao">{servico.descricao}</p>

        {!semPrestador && prestador && (
          <Link to={`/prestadores/${prestador.id}`} className="servico-card-prestador">
            <Avatar nome={prestador.user.name} url={prestador.user.avatar_url} tamanho={28} />
            <span>
              <strong>{prestador.user.name}</strong>
              {prestador.user.cidade && (
                <small>
                  {prestador.user.cidade}
                  {prestador.user.uf && `/${prestador.user.uf}`}
                </small>
              )}
            </span>
          </Link>
        )}

        {children}
      </div>
    </article>
  )
}
