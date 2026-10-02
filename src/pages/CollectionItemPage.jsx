import { useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa6'
import { Database } from 'lucide-react'
import { Loader } from 'react-loaders'

import { useBreadcrumbContext } from '@/context/BreadcrumbContext'
import useCollection from '@/hooks/useCollection'
import { getTitle, getImageUrl, TITLE_FIELDS, IMAGE_FIELDS } from '@/utils/collection'

const FieldValue = ({ field, value }) => {
    if (value == null || value === '') return null

    if (field.type === 'image') {
        return (
            <img
                src={value}
                alt={field.label ?? field.name}
                className="max-h-64 w-auto rounded-lg object-contain"
            />
        )
    }
    if (field.type === 'boolean') {
        return <span className="text-slate-700">{value ? 'Sí' : 'No'}</span>
    }
    if (Array.isArray(value)) {
        return (
            <div className="flex flex-wrap gap-2">
                {value.map((v, i) => (
                    <span
                        key={i}
                        className="rounded-full bg-brand-light px-3.5 py-1 text-xs font-semibold uppercase tracking-wide text-brand-primary"
                    >
                        {String(v)}
                    </span>
                ))}
            </div>
        )
    }
    if (field.type === 'textarea') {
        return (
            <p className="whitespace-pre-line text-base leading-7 text-slate-700 text-justify">
                {String(value)}
            </p>
        )
    }
    return <span className="text-base text-slate-700">{String(value)}</span>
}

const CollectionItemPage = () => {
    const { collectionSlug, itemId } = useParams()
    const navigate = useNavigate()
    const { state } = useLocation()
    const fromPath = state?.fromPath ?? null
    const { setLabel, clearLabel } = useBreadcrumbContext()
    const { schema, loading, error, load, getItem } = useCollection(collectionSlug)

    useEffect(() => { load() }, [load])

    const item = loading ? null : getItem(itemId)
    const title = item ? getTitle(item, schema) : ''

    useEffect(() => {
        if (!item) return
        const path = `/coleccion/${collectionSlug}/${itemId}`
        setLabel(path, title)
        if (fromPath) setLabel(`__parent__:${path}`, fromPath)
        return () => {
            clearLabel(path)
            clearLabel(`__parent__:${path}`)
        }
    }, [item, title, collectionSlug, itemId, fromPath, setLabel, clearLabel])

    if (loading) {
        return (
            <section className="py-8">
                <Loader type="ball-grid-pulse" className="flex items-center justify-center" />
            </section>
        )
    }

    if (error) {
        return <p className="py-8 text-slate-600">No se pudo cargar el elemento.</p>
    }

    if (!item) {
        return <p className="py-8 text-slate-600">Elemento no encontrado.</p>
    }

    const imageUrl = getImageUrl(item, schema)

    const detailFields = schema.filter(f => {
        const val = item[f.name]
        if (val == null || val === '') return false
        if (TITLE_FIELDS.includes(f.name)) return false
        if (IMAGE_FIELDS.includes(f.name)) return false
        return true
    })

    // Chips: campos array o de relación — se muestran como etiquetas bajo el título
    const chipFields = detailFields.filter(f => {
        const val = item[f.name]
        return Array.isArray(val) || f.type === 'relation' || f.type === 'relation-multi'
    })

    // Campos con etiqueta: el resto, con textarea al final
    const labeledFields = detailFields
        .filter(f => !chipFields.includes(f))
        .sort((a, b) => {
            if (a.type === 'textarea' && b.type !== 'textarea') return 1
            if (a.type !== 'textarea' && b.type === 'textarea') return -1
            return 0
        })

    return (
        <section className="my-8">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,420px)_1fr]">
                <div className="flex max-h-[70vh] justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={title}
                            className="h-auto max-h-[calc(70vh-2rem)] max-w-full object-contain"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center min-h-48">
                            <Database className="size-24 text-slate-300" />
                        </div>
                    )}
                </div>

                <div className="flex min-w-0 flex-col gap-6">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-primary hover:text-submit-hover"
                    >
                        <FaArrowLeft className="size-3.5" />
                        Volver
                    </button>

                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h1>

                        {chipFields.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {chipFields.map(field => {
                                    const val = item[field.name]
                                    const values = Array.isArray(val) ? val : [val]
                                    return values.filter(Boolean).map((v, i) => (
                                        <span
                                            key={`${field.name}-${i}`}
                                            className="rounded-full bg-brand-light px-3.5 py-1 text-xs font-semibold uppercase tracking-wide text-brand-primary"
                                        >
                                            {String(v)}
                                        </span>
                                    ))
                                })}
                            </div>
                        )}
                    </div>

                    <hr className="border-slate-200" />

                    {labeledFields.map(field => (
                        <div key={field.name}>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
                                {field.label ?? field.name}
                            </p>
                            <FieldValue field={field} value={item[field.name]} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default CollectionItemPage
