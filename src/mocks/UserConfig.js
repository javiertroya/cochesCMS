import { PencilLine, ShieldCheck } from 'lucide-react'

export const ROLE_CONFIG = {
    admin:  { label: 'Administrador', variant: 'destructive', icon: ShieldCheck, description: 'Acceso completo al panel' },
    editor: { label: 'Editor',        variant: 'default',     icon: PencilLine,  description: 'Contenido, vehículos, multimedia y solicitudes' },
}

export const ROLE_LABELS = Object.fromEntries(
    Object.entries(ROLE_CONFIG).map(([role, config]) => [role, config.label]),
)
