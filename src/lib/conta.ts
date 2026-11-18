import { createContext, useContext } from 'react'

/** O mínimo da conta logada que a navegação precisa saber. */
export type Conta = {
  name: string
  avatar_url: string | null
  perfil_cliente: object | null
  perfil_prestador: { id: number } | null
}

type ContaContextValue = {
  conta: Conta | null
  /** Busca a conta de novo, por exemplo depois de trocar o tipo de conta no perfil. */
  recarregarConta: () => Promise<void>
}

export const ContaContext = createContext<ContaContextValue>({
  conta: null,
  recarregarConta: async () => {},
})

export function useConta() {
  return useContext(ContaContext)
}
