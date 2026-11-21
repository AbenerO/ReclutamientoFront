<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const user = useSanctumUser<{
  id: number
  name: string
  nombre_completo: string
  primer_nombre_apellido: string
  email: string
  avatar: string | null
  username: string | null
  primer_nombre: string | null
  segundo_nombre: string | null
  tercer_nombre: string | null
  primer_apellido: string | null
  segundo_apellido: string | null
  apellido_casada: string | null
  dpi: string | null
  genero: string | null
  fecha_nacimiento: string | null
  telefono: string | null
  estado: boolean
  roles?: Array<{ name: string }>
}>()

const client = useSanctumClient()
const { showToastSuccess, showToastError } = useToast()
const { paginaEspera } = useCargandoPagina()

const tab = ref('info')
const requestInProgress = ref(false)

// ─── Avatar ────────────────────────────────────────────────────────────────
const fileInput = ref<HTMLInputElement>()
const uploadingAvatar = ref(false)
const localAvatarUrl = ref<string | null>(null)

const avatarDisplayUrl = computed(() =>
  localAvatarUrl.value ?? user.value?.avatar ?? null,
)

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

const triggerFileInput = () => fileInput.value?.click()

const subirAvatar = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return

  const file = input.files[0]
  const blobUrl = URL.createObjectURL(file)
  localAvatarUrl.value = blobUrl

  const formData = new FormData()
  formData.append('avatar', file)

  uploadingAvatar.value = true
  try {
    const respuesta: any = await client('api/perfil/avatar', { method: 'POST', body: formData })
    URL.revokeObjectURL(blobUrl)
    localAvatarUrl.value = respuesta.data?.avatar ?? null
    showToastSuccess(respuesta.message)
    await refreshNuxtData()
  }
  catch (error: any) {
    URL.revokeObjectURL(blobUrl)
    localAvatarUrl.value = user.value?.avatar ?? null
    showToastError(error?.data?.message ?? 'Error al subir la imagen')
  }
  finally {
    uploadingAvatar.value = false
    input.value = ''
  }
}

const eliminarAvatar = async () => {
  if (uploadingAvatar.value) return
  uploadingAvatar.value = true
  try {
    const respuesta: any = await client('api/perfil/avatar', { method: 'DELETE' })
    localAvatarUrl.value = null
    showToastSuccess(respuesta.message)
    await refreshNuxtData()
  }
  catch (error: any) {
    showToastError(error?.data?.message ?? 'Error al eliminar la foto')
  }
  finally { uploadingAvatar.value = false }
}

// ─── Info personal ─────────────────────────────────────────────────────────
const infoForm = ref({
  email: '',
  username: '',
  primer_nombre: '',
  segundo_nombre: '',
  tercer_nombre: '',
  primer_apellido: '',
  segundo_apellido: '',
  apellido_casada: '',
  dpi: '',
  genero: null as string | null,
  fecha_nacimiento: '',
  telefono: '',
})

const refInfoForm = ref()

watch(
  () => user.value,
  u => {
    if (!u) return
    infoForm.value = {
      email:            u.email ?? '',
      username:         u.username ?? '',
      primer_nombre:    u.primer_nombre ?? '',
      segundo_nombre:   u.segundo_nombre ?? '',
      tercer_nombre:    u.tercer_nombre ?? '',
      primer_apellido:  u.primer_apellido ?? '',
      segundo_apellido: u.segundo_apellido ?? '',
      apellido_casada:  u.apellido_casada ?? '',
      dpi:              u.dpi ?? '',
      genero:           u.genero ?? null,
      fecha_nacimiento: u.fecha_nacimiento ?? '',
      telefono:         u.telefono ?? '',
    }
  },
  { immediate: true },
)

