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

export const getImageUrl = (item, schema = []) => {
    const byName = IMAGE_FIELDS.find(n => item[n] != null && item[n] !== '')
    if (byName) return item[byName]
    const bySchema = schema.find(f => f.type === 'image' && item[f.name] != null)
    return bySchema ? item[bySchema.name] : null
}

export const getDisplayFieldOptions = (schema = []) =>
    schema.filter(f =>
        !TITLE_FIELDS.includes(f.name) &&
        !IMAGE_FIELDS.includes(f.name) &&
        !URL_FIELDS.includes(f.name) &&
        f.type !== 'image'
    )
