export type CategoriaServico = {
  id: number
  nome: string
  slug: string
}

export type PerfilPrestadorResumo = {
  id: number
  bio: string | null
  user: {
    id: number
    name: string
    email: string
  }
}

export type Servico = {
  id: number
  perfil_prestador_id: number
  categoria_servico_id: number
  descricao: string
  ativo: boolean
  categoria_servico: CategoriaServico
  perfil_prestador: PerfilPrestadorResumo
}

export type PerfilClienteResumo = {
  id: number
  user: {
    id: number
    name: string
    email: string
  }
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
}
