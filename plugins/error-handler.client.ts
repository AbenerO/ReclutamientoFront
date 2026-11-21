/**
 * Plugin cliente: captura errores Vue, promesas rechazadas y errores del router
 * y los envía al canal "frontend" de logs del backend.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter()

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const isChunkError = (err: unknown): boolean => {
    const msg = String(err instanceof Error ? err.message : err)
    return (
      msg.includes('Failed to fetch dynamically imported module') ||
      msg.includes('Importing a module script failed') ||
      msg.includes('Unable to preload CSS') ||
      msg.includes('ChunkLoadError') ||
      msg.includes('Loading chunk')
    )
  }

  const enviarLog = async (payload: {
    type: string
    message: string
    stack?: string
    info?: string
    url?: string
    userAgent?: string
    timestamp?: string
  }) => {
    try {
      // Usamos $fetch directo para evitar dependencias circulares con composables
      await $fetch('/api/configuracion/log-viewer/logs/frontend', {
        method: 'POST',
        credentials: 'include',
        body: {
          ...payload,
          url:       payload.url       ?? window.location.href,
          userAgent: payload.userAgent ?? navigator.userAgent,
          timestamp: payload.timestamp ?? new Date().toISOString(),
        },
      })
    } catch {
      // Silenciar: no queremos que el log de errores lance otro error
    }
  }

  const manejarChunkError = (err: unknown) => {
    const nuevaVersion = useState<boolean>('nueva_version_disponible', () => false)
    nuevaVersion.value = true

    const clave  = 'chunkErrorRetries'
    const actual = parseInt(sessionStorage.getItem(clave) ?? '0', 10)

    if (actual < 3) {
      sessionStorage.setItem(clave, String(actual + 1))
      window.location.reload()
      return
    }

    // Agotados los reintentos: registrar como error final
    sessionStorage.removeItem(clave)
    const msg = err instanceof Error ? err.message : String(err)
    const stk = err instanceof Error ? (err.stack ?? '') : ''
    enviarLog({ type: 'chunk_load_failed_final', message: msg, stack: stk })
  }

  // ── 1. Errores de Vue (errorHandler) ─────────────────────────────────────────
  nuxtApp.vueApp.config.errorHandler = (err, _instance, info) => {
    if (isChunkError(err)) { manejarChunkError(err); return }

    const msg = err instanceof Error ? err.message : String(err)
    const stk = err instanceof Error ? (err.stack ?? '') : ''
    enviarLog({ type: 'vue_error', message: msg, stack: stk, info: info ?? undefined })
  }

  // ── 2. Promesas no capturadas ────────────────────────────────────────────────
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason
    if (isChunkError(reason)) { manejarChunkError(reason); return }

    const msg = reason instanceof Error ? reason.message : String(reason)
    const stk = reason instanceof Error ? (reason.stack ?? '') : ''
    enviarLog({ type: 'unhandled_rejection', message: msg, stack: stk })
  })

  // ── 3. Errores de navegación del router ──────────────────────────────────────
  router.onError((err) => {
    if (isChunkError(err)) { manejarChunkError(err); return }

    const msg = err instanceof Error ? err.message : String(err)
    const stk = err instanceof Error ? (err.stack ?? '') : ''
    enviarLog({ type: 'router_error', message: msg, stack: stk })
  })
})
