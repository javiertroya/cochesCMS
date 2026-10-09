import { useLayoutEffect, useRef, useState } from 'react'
import { AlertTriangle, Star } from 'lucide-react'

import {
    formatExpandedValue,
    getCourseGroup,
    getCourseName,
} from './collectionItemsUtils'

const ExpandValueButton = ({ label, value, onExpand }) => (
    <button
        type="button"
        className="mt-1 text-xs font-semibold text-brand-primary hover:text-submit-hover"
        onClick={() => onExpand?.({ label, value: formatExpandedValue(value) })}
    >
        Ver más
    </button>
)

const useIsOverflowing = (value) => {
    const ref = useRef(null)
    const [isOverflowing, setIsOverflowing] = useState(false)

    useLayoutEffect(() => {
        const element = ref.current
        if (!element) return undefined

        const update = () => {
            setIsOverflowing(element.scrollWidth > element.clientWidth)
        }

        update()
        const resizeObserver = new ResizeObserver(update)
        resizeObserver.observe(element)

        return () => resizeObserver.disconnect()
    }, [value])

    return [ref, isOverflowing]
}

const TruncatedText = ({
    value,
    label,
    onExpand,
    className = 'text-[#374151]',
    textClassName = 'block',
    forceExpand = false,
}) => {
    const str = String(value ?? '')
    const [textRef, isOverflowing] = useIsOverflowing(str)

    if (!value && value !== 0) return <span className="text-[#9ca3af]">—</span>

    return (
        <div className="w-full min-w-0 max-w-full">
            <span ref={textRef} className={`${textClassName} truncate ${className}`} title={str}>
                {str}
            </span>
            {(forceExpand || isOverflowing) && (
                <ExpandValueButton label={label} value={str} onExpand={onExpand} />
            )}
        </div>
    )
}

const TextCell = ({ value, label, onExpand }) => (
    <TruncatedText value={value} label={label} onExpand={onExpand} />
)

const shouldAlwaysCompact = (collectionSlug, fieldName) => {
    if ((collectionSlug === 'equipamientos' || collectionSlug === 'equipamiento') && fieldName === 'descripcion') {
        return true
    }
    if (collectionSlug === 'noticias' && ['titular', 'cuerpo'].includes(fieldName)) {
        return true
    }
    return false
}

const BooleanToggle = ({ field, value, onToggle }) => {
    const checked = value ?? field.default ?? false

    if (field.name === 'destacado') {
        return (
            <button
                type="button"
                onClick={onToggle}
                title={checked ? 'Quitar de destacados' : 'Marcar como destacado'}
                aria-pressed={checked}
                className="flex size-8 items-center justify-center rounded-lg transition hover:bg-amber-50"
            >
                <Star size={16} className={checked ? 'fill-amber-400 text-amber-400' : 'text-[#d1d5db]'} />
            </button>
        )
    }

    return (
        <button
            type="button"
            onClick={onToggle}
            title="Cambiar estado"
            aria-pressed={checked}
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition ${
                checked
                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    : 'bg-[#f3f4f6] text-[#6b7280] hover:bg-[#e5e7eb]'
            }`}
        >
            <span className={`size-1.5 rounded-full ${checked ? 'bg-emerald-500' : 'bg-[#9ca3af]'}`} />
            {field.name === 'activo' ? (checked ? 'Activo' : 'Inactivo') : (checked ? 'Sí' : 'No')}
        </button>
    )
}

export const CellValue = ({ field, value, knownMediaUrls, onExpand, onToggle, collectionSlug }) => {
    if (field.type === 'boolean') {
        if (onToggle) return <BooleanToggle field={field} value={value} onToggle={onToggle} />
        return value ? 'Sí' : 'No'
    }

    if (field.type === 'image') {
        const images = Array.isArray(value) ? value : (value ? [value] : [])
        const firstImage = images[0]

        if (!firstImage) return <span className="text-[#9ca3af]">—</span>
        const isKnown = !knownMediaUrls || knownMediaUrls.has(firstImage)
        if (!isKnown) {
            return (
                <div className="flex items-center gap-1.5 text-amber-600" title={`Archivo no registrado en media: ${firstImage}`}>
                    <AlertTriangle size={13} className="shrink-0" />
                    <span className="text-xs font-medium">No encontrado</span>
                </div>
            )
        }
        return (
            <div className="flex items-center gap-2">
                <img
                    src={firstImage}
                    alt=""
                    className="h-9 w-9 rounded-lg object-cover border border-[#e5e7eb]"
                    onError={e => { e.target.replaceWith(Object.assign(document.createElement('span'), { className: 'text-xs text-[#9ca3af]', textContent: '—' })) }}
                />
                {images.length > 1 && (
                    <span className="text-xs font-medium text-[#6b7280]">+{images.length - 1}</span>
                )}
            </div>
        )
    }

    if (field.type === 'relation-multi' && Array.isArray(value)) {
        if (value.length === 0) return <span className="text-[#9ca3af]">—</span>
        return (
            <div className="min-w-0 max-w-full">
                <div className="flex min-w-0 flex-wrap gap-1">
                    {value.slice(0, 2).map((v, i) => (
                        <span key={i} className="inline-flex max-w-full items-center truncate rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                            {v}
                        </span>
                    ))}
                    {value.length > 2 && (
                        <span className="text-xs text-[#9ca3af]">+{value.length - 2}</span>
                    )}
                </div>
                {value.length > 2 && (
                    <ExpandValueButton label={field.label ?? field.name} value={value} onExpand={onExpand} />
                )}
            </div>
        )
    }

    if (field.type === 'relation') {
        if (!value && value !== 0) return <span className="text-[#9ca3af]">—</span>
        const display = typeof value === 'number' ? `#${value}` : value
        return (
            <TruncatedText
                value={display}
                label={field.label ?? field.name}
                onExpand={onExpand}
                className="rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700"
                textClassName="inline-block max-w-full align-middle"
            />
        )
    }

    const alwaysCompact = shouldAlwaysCompact(collectionSlug, field.name)

    if (alwaysCompact || field.type === 'textarea' || (typeof value === 'string' && value.length > 60)) {
        const str = String(value ?? '—')
        return (
            <TruncatedText
                value={str}
                label={field.label ?? field.name}
                onExpand={onExpand}
                forceExpand={alwaysCompact}
            />
        )
    }

    const str = String(value ?? '—')
    return (
        <TruncatedText
            value={str}
            label={field.label ?? field.name}
            onExpand={onExpand}
            className="text-[#374151]"
        />
    )
}

export const CourseCellValue = ({ column, item, relationData, onExpand }) => {
    const data = item?.data ?? {}

    if (column.name === 'nombre') {
        return <TextCell value={getCourseName(item)} label={column.label} onExpand={onExpand} />
    }

    if (column.name === 'descripcion') {
        return (
            <TruncatedText
                value={data.descripcion}
                label={column.label}
                onExpand={onExpand}
                forceExpand
            />
        )
    }

    if (column.name === 'grupo') {
        return <TextCell value={getCourseGroup(item, relationData)} label={column.label} onExpand={onExpand} />
    }

    if (column.name === 'duracion') {
        return <TextCell value={data.duracion ? `${data.duracion} h` : ''} />
    }

    if (column.name === 'activo') {
        return data.activo ? 'Sí' : 'No'
    }

    return <TextCell value={data[column.name]} label={column.label} onExpand={onExpand} />
}