const guardarInfo = async () => {
  const { valid } = await refInfoForm.value?.validate()
  if (!valid || requestInProgress.value) return

  requestInProgress.value = true
  paginaEspera.value = true
  try {
    const respuesta: any = await client('api/perfil', { method: 'PUT', body: infoForm.value })
    showToastSuccess(respuesta.message)
    await refreshNuxtData()
  }
  catch (error: any) {
    const errors = error?.data?.errors
    if (errors) {
      const firstMsg = Object.values(errors).flat()[0] as string
      showToastError(firstMsg)
    }
    else {
      showToastError(error?.data?.message ?? 'Error al actualizar el perfil')
    }
  }
  finally {
    paginaEspera.value = false
    requestInProgress.value = false
  }
}

// ─── Cambiar contraseña ────────────────────────────────────────────────────
const securityForm = ref({
  password_actual: '',
  nueva_password: '',
  nueva_password_confirmation: '',
})
const refSecurityForm = ref()
const showPasswordActual = ref(false)
const showNuevaPassword = ref(false)
const showConfirmPassword = ref(false)

const confirmarPasswordRule = (v: string) =>
  v === securityForm.value.nueva_password || 'Las contraseñas no coinciden'

const minLengthRule = (v: string) => v.length >= 8 || 'Mínimo 8 caracteres'

const cambiarPassword = async () => {
  const { valid } = await refSecurityForm.value?.validate()
  if (!valid || requestInProgress.value) return

  requestInProgress.value = true
  paginaEspera.value = true
  try {
    const respuesta: any = await client('api/perfil/cambiar-password', {
      method: 'PUT',
      body: securityForm.value,
    })
    showToastSuccess(respuesta.message)
    securityForm.value = { password_actual: '', nueva_password: '', nueva_password_confirmation: '' }
    refSecurityForm.value?.reset()
  }
  catch (error: any) {
    const msg = error?.data?.errors?.password_actual?.[0]
      ?? error?.data?.message
      ?? 'Error al cambiar la contraseña'
    showToastError(msg)
  }
  finally {
    paginaEspera.value = false
    requestInProgress.value = false
  }
}

const generosOpciones = ['Masculino', 'Femenino', 'Otro']
</script>

