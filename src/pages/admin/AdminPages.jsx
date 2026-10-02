import useAdminCms from '@/hooks/admin/useAdminCms'
import PageOverview from '@/components/Admin/Pages/PageOverview'

const AdminPages = () => {
    const cms = useAdminCms({})

    return (
        <PageOverview
            pages={cms.pages}
            movingPage={cms.movingPage}
            deletingPage={cms.deletingPage}
            saving={cms.saving}
            onSavePage={cms.handleSavePage}
            onDeletePage={cms.handleDeletePageById}
            onMovePage={cms.handleMovePage}
        />
    )
}

export default AdminPages
