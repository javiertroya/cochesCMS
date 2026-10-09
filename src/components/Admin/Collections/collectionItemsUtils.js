export const INPUT_CLS = 'w-full rounded-lg border border-[#e5e7eb] bg-[#f9fafb] pl-3 pr-9 py-2 text-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary/20'

export const EXPAND_TEXT_LENGTH = 28

const COLLECTION_UPLOAD_TARGETS = {
    cursos: 'cursos',
    'cursos-iniciacion': 'cursos',
    equipamientos: 'equipamiento',
    'equipo-tecnico': 'equipo-tecnico',
    noticias: 'noticias',
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

export const toKey = (value) => value == null ? '' : String(value)

export const findCollectionItem = (items = [], value) => {
    const key = toKey(value)
    if (!key) return null

    return items.find(item => {
        const data = item?.data ?? item ?? {}
        return [
            item?.id,
            item?.global_id,
            item?.local_id,
            data.id,
            data.global_id,
            data.local_id,
            data.name,
            data.nombre,
        ].some(candidate => toKey(candidate) === key)
    }) ?? null
}

export const getCourseName = (item) => {
    const data = item?.data ?? {}
    const tecnica = data.tecnica ?? data.tecnica_name ?? data.tecnica_id
    return data.name ?? data.nombre ?? (tecnica ? `Curso de ${tecnica}` : '')
}

export const getCourseGroup = (item, relationData) => {
    const data = item?.data ?? {}
    const grupos = relationData.grupos ?? []

    if (data.grupo_id) {
        return getItemLabel(findCollectionItem(grupos, data.grupo_id)) || data.grupo_id
    }

    const tecnica = findCollectionItem(relationData.tecnicas ?? [], data.tecnica ?? data.tecnica_name ?? data.tecnica_id)
    const tecnicaData = tecnica?.data ?? tecnica ?? {}
    const grupo = findCollectionItem(grupos, tecnicaData.group_id ?? tecnicaData.grupo_id ?? tecnicaData.grupo)

    return getItemLabel(grupo)
}

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

export const getAdminFilterDefinitions = (slug) => {
    if (slug === 'coches') {
        return [
            { key: 'activo', label: 'Estado', type: 'boolean' },
            { key: 'destacado', label: 'Destacado', type: 'boolean', trueLabel: 'Destacados', falseLabel: 'No destacados' },
        ]
    }
    if (slug === 'ordenadores') return [{ key: 'sala_id', label: 'Sala', type: 'relation', collection: 'salas' }]
    if (slug === 'tecnicas') return [{ key: 'group_id', label: 'Grupo', type: 'relation', collection: 'grupos' }]
    if (slug === 'cursos') {
        return [
            { key: 'grupo', label: 'Grupo', type: 'computed-relation', collection: 'grupos' },
            { key: 'activo', label: 'Estado', type: 'boolean' },
        ]
    }
    if (slug === 'cursos-iniciacion') return [{ key: 'grupo_id', label: 'Grupo', type: 'relation', collection: 'grupos' }]
    if (slug === 'equipamientos' || slug === 'equipamiento') {
        return [{ key: 'grupo', label: 'Grupo', type: 'computed-relation', collection: 'grupos' }]
    }
    return []
}

export const getAdminFilterCollections = (slug) => {
    if (slug === 'ordenadores') return ['salas']
    if (slug === 'tecnicas') return ['grupos']
    if (slug === 'cursos') return ['tecnicas', 'grupos']
    if (slug === 'cursos-iniciacion') return ['grupos']
    if (slug === 'equipamientos' || slug === 'equipamiento') return ['tecnicas', 'grupos']
    return []
}

const valueMatchesFilter = (value, selected) => {
    if (!selected) return true
    if (Array.isArray(value)) return value.some(item => toKey(item) === selected)
    return toKey(value) === selected
}

const getCourseGroupFilterValue = (item, relationData) => {
    const data = item?.data ?? {}
    if (data.grupo_id) return toKey(data.grupo_id)

    const tecnica = findCollectionItem(relationData.tecnicas ?? [], data.tecnica ?? data.tecnica_name ?? data.tecnica_id)
    const tecnicaData = tecnica?.data ?? tecnica ?? {}
    return toKey(tecnicaData.group_id ?? tecnicaData.grupo_id ?? tecnicaData.grupo)
}

const getEquipmentGroupFilterValues = (item, relationData) => {
    const data = item?.data ?? {}
    const tecnicas = Array.isArray(data.tecnicas)
        ? data.tecnicas
        : [data.tecnica, data.tecnica_id, data.tecnica_name].filter(Boolean)

    return tecnicas
        .map(tecnicaValue => {
            const tecnica = findCollectionItem(relationData.tecnicas ?? [], tecnicaValue)
            const tecnicaData = tecnica?.data ?? tecnica ?? {}
            return toKey(tecnicaData.group_id ?? tecnicaData.grupo_id ?? tecnicaData.grupo)
        })
        .filter(Boolean)
}

export const itemMatchesAdminFilters = (item, slug, filters, relationData) => {
    const data = item?.data ?? {}

    if (filters.sala_id && !valueMatchesFilter(data.sala_id, filters.sala_id)) return false
    if (filters.group_id && !valueMatchesFilter(data.group_id, filters.group_id)) return false
    if (filters.grupo_id && !valueMatchesFilter(data.grupo_id, filters.grupo_id)) return false

    if (filters.grupo) {
        if (slug === 'cursos' && !valueMatchesFilter(getCourseGroupFilterValue(item, relationData), filters.grupo)) return false
        if ((slug === 'equipamientos' || slug === 'equipamiento') && !valueMatchesFilter(getEquipmentGroupFilterValues(item, relationData), filters.grupo)) return false
    }

    if (filters.activo) {
        const isActive = data.activo !== false
        if (filters.activo === 'active' && !isActive) return false
        if (filters.activo === 'inactive' && isActive) return false
    }

    if (filters.destacado) {
        const isFeatured = data.destacado === true
        if (filters.destacado === 'active' && !isFeatured) return false
        if (filters.destacado === 'inactive' && isFeatured) return false
    }

    return true
}
