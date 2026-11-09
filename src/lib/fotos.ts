import { apiFetch } from './api'
import { reduzirImagem } from './format'
import type { ServicoFoto } from './types'

export const MAX_FOTOS = 5

/** Envia as fotos já reduzidas para um serviço e devolve a lista atualizada. */
export async function enviarFotos(servicoId: number, arquivos: File[]): Promise<ServicoFoto[]> {
  const form = new FormData()
  for (const arquivo of arquivos) {
    form.append('fotos[]', await reduzirImagem(arquivo))
  }

  const res = await apiFetch(`/servicos/${servicoId}/fotos`, { method: 'POST', body: form })
  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const primeiroErro = data.errors ? (Object.values(data.errors)[0] as string[])[0] : null
    throw new Error(primeiroErro ?? data.message ?? 'Não foi possível enviar as fotos.')
  }

  return data
}
