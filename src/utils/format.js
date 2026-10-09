const numberFormat = new Intl.NumberFormat('es-ES')

// useGrouping 'always': "5.000 €" (por defecto es-ES no separa los miles con 4 cifras)
const priceFormat = new Intl.NumberFormat('es-ES', {
    style: 'currency', currency: 'EUR', maximumFractionDigits: 0, useGrouping: 'always',
})

// Sin forzar separador: los años (2022) no deben salir como "2.022"
export const formatNumber = (value) => numberFormat.format(Number(value ?? 0))

export const formatPrice = (value) => {
    const number = Number(value)
    return Number.isFinite(number) ? priceFormat.format(number) : String(value)
}

// Fechas "AAAA-MM-DD" (sin hora) se interpretan en hora local, no en UTC
export const parseDate = (value) => {
    if (!value) return null
    const date = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
        ? new Date(`${value}T00:00:00`)
        : new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
}

// "05 oct 2026" por defecto; options sobrescribe el formato (p. ej. { month: 'long' })
export const formatDate = (value, options = {}) => {
    const date = parseDate(value)
    if (!date) return ''
    return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric', ...options }).format(date)
}

// "05 oct 2026, 11:45"
export const formatDateTime = (value) => formatDate(value, { hour: '2-digit', minute: '2-digit' })

// "Hace un momento", "Hace 5 min", "Hace 3 h"; a partir de un día, la fecha corta
export const formatRelativeTime = (value) => {
    const date = parseDate(value)
    if (!date) return '—'
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
    if (seconds < 60) return 'Hace un momento'
    if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} min`
    if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)} h`
    return formatDate(date, { day: 'numeric', year: undefined })
}
