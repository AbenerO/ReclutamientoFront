<script setup lang="ts">
import { useGenerateImageVariant } from '@/@core/composable/useGenerateImageVariant'
import authV2LoginIllustrationBorderedDark from '@images/pages/auth-v2-login-illustration-bordered-dark.png'
import authV2LoginIllustrationBorderedLight from '@images/pages/auth-v2-login-illustration-bordered-light.png'
import authV2LoginIllustrationDark from '@images/pages/auth-v2-login-illustration-dark.png'
import authV2LoginIllustrationLight from '@images/pages/auth-v2-login-illustration-light.png'
import authV2LoginMaskDark from '@images/pages/auth-v2-login-mask-dark.png'
import authV2LoginMaskLight from '@images/pages/auth-v2-login-mask-light.png'
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
  const serverMsg: string | undefined =
    e?.data?.message ?? e?.response?._data?.message

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
const authV2LoginMask = useGenerateImageVariant(authV2LoginMaskLight, authV2LoginMaskDark)
const authV2LoginIllustration = useGenerateImageVariant (authV2LoginIllustrationLight, authV2LoginIllustrationDark, authV2LoginIllustrationBorderedLight, authV2LoginIllustrationBorderedDark, true)
</script>

<template>
  <a href="javascript:void(0)">
    <div class="app-logo auth-logo">
      <VNodeRenderer :nodes="themeConfig.app.logo" />
      <h1 class="app-logo-title">
        {{ themeConfig.app.title }}
      </h1>
    </div>
  </a>

  <VRow
    no-gutters
    class="auth-wrapper"
  >
    <VCol
      md="8"
      class="d-none d-md-flex align-center justify-center position-relative"
    >
      <div class="d-flex align-center justify-center pa-10">
        <img
          :src="authV2LoginIllustration"
          class="auth-illustration w-100"
          alt="auth-illustration"
        >
      </div>
      <VImg
        :src="authV2LoginMask"
        class="d-none d-md-flex auth-footer-mask"
        alt="auth-mask"
      />
    </VCol>
    <VCol
      cols="12"
      md="4"
      class="auth-card-v2 d-flex align-center justify-center"
      style="background-color: rgb(var(--v-theme-surface));"
    >
      <VCard
        flat
        :max-width="500"
        class="mt-12 mt-sm-0 pa-5 pa-lg-7"
      >
        <VCardText>
          <h4 class="text-h4 mb-1 text-center">
            <span class="text-capitalize">{{ themeConfig.app.title }}! 👋🏻</span>
          </h4>

          <p class="mb-0 text-center">
            Inicia sesión en tu cuenta
          </p>
        </VCardText>

        <VCardText>
          <VForm @submit.prevent="onSubmit">
            <VRow>
              <!-- Error alert -->
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

              <!-- username -->
              <VCol cols="12">
                <VTextField
                  v-model="form.email"
                  autofocus
                  label="Nombre de usuario"
                  placeholder="admin"
                  prepend-inner-icon="ri-at-line"
                  autocomplete="username"
                />
              </VCol>

              <!-- password -->
              <VCol cols="12">
                <VTextField
                  v-model="form.password"
                  class="mb-4"
                  label="Contraseña"
                  placeholder="············"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  autocomplete="password"
                  :append-inner-icon="isPasswordVisible ? 'ri-eye-off-line' : 'ri-eye-line'"
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                />

                <!-- login button -->
                <VBtn
                  block
                  type="submit"
                  :loading="isLoading"
                  :disabled="isLoading"
                >
                  Iniciar Sesión
                </VBtn>
              </VCol>

              <!-- create account -->
              <VCol
                cols="12"
                class="text-body-1 text-center"
              >
                <span class="d-inline-block">
                  Ingresa correctamente tus credenciales
                </span>
              </VCol>

              <VCol
                cols="12"
                class="d-flex align-center"
              >
                <VDivider />
                <span class="mx-4 text-high-emphasis">-</span>
                <VDivider />
              </VCol>


            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth";
</style>
