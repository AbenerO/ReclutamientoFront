<script setup lang="ts">
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'

definePageMeta({
  layout: 'blank',
})

const { login } = useSanctumAuth()

const form = ref({
  email: '',
  password: '',
})

interface LoginForm {
  email: string
  password: string
}

const error = ref<string | null>(null)
const isLoading = ref(false)

// Mensajes del servidor en español
const mensajeDeError = (e: any): string => {
  // ofetch lanza FetchError: el cuerpo de la respuesta está en e.data o e.response._data
  const serverMsg: string | undefined
    = e?.data?.message ?? e?.response?._data?.message

  if (serverMsg) {
    const lower = serverMsg.toLowerCase()

    // Claves de traducción de Laravel (cuando no hay lang/es configurado)
    if (lower === 'auth.failed' || lower.includes('credentials') || lower.includes('credencial'))
      return 'Las credenciales ingresadas no son correctas.'
    if (lower === 'auth.throttle' || lower.includes('too many') || lower.includes('throttle'))
      return 'Demasiados intentos. Espera un momento antes de volver a intentarlo.'
    if (lower.includes('inactive') || lower.includes('inactiv'))
      return 'Tu cuenta está inactiva. Contacta al administrador.'

    // Devolver el mensaje original si no hay traducción
    return serverMsg
  }

  // Fallback genérico según el código HTTP
  const status: number = e?.status ?? e?.statusCode ?? 0
  if (status === 401 || status === 422)
    return 'Las credenciales ingresadas no son correctas.'
  if (status === 429)
    return 'Demasiados intentos. Espera un momento antes de volver a intentarlo.'
  if (status === 0 || status >= 500)
    return 'No se pudo conectar con el servidor. Intenta de nuevo.'

  return 'Error al iniciar sesión. Inténtalo de nuevo.'
}

const onSubmit = async (): Promise<void> => {
  error.value = null
  isLoading.value = true
  try {
    await login(form.value as LoginForm)
  }
  catch (e: unknown) {
    error.value = mensajeDeError(e)
  }
  finally {
    isLoading.value = false
  }
}

const isPasswordVisible = ref(false)
</script>

<template>
  <div class="login-fondo d-flex align-center justify-center pa-4">
    <!-- Tema oscuro solo para la tarjeta, así el texto y los campos se ven claros sobre el fondo de color -->
    <VThemeProvider theme="dark">
      <VCard
        width="100%"
        :max-width="440"
        class="login-card pa-4 pa-sm-6"
        elevation="0"
      >
      <VCardText class="text-center">
        <div class="d-flex align-center justify-center gap-x-3 mb-4">
          <VNodeRenderer :nodes="themeConfig.app.logo" />
          <h4 class="text-h4">
            {{ themeConfig.app.title }}
          </h4>
        </div>

        <h5 class="text-h5 mb-1">
          Sistema de Reclutamiento y Selección de Personal
        </h5>
        <p class="mb-0">
          Inicia sesión para continuar
        </p>
      </VCardText>

      <VCardText>
        <VForm @submit.prevent="onSubmit">
          <VRow>
            <VCol
              v-if="error"
              cols="12"
            >
              <VAlert
                type="error"
                variant="tonal"
                closable
                @click:close="error = null"
              >
                {{ error }}
              </VAlert>
            </VCol>

            <VCol cols="12">
              <VTextField
                v-model="form.email"
                autofocus
                label="Nombre de usuario"
                prepend-inner-icon="ri-at-line"
                autocomplete="username"
              />
            </VCol>

            <VCol cols="12">
              <VTextField
                v-model="form.password"
                label="Contraseña"
                prepend-inner-icon="ri-lock-line"
                :type="isPasswordVisible ? 'text' : 'password'"
                autocomplete="current-password"
                :append-inner-icon="isPasswordVisible ? 'ri-eye-off-line' : 'ri-eye-line'"
                @click:append-inner="isPasswordVisible = !isPasswordVisible"
              />
            </VCol>

            <VCol cols="12">
              <VBtn
                block
                type="submit"
                :loading="isLoading"
                :disabled="isLoading"
              >
                Iniciar Sesión
              </VBtn>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
      </VCard>
    </VThemeProvider>
  </div>
</template>

<style scoped>
.login-fondo {
  min-block-size: 100vh;
  /* Base de color sólido (sin blanco) y encima manchas de luz */
  background-color: #0f766e;
  background-image:
    radial-gradient(circle at 15% 20%, rgba(14, 165, 233, 0.75) 0, transparent 50%), /* azul cielo */
    radial-gradient(circle at 85% 15%, rgba(20, 184, 166, 0.6) 0, transparent 45%), /* verde azulado */
    radial-gradient(circle at 80% 85%, rgba(16, 185, 129, 0.6) 0, transparent 50%), /* verde esmeralda */
    radial-gradient(circle at 10% 90%, rgba(6, 182, 212, 0.55) 0, transparent 45%), /* turquesa */
    linear-gradient(135deg, #0369a1, #0f766e 55%, #047857); /* azul → verde */
}

/* Tarjeta de vidrio: oscura y translúcida, con el fondo de color visible detrás */
.login-card {
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(8, 47, 73, 0.55) !important;
  backdrop-filter: blur(14px);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35) !important;
}
</style>
