export const INPUT_CLS = 'w-full rounded-lg border border-[#e5e7eb] bg-[#f9fafb] pl-3 pr-9 py-2 text-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary/20'

// Carpeta de subida por colección (ver UPLOAD_TARGETS en server/app/routes/upload_routes.py)
const COLLECTION_UPLOAD_TARGETS = {
    noticias: 'noticias',
    coches: 'vehiculos',
}

export const getCollectionUploadTarget = (collection) =>
    COLLECTION_UPLOAD_TARGETS[collection?.slug] ?? 'media'

export const getItemLabel = (item) => {
    if (!item) return ''

    const data = item?.data ?? {}
    const name =
        data.name ?? data.nombre ?? data.title ?? data.titular ??
        item?.name ?? item?.nombre ?? item?.title ?? item?.titular
    if (name) return name

    const anyStr = Object.values(data).find(value =>
        typeof value === 'string' && value.length > 1 && !/^\d{4}-\d{2}/.test(value)
    )
    return anyStr ?? `#${item?.id ?? item?.global_id}`
}

// Noticias: fotos en `images` (nuevo) o `photo` (antiguo) → lista única
export const normalizeNewsImages = (data = {}) => {
    const images = Array.isArray(data.images) ? data.images : []
    const values = [...images, data.photo]
        .filter(value => typeof value === 'string' && value.trim())
        .map(value => value.trim())

    return [...new Set(values)]
}

export const formatExpandedValue = (value) => {
    if (Array.isArray(value)) return value.join('\n')
    if (value && typeof value === 'object') return JSON.stringify(value, null, 2)
    return String(value ?? '—')
}

// ── Filtros de la tabla del panel ──────────────────────────────────────────

// Filtros Sí/No por campo de estado: 'active' = true, 'inactive' = false
const STATUS_FILTERS = {
    activo: { label: 'Estado', isOn: data => data.activo !== false },
    destacado: { label: 'Destacado', isOn: data => data.destacado === true, trueLabel: 'Destacados', falseLabel: 'No destacados' },
}

const COLLECTION_FILTERS = {
    coches: ['activo', 'destacado'],
}

export const getAdminFilterDefinitions = (slug) =>
    (COLLECTION_FILTERS[slug] ?? []).map(key => {
        const { label, trueLabel, falseLabel } = STATUS_FILTERS[key]
        return { key, label, type: 'boolean', trueLabel, falseLabel }
    })

export const itemMatchesAdminFilters = (item, filters) => {
    const data = item?.data ?? {}
    return Object.entries(filters).every(([key, value]) => {
        if (!value || !STATUS_FILTERS[key]) return true
        return STATUS_FILTERS[key].isOn(data) === (value === 'active')
    })
}
