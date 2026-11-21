<script setup lang="ts">
import { computed, ref } from 'vue'
import type { EnviarPruebaPayload } from '@/types/notificaciones'

definePageMeta({
  middleware: 'permissions',
  action: 'enviar notificaciones',
  subject: 'Notificacion',
})

const { post } = useClienteRequest()
const { showToastSuccess, showToastError } = useToast()

const canales = [
  { title: 'Correo electrónico', value: 'email', icon: 'ri-mail-line' },
  { title: 'WhatsApp', value: 'whatsapp', icon: 'ri-whatsapp-line' },
]

const { nombre: nombreEmpresa } = useEmpresaInfo()

const form = ref({
  canal: 'email' as EnviarPruebaPayload['canal'],
  destinatario: '',
  asunto: `Mensaje de prueba - ${nombreEmpresa}`,
  mensaje: '',
  plantilla: '',
  parametros: '',
})

const enviando = ref(false)
const formRef = ref()
const ultimoResultado = ref<{ canal: string; estado: string; destinatario: string } | null>(null)

const esEmail = computed(() => form.value.canal === 'email')

const labelDestinatario = computed(() =>
  esEmail.value ? 'Correo del destinatario' : 'Teléfono (con código de país, ej. 502XXXXXXXX)',
)

const enviar = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid)
    return

  enviando.value = true
  ultimoResultado.value = null
  try {
    const parametros = form.value.parametros
      .split(',')
      .map(p => p.trim())
      .filter(Boolean)

    const payload: EnviarPruebaPayload = {
      canal: form.value.canal,
      destinatario: form.value.destinatario.trim(),
      ...(esEmail.value
        ? { asunto: form.value.asunto, mensaje: form.value.mensaje }
        : form.value.plantilla.trim()
          ? { plantilla: form.value.plantilla.trim(), parametros }
          : { mensaje: form.value.mensaje }
      ),
    }

    const res: any = await post('api/configuracion/notificacion/prueba', payload)

    showToastSuccess(res.message ?? 'Mensaje enviado correctamente.')
    ultimoResultado.value = {
      canal: res.data?.canal ?? form.value.canal,
      estado: res.data?.estado ?? 'enviado',
      destinatario: res.data?.destinatario ?? form.value.destinatario,
    }
  }
  catch (e: any) {
    showToastError(e?.message ?? 'No se pudo enviar el mensaje.')
  }
  finally {
    enviando.value = false
  }
}
</script>

<template>
  <div class="d-flex flex-wrap justify-space-between align-center gap-3 mb-6">
    <div>
      <h1 class="text-h5 font-weight-bold">
        Enviar Mensaje de Prueba
      </h1>
      <p class="text-body-2 text-medium-emphasis mb-0">
        Verifica que el envío por correo y WhatsApp esté funcionando. Cada envío queda registrado en la bitácora.
      </p>
    </div>
    <VBtn
      variant="tonal"
      color="info"
      to="/configuracion/notificaciones"
      prepend-icon="ri-history-line"
    >
      Ver Bitácora
    </VBtn>
  </div>

  <VRow>
    <VCol cols="12" md="7">
      <VCard>
        <VCardText>
          <VForm ref="formRef" @submit.prevent="enviar">
            <VRow>
              <VCol cols="12">
                <VSelect
                  v-model="form.canal"
                  :items="canales"
                  label="Canal"
                  variant="outlined"
                  :rules="[requiredValidator]"
                >
                  <template #selection="{ item }">
                    <VIcon :icon="item.raw.icon" size="18" class="me-2" />
                    {{ item.title }}
                  </template>
                  <template #item="{ item, props }">
                    <VListItem v-bind="props" :title="item.title">
                      <template #prepend>
                        <VIcon :icon="item.raw.icon" size="18" />
                      </template>
                    </VListItem>
                  </template>
                </VSelect>
              </VCol>

              <VCol cols="12">
                <VTextField
                  v-model="form.destinatario"
                  :label="labelDestinatario"
                  variant="outlined"
                  :rules="esEmail ? [requiredValidator, emailValidator] : [requiredValidator]"
                />
              </VCol>

              <VCol v-if="esEmail" cols="12">
                <VTextField
                  v-model="form.asunto"
                  label="Asunto"
                  variant="outlined"
                  :rules="[requiredValidator]"
                />
              </VCol>

              <!-- Email: texto libre -->
              <VCol v-if="esEmail" cols="12">
                <VTextarea
                  v-model="form.mensaje"
                  label="Mensaje"
                  variant="outlined"
                  rows="5"
                  counter="4000"
                  :rules="[requiredValidator]"
                />
              </VCol>

              <!-- WhatsApp: plantilla aprobada por Meta o texto libre -->
              <template v-else>
                <VCol cols="12">
                  <VAlert type="info" variant="tonal" density="compact" class="mb-2">
                    Indicá una <strong>plantilla aprobada</strong> por Meta con sus parámetros, o dejala vacía para
                    enviar texto libre (solo funciona si el destinatario escribió en las últimas 24 h).
                  </VAlert>
                </VCol>
                <VCol cols="12" md="6">
                  <VTextField
                    v-model="form.plantilla"
                    label="Nombre de la plantilla (opcional)"
                    variant="outlined"
                    placeholder="Ej. hello_world"
                  />
                </VCol>
                <VCol cols="12" md="6">
                  <VTextField
                    v-model="form.parametros"
                    label="Parámetros (separados por coma)"
                    variant="outlined"
                    placeholder="Ej. Juan Pérez, 20/11/2026"
                    :disabled="!form.plantilla"
                  />
                </VCol>
                <VCol v-if="!form.plantilla" cols="12">
                  <VTextarea
                    v-model="form.mensaje"
                    label="Mensaje"
                    variant="outlined"
                    rows="4"
                    counter="4000"
                    :rules="[requiredValidator]"
                  />
                </VCol>
              </template>

              <VCol cols="12" class="d-flex gap-3">
                <VBtn
                  type="submit"
                  color="primary"
                  :loading="enviando"
                  prepend-icon="ri-send-plane-line"
                >
                  Enviar
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>

    <VCol cols="12" md="5">
      <VCard v-if="ultimoResultado" variant="tonal" color="success">
        <VCardText>
          <div class="d-flex align-center gap-2 mb-2">
            <VIcon icon="ri-checkbox-circle-line" />
            <span class="text-subtitle-1 font-weight-bold">Último envío</span>
          </div>
          <p class="mb-1">
            <strong>Canal:</strong> {{ ultimoResultado.canal === 'whatsapp' ? 'WhatsApp' : 'Correo' }}
          </p>
          <p class="mb-1">
            <strong>Destinatario:</strong> {{ ultimoResultado.destinatario }}
          </p>
          <p class="mb-0">
            <strong>Estado:</strong> {{ ultimoResultado.estado }}
          </p>
        </VCardText>
      </VCard>

      <VCard variant="flat" border class="mt-4">
        <VCardText class="text-body-2 text-medium-emphasis">
          <p class="font-weight-medium text-high-emphasis mb-2">
            Notas
          </p>
          <ul class="ps-4 mb-0">
            <li>El correo usa la configuración SMTP del sistema.</li>
            <li>
              Para WhatsApp, el número debe estar en la lista de destinatarios de prueba de Meta
              mientras la app esté en modo desarrollo.
            </li>
            <li>El estado puede pasar a "entregado" o "leído" luego, vía el webhook de WhatsApp.</li>
          </ul>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>
