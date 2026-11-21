export interface UsuarioInterface {
  id?: number | null
  primer_nombre: string | null
  segundo_nombre?: string | null
  tercer_nombre?: string | null
  primer_apellido: string | null
  segundo_apellido?: string | null
  apellido_casada?: string | null
  username: string | null
  email: string | null
  password?: string | null
  dpi?: string | null
  genero?: string | null
  fecha_nacimiento?: string | null
  telefono?: string | null
  estado?: boolean
  nombre_completo?: string | null
  primer_nombre_apellido?: string | null
  avatar?: string | null
  roles?: { id: number; name: string }[]
  permissions?: { id: number; name: string }[]
}