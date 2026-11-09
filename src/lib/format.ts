import type { Servico, TipoPreco } from './types'

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export const TIPO_PRECO_LABEL: Record<TipoPreco, string> = {
  fixo: 'Preço fixo',
  a_partir_de: 'A partir de',
  por_hora: 'Por hora',
  a_combinar: 'A combinar',
}

/** "R$ 150,00", "A partir de R$ 80,00", "R$ 120,00/hora" ou "A combinar". */
export function formatPreco(servico: Pick<Servico, 'tipo_preco' | 'preco'>): string {
  if (servico.tipo_preco === 'a_combinar' || servico.preco === null) return 'A combinar'

  const valor = moeda.format(Number(servico.preco))

  if (servico.tipo_preco === 'a_partir_de') return `A partir de ${valor}`
  if (servico.tipo_preco === 'por_hora') return `${valor}/hora`
  return valor
}

/** Converte a média do backend (número ou texto) em número com uma casa, ou null. */
export function notaMedia(valor: number | string | null): number | null {
  if (valor === null || valor === undefined) return null
  return Math.round(Number(valor) * 10) / 10
}

export function formatNota(valor: number): string {
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}

export function formatData(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}

/**
 * Reduz a foto para no máximo 1600px no maior lado e converte para JPEG antes do upload.
 * Fotos de celular costumam ter 5–10 MB; assim chegam ao servidor com algumas centenas de KB.
 */
export async function reduzirImagem(arquivo: File, ladoMaximo = 1600): Promise<File> {
  if (!arquivo.type.startsWith('image/')) return arquivo

  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(arquivo)
  } catch {
    return arquivo
  }

  const escala = Math.min(1, ladoMaximo / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * escala)
  canvas.height = Math.round(bitmap.height * escala)
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85))
  if (!blob || blob.size >= arquivo.size) return arquivo

  const nome = arquivo.name.replace(/\.[^.]+$/, '') + '.jpg'
  return new File([blob], nome, { type: 'image/jpeg' })
}
