import { useState } from 'react'
import { FileText, FilePlus2 } from 'lucide-react'

import { Button } from '@/components/UI/coss/button'
import AdminPageHeader from '@/components/Admin/Layout/AdminPageHeader'
import PagesTable from './PagesTable'
import PageEditDialog from './PageEditDialog'

const PageOverview = ({
    pages,
    movingPage,
    deletingPage,
    saving,
    onSavePage,
    onDeletePage,
    onMovePage,
}) => {
    const [editingPage, setEditingPage] = useState(null)
    const [isCreating, setIsCreating] = useState(false)

    const isDialogOpen = isCreating || !!editingPage

    const handleCloseDialog = () => {
        setEditingPage(null)
        setIsCreating(false)
    }

    const handleSubmit = async (formData, pageId) => {
        try {
            await onSavePage(formData, pageId)
            handleCloseDialog()
        } catch {
            // error toast handled inside onSavePage
        }
    }

    const handleDelete = (pageId) => {
        onDeletePage(pageId)
        handleCloseDialog()
    }

    return (
        <div className="h-full overflow-y-auto py-6 lg:py-8">
            <div className="space-y-6">
                <AdminPageHeader
                    icon={FileText}
                    title="Páginas"
                    description="Administra páginas, visibilidad, menú y contenido del sitio."
                >
                    <Button onClick={() => setIsCreating(true)}>
                        <FilePlus2 className="h-4 w-4" />
                        Nueva página
                    </Button>
                </AdminPageHeader>

                <PagesTable
                    pages={pages}
                    movingPage={movingPage}
                    deletingPage={deletingPage}
                    onOpenEdit={setEditingPage}
                    onNewPage={() => setIsCreating(true)}
                    onMovePage={onMovePage}
                    onDeletePage={onDeletePage}
                />
            </div>

            <PageEditDialog
                isOpen={isDialogOpen}
                onClose={handleCloseDialog}
                page={editingPage}
                cmsPages={pages}
                onSubmit={handleSubmit}
                onDelete={handleDelete}
                isPending={saving}
                isDeleting={deletingPage === editingPage?.id}
            />
        </div>
    )
}

export default PageOverview