<template>
  <div>
    <!-- ── Banner de portada ───────────────────────────────────────────────── -->
    <VCard
      class="mb-6 overflow-hidden"
      rounded="lg"
    >
      <div class="profile-cover">
        <div class="profile-cover-circle profile-cover-circle-1" />
        <div class="profile-cover-circle profile-cover-circle-2" />
        <div class="profile-cover-circle profile-cover-circle-3" />
      </div>

      <VCardText class="pt-0">
        <div class="d-flex flex-column flex-sm-row align-start align-sm-end gap-4 pb-2">

          <!-- ── Avatar ───────────────────────────────────────────────── -->
          <div class="profile-avatar-wrapper">
            <VAvatar
              size="110"
              class="profile-avatar elevation-6"
              :color="avatarDisplayUrl ? undefined : avatarColor"
              rounded="lg"
            >
              <VImg
                v-if="avatarDisplayUrl"
                :src="avatarDisplayUrl"
                cover
                alt="Avatar"
              />
              <span
                v-else
                class="text-h3 font-weight-black text-white"
              >
                {{ initials }}
              </span>
            </VAvatar>

            <div
              class="avatar-overlay"
              :class="{ 'avatar-overlay--uploading': uploadingAvatar }"
              @click="triggerFileInput"
            >
              <VProgressCircular
                v-if="uploadingAvatar"
                indeterminate
                color="white"
                size="26"
              />
              <VIcon
                v-else
                color="white"
                size="26"
              >
                ri-camera-line
              </VIcon>
            </div>

            <input
              ref="fileInput"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              class="d-none"
              @change="subirAvatar"
            >
          </div>

          <!-- ── Info ──────────────────────────────────────────────────── -->
          <div class="flex-grow-1 mt-1">
            <h4 class="text-h4 font-weight-bold">
              {{ displayName }}
            </h4>

            <div class="d-flex flex-wrap align-center gap-3 mt-1 text-medium-emphasis">
              <div
                v-if="user?.username"
                class="d-flex align-center gap-1"
              >
                <VIcon
                  size="14"
                  color="secondary"
                >
                  ri-at-line
                </VIcon>
                <span class="text-body-2">{{ user.username }}</span>
              </div>
              <div class="d-flex align-center gap-1">
                <VIcon
                  size="14"
                  color="primary"
                >
                  ri-mail-line
                </VIcon>
                <span class="text-body-2">{{ user?.email }}</span>
              </div>
              <div
                v-if="user?.telefono"
                class="d-flex align-center gap-1"
              >
                <VIcon
                  size="14"
                  color="success"
                >
                  ri-phone-line
                </VIcon>
                <span class="text-body-2">{{ user.telefono }}</span>
              </div>
            </div>

            <div class="d-flex flex-wrap gap-2 mt-3">
              <VChip
                v-for="role in user?.roles"
                :key="role.name"
                color="primary"
                size="small"
                variant="tonal"
                label
                prepend-icon="ri-shield-user-line"
              >
                {{ role.name }}
              </VChip>
              <VChip
                v-if="user?.genero"
                color="secondary"
                size="small"
                variant="tonal"
                label
                prepend-icon="ri-user-heart-line"
              >
                {{ user.genero }}
              </VChip>
            </div>

            <VBtn
              v-if="avatarDisplayUrl"
              class="mt-3"
              color="error"
              size="small"
              variant="tonal"
              prepend-icon="ri-delete-bin-line"
              :loading="uploadingAvatar"
              @click="eliminarAvatar"
            >
              Quitar foto
            </VBtn>
          </div>
        </div>

        <p class="text-caption text-disabled mt-2 mb-0">
          <VIcon size="13">ri-information-line</VIcon>
          Haz clic en la foto para cambiarla · JPG, PNG, WEBP · Máx. 1 MB
        </p>
      </VCardText>
    </VCard>

    <!-- ── Tabs ───────────────────────────────────────────────────────────── -->
    <VCard rounded="lg">
      <VTabs
        v-model="tab"
        color="primary"
        align-tabs="start"
      >
        <VTab value="info">
          <VIcon
            start
            size="18"
          >
            ri-user-settings-line
          </VIcon>
          Información Personal
        </VTab>
        <VTab value="seguridad">
          <VIcon
            start
            size="18"
          >
            ri-lock-password-line
          </VIcon>
          Seguridad
        </VTab>
      </VTabs>

      <VDivider />

      <VCardText class="pa-6">
        <VWindow v-model="tab">

          <!-- ── Tab: Información Personal ──────────────────────────────── -->
          <VWindowItem value="info">
            <VForm
              ref="refInfoForm"
              @submit.prevent="guardarInfo"
            >

              <!-- SECCIÓN: Nombres -->
              <p class="text-overline text-disabled mb-3">
                Nombres
              </p>
              <VRow>
                <VCol
                  cols="12"
                  md="4"
                >
                  <VTextField
                    v-model="infoForm.primer_nombre"
                    :rules="[requiredValidator]"
                    label="Primer nombre *"
                    placeholder="Ana"
                    prepend-inner-icon="ri-user-line"
                    variant="outlined"
                  />
                </VCol>
                <VCol
                  cols="12"
                  md="4"
                >
                  <VTextField
                    v-model="infoForm.segundo_nombre"
                    label="Segundo nombre"
                    placeholder="María"
                    prepend-inner-icon="ri-user-line"
                    variant="outlined"
                  />
                </VCol>
                <VCol
                  cols="12"
                  md="4"
                >
                  <VTextField
                    v-model="infoForm.tercer_nombre"
                    label="Tercer nombre"
                    placeholder="Sofía"
                    prepend-inner-icon="ri-user-line"
                    variant="outlined"
                  />
                </VCol>
              </VRow>

              <!-- SECCIÓN: Apellidos -->
              <p class="text-overline text-disabled mb-3 mt-2">
                Apellidos
              </p>
              <VRow>
                <VCol
                  cols="12"
                  md="4"
                >
                  <VTextField
                    v-model="infoForm.primer_apellido"
                    :rules="[requiredValidator]"
                    label="Primer apellido *"
                    placeholder="González"
                    prepend-inner-icon="ri-user-3-line"
                    variant="outlined"
                  />
                </VCol>
                <VCol
                  cols="12"
                  md="4"
                >
                  <VTextField
                    v-model="infoForm.segundo_apellido"
                    label="Segundo apellido"
                    placeholder="López"
                    prepend-inner-icon="ri-user-3-line"
                    variant="outlined"
                  />
                </VCol>
                <VCol
                  cols="12"
                  md="4"
                >
                  <VTextField
                    v-model="infoForm.apellido_casada"
                    label="Apellido de casada"
                    placeholder="de Pérez"
                    prepend-inner-icon="ri-user-heart-line"
                    variant="outlined"
                  />
                </VCol>
              </VRow>

              <!-- SECCIÓN: Datos de cuenta -->
              <p class="text-overline text-disabled mb-3 mt-2">
                Datos de cuenta
              </p>
              <VRow>
                <VCol
                  cols="12"
                  md="6"
                >
                  <VTextField
                    v-model="infoForm.email"
                    :rules="[requiredValidator, emailValidator]"
                    label="Correo electrónico *"
                    type="email"
                    placeholder="usuario@empresa.com"
                    prepend-inner-icon="ri-mail-line"
                    variant="outlined"
                  />
                </VCol>
                <VCol
                  cols="12"
                  md="6"
                >
                  <VTextField
                    v-model="infoForm.username"
                    label="Nombre de usuario"
                    placeholder="ana.gonzalez"
                    prepend-inner-icon="ri-at-line"
                    variant="outlined"
                    hint="Solo letras, números y puntos. Sin espacios."
                    persistent-hint
                  />
                </VCol>
              </VRow>

              <!-- SECCIÓN: Datos personales -->
              <p class="text-overline text-disabled mb-3 mt-4">
                Datos personales
              </p>
              <VRow>
                <VCol
                  cols="12"
                  md="4"
                >
                  <VTextField
                    v-model="infoForm.dpi"
                    label="DPI / CUI"
                    placeholder="0000 00000 0101"
                    prepend-inner-icon="ri-id-card-line"
                    variant="outlined"
                    maxlength="13"
                  />
                </VCol>
                <VCol
                  cols="12"
                  md="4"
                >
                  <VSelect
                    v-model="infoForm.genero"
                    :items="generosOpciones"
                    label="Género"
                    prepend-inner-icon="ri-user-heart-line"
                    variant="outlined"
                    clearable
                  />
                </VCol>
                <VCol
                  cols="12"
                  md="4"
                >
                  <VTextField
                    v-model="infoForm.fecha_nacimiento"
                    label="Fecha de nacimiento"
                    type="date"
                    prepend-inner-icon="ri-cake-line"
                    variant="outlined"
                  />
                </VCol>
                <VCol
                  cols="12"
                  md="4"
                >
                  <VTextField
                    v-model="infoForm.telefono"
                    label="Teléfono"
                    placeholder="+502 5555-5555"
                    prepend-inner-icon="ri-phone-line"
                    variant="outlined"
                    maxlength="15"
                  />
                </VCol>
              </VRow>

              <VRow class="mt-1">
                <VCol cols="12">
                  <VBtn
                    type="submit"
                    :loading="requestInProgress"
                    prepend-icon="ri-save-3-line"
                  >
                    Guardar Cambios
                  </VBtn>
                </VCol>
              </VRow>
            </VForm>
          </VWindowItem>

          <!-- ── Tab: Seguridad ─────────────────────────────────────────── -->
          <VWindowItem value="seguridad">
            <VForm
              ref="refSecurityForm"
              @submit.prevent="cambiarPassword"
            >
              <VRow>
                <VCol cols="12">
                  <VAlert
                    type="info"
                    variant="tonal"
                    density="compact"
                    class="mb-2"
                    prepend-icon="ri-information-line"
                  >
                    Usa una contraseña de al menos <strong>8 caracteres</strong> que no hayas usado en otro sitio.
                  </VAlert>
                </VCol>

                <VCol
                  cols="12"
                  md="6"
                >
                  <VTextField
                    v-model="securityForm.password_actual"
                    :rules="[requiredValidator]"
                    label="Contraseña actual"
                    placeholder="············"
                    :type="showPasswordActual ? 'text' : 'password'"
                    prepend-inner-icon="ri-lock-line"
                    :append-inner-icon="showPasswordActual ? 'ri-eye-off-line' : 'ri-eye-line'"
                    variant="outlined"
                    @click:append-inner="showPasswordActual = !showPasswordActual"
                  />
                </VCol>

                <VCol cols="12" />

                <VCol
                  cols="12"
                  md="6"
                >
                  <VTextField
                    v-model="securityForm.nueva_password"
                    :rules="[requiredValidator, minLengthRule]"
                    label="Nueva contraseña"
                    placeholder="············"
                    :type="showNuevaPassword ? 'text' : 'password'"
                    prepend-inner-icon="ri-lock-password-line"
                    :append-inner-icon="showNuevaPassword ? 'ri-eye-off-line' : 'ri-eye-line'"
                    variant="outlined"
                    @click:append-inner="showNuevaPassword = !showNuevaPassword"
                  />
                </VCol>

                <VCol
                  cols="12"
                  md="6"
                >
                  <VTextField
                    v-model="securityForm.nueva_password_confirmation"
                    :rules="[requiredValidator, confirmarPasswordRule]"
                    label="Confirmar nueva contraseña"
                    placeholder="············"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    prepend-inner-icon="ri-lock-check-line"
                    :append-inner-icon="showConfirmPassword ? 'ri-eye-off-line' : 'ri-eye-line'"
                    variant="outlined"
                    @click:append-inner="showConfirmPassword = !showConfirmPassword"
                  />
                </VCol>

                <VCol cols="12">
                  <VBtn
                    type="submit"
                    color="warning"
                    :loading="requestInProgress"
                    prepend-icon="ri-lock-password-line"
                  >
                    Cambiar Contraseña
                  </VBtn>
                </VCol>
              </VRow>
            </VForm>
          </VWindowItem>

        </VWindow>
      </VCardText>
    </VCard>
  </div>
