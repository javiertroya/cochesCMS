import { useCallback, useEffect, useState } from 'react'

import { toastManager } from '@/components/UI/coss/toast'
import {
    clearMediaCategory,
    createMediaCategory,
    deleteAdminMedia,
    deleteMediaCategory,
    getAdminMedia,
    getMediaCategories,
    getMediaReferences,
    updateMedia,
    updateMediaCategory,
} from '@/services/media_service'

// ............................................................................
const useMediaLibrary = ({ lazy = false } = {}) => {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(false)
    const [categories, setCategories] = useState([])
    const [categoriesLoading, setCategoriesLoading] = useState(false)

    const loadCategories = useCallback(async () => {
        setCategoriesLoading(true)
        try {
            const data = await getMediaCategories()
            setCategories(data)
        } catch {
            toastManager.add({ title: 'Error', description: 'No se pudieron cargar las categorías.', type: 'error' })
        } finally {
            setCategoriesLoading(false)
        }
    }, [])

    const reload = useCallback(async () => {
        setLoading(true)
        try {
            const data = await getAdminMedia()
            setItems(data)
        } catch {
            toastManager.add({
                title: 'Error',
                description: 'No se pudo cargar la biblioteca de multimedia.',
                type: 'error',
            })
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (!lazy) {
            reload()
            loadCategories()
        }
    }, [lazy, reload, loadCategories])

    const deleteMedia = useCallback(async (id) => {
        try {
            await deleteAdminMedia(id)
            setItems(previous => previous.filter(item => item.id !== id))
            toastManager.add({ title: 'Eliminado', description: 'El archivo se ha eliminado.', type: 'success' })
        } catch {
            toastManager.add({ title: 'Error', description: 'No se pudo eliminar el archivo.', type: 'error' })
        }
    }, [])

    const updateMediaItem = useCallback(async (id, data) => {
        try {
            const updated = await updateMedia(id, data)
            setItems(previous => previous.map(item =>
                item.id === id ? { ...item, ...updated } : item
            ))
        } catch {
            toastManager.add({ title: 'Error', description: 'No se pudo actualizar el archivo.', type: 'error' })
            throw new Error('update failed')
        }
    }, [])

    const clearItemCategory = useCallback(async (id) => {
        try {
            await clearMediaCategory(id)
            setItems(previous => previous.map(item =>
                item.id === id ? { ...item, category_id: null } : item
            ))
        } catch {
            toastManager.add({ title: 'Error', description: 'No se pudo quitar la categoría.', type: 'error' })
        }
    }, [])

    const getReferences = useCallback(async (id) => {
        return await getMediaReferences(id)
    }, [])

    const createCategory = useCallback(async (name) => {
        try {
            const cat = await createMediaCategory({ name })
            setCategories(prev => [...prev, cat].sort((a, b) => a.name.localeCompare(b.name)))
            toastManager.add({ title: 'Categoría creada', type: 'success' })
            return cat
        } catch (err) {
            toastManager.add({ title: 'Error', description: err.message || 'No se pudo crear la categoría.', type: 'error' })
            throw err
        }
    }, [])

    const renameCategory = useCallback(async (id, name) => {
        try {
            const cat = await updateMediaCategory(id, { name })
            setCategories(prev => prev.map(c => c.id === id ? cat : c).sort((a, b) => a.name.localeCompare(b.name)))
            toastManager.add({ title: 'Categoría actualizada', type: 'success' })
        } catch (err) {
            toastManager.add({ title: 'Error', description: err.message || 'No se pudo renombrar la categoría.', type: 'error' })
            throw err
        }
    }, [])

    const deleteCategory = useCallback(async (id) => {
        try {
            await deleteMediaCategory(id)
            setCategories(prev => prev.filter(c => c.id !== id))
            setItems(prev => prev.map(item => item.category_id === id ? { ...item, category_id: null } : item))
            toastManager.add({ title: 'Categoría eliminada', type: 'success' })
        } catch (err) {
            toastManager.add({ title: 'Error', description: err.message || 'No se pudo eliminar la categoría.', type: 'error' })
        }
    }, [])

    return {
        items,
        loading,
        reload,
        deleteMedia,
        updateMediaItem,
        clearItemCategory,
        getReferences,
        categories,
        categoriesLoading,
        loadCategories,
        createCategory,
        renameCategory,
        deleteCategory,
    }
}

export default useMediaLibrary
