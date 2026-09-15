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
