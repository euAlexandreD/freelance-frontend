import { useRef, useState } from 'react'
import { IconPhotoPlus, IconX } from '@tabler/icons-react'
import { apiFetch } from '../lib/api'
import { MAX_FOTOS, enviarFotos } from '../lib/fotos'
import type { ServicoFoto } from '../lib/types'
import './FotosServico.css'

type FotosServicoProps = {
  servicoId: number
  fotos: ServicoFoto[]
  onChange: (fotos: ServicoFoto[]) => void
}

/** Miniaturas das fotos do serviço, com botões para adicionar e remover. */
export function FotosServico({ servicoId, fotos, onChange }: FotosServicoProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [enviando, setEnviando] = useState(false)
  const [removendoId, setRemovendoId] = useState<number | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  const vagas = MAX_FOTOS - fotos.length

  async function handleSelecionar(lista: FileList | null) {
    if (!lista || lista.length === 0) return
    setErro(null)

    const arquivos = Array.from(lista).slice(0, vagas)
    if (lista.length > vagas) {
      setErro(`Só cabem mais ${vagas} foto(s). As demais foram ignoradas.`)
    }

    setEnviando(true)
    try {
      onChange(await enviarFotos(servicoId, arquivos))
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setEnviando(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function handleRemover(foto: ServicoFoto) {
    setRemovendoId(foto.id)
    setErro(null)

    try {
      const res = await apiFetch(`/servico-fotos/${foto.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      onChange(fotos.filter((f) => f.id !== foto.id))
    } catch {
      setErro('Não foi possível remover a foto.')
    } finally {
      setRemovendoId(null)
    }
  }

  return (
    <div className="fotos-servico">
      <div className="fotos-servico-grade">
        {fotos.map((foto) => (
          <div key={foto.id} className="fotos-servico-item">
            <img src={foto.url} alt="" />
            <button
              type="button"
              className="fotos-servico-remover"
              onClick={() => handleRemover(foto)}
              disabled={removendoId === foto.id}
              aria-label="Remover foto"
            >
              <IconX size={14} />
            </button>
          </div>
        ))}

        {vagas > 0 && (
          <button
            type="button"
            className="fotos-servico-adicionar"
            onClick={() => inputRef.current?.click()}
            disabled={enviando}
          >
            <IconPhotoPlus size={20} />
            <span>{enviando ? 'Enviando...' : 'Adicionar'}</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        hidden
        onChange={(e) => handleSelecionar(e.target.files)}
      />

      <p className="fotos-servico-dica">
        {fotos.length}/{MAX_FOTOS} fotos · a primeira aparece como capa no catálogo
      </p>
      {erro && <p className="fotos-servico-erro">{erro}</p>}
    </div>
  )
}
