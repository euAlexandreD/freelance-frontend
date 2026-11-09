type AvatarProps = {
  nome: string
  url: string | null
  tamanho?: number
}

/** Foto do usuário ou, sem foto, as iniciais do nome. */
export function Avatar({ nome, url, tamanho = 40 }: AvatarProps) {
  const iniciais = nome
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join('')

  const estilo = { width: tamanho, height: tamanho, fontSize: Math.round(tamanho * 0.38) }

  return url ? (
    <img className="avatar" src={url} alt="" style={estilo} />
  ) : (
    <span className="avatar avatar-iniciais" style={estilo} aria-hidden="true">
      {iniciais}
    </span>
  )
}
