import { COMPONENT_GROUPS } from '@/mocks/admin/componentSchemas'
import { COMPONENT_META } from '@/mocks/admin/componentMeta'

const COMPONENT_DESCRIPTIONS = {
    hero:             'Portada con fondo, título y botón de acción',
    rich_text:        'Párrafos y texto con formato enriquecido',
    info_card:        'Recuadro informativo con icono y texto',
    image_text:       'Imagen y texto dispuestos en dos columnas',
    cta:              'Llamada a la acción con botón destacado',
    banner:           'Aviso informativo o alerta coloreada',
    divider:          'Separador visual entre secciones',
    placeholder:      'Espacio vacío configurable',

    accordion:        'Secciones expandibles de preguntas y respuestas',
    content_index:    'Índice con enlaces a las secciones de la página',
    steps:            'Pasos numerados de un proceso o guía',
    feature_list:     'Lista de características o beneficios con iconos',
    tabs_section:     'Contenido organizado en pestañas',

    cards:            'Cuadrícula de tarjetas con imagen y texto',
    profile_cards:    'Perfiles del equipo con foto y descripción',
    link_cards:       'Tarjetas de navegación con enlace directo',
    carousel:         'Carrusel deslizable de imágenes o contenido',
    gallery:          'Galería fotográfica en cuadrícula',
    stats_row:        'Fila de estadísticas o cifras destacadas',
    service_stack:    'Servicios apilados con iconos y descripción',
    youtube_embed:    'Vídeo de YouTube embebido en la página',
    map_embed:        'Mapa interactivo de Google Maps',

    latest_news:           'Feed automático de las últimas noticias',
    collection_links:      'Tarjetas de colección dinámica con enlace al hacer clic',
    info_items:            'Tarjetas de colección dinámica con panel de detalle al hacer clic',
    form:                  'Formulario de contacto o consulta general',
}

const GROUP_CONFIG = {
    'Contenido':           { pill: 'bg-blue-50 text-blue-700 ring-1 ring-blue-100',       dot: 'bg-blue-400'    },
    'Listas y estructura': { pill: 'bg-violet-50 text-violet-700 ring-1 ring-violet-100', dot: 'bg-violet-400' },
    'Tarjetas y media':    { pill: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',     dot: 'bg-amber-400'    },
    'Datos y formularios': { pill: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100', dot: 'bg-emerald-400' },
}

const ComponentInsertMenu = ({ componentTypes, onAddComponent }) => {
    const byType = new Map(componentTypes.map(ct => [ct.type, ct]))

    return (
        <div className="space-y-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Elige un tipo de componente para añadir a la página
            </p>

            {COMPONENT_GROUPS.map(group => {
                const available = group.types.map(t => byType.get(t)).filter(Boolean)
                if (available.length === 0) return null

                const config = GROUP_CONFIG[group.title] ?? {
                    pill: 'bg-gray-100 text-gray-600 ring-1 ring-gray-200',
                    dot:  'bg-gray-400',
                }

                return (
                    <div key={group.title}>
                        <div className="mb-3 flex items-center gap-2.5">
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${config.pill}`}>
                                <span className={`size-1.5 rounded-full ${config.dot}`} />
                                {group.title}
                            </span>
                            <span className="text-xs text-gray-300">{available.length} componentes</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                            {available.map(ct => {
                                const meta = COMPONENT_META[ct.type]
                                const Icon = meta?.Icon
                                const description = COMPONENT_DESCRIPTIONS[ct.type]

                                return (
                                    <button
                                        key={ct.type}
                                        type="button"
                                        onClick={() => onAddComponent(ct)}
                                        className="group flex flex-col gap-2.5 rounded-xl border border-gray-200 bg-white p-3 text-left transition-all hover:-translate-y-px hover:border-brand-primary hover:shadow-md active:translate-y-0"
                                    >
                                        {Icon && meta && (
                                            <div className={`flex size-9 items-center justify-center rounded-lg transition-transform group-hover:scale-110 ${meta.bg}`}>
                                                <Icon size={16} className={meta.iconColor} />
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-sm font-semibold leading-tight text-gray-800 group-hover:text-brand-primary">
                                                {ct.name}
                                            </p>
                                            {description && (
                                                <p className="mt-0.5 text-xs leading-snug text-gray-400">
                                                    {description}
                                                </p>
                                            )}
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default ComponentInsertMenu
