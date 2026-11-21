export type CanalNotificacion = 'email' | 'whatsapp'

export type EstadoNotificacion =
  | 'pendiente'
  | 'enviado'
  | 'fallido'
  | 'entregado'
  | 'leido'

/** 'prueba' | 'manual' u otro identificador del módulo que envía */
export type OrigenNotificacion = string

export interface NotificacionInterface {
  id: number
  canal: CanalNotificacion
  destinatario: string
  asunto: string | null
  cuerpo: string
  estado: EstadoNotificacion
  error: string | null
  origen: OrigenNotificacion
  notificable_type: string | null
  notificable_id: number | null
  wamid: string | null
  enviado_en: string | null
  created_at: string | null
  updated_at: string | null
}

export interface EnviarPruebaPayload {
  canal: CanalNotificacion
  destinatario: string
  asunto?: string | null
  mensaje?: string
  /** WhatsApp: nombre de plantilla aprobada por Meta */
  plantilla?: string
  parametros?: string[]
}