</template>

<style scoped lang="scss">
.profile-cover {
  block-size: 185px;
  background: linear-gradient(
    135deg,
    rgb(var(--v-theme-primary)) 0%,
    color-mix(in srgb, rgb(var(--v-theme-primary)) 60%, rgb(var(--v-theme-secondary))) 60%,
    rgb(var(--v-theme-secondary)) 100%
  );
  position: relative;
  overflow: hidden;
}

.profile-cover-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
}

.profile-cover-circle-1 {
  inline-size: 220px;
  block-size: 220px;
  inset-block-start: -60px;
  inset-inline-start: -40px;
}

.profile-cover-circle-2 {
  inline-size: 160px;
  block-size: 160px;
  inset-block-end: -50px;
  inset-inline-end: 10%;
  background: rgba(255, 255, 255, 0.06);
}

.profile-cover-circle-3 {
  inline-size: 90px;
  block-size: 90px;
  inset-block-start: 20px;
  inset-inline-end: 30%;
  background: rgba(255, 255, 255, 0.12);
}

.profile-avatar-wrapper {
  position: relative;
  display: inline-block;
  margin-block-start: -55px;
  cursor: pointer;

  &:hover .avatar-overlay {
    opacity: 1;
  }
}

.profile-avatar {
  border: 4px solid rgb(var(--v-theme-surface));
  display: block;
}

.avatar-overlay {
  position: absolute;
  inset: 4px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
  cursor: pointer;

  &--uploading {
    opacity: 1;
  }
}
</style>
