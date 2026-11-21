<script setup lang="ts">
import type { VForm } from 'vuetify/components/VForm'
import type { UsuarioInterface } from '@/types/usuarios'
import DualListBox from '@/components/DualListBox.vue'

const props = defineProps({
  item: {
    type: Object as () => UsuarioInterface | null,
    default: null,
  },
})

const emit = defineEmits<{
  (e: 'emitirDatos', value: UsuarioInterface): void
}>()

const { get } = useClienteRequest()

const isFormValid = ref(false)
const refForm = ref<VForm>()

const todosRoles = ref<{ id: number; name: string }[]>([])
const todosPermisos = ref<{ id: number; name: string }[]>([])

const isEditing = computed(() => !!props.item?.id)

const data = ref<UsuarioInterface>({
  primer_nombre: null,
  segundo_nombre: null,
  tercer_nombre: null,
  primer_apellido: null,
  segundo_apellido: null,
  apellido_casada: null,
  username: null,
  email: null,
  password: null,
  dpi: null,
  genero: null,
  fecha_nacimiento: null,
  telefono: null,
  estado: true,
  roles: [],
  permissions: [],
})

if (props.item) {
  data.value = {
    ...props.item,
    password: null,
    roles: props.item.roles ?? [],
    permissions: props.item.permissions ?? [],
  }
}

const fetchCatalogos = async () => {
  const [rolesRes, permisosRes] = await Promise.all([
    get('api/roles?per_page=100'),
    get('api/permissions?per_page=500'),
  ])
  todosRoles.value = rolesRes?.data?.data ?? []
  todosPermisos.value = permisosRes?.data?.data ?? []
}

fetchCatalogos()

// ─── Generación automática de username ─────────────────────────────────────
const normalizar = (s: string) =>
  s.normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/gi, '')
    .toLowerCase()

const usernameGenerado = computed(() => {
  const nombre   = normalizar(data.value.primer_nombre ?? '').slice(0, 3)
  const apellido = normalizar(data.value.primer_apellido ?? '')
  if (!nombre && !apellido) return ''
  return `cz${nombre}${apellido}`
})

const usernameEditadoManualmente = ref(false)

watch(usernameGenerado, (val) => {
  if (!isEditing.value && !usernameEditadoManualmente.value)
    data.value.username = val
})

const anioActual = new Date().getFullYear()

// ─── Submit ─────────────────────────────────────────────────────────────────
const onSubmit = () => {
  refForm.value?.validate().then(({ valid }) => {
    if (valid)
      emit('emitirDatos', data.value)
  })
}
</script>

