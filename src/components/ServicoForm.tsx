import { useState, type FormEvent, type ReactNode } from 'react'
import { TIPO_PRECO_LABEL } from '../lib/format'
import type { CategoriaServico, Servico, TipoPreco } from '../lib/types'
import './ServicoForm.css'

export type ServicoFormValues = {
  categoria_servico_id: number
  titulo: string
  descricao: string
  tipo_preco: TipoPreco
  preco: number | null
}

type ServicoFormProps = {
  categorias: CategoriaServico[]
  inicial?: Servico
  enviando: boolean
  textoBotao: string
  /** Erros de validação do backend, por campo. */
  erros?: Record<string, string[]>
  onSubmit: (valores: ServicoFormValues) => void
  onCancel?: () => void
  /** Conteúdo extra antes do botão (ex.: seleção de fotos no cadastro). */
  extra?: ReactNode
}

const TIPOS: TipoPreco[] = ['fixo', 'a_partir_de', 'por_hora', 'a_combinar']

export function ServicoForm({
  categorias,
  inicial,
  enviando,
  textoBotao,
  erros = {},
  onSubmit,
  onCancel,
  extra,
}: ServicoFormProps) {
  const [categoria, setCategoria] = useState(inicial ? String(inicial.categoria_servico_id) : '')
  const [titulo, setTitulo] = useState(inicial?.titulo ?? '')
  const [descricao, setDescricao] = useState(inicial?.descricao ?? '')
  const [tipoPreco, setTipoPreco] = useState<TipoPreco>(inicial?.tipo_preco ?? 'fixo')
  const [preco, setPreco] = useState(inicial?.preco ? String(Number(inicial.preco)) : '')

  const aCombinar = tipoPreco === 'a_combinar'

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit({
      categoria_servico_id: Number(categoria),
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      tipo_preco: tipoPreco,
      preco: aCombinar ? null : Number(preco.replace(',', '.')),
    })
  }

  const erro = (campo: string) =>
    erros[campo]?.[0] && <span className="auth-field-error">{erros[campo][0]}</span>

  return (
    <form className="servico-form" onSubmit={handleSubmit}>
      <label className="auth-field">
        <p className="auth-label">Título</p>
        <input
          className="auth-input"
          placeholder="Ex.: Criação de logotipo profissional"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          minLength={5}
          maxLength={120}
          required
        />
        {erro('titulo')}
      </label>

      <label className="auth-field">
        <p className="auth-label">Categoria</p>
        <select
          className="catalog-filter servico-form-select"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          required
        >
          <option value="" disabled>
            Selecione a categoria
          </option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
        {erro('categoria_servico_id')}
      </label>

      <div className="servico-form-preco">
        <label className="auth-field">
          <p className="auth-label">Tipo de preço</p>
          <select
            className="catalog-filter servico-form-select"
            value={tipoPreco}
            onChange={(e) => setTipoPreco(e.target.value as TipoPreco)}
          >
            {TIPOS.map((tipo) => (
              <option key={tipo} value={tipo}>
                {TIPO_PRECO_LABEL[tipo]}
              </option>
            ))}
          </select>
        </label>

        {!aCombinar && (
          <label className="auth-field">
            <p className="auth-label">Valor (R$){tipoPreco === 'por_hora' && ' por hora'}</p>
            <input
              className="auth-input"
              type="number"
              inputMode="decimal"
              min={1}
              step="0.01"
              placeholder="0,00"
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
              required
            />
            {erro('preco')}
          </label>
        )}
      </div>

      <label className="auth-field">
        <p className="auth-label">Descrição</p>
        <textarea
          className="auth-textarea"
          placeholder="O que está incluso, prazo de entrega, como você trabalha..."
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          maxLength={5000}
          required
        />
        {erro('descricao')}
      </label>

      {extra}

      <div className="meus-servicos-actions">
        <button type="submit" className="auth-submit servico-form-submit" disabled={enviando}>
          {enviando ? 'Salvando...' : textoBotao}
        </button>
        {onCancel && (
          <button type="button" className="meus-servicos-btn meus-servicos-btn-ghost" onClick={onCancel}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}
