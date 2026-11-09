import { useCallback, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { IconMessageCircle, IconSend } from '@tabler/icons-react'
import { apiFetch } from '../lib/api'
import type { Mensagem } from '../lib/types'
import './ConversaPedido.css'

/** De quanto em quanto tempo a conversa aberta busca mensagens novas. */
const INTERVALO_ATUALIZACAO_MS = 5000

type ConversaPedidoProps = {
  pedidoId: number
  naoLidas?: number
  /** Abre a conversa ao montar (quando o usuário chega pelo link do e-mail). */
  abertaInicialmente?: boolean
  /** Chamado quando a conversa é aberta e as mensagens são marcadas como lidas. */
  onLidas?: () => void
}

function formatarHora(iso: string): string {
  const data = new Date(iso)
  const hoje = new Date().toDateString() === data.toDateString()
  return hoje
    ? data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : data.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

export function ConversaPedido({ pedidoId, naoLidas = 0, abertaInicialmente, onLidas }: ConversaPedidoProps) {
  const [aberta, setAberta] = useState(Boolean(abertaInicialmente))
  const [mensagens, setMensagens] = useState<Mensagem[]>([])
  const [podeEnviar, setPodeEnviar] = useState(true)
  const [carregando, setCarregando] = useState(false)
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const listaRef = useRef<HTMLDivElement>(null)
  const ultimoIdRef = useRef(0)
  const onLidasRef = useRef(onLidas)
  useEffect(() => {
    onLidasRef.current = onLidas
  }, [onLidas])

  const adicionar = useCallback((novas: Mensagem[]) => {
    if (novas.length === 0) return
    setMensagens((atuais) => {
      const ids = new Set(atuais.map((m) => m.id))
      return [...atuais, ...novas.filter((m) => !ids.has(m.id))]
    })
    ultimoIdRef.current = Math.max(ultimoIdRef.current, ...novas.map((m) => m.id))
  }, [])

  const buscar = useCallback(
    async (inicial: boolean) => {
      const query = inicial ? '' : `?depois_de=${ultimoIdRef.current}`
      const res = await apiFetch(`/pedidos/${pedidoId}/mensagens${query}`)
      if (!res.ok) throw new Error()
      const data: { mensagens: Mensagem[]; pode_enviar: boolean } = await res.json()
      adicionar(data.mensagens)
      setPodeEnviar(data.pode_enviar)
      onLidasRef.current?.()
    },
    [pedidoId, adicionar],
  )

  // Ao abrir: carrega a conversa e passa a buscar mensagens novas enquanto a aba estiver visível.
  useEffect(() => {
    if (!aberta) return

    let ativo = true
    setCarregando(true)
    setErro(null)
    buscar(true)
      .catch(() => ativo && setErro('Não foi possível carregar a conversa.'))
      .finally(() => ativo && setCarregando(false))

    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') buscar(false).catch(() => {})
    }, INTERVALO_ATUALIZACAO_MS)

    return () => {
      ativo = false
      window.clearInterval(timer)
    }
  }, [aberta, buscar])

  // Mantém a conversa rolada até a última mensagem.
  useEffect(() => {
    const lista = listaRef.current
    if (lista) lista.scrollTop = lista.scrollHeight
  }, [mensagens.length, aberta])

  async function enviar(event?: FormEvent) {
    event?.preventDefault()
    const conteudo = texto.trim()
    if (!conteudo || enviando) return

    setEnviando(true)
    setErro(null)

    try {
      const res = await apiFetch(`/pedidos/${pedidoId}/mensagens`, {
        method: 'POST',
        body: JSON.stringify({ texto: conteudo }),
      })
      const data = await res.json()

      if (!res.ok) {
        setErro(data.errors?.texto?.[0] ?? data.message ?? 'Não foi possível enviar a mensagem.')
        return
      }

      adicionar([data])
      setTexto('')
    } catch {
      setErro('Não foi possível conectar ao servidor.')
    } finally {
      setEnviando(false)
    }
  }

  // Enter envia; Shift+Enter quebra a linha.
  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      enviar()
    }
  }

  if (!aberta) {
    return (
      <div className="meus-servicos-actions">
        <button type="button" className="meus-servicos-btn conversa-abrir" onClick={() => setAberta(true)}>
          <IconMessageCircle size={16} />
          Conversa
          {naoLidas > 0 && (
            <span className="conversa-badge" aria-label={`${naoLidas} mensagens não lidas`}>
              {naoLidas}
            </span>
          )}
        </button>
      </div>
    )
  }

  return (
    <section className="conversa" aria-label="Conversa do pedido">
      <div className="conversa-topo">
        <span>Conversa</span>
        <button type="button" className="conversa-fechar" onClick={() => setAberta(false)}>
          Fechar
        </button>
      </div>

      <div className="conversa-lista" ref={listaRef} aria-live="polite">
        {carregando && mensagens.length === 0 && <p className="conversa-vazia">Carregando...</p>}
        {!carregando && mensagens.length === 0 && (
          <p className="conversa-vazia">Nenhuma mensagem ainda. Combine os detalhes por aqui.</p>
        )}
        {mensagens.map((mensagem) => (
          <div key={mensagem.id} className={`conversa-msg${mensagem.minha ? ' is-minha' : ''}`}>
            {!mensagem.minha && <span className="conversa-autor">{mensagem.autor}</span>}
            <p className="conversa-texto">{mensagem.texto}</p>
            <span className="conversa-hora">
              {formatarHora(mensagem.created_at)}
              {mensagem.minha && mensagem.lida_em && ' · lida'}
            </span>
          </div>
        ))}
      </div>

      {erro && <p className="conversa-erro">{erro}</p>}

      {podeEnviar ? (
        <form className="conversa-form" onSubmit={enviar}>
          <textarea
            className="auth-textarea conversa-input"
            placeholder="Mensagem"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={2000}
            rows={1}
          />
          <button
            type="submit"
            className="conversa-enviar"
            disabled={enviando || !texto.trim()}
            aria-label="Enviar mensagem"
          >
            <IconSend size={18} />
          </button>
        </form>
      ) : (
        <p className="conversa-vazia">Este pedido foi encerrado. A conversa fica disponível só para leitura.</p>
      )}
    </section>
  )
}
