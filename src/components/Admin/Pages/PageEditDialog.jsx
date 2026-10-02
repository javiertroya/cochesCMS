import { useEffect, useState } from 'react'
import { FileText } from 'lucide-react'

import { Button } from '@/components/UI/coss/button'
import {
    Dialog,
    DialogPopup,
    DialogHeader,
    DialogTitle,
    DialogPanel,
    DialogFooter,
} from '@/components/UI/coss/dialog'
import PageSettingsForm from './PageSettingsForm'
import PageSeoSection from './PageSeoSection'

const initDraft = (page) => ({
    title:           page?.title            ?? '',
    slug:            page?.slug             ?? '',
    requires_auth:   Boolean(page?.requires_auth),
    is_published:    page ? Boolean(page.is_published) : true,
    nav_visible:     Boolean(page?.nav_visible),
    nav_parent_slug: page?.nav_parent_slug  ?? '',
    nav_order:       page?.nav_order        ?? 100,
    nav_icon:        page?.nav_icon         ?? '',
    page_color:      page?.page_color       ?? '',
    seo_title:       page?.seo_title        ?? '',
    seo_description: page?.seo_description  ?? '',
    seo_og_image:    page?.seo_og_image     ?? '',
    seo_canonical:   page?.seo_canonical    ?? '',
})

const PageEditDialog = ({
    isOpen,
    onClose,
    page,
    cmsPages,
    onSubmit,
    onDelete,
    isPending,
    isDeleting,
}) => {
    const [draft, setDraft] = useState(() => initDraft(page))

    useEffect(() => {
        if (isOpen) setDraft(initDraft(page))
    }, [isOpen, page])

    const handleChange = (field, value) => setDraft((prev) => ({ ...prev, [field]: value }))
    const handleSave = () => onSubmit(draft, page?.id ?? null)
    const handleDelete = () => {
        if (!page) return
        if (window.confirm(`¿Eliminar la página "${page.title}"? También se eliminarán sus componentes de contenido.`)) {
            onDelete(page.id)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
            <DialogPopup className="sm:max-w-2xl" showCloseButton={false}>
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                            <FileText size={17} />
                        </div>
                        <DialogTitle>
                            {page ? 'Editar página' : 'Nueva página'}
                        </DialogTitle>
                    </div>
                </DialogHeader>

                <DialogPanel className="space-y-0 p-0">
                    <PageSettingsForm
                        draft={draft}
                        cmsPages={cmsPages}
                        selectedId={page?.id ?? null}
                        onDraftChange={handleChange}
                    />
                    <div className="px-5 pb-5">
                        <PageSeoSection draft={draft} onChange={handleChange} />
                    </div>
                </DialogPanel>

                <DialogFooter>
                    {page && (
                        <Button
                            variant="destructive"
                            type="button"
                            onClick={handleDelete}
                            loading={isDeleting}
                            className="mr-auto"
                        >
                            Eliminar
                        </Button>
                    )}
                    <Button variant="outline" type="button" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button type="button" onClick={handleSave} loading={isPending}>
                        {page ? 'Guardar cambios' : 'Crear página'}
                    </Button>
                </DialogFooter>
            </DialogPopup>
        </Dialog>
    )
}

export default PageEditDialog
