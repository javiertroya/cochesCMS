// Nombre legible de cada resource_type que registra el backend (AuditLogService.log)
const AUDIT_RESOURCE_LABELS = {
    cms_page:        'Página',
    collection:      'Colección',
    collection_item: 'Elemento de colección',
    media:           'Archivo',
    media_category:  'Categoría de archivos',
    redirect:        'Redirección',
    request:         'Solicitud',
    site_settings:   'Ajustes del sitio',
    user:            'Usuario',
}

export const getResourceLabel = (type) => AUDIT_RESOURCE_LABELS[type] ?? type
