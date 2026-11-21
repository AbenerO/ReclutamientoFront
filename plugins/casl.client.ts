import { abilitiesPlugin } from '@casl/vue'
import { createMongoAbility } from '@casl/ability'

export default defineNuxtPlugin(nuxtApp => {
  const ability = createMongoAbility([])

  nuxtApp.vueApp.use(abilitiesPlugin, ability, {
    useGlobalProperties: true,
  })

  const user = useSanctumUser<{ abilities?: Array<{ action: string; subject: string }> }>()

  // Inicializar inmediatamente si ya hay usuario en el estado
  if (user.value?.abilities && Array.isArray(user.value.abilities))
    ability.update(user.value.abilities)

  // Observar cambios posteriores (login/logout)
  watch(
    () => user.value,
    newUser => {
      if (newUser?.abilities && Array.isArray(newUser.abilities))
        ability.update(newUser.abilities)
      else
        ability.update([])
    },
  )

  return {
    provide: {
      ability,
    },
  }
})