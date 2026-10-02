// Estados de una solicitud (deben coincidir con el CHECK de la tabla requests)
export const REQUEST_STATUSES = [
    { value: 'nueva',         label: 'Nueva',         dot: 'bg-blue-500',    badge: 'bg-blue-50 text-blue-700 ring-blue-100' },
    { value: 'en_curso',      label: 'En curso',      dot: 'bg-amber-500',   badge: 'bg-amber-50 text-amber-700 ring-amber-100' },
    { value: 'presupuestada', label: 'Presupuestada', dot: 'bg-violet-500',  badge: 'bg-violet-50 text-violet-700 ring-violet-100' },
    { value: 'cerrada',       label: 'Cerrada',       dot: 'bg-gray-400',    badge: 'bg-gray-100 text-gray-600 ring-gray-200' },
]

export const getRequestStatus = (value) =>
    REQUEST_STATUSES.find((status) => status.value === value) ?? REQUEST_STATUSES[0]

export const REQUEST_TYPE_OPTIONS = [
    { value: '', label: 'Todos los tipos' },
    { value: 'contacto', label: 'Contacto' },
    { value: 'importacion_busqueda', label: 'Importación · búscame un coche' },
    { value: 'importacion_encontrado', label: 'Importación · ya lo he encontrado' },
]

// Texto corto para el listado: mensaje (contacto) o coche + dato principal (importación)
export const getRequestPreview = (request) => {
    const data = request.data ?? {}
    if (data.message) return data.message
    const vehicle = [data.brand, data.model, data.version].filter(Boolean).join(' ')
    const extra = (request.summary ?? []).find((item) => ['max_budget', 'listing_price'].includes(item.key))
    return [vehicle, extra && `${extra.label}: ${extra.value}`].filter(Boolean).join(' · ')
}

export const formatRequestDate = (value) => {
    if (!value) return ''
    return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    }).format(new Date(value))
}
