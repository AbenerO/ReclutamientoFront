export default defineNuxtRouteMiddleware(to => {
  if (import.meta.server)
    return

  const user = useSanctumUser()

  // Si no hay usuario autenticado, Sanctum se encarga de redirigir al login
  if (!user.value)
    return

  const nuxtApp = useNuxtApp()
  const ability = nuxtApp.$ability as any

  const targetRoute = to.matched[to.matched.length - 1]
  const action = targetRoute?.meta?.action as string | undefined
  const subject = targetRoute?.meta?.subject as string | undefined

  // Si la ruta no tiene permisos definidos, permitir
  if (!action || !subject)
    return

  // Usuario autenticado sin el permiso → denegar
  if (!ability || !ability.can(action, subject))
    return navigateTo('/')
})
