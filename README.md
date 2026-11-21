# SysBase — Frontend (Nuxt 3)

Panel de administración en Nuxt 3 + Vue 3 + Vuetify (plantilla Materialize). Se conecta al backend
Laravel (`ReclutamientoBack`) con autenticación por cookie usando `nuxt-auth-sanctum`.
Es una SPA (`ssr: false`).

## Requisitos

- Node.js 18+ y npm
- El backend corriendo en `http://localhost:8000` (ver el README del backend)

## Puesta en marcha

```sh
npm install
cp .env.example .env
npm run dev
```

La app queda en `http://localhost:3000`. Usuario inicial: `admin` / `12345`.

## Variables `.env`

| Variable | Valor local | Para qué |
|---|---|---|
| `NUXT_PUBLIC_API_BASE_URL` | `http://localhost:8000` | URL del backend. **Solo el host, sin `/api`**: las llamadas ya incluyen el prefijo (`api/user`, `api/login`, ...) y el endpoint CSRF es `/sanctum/csrf-cookie` |
| `NUXT_DEV_HOST` | `localhost` | Host del servidor de desarrollo (puerto 3000) |
| `NUXT_PUBLIC_EMPRESA_NOMBRE` | `SysBase` | Nombre en encabezados, impresiones y PDFs |
| `NUXT_PUBLIC_EMPRESA_COLOR` / `_COLOR_CLARO` | `#666CFF` / `#F0F0FF` | Colores de marca |
| `NUXT_PUBLIC_EMPRESA_LOGO` | `/logo.svg` | Logo |

Nuxt lee el `.env` solo al arrancar: después de cambiarlo, reiniciar `npm run dev`.

## Conexión con el backend

- El front usa cookies de sesión (Sanctum, modo `cookie`). El origen del front debe estar en
  `FRONTEND_URL` y `SANCTUM_STATEFUL_DOMAINS` del `.env` del backend (`localhost:3000`).
- Para llamar a la API usar `useSanctumClient()`: `client('api/perfil')`.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga en caliente |
| `npm run build` | Compilación de producción |
| `npm run generarCrudV3` | Genera un CRUD en el front para un módulo creado con `php artisan make:api` en el backend |
