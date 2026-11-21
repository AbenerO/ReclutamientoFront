import { useAbility } from '@casl/vue'
import type { RouteLocationNormalized } from 'vue-router'
import type { NavGroup } from '@layouts/types'

/**
 * Returns ability result if ACL is configured or else just return true
 * We should allow passing string | undefined to can because for admin ability we omit defining action & subject
 *
 * Useful if you don't know if ACL is configured or not
 * Used in @core files to handle absence of ACL without errors
 *
 * @param {string} action CASL Actions // https://casl.js.org/v4/en/guide/intro#basics
 * @param {string} subject CASL Subject // https://casl.js.org/v4/en/guide/intro#basics
 */
export const can = (action: string | undefined, subject: string | undefined) => {
  const vm = getCurrentInstance()

  if (!vm)
    return true // Permitir si no hay instancia (SSR o inicialización)

  const localCan = vm.proxy && '$can' in vm.proxy

  if (!localCan)
    return true // Permitir si CASL no está configurado

  // Si no hay action o subject definido, permitir
  if (!action || !subject)
    return true

  // @ts-expect-error We will get TS error in below line because we aren't using $can in component instance
  return vm.proxy?.$can(action, subject) ?? true
}

/**
 * Determina si un grupo del menú (ítem padre con hijos) debe mostrarse.
 * Un grupo se ve solo si:
 *   1. El usuario cumple el permiso propio del grupo (action + subject), y
 *   2. Tiene al menos un hijo visible (recursivo para sub-grupos).
 * @param {object} item ítem de navegación (grupo)
 */
export const canViewNavMenuGroup = (item: NavGroup): boolean => {
  const hasVisibleChild = (item.children ?? []).some((child: any) => {
    // Sub-grupo → recursión
    if (Array.isArray(child?.children) && child.children.length > 0)
      return canViewNavMenuGroup(child)

    // Link o título → chequeo directo del permiso
    return can(child?.action, child?.subject)
  })

  // Si el grupo define su propio permiso, debe cumplirse además de tener hijos visibles
  if (item.action && item.subject)
    return can(item.action, item.subject) && hasVisibleChild

  return hasVisibleChild
}

export const canNavigate = (to: RouteLocationNormalized) => {
  const ability = useAbility()

  // Get the most specific route (last one in the matched array)
  const targetRoute = to.matched[to.matched.length - 1]

  // If the target route has specific permissions, check those first
  if (targetRoute?.meta?.action && targetRoute?.meta?.subject)
    return ability.can(targetRoute.meta.action, targetRoute.meta.subject)

  // If no specific permissions, fall back to checking if any parent route allows access
  // @ts-expect-error We should allow passing string | undefined to can because for admin ability we omit defining action & subject
  return to.matched.some(route => ability.can(route.meta.action, route.meta.subject))
}
