import { useCallback, useEffect, useMemo, useState } from 'react'

import { toastManager } from '@/components/UI/coss/toast'
import EMPTY_CMS_PAGE from '@/mocks/admin/emptyCmsPage'
import {
    createCmsPage,
    deleteCmsPage,
    getAdminCmsPages,
    getCmsComponentTypes,
    updateCmsPage,
} from '@/services/cms_service'
import {
    buildEditablePages,
    makeCmsComponent,
    pageToDraft,
} from '@/utils/admin/cmsEditor'

const useAdminCms = ({ setActiveSection = null, initialPageSlug = null } = {}) => {
    const [pages, setPages] = useState([])
    const [componentTypes, setComponentTypes] = useState([])
    const [selectedId, setSelectedId] = useState(null)
    const [draft, setDraft] = useState(EMPTY_CMS_PAGE)
    const [saving, setSaving] = useState(false)
    const [isDirty, setIsDirty] = useState(false)
    const [isNewPage, setIsNewPage] = useState(false)
    const [movingPage, setMovingPage] = useState(null)
    const [deletingPage, setDeletingPage] = useState(null)

    const editablePages = useMemo(
        () => buildEditablePages(pages),
        [pages],
    )

    const setDraftFromPage = useCallback((page, fallback = EMPTY_CMS_PAGE) => {
        setDraft(pageToDraft(page, fallback))
        setIsDirty(false)
    }, [])

    const loadAdmin = useCallback(async (preferredPageId = null, preferredSlug = null) => {
        const [pagesResponse, typesResponse] = await Promise.all([
            getAdminCmsPages(),
            getCmsComponentTypes(),
        ])

        setPages(pagesResponse)
        setComponentTypes(typesResponse)

        const nextPage =
            pagesResponse.find(page => page.id === preferredPageId) ??
            (preferredSlug ? pagesResponse.find(page => page.slug === preferredSlug) : null) ??
            pagesResponse[0]
        if (nextPage) {
            setSelectedId(nextPage.id)
            setDraftFromPage(nextPage)
        } else {
            setSelectedId(null)
            setDraftFromPage(null)
        }
    }, [setDraftFromPage])

    useEffect(() => {
        const loadInitialAdmin = async () => {
            try {
                await loadAdmin(null, initialPageSlug)
            } catch {
                toastManager.add({
                    title: 'Error',
                    description: 'No se pudo cargar la gestion de contenidos.',
                    type: 'error',
                })
            }
        }

        loadInitialAdmin()
    }, [loadAdmin, initialPageSlug])

    const handleSelectPage = (page) => {
        setSelectedId(page.cmsPage.id)
        setDraftFromPage(page.cmsPage)
        setIsNewPage(false)
    }

    const handleNewPage = () => {
        setSelectedId(null)
        setDraft(EMPTY_CMS_PAGE)
        setIsDirty(false)
        setIsNewPage(true)
        setActiveSection?.('pages')
    }

    const handleDraftChange = (field, value) => {
        setDraft(previous => ({
            ...previous,
            [field]: value,
        }))
        setIsDirty(true)
    }

    const handleUpdateComponentProps = (index, updater) => {
        setDraft(previous => ({
            ...previous,
            components: previous.components.map((component, itemIndex) => {
                if (itemIndex !== index) return component

                const nextProps = typeof updater === 'function'
                    ? updater(component.props ?? {})
                    : updater

                return {
                    ...component,
                    props: nextProps,
                }
            }),
        }))
        setIsDirty(true)
    }

    const handleAddComponent = (componentType) => {
        const component = makeCmsComponent(componentType)
        setDraft(previous => ({
            ...previous,
            components: [...previous.components, component],
        }))
        setIsDirty(true)
    }

    const handleDeleteComponent = (index) => {
        setDraft(previous => ({
            ...previous,
            components: previous.components.filter((_, itemIndex) => itemIndex !== index),
        }))
        setIsDirty(true)
    }

    const handleMoveComponent = (index, direction) => {
        setDraft(previous => {
            const components = [...previous.components]
            const targetIndex = direction === 'up' ? index - 1 : index + 1
            if (targetIndex < 0 || targetIndex >= components.length) return previous
            ;[components[index], components[targetIndex]] = [components[targetIndex], components[index]]
            return { ...previous, components }
        })
        setIsDirty(true)
    }

    const handleSave = async () => {
        setSaving(true)

        try {
            const payload = {
                ...draft,
                nav_parent_slug: draft.nav_visible ? draft.nav_parent_slug || null : null,
            }

            const saved = selectedId
                ? await updateCmsPage(selectedId, payload)
                : await createCmsPage(payload)

            await loadAdmin(saved.id)
            setSelectedId(saved.id)
            setIsDirty(false)
            setIsNewPage(false)
            toastManager.add({
                title: 'Guardado',
                description: 'La pagina se ha guardado correctamente.',
                type: 'success',
            })
        } catch (error) {
            toastManager.add({
                title: 'Error',
                description: error.message || 'No se pudo guardar la pagina.',
                type: 'error',
            })
        } finally {
            setSaving(false)
        }
    }

    const handleSavePage = async (formData, pageId = null) => {
        setSaving(true)
        try {
            const payload = {
                ...formData,
                nav_parent_slug: formData.nav_visible ? formData.nav_parent_slug || null : null,
            }
            const saved = pageId
                ? await updateCmsPage(pageId, payload)
                : await createCmsPage(payload)
            await loadAdmin(saved.id)
            toastManager.add({
                title: 'Guardado',
                description: 'La página se ha guardado correctamente.',
                type: 'success',
            })
            return saved
        } catch (error) {
            toastManager.add({
                title: 'Error',
                description: error.message || 'No se pudo guardar la página.',
                type: 'error',
            })
            throw error
        } finally {
            setSaving(false)
        }
    }

    const handleDeletePage = async () => {
        if (!selectedId) return

        await handleDeletePageById(selectedId)
    }

    const handleDeletePageById = async (pageId) => {
        if (!pageId) return

        setDeletingPage(pageId)
        try {
            await deleteCmsPage(pageId)
            if (selectedId === pageId) {
                setSelectedId(null)
                setIsNewPage(false)
                setDraftFromPage(null)
            }
            setIsDirty(false)
            await loadAdmin(null)
            toastManager.add({
                title: 'Eliminada',
                description: 'La pagina se ha eliminado.',
                type: 'success',
            })
        } catch {
            toastManager.add({
                title: 'Error',
                description: 'No se pudo eliminar la pagina.',
                type: 'error',
            })
        } finally {
            setDeletingPage(null)
        }
    }

    const handleMovePage = async (pageId, direction, visiblePages = null) => {
        const currentPages = Array.isArray(visiblePages) && visiblePages.length > 0
            ? visiblePages
            : [...pages].sort((a, b) => {
                const aOrder = Number(a.order) || 100
                const bOrder = Number(b.order) || 100
                if (aOrder !== bOrder) return aOrder - bOrder
                return a.title.localeCompare(b.title)
            })

        const index = currentPages.findIndex(page => page.id === pageId)
        const targetIndex = direction === 'up' ? index - 1 : index + 1
        if (index < 0 || targetIndex < 0 || targetIndex >= currentPages.length) return

        const pageA = currentPages[index]
        const pageB = currentPages[targetIndex]
        const orderA = pageA.order
        const orderB = pageB.order

        // Actualización optimista: el UI responde al instante
        setPages(prev => prev.map(p => {
            if (p.id === pageA.id) return { ...p, order: orderB }
            if (p.id === pageB.id) return { ...p, order: orderA }
            return p
        }))

        setMovingPage(pageId)
        try {
            await Promise.all([
                updateCmsPage(pageA.id, { order: orderB }),
                updateCmsPage(pageB.id, { order: orderA }),
            ])
            // Refresh silencioso para confirmar estado del servidor
            loadAdmin(pageId)
        } catch (error) {
            // Revertir el optimistic update si falla
            setPages(prev => prev.map(p => {
                if (p.id === pageA.id) return { ...p, order: orderA }
                if (p.id === pageB.id) return { ...p, order: orderB }
                return p
            }))
            toastManager.add({
                title: 'Error',
                description: error.message || 'No se pudo actualizar el orden.',
                type: 'error',
            })
        } finally {
            setMovingPage(null)
        }
    }

    return {
        pages,
        publishedPages: pages.filter(page => page.is_published).length,
        navPages: pages.filter(page => page.nav_visible).length,
        componentTypes,
        selectedId,
        isNewPage,
        selectedLabel: draft.title,
        draft,
        saving,
        isDirty,
        movingPage,
        deletingPage,
        editablePages,
        handleSelectPage,
        handleNewPage,
        handleDraftChange,
        handleUpdateComponentProps,
        handleAddComponent,
        handleDeleteComponent,
        handleMoveComponent,
        handleSave,
        handleSavePage,
        handleDeletePage,
        handleDeletePageById,
        handleMovePage,
    }
}

export default useAdminCms
