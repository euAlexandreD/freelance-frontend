import { IconStar, IconStarFilled, IconStarHalfFilled } from '@tabler/icons-react'
import { formatNota } from '../lib/format'
import './Estrelas.css'

type EstrelasProps = {
  nota: number | null
  total?: number
  tamanho?: number
}

/** Mostra a nota em estrelas (com meia estrela) e, opcionalmente, o número de avaliações. */
export function Estrelas({ nota, total, tamanho = 14 }: EstrelasProps) {
  if (nota === null) {
    return <span className="estrelas estrelas-vazio">Sem avaliações</span>
  }

  return (
    <span className="estrelas" aria-label={`Nota ${formatNota(nota)} de 5`}>
      <span className="estrelas-icones" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((posicao) => {
          if (nota >= posicao) return <IconStarFilled key={posicao} size={tamanho} />
          if (nota >= posicao - 0.5) return <IconStarHalfFilled key={posicao} size={tamanho} />
          return <IconStar key={posicao} size={tamanho} />
        })}
      </span>
      <span className="estrelas-nota">{formatNota(nota)}</span>
      {total !== undefined && <span className="estrelas-total">({total})</span>}
    </span>
  )
}

type EstrelasInputProps = {
  valor: number
  onChange: (nota: number) => void
}

const ROTULOS = ['', 'Ruim', 'Regular', 'Bom', 'Muito bom', 'Excelente']

/** Seletor de nota de 1 a 5, usado na avaliação do pedido. */
export function EstrelasInput({ valor, onChange }: EstrelasInputProps) {
  return (
    <div className="estrelas-input" role="radiogroup" aria-label="Nota">
      {[1, 2, 3, 4, 5].map((nota) => (
        <button
          key={nota}
          type="button"
          role="radio"
          aria-checked={valor === nota}
          aria-label={`${nota} - ${ROTULOS[nota]}`}
          className={`estrelas-input-btn${nota <= valor ? ' is-active' : ''}`}
          onClick={() => onChange(nota)}
        >
          {nota <= valor ? <IconStarFilled size={26} /> : <IconStar size={26} />}
        </button>
      ))}
      {valor > 0 && <span className="estrelas-input-rotulo">{ROTULOS[valor]}</span>}
    </div>
  )
}