<template>
  <VForm ref="refForm" v-model="isFormValid" @submit.prevent="onSubmit">
    <VRow>
      <!-- Nombres -->
      <VCol cols="12" md="4">
        <VTextField
          :id="useId()"
          v-model="data.primer_nombre"
          :rules="[requiredValidator]"
          label="Primer Nombre"
          placeholder="Ingrese primer nombre"
        />
      </VCol>
      <VCol cols="12" md="4">
        <VTextField
          :id="useId()"
          v-model="data.segundo_nombre"
          label="Segundo Nombre"
          placeholder="Ingrese segundo nombre"
        />
      </VCol>
      <VCol cols="12" md="4">
        <VTextField
          :id="useId()"
          v-model="data.tercer_nombre"
          label="Tercer Nombre"
          placeholder="Ingrese tercer nombre"
        />
      </VCol>

      <!-- Apellidos -->
      <VCol cols="12" md="4">
        <VTextField
          :id="useId()"
          v-model="data.primer_apellido"
          :rules="[requiredValidator]"
          label="Primer Apellido"
          placeholder="Ingrese primer apellido"
        />
      </VCol>
      <VCol cols="12" md="4">
        <VTextField
          :id="useId()"
          v-model="data.segundo_apellido"
          label="Segundo Apellido"
          placeholder="Ingrese segundo apellido"
        />
      </VCol>
      <VCol cols="12" md="4">
        <VTextField
          :id="useId()"
          v-model="data.apellido_casada"
          label="Apellido de Casada"
          placeholder="Ingrese apellido de casada"
        />
      </VCol>

      <!-- Acceso -->
      <VCol cols="12" md="6" sm="6">
        <VTextField
          :id="useId()"
          v-model="data.username"
          :rules="[requiredValidator]"
          label="Username"
          placeholder="Se genera automáticamente"
          :hint="!isEditing ? 'Se genera desde nombre y apellido. Puedes modificarlo.' : ''"
          persistent-hint
          @input="usernameEditadoManualmente = true"
        />
      </VCol>
      <VCol cols="12" md="6" sm="6">
        <VTextField
          :id="useId()"
          v-model="data.email"
          :rules="[requiredValidator, emailValidator]"
          label="Correo Electrónico"
          placeholder="Ingrese correo"
          type="email"
        />
      </VCol>

      <!-- Contraseña -->
      <VCol v-if="isEditing" cols="12" md="6" sm="6">
        <VTextField
          :id="useId()"
          v-model="data.password"
          label="Nueva Contraseña"
          placeholder="Dejar vacío para no cambiar"
          type="password"
        />
      </VCol>
      <VCol v-if="!isEditing" cols="12" md="6" sm="6" class="d-flex align-center">
        <VAlert type="info" variant="tonal" density="compact" icon="tabler-key" class="w-100">
          Contraseña inicial: <strong>Cz{{ anioActual }}00</strong>
        </VAlert>
      </VCol>

      <!-- Estado -->
      <VCol cols="12" md="6" sm="6" class="d-flex align-center">
        <VSwitch v-model="data.estado" label="Usuario Activo" color="success" hide-details />
      </VCol>

      <!-- Datos personales -->
      <VCol cols="12" md="4">
        <VTextField
          :id="useId()"
          v-model="data.dpi"
          label="DPI"
          placeholder="Ingrese DPI"
        />
      </VCol>
      <VCol cols="12" md="4">
        <VSelect
          :id="useId()"
          v-model="data.genero"
          :items="['Masculino', 'Femenino', 'Otro']"
          label="Género"
          placeholder="Seleccione género"
          clearable
        />
      </VCol>
      <VCol cols="12" md="4">
        <AppDateTimePicker
          :id="useId()"
          v-model="data.fecha_nacimiento"
          label="Fecha de Nacimiento"
          placeholder="Seleccione fecha"
        />
      </VCol>
      <VCol cols="12" md="6" sm="6">
        <VTextField
          :id="useId()"
          v-model="data.telefono"
          label="Teléfono"
          placeholder="Ingrese teléfono"
        />
      </VCol>

      <!-- Roles y Permisos en paneles separados -->
      <VCol cols="12">
        <VExpansionPanels variant="popout" class="mt-2">

          <!-- Panel Roles -->
          <VExpansionPanel>
            <VExpansionPanelTitle>
              <div class="d-flex align-center gap-2">
                <VIcon icon="ri-shield-user-line" size="20" />
                <span class="font-weight-medium">Roles asignados</span>
                <VChip
                  v-if="(data.roles ?? []).length"
                  size="x-small"
                  color="primary"
                  class="ms-1"
                >
                  {{ (data.roles ?? []).length }}
                </VChip>
              </div>
            </VExpansionPanelTitle>
            <VExpansionPanelText>
              <DualListBox
                :items="todosRoles"
                :selected-items="data.roles ?? []"
                tipo="Roles"
                @update:selected-items="data.roles = $event"
              />
            </VExpansionPanelText>
          </VExpansionPanel>

          <!-- Panel Permisos directos -->
          <VExpansionPanel>
            <VExpansionPanelTitle>
              <div class="d-flex align-center gap-2">
                <VIcon icon="ri-key-2-line" size="20" />
                <span class="font-weight-medium">Permisos directos</span>
                <VChip
                  v-if="(data.permissions ?? []).length"
                  size="x-small"
                  color="warning"
                  class="ms-1"
                >
                  {{ (data.permissions ?? []).length }}
                </VChip>
                <VChip size="x-small" variant="outlined" class="ms-1">opcional</VChip>
              </div>
            </VExpansionPanelTitle>
            <VExpansionPanelText>
              <p class="text-caption text-medium-emphasis mb-3">
                Los permisos directos se suman a los que ya otorga el rol asignado.
              </p>
              <DualListBox
                :items="todosPermisos"
                :selected-items="data.permissions ?? []"
                tipo="Permisos"
                @update:selected-items="data.permissions = $event"
              />
            </VExpansionPanelText>
          </VExpansionPanel>

        </VExpansionPanels>
      </VCol>

      <VCol cols="12">
        <VBtn type="submit" class="me-3">
          <VIcon class="mr-2 ri-save-3-fill" />
          Guardar
        </VBtn>
        <VBtn type="reset" variant="tonal" color="error" to="/admin/usuarios">
          <VIcon class="mr-2 ri-contract-left-fill" />
          Cancelar
        </VBtn>
      </VCol>
    </VRow>
  </VForm>
</template>