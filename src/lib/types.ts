export type CategoriaServico = {
  id: number
  nome: string
  slug: string
}

/** Dados públicos do usuário (o backend não envia e-mail nem telefone nas telas públicas). */
export type UsuarioPublico = {
  id: number
  name: string
  avatar_url: string | null
  cidade: string | null
  uf: string | null
}

export type PerfilPrestadorResumo = {
  id: number
  titulo: string | null
  bio: string | null
  user: UsuarioPublico
}

export type TipoPreco = 'fixo' | 'a_partir_de' | 'por_hora' | 'a_combinar'

export type ServicoFoto = {
  id: number
  servico_id: number
  ordem: number
  url: string
}

export type Servico = {
  id: number
  perfil_prestador_id: number
  categoria_servico_id: number
  titulo: string
  descricao: string
  tipo_preco: TipoPreco
  /** Vem como texto do backend ("150.00"); null quando é "a combinar". */
  preco: string | null
  ativo: boolean
  categoria_servico: CategoriaServico
  perfil_prestador: PerfilPrestadorResumo
  fotos: ServicoFoto[]
  /** Média das avaliações; null quando ainda não há nenhuma. */
  nota_media: number | string | null
  avaliacoes_count: number
}

export type PerfilClienteResumo = {
  id: number
  user: {
    id: number
    name: string
    email: string
  }
}

export type Avaliacao = {
  id: number
  pedido_id: number
  nota: number
  comentario: string | null
  created_at: string
}

export type PedidoStatus = 'pendente' | 'aceito' | 'recusado' | 'concluido' | 'cancelado'

export type Pedido = {
  id: number
  perfil_cliente_id: number
  servico_id: number
  status: PedidoStatus
  descricao_pedido: string | null
  servico: Servico
  perfil_cliente?: PerfilClienteResumo
  avaliacao?: Avaliacao | null
}

export type AvaliacaoPublica = {
  id: number
  nota: number
  comentario: string | null
  created_at: string
  cliente: string
  servico: { id: number; titulo: string } | null
}

export type PrestadorPublico = {
  id: number
  titulo: string | null
  bio: string | null
  link_externo: string | null
  membro_desde: string
  user: UsuarioPublico
  nota_media: number | string | null
  avaliacoes_count: number
  pedidos_concluidos: number
  servicos: Servico[]
  avaliacoes: AvaliacaoPublica[]
}
