export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost/api";

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");
  const isFormData = options.body instanceof FormData;

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  // Token vencido ou revogado: limpa a sessão e volta para o login,
  // em vez de deixar cada tela mostrar um erro genérico.
  if (response.status === 401 && token) {
    localStorage.removeItem("token");
    if (window.location.pathname !== "/") window.location.assign("/");
  }

  return response;
}

/** Encerra a sessão no servidor (invalida o token) e no navegador. */
export async function logout() {
  try {
    if (localStorage.getItem("token")) await apiFetch("/logout", { method: "POST" });
  } catch {
    // Sem conexão: o token ainda vence sozinho no servidor.
  } finally {
    localStorage.removeItem("token");
  }
}

/** Só deixa passar links http(s), para um valor salvo no perfil nunca virar `javascript:` ou `data:` num href. */
export function linkSeguro(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const { protocol } = new URL(url);
    return protocol === "http:" || protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}
