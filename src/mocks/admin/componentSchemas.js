export const COMPONENT_GROUPS = [
    {
        title: 'Contenido',
        types: ['hero', 'rich_text', 'info_card', 'image_text', 'cta', 'banner', 'divider', 'placeholder'],
    },
    {
        title: 'Listas y estructura',
        types: ['accordion', 'content_index', 'steps', 'feature_list', 'tabs_section'],
    },
    {
        title: 'Tarjetas y media',
        types: ['cards', 'profile_cards', 'link_cards', 'carousel', 'gallery', 'stats_row', 'service_stack', 'youtube_embed', 'map_embed'],
    },
    {
        title: 'Datos y formularios',
        types: ['latest_news', 'collection_links', 'info_items', 'form', 'full_form', 'import_request'],
    },
]

export const COMPONENT_SCHEMAS = {
    // ── Contenido ──────────────────────────────────────────────────────────
    hero: [
        { name: 'title',      label: 'Título',            type: 'text' },
        { name: 'subtitle',   label: 'Subtítulo',         type: 'textarea' },
        { name: 'buttonText', label: 'Texto del botón',   type: 'text' },
        { name: 'buttonUrl',  label: 'URL del botón',     type: 'text' },
    ],
    rich_text: [
        { name: 'anchor', label: 'Ancla (ID)',   type: 'text' },
        { name: 'title',  label: 'Título',       type: 'text' },
        { name: 'body',   label: 'Contenido',    type: 'textarea', rows: 8 },
    ],
    info_card: [
        { name: 'anchor', label: 'Ancla (ID)', type: 'text' },
        { name: 'title',  label: 'Título',     type: 'text' },
        { name: 'body',   label: 'Contenido',  type: 'textarea', rows: 6 },
    ],
    image_text: [
        { name: 'imageUrl',      label: 'Imagen',              type: 'image' },
        { name: 'imageAlt',      label: 'Texto alternativo',   type: 'text' },
        {
            name: 'imagePosition', label: 'Posición de la imagen', type: 'select',
            options: [
                { value: 'left',  label: 'Izquierda' },
                { value: 'right', label: 'Derecha' },
            ],
        },
        { name: 'title',      label: 'Título',          type: 'text' },
        { name: 'text',       label: 'Texto',           type: 'textarea' },
        { name: 'buttonText', label: 'Texto del botón', type: 'text' },
        { name: 'buttonUrl',  label: 'URL del botón',   type: 'text' },
    ],
    cta: [
        { name: 'title',      label: 'Título',          type: 'text' },
        { name: 'text',       label: 'Texto',           type: 'textarea' },
        { name: 'buttonText', label: 'Texto del botón', type: 'text' },
        { name: 'buttonUrl',  label: 'URL del botón',   type: 'text' },
    ],
    banner: [
        {
            name: 'variant', label: 'Tipo', type: 'select',
            options: [
                { value: 'info',    label: 'Información (azul)' },
                { value: 'success', label: 'Éxito (verde)' },
                { value: 'warning', label: 'Advertencia (amarillo)' },
                { value: 'error',   label: 'Error (rojo)' },
            ],
        },
        { name: 'title', label: 'Título',  type: 'text' },
        { name: 'text',  label: 'Mensaje', type: 'textarea' },
    ],
    divider: [
        { name: 'label', label: 'Etiqueta central (opcional)', type: 'text' },
    ],
    placeholder: [
        { name: 'text', label: 'Texto', type: 'textarea' },
    ],

    // ── Listas y estructura ────────────────────────────────────────────────
    accordion: [
        { name: 'anchor',   label: 'Ancla (ID)',        type: 'text' },
        { name: 'title',    label: 'Título',            type: 'text' },
        { name: 'subtitle', label: 'Subtítulo',         type: 'text' },
        {
            name: 'source', label: 'Origen predefinido', type: 'select',
            options: [
                { value: '',                label: 'Manual' },
                { value: 'principios',      label: 'Principios' },
                { value: 'responsabilidades', label: 'Responsabilidades' },
            ],
        },
        {
            name: 'items', label: 'Elementos manuales', type: 'list', itemLabel: 'Elemento',
            fields: [
                { name: 'title',   label: 'Título',    type: 'text' },
                { name: 'content', label: 'Contenido', type: 'textarea' },
            ],
            newItem: { title: 'Elemento', content: 'Contenido' },
        },
    ],
    content_index: [
        {
            name: 'items', label: 'Entradas del índice', type: 'list', itemLabel: 'Entrada',
            fields: [
                { name: 'text', label: 'Texto',  type: 'text' },
                { name: 'href', label: 'Enlace', type: 'text' },
            ],
            newItem: { text: 'Sección', href: '#seccion' },
        },
    ],
    steps: [
        { name: 'title',    label: 'Título',    type: 'text' },
        { name: 'subtitle', label: 'Subtítulo', type: 'text' },
        {
            name: 'items', label: 'Pasos', type: 'list', itemLabel: 'Paso',
            fields: [
                { name: 'title', label: 'Título',      type: 'text' },
                { name: 'text',  label: 'Descripción', type: 'textarea' },
            ],
            newItem: { title: 'Paso', text: 'Descripción del paso.' },
        },
    ],
    feature_list: [
        { name: 'title', label: 'Título', type: 'text' },
        {
            name: 'columns', label: 'Columnas', type: 'select',
            options: [
                { value: 1, label: '1 columna' },
                { value: 2, label: '2 columnas' },
                { value: 3, label: '3 columnas' },
            ],
        },
        {
            name: 'items', label: 'Características', type: 'list', itemLabel: 'Característica',
            fields: [
                { name: 'title', label: 'Título',      type: 'text' },
                { name: 'text',  label: 'Descripción', type: 'textarea' },
            ],
            newItem: { title: 'Característica', text: 'Descripción breve.' },
        },
    ],
    tabs_section: [
        { name: 'title', label: 'Título (opcional)', type: 'text' },
        {
            name: 'tabs', label: 'Pestañas', type: 'list', itemLabel: 'Pestaña',
            fields: [
                { name: 'label',   label: 'Nombre de la pestaña', type: 'text' },
                { name: 'content', label: 'Contenido',            type: 'textarea', rows: 6 },
            ],
            newItem: { label: 'Nueva pestaña', content: '' },
        },
    ],

    // ── Tarjetas y media ───────────────────────────────────────────────────
    cards: [
        { name: 'title', label: 'Título del bloque', type: 'text' },
        {
            name: 'items', label: 'Tarjetas', type: 'list', itemLabel: 'Tarjeta',
            fields: [
                { name: 'title', label: 'Título',  type: 'text' },
                { name: 'text',  label: 'Texto',   type: 'textarea' },
                { name: 'url',   label: 'URL',     type: 'text' },
                { name: 'image', label: 'Imagen',  type: 'image' },
            ],
            newItem: { title: 'Tarjeta', text: '', url: '', image: '' },
        },
    ],
    profile_cards: [
        {
            name: 'items', label: 'Tarjetas', type: 'list', itemLabel: 'Tarjeta',
            fields: [
                { name: 'title',    label: 'Nombre',        type: 'text' },
                { name: 'subtitle', label: 'Subtítulo',     type: 'text' },
                { name: 'source',   label: 'Imagen',        type: 'image' },
                { name: 'to',       label: 'Enlace interno',type: 'text' },
                {
                    name: 'icon', label: 'Icono', type: 'select',
                    options: [
                        { value: 'card',       label: 'Genérico' },
                        { value: 'room',       label: 'Sala' },
                        { value: 'tools',      label: 'Herramientas' },
                        { value: 'computer',   label: 'Ordenador' },
                        { value: 'start',      label: 'Inicio' },
                        { value: 'graduation', label: 'Graduación' },
                    ],
                },
            ],
            newItem: { title: 'Tarjeta', subtitle: '', source: '', to: '/', icon: 'card' },
        },
    ],
    link_cards: [
        {
            name: 'items', label: 'Enlaces', type: 'list', itemLabel: 'Enlace',
            fields: [
                { name: 'id',       label: 'Ancla',             type: 'text' },
                { name: 'title',    label: 'Título',            type: 'text' },
                { name: 'description', label: 'Descripción',    type: 'textarea' },
                { name: 'href',     label: 'URL',               type: 'text' },
                { name: 'linkText', label: 'Texto del botón',   type: 'text' },
            ],
            newItem: { id: 'enlace', title: 'Enlace', description: '', href: 'https://', linkText: 'Visitar' },
        },
    ],
    carousel: [
        {
            name: 'items', label: 'Slides', type: 'list', itemLabel: 'Slide',
            fields: [
                { name: 'title', label: 'Título',      type: 'text' },
                { name: 'text',  label: 'Descripción', type: 'textarea' },
                { name: 'image', label: 'Imagen',      type: 'image' },
            ],
            newItem: { title: 'Imagen', text: '', image: '' },
        },
    ],
    gallery: [
        { name: 'title', label: 'Título (opcional)', type: 'text' },
        {
            name: 'columns', label: 'Columnas', type: 'select',
            options: [
                { value: 2, label: '2 columnas' },
                { value: 3, label: '3 columnas' },
                { value: 4, label: '4 columnas' },
            ],
        },
        {
            name: 'items', label: 'Imágenes', type: 'list', itemLabel: 'Imagen',
            fields: [
                { name: 'src',     label: 'Imagen',          type: 'image' },
                { name: 'alt',     label: 'Texto alternativo', type: 'text' },
                { name: 'caption', label: 'Pie de foto',     type: 'text' },
            ],
            newItem: { src: '', alt: '', caption: '' },
        },
    ],
    stats_row: [
        { name: 'title', label: 'Título (opcional)', type: 'text' },
        {
            name: 'items', label: 'Estadísticas', type: 'list', itemLabel: 'Estadística',
            fields: [
                { name: 'value', label: 'Valor (ej: 200+)', type: 'text' },
                { name: 'unit',  label: 'Unidad (opcional)', type: 'text' },
                { name: 'label', label: 'Etiqueta',          type: 'text' },
            ],
            newItem: { value: '0', unit: '', label: 'Etiqueta' },
        },
    ],
    service_stack: [
        { name: 'title',    label: 'Título',    type: 'text' },
        { name: 'subtitle', label: 'Subtítulo', type: 'textarea' },
        { name: 'showLinks', label: 'Mostrar botones de enlace', type: 'checkbox' },
        {
            name: 'items', label: 'Servicios', type: 'list', itemLabel: 'Servicio',
            fields: [
                { name: 'title',       label: 'Título',             type: 'text' },
                { name: 'description', label: 'Descripción',        type: 'textarea' },
                { name: 'to',          label: 'URL de destino',     type: 'text' },
                { name: 'linkText',    label: 'Texto del botón',    type: 'text' },
                {
                    name: 'icon', label: 'Icono', type: 'select',
                    options: [
                        { value: 'wrench',     label: 'Herramientas' },
                        { value: 'calendar',   label: 'Calendario' },
                        { value: 'graduation', label: 'Graduación' },
                        { value: 'users',      label: 'Equipo' },
                        { value: 'flask',      label: 'Laboratorio' },
                        { value: 'laptop',     label: 'Portátil' },
                        { value: 'layers',     label: 'Capas' },
                        { value: 'settings',   label: 'Configuración' },
                        { value: 'book',       label: 'Libro' },
                        { value: 'cpu',        label: 'CPU' },
                        { value: 'hammer',     label: 'Martillo' },
                        { value: 'zap',        label: 'Rayo' },
                        { value: 'star',       label: 'Estrella' },
                        { value: 'printer',    label: 'Impresora' },
                        { value: 'microscope', label: 'Microscopio' },
                        { value: 'package',    label: 'Paquete' },
                        { value: 'monitor',    label: 'Monitor' },
                        { value: 'boxes',      label: 'Cajas' },
                        { value: 'car',        label: 'Coche' },
                        { value: 'key',        label: 'Llave' },
                    ],
                },
                {
                    name: 'gradient', label: 'Color', type: 'select',
                    options: [
                        { value: 'blue',    label: 'Azul' },
                        { value: 'indigo',  label: 'Índigo' },
                        { value: 'sky',     label: 'Cielo' },
                        { value: 'violet',  label: 'Violeta' },
                        { value: 'emerald', label: 'Esmeralda' },
                        { value: 'teal',    label: 'Teal' },
                        { value: 'rose',    label: 'Rosa' },
                        { value: 'orange',  label: 'Naranja' },
                        { value: 'slate',   label: 'Pizarra' },
                    ],
                },
            ],
            newItem: { title: 'Servicio', description: 'Descripción del servicio.', to: '/', linkText: 'Explorar', icon: 'wrench', gradient: 'blue' },
        },
    ],
    youtube_embed: [
        { name: 'url',   label: 'URL de YouTube',   type: 'text' },
        { name: 'title', label: 'Título (opcional)', type: 'text' },
    ],
    map_embed: [
        { name: 'src',    label: 'URL del iframe (Google Maps → Compartir → Insertar)', type: 'text' },
        { name: 'title',  label: 'Título (opcional)',  type: 'text' },
        { name: 'height', label: 'Altura en píxeles',  type: 'number' },
    ],

    // ── Datos y formularios ────────────────────────────────────────────────
    latest_news: [
        { name: 'collection', label: 'Colección',            type: 'collection-picker' },
        { name: 'title',    label: 'Título',              type: 'text' },
        { name: 'subtitle', label: 'Subtítulo',           type: 'textarea' },
        {
            name: 'limit', label: 'Número de noticias', type: 'select',
            options: [
                { value: 'all', label: 'Todas' },
                { value: '3',   label: '3 noticias' },
                { value: '5',   label: '5 noticias' },
            ],
        },
        { name: 'linkText', label: 'Texto del enlace',    type: 'text' },
        { name: 'linkUrl',  label: 'URL del enlace',      type: 'text' },
    ],
    collection_links: [
        { name: 'collection', label: 'Colección', type: 'collection-picker' },
    ],
    info_items: [
        { name: 'collection', label: 'Colección', type: 'collection-picker' },
    ],
    form: [
        {
            name: 'form', label: 'Formulario', type: 'select',
            options: [
                { value: 'contacto', label: 'Contacto' },
            ],
        },
    ],
    // Campos fijos: nombre, teléfono, email y mensaje. Los envíos llegan a Solicitudes.
    full_form: [
        { name: 'anchor',             label: 'Ancla (ID)',                  type: 'text' },
        { name: 'title',              label: 'Título',                      type: 'text' },
        { name: 'subtitle',           label: 'Subtítulo',                   type: 'textarea' },
        { name: 'messageLabel',       label: 'Etiqueta del campo de mensaje', type: 'text' },
        { name: 'messagePlaceholder', label: 'Texto de ayuda del mensaje',  type: 'text' },
        { name: 'buttonText',         label: 'Texto del botón',             type: 'text' },
        { name: 'successMessage',     label: 'Mensaje tras enviar',         type: 'textarea' },
    ],
    // Dos opciones con su formulario. Enlaza a /pagina#busqueda o #encontrado para abrir uno directamente.
    import_request: [
        { name: 'anchor',           label: 'Ancla (ID)',                          type: 'text' },
        { name: 'title',            label: 'Título',                              type: 'text' },
        { name: 'subtitle',         label: 'Subtítulo',                           type: 'textarea' },
        { name: 'searchCardTitle',  label: 'Opción 1 · Título (búsqueda)',        type: 'text' },
        { name: 'searchCardText',   label: 'Opción 1 · Descripción',              type: 'textarea' },
        { name: 'searchCardButton', label: 'Opción 1 · Texto del botón',          type: 'text' },
        { name: 'foundCardTitle',   label: 'Opción 2 · Título (ya encontrado)',   type: 'text' },
        { name: 'foundCardText',    label: 'Opción 2 · Descripción',              type: 'textarea' },
        { name: 'foundCardButton',  label: 'Opción 2 · Texto del botón',          type: 'text' },
        { name: 'searchFormTitle',  label: 'Formulario 1 · Título',               type: 'text' },
        { name: 'searchFormIntro',  label: 'Formulario 1 · Introducción',         type: 'textarea' },
        { name: 'foundFormTitle',   label: 'Formulario 2 · Título',               type: 'text' },
        { name: 'foundFormIntro',   label: 'Formulario 2 · Introducción',         type: 'textarea' },
        { name: 'successMessage',   label: 'Mensaje tras enviar',                 type: 'textarea' },
    ],
}

export const getComponentSchema = (type) => COMPONENT_SCHEMAS[type] ?? []

export default COMPONENT_SCHEMAS
