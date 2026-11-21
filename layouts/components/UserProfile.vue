<script setup lang="ts">
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'

const user = useSanctumUser<{
  name: string
  nombre_completo: string
  primer_nombre_apellido: string
  email: string
  avatar: string | null
  username: string | null
  roles?: Array<{ name: string }>
}>()

const { logout } = useSanctumAuth()

const displayName = computed(() =>
  user.value?.nombre_completo || user.value?.name || '',
)

const initials = computed(() => {
  const nombre = displayName.value
  if (!nombre) return '?'
  return nombre
    .split(' ')
    .filter(Boolean)
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
})

const avatarColor = computed(() => {
  const palette = ['primary', 'secondary', 'success', 'info', 'warning', 'error']
  const code = displayName.value?.charCodeAt(0) ?? 0
  return palette[code % palette.length]
})

const rolePrincipal = computed(() =>
  user.value?.roles?.[0]?.name ?? 'Usuario',
)
</script>

<template>
  <VBadge
    dot
    bordered
    location="bottom right"
    offset-x="2"
    offset-y="2"
    color="success"
    class="user-profile-badge"
  >
    <!-- Avatar en la navbar -->
    <VAvatar
      class="cursor-pointer"
      size="38"
      :color="user?.avatar ? undefined : avatarColor"
      rounded="lg"
    >
      <VImg
        v-if="user?.avatar"
        :src="user.avatar"
        cover
        alt="Avatar"
      />
      <span
        v-else
        class="text-caption font-weight-bold text-white"
      >
        {{ initials }}
      </span>

      <!-- SECTION Menu desplegable -->
      <VMenu
        activator="parent"
        width="240"
        location="bottom end"
        offset="15px"
      >
        <VList>
          <!-- Header usuario -->
          <VListItem class="px-4 py-3">
            <div class="d-flex gap-x-3 align-center">
              <VAvatar
                size="44"
                :color="user?.avatar ? undefined : avatarColor"
                rounded="lg"
              >
                <VImg
                  v-if="user?.avatar"
                  :src="user.avatar"
                  cover
                  alt="Avatar"
                />
                <span
                  v-else
                  class="text-body-2 font-weight-bold text-white"
                >
                  {{ initials }}
                </span>
              </VAvatar>

              <div class="overflow-hidden">
                <div class="text-body-2 font-weight-semibold text-high-emphasis text-truncate">
                  {{ displayName }}
                </div>
                <div class="text-caption text-disabled text-truncate">
                  {{ rolePrincipal }}
                </div>
              </div>
            </div>
          </VListItem>

          <PerfectScrollbar :options="{ wheelPropagation: false }">
            <VDivider class="my-1" />

            <VListItem
              to="/perfil"
              class="px-4"
            >
              <template #prepend>
                <VIcon
                  icon="ri-user-line"
                  size="22"
                />
              </template>
              <VListItemTitle>Mi Perfil</VListItemTitle>
            </VListItem>

            <VDivider class="my-1" />

            <VListItem class="px-4 pb-3">
              <VBtn
                block
                color="error"
                size="small"
                variant="tonal"
                append-icon="ri-logout-box-r-line"
                @click="logout"
              >
                Cerrar Sesión
              </VBtn>
            </VListItem>
          </PerfectScrollbar>
        </VList>
      </VMenu>
      <!-- !SECTION -->
    </VAvatar>
  </VBadge>
</template>

<style lang="scss">
.user-profile-badge {
  &.v-badge--bordered.v-badge--dot .v-badge__badge::after {
    color: rgb(var(--v-theme-background));
  }
}
</style>
