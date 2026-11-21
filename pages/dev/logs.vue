<script setup lang="ts">
definePageMeta({
  middleware: 'permissions',
  action: 'ver logs sistema',
  subject: 'DevHerramienta',
})

// Redirige al nuevo Visor de Logs
const router = useRouter()
onMounted(() => router.replace('/dev/log'))
</script>

<template>
  <div />
</template>
