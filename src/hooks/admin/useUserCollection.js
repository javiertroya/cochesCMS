import { useCallback, useEffect, useState } from 'react'

import { toastManager } from '@/components/UI/coss/toast'
import useConfirm from '@/hooks/admin/useConfirm'
import {
    createAdminUser,
    deleteAdminUser,
    getAdminUsers,
    updateAdminUser,
} from '@/services/admin_user_service'

const EMPTY_COUNTS = { all: 0, admin: 0, editor: 0, inactive: 0 }

// ............................................................................
const useUserCollection = () => {
    const [items, setItems] = useState([])
    const [total, setTotal] = useState(0)
    const [pages, setPages] = useState(1)
    const [counts, setCounts] = useState(EMPTY_COUNTS)
    const [loading, setLoading] = useState(false)
    const [formMode, setFormMode] = useState(null)
    const [selectedItem, setSelectedItem] = useState(null)
    const [filter, _setFilter] = useState('all')
    const [search, _setSearch] = useState('')
    const [page, setPage] = useState(1)
    const { confirm, confirmProps } = useConfirm()

    const setFilter = (val) => { _setFilter(val); setPage(1) }
    const setSearch = (val) => { _setSearch(val); setPage(1) }

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const data = await getAdminUsers({ page, limit: 8, filter, search })

            setItems(data.items ?? [])
            setTotal(data.total ?? 0)
            setPages(data.pages ?? 1)
            setCounts(data.counts ?? EMPTY_COUNTS)
        } catch {
            toastManager.add({ title: 'Error', description: 'No se pudo cargar la lista de usuarios.', type: 'error' })
        } finally {
            setLoading(false)
        }
    }, [page, filter, search])

    useEffect(() => { load() }, [load])

    const openCreate = () => {
        setSelectedItem(null)
        setFormMode('create')
    }
    const openEdit = (item) => {
        setSelectedItem(item)
        setFormMode('edit')
    }
    const closeForm = () => {
        setSelectedItem(null)
        setFormMode(null)
    }

    const saveItem = async (data) => {
        if (formMode === 'edit' && selectedItem) {
            await updateAdminUser(selectedItem.id, data)
            await load()
            closeForm()
            toastManager.add({ title: 'Usuario actualizado', description: 'Los cambios se han guardado correctamente.', type: 'success' })
            return
        }

        await createAdminUser(data)
        await load()
        closeForm()
        toastManager.add({ title: 'Usuario creado', description: 'El usuario se ha creado correctamente.', type: 'success' })
    }

    const deleteItem = async (item) => {
        const ok = await confirm(`¿Seguro que quieres eliminar al usuario "${item.name}"? Esta acción no se puede deshacer.`)
        if (!ok) return
        try {
            await deleteAdminUser(item.id)
            await load()
            toastManager.add({ title: 'Eliminado', description: 'El usuario se ha eliminado.', type: 'success' })
        } catch (err) {
            toastManager.add({ title: 'Error', description: err.message || 'No se pudo eliminar el usuario.', type: 'error' })
        }
    }

    const toggleActive = async (item) => {
        try {
            await updateAdminUser(item.id, { is_active: !item.is_active })
            await load()
            toastManager.add({
                title: item.is_active ? 'Usuario desactivado' : 'Usuario activado',
                description: item.is_active
                    ? `${item.name} ya no puede acceder al panel.`
                    : `${item.name} puede volver a acceder al panel.`,
                type: 'success',
            })
        } catch (err) {
            toastManager.add({ title: 'Error', description: err.message || 'No se pudo cambiar el estado.', type: 'error' })
        }
    }

    return {
        items,
        total,
        counts,
        totalPages: pages,
        page,
        setPage,
        loading,
        formMode,
        selectedItem,
        filter,
        setFilter,
        search,
        setSearch,
        confirmProps,
        openCreate,
        openEdit,
        closeForm,
        saveItem,
        deleteItem,
        toggleActive,
    }
}

export default useUserCollection
