export const TITLE_FIELDS = ['name', 'nombre', 'title', 'titulo', 'titular']
export const IMAGE_FIELDS = ['photo', 'image', 'imageUrl', 'foto', 'imagen', 'photo_url']
export const URL_FIELDS = ['url', 'URL']

export const getTitle = (item, schema = []) => {
    const byName = TITLE_FIELDS.find(n => item[n] != null && item[n] !== '')
    if (byName) return String(item[byName])
    const bySchema = schema.find(f => f.type === 'text' && item[f.name] != null)
    if (bySchema) return String(item[bySchema.name])
    return `#${item.id ?? item.local_id ?? ''}`
}

// Campos de estado: controlan la visibilidad/orden en la web y no se muestran como datos
export const STATUS_FIELDS = ['activo', 'destacado']

const hasValue = (value) => Array.isArray(value) ? value.length > 0 : value != null && value !== ''

// Un campo imagen puede guardar una URL o, si es múltiple, un array de URLs
export const toImageList = (value) =>
    (Array.isArray(value) ? value : [value]).filter(url => typeof url === 'string' && url.trim())

export const getImageUrls = (item, schema = []) => {
    const byName = IMAGE_FIELDS.find(n => hasValue(item[n]))
    if (byName) return toImageList(item[byName])
    const bySchema = schema.find(f => f.type === 'image' && hasValue(item[f.name]))
    return bySchema ? toImageList(item[bySchema.name]) : []
}

export const getImageUrl = (item, schema = []) => getImageUrls(item, schema)[0] ?? null

export const isFeatured = (item) => item?.destacado === true

// Destacados primero, manteniendo el orden original dentro de cada grupo
export const sortFeaturedFirst = (items = []) =>
    [...items].sort((a, b) => Number(isFeatured(b)) - Number(isFeatured(a)))

export const getDisplayFieldOptions = (schema = []) =>
    schema.filter(f =>
        !TITLE_FIELDS.includes(f.name) &&
        !IMAGE_FIELDS.includes(f.name) &&
        !URL_FIELDS.includes(f.name) &&
        !STATUS_FIELDS.includes(f.name) &&
        f.type !== 'image'
    )

export const PRICE_FIELDS = ['precio', 'price']

export const getPriceField = (item) => PRICE_FIELDS.find(name => item?.[name] != null && item[name] !== '')

export const formatPrice = (value) => {
    const number = Number(value)
    if (!Number.isFinite(number)) return String(value)
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(number)
}

// Enlace de WhatsApp con mensaje prellenado. Los números españoles sin prefijo reciben el 34
export const getWhatsAppUrl = (phone, message) => {
    let digits = String(phone ?? '').replace(/\D/g, '')
    if (digits.startsWith('00')) digits = digits.slice(2)
    if (digits.length === 9) digits = `34${digits}`
    if (digits.length < 10) return null
    return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}
