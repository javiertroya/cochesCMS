const API_URL = import.meta.env.VITE_API_URL ?? ''

// Formatos de imagen aceptados al subir (HEIC = fotos de iPhone; se convierten a WebP)
export const IMAGE_ACCEPT = 'image/png,image/jpeg,image/webp,image/heic,image/heif,.heic,.heif'
export const MEDIA_ACCEPT = `${IMAGE_ACCEPT},video/mp4,video/webm`

// ..............................
// Las URLs de R2 son absolutas; las locales (/uploads/...) se resuelven contra la API
export const resolveMediaUrl = (url) => {
    if (!url) return ''
    if (/^https?:\/\//i.test(url) || url.startsWith('data:') || url.startsWith('blob:')) return url
    return `${API_URL}${url}`
}

// ..............................
// Miniatura para listados: usa la variante pequeña si existe
export const getThumbnailUrl = (item, size = 'sm') => resolveMediaUrl(item?.variants?.[size] || item?.url)
