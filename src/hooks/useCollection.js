import { useCallback, useState } from 'react'
import { getPublicCollectionBySlug } from '@/services/collection_service'
import { parseSchema } from '@/utils/collection'

const useCollection = (slug) => {
    const [items, setItems] = useState([])
    const [schema, setSchema] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const load = useCallback(async () => {
        if (!slug) return
        setLoading(true)
        setError(null)
        try {
            const data = await getPublicCollectionBySlug(slug)
            setSchema(parseSchema(data?.collection?.fields_schema))
            setItems(data?.items ?? [])
        } catch (err) {
            setError(err.message ?? 'Error al cargar la colección')
        } finally {
            setLoading(false)
        }
    }, [slug])

    const getItem = useCallback((id) => {
        const numId = Number(id)
        return items.find(item => item.id === numId || item.local_id === numId) ?? null
    }, [items])

    return { items, schema, loading, error, load, getItem }
}

export default useCollection
