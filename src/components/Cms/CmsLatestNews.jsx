import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FaArrowRight } from 'react-icons/fa'
import { Newspaper } from 'lucide-react'

import NewsCard from '@/components/UI/NewsCard'
import NewsGridSkeleton from '@/components/Content/Home/NewsGridSkeleton'
import SectionHeading from '@/components/Cms/SectionHeading'
import useCollection from '@/hooks/useCollection'
import { getImageUrl, getTitle, isFeatured, isPublished } from '@/utils/collection'
import { parseDate } from '@/utils/format'

const DESCRIPTION_FIELDS = ['description', 'descripcion', 'entrada', 'cuerpo', 'content', 'contenido', 'subtitle', 'subtitulo']
const DATE_FIELDS = ['publishedAt', 'date', 'fecha_publicacion', 'created_at']

const getFirstFieldValue = (item, fieldNames) => {
    const fieldName = fieldNames.find(name => item?.[name] != null && item[name] !== '')
    return fieldName ? item[fieldName] : null
}

const getTimestamp = (item) => parseDate(getFirstFieldValue(item, DATE_FIELDS))?.getTime() ?? 0

const getItemPath = (collection, item) => {
    const id = item.id ?? item.local_id
    if (!id) return undefined
    if (collection === 'noticias') return `/noticias/${id}`
    return `/coleccion/${collection}/${id}`
}

const toNewsArticle = (item, schema) => ({
    ...item,
    title: getTitle(item, schema),
    description: getFirstFieldValue(item, DESCRIPTION_FIELDS),
    image: getImageUrl(item, schema),
    publishedAt: getFirstFieldValue(item, DATE_FIELDS),
})

const CmsLatestNews = ({ collection = 'noticias', title, subtitle, limit = 3, linkText, linkUrl }) => {
    const collectionSlug = collection || 'noticias'
    const { items, schema, loading, load } = useCollection(collectionSlug)

    useEffect(() => {
        load()
    }, [load])

    const normalizedLimit = String(limit)
    // Destacados primero; después (y dentro de cada grupo) lo más reciente. Los inactivos no se muestran
    const sortedItems = items
        .filter(isPublished)
        .sort((a, b) => {
            const featuredDiff = Number(isFeatured(b)) - Number(isFeatured(a))
            if (featuredDiff !== 0) return featuredDiff
            const dateDiff = getTimestamp(b) - getTimestamp(a)
            if (dateDiff !== 0) return dateDiff
            return Number(b.id ?? b.local_id ?? 0) - Number(a.id ?? a.local_id ?? 0)
        })
    const latestItems = normalizedLimit === 'all'
        ? sortedItems
        : sortedItems.slice(0, Number(normalizedLimit) || 3)

    const action = linkText && linkUrl ? (
        <Link to={linkUrl} className="flex items-center gap-1.5 text-sm font-medium text-brand-primary transition-colors hover:text-blue-700 hover:underline">
            {linkText}
            <FaArrowRight size={10} />
        </Link>
    ) : undefined

    return (
        <section className="py-8">
            {title && <SectionHeading subtitle={subtitle} action={action}>{title}</SectionHeading>}

            {loading ? (
                <NewsGridSkeleton />
            ) : latestItems.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {latestItems.map((item) => (
                        <NewsCard
                            key={item.id ?? item.local_id}
                            article={toNewsArticle(item, schema)}
                            to={getItemPath(collectionSlug, item)}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center gap-3 rounded-xl bg-gray-50 py-12 text-center">
                    <Newspaper className="size-8 text-gray-300" />
                    <p className="text-sm text-gray-500">No hay noticias publicadas por el momento.</p>
                </div>
            )}
        </section>
    )
}

export default CmsLatestNews
