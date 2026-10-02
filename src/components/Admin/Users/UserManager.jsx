import AdminFormModal from '@/components/UI/AdminFormModal'
import ConfirmDialog from '@/components/Admin/UI/ConfirmDialog'
import Pagination from '@/components/Admin/UI/Pagination'
import Toolbar from '@/components/Admin/UI/Toolbar'
import UserForm from '@/components/Admin/Users/UserForm'
import UserTable from '@/components/Admin/Users/UserTable'

const UserManager = (props) => {

    const { collection } = props

    const filters = [
        { label: 'Todos',          value: 'all',    count: collection.counts.all },
        { label: 'Administradores', value: 'admin',  count: collection.counts.admin },
        { label: 'Editores',       value: 'editor', count: collection.counts.editor },
        ...(collection.counts.inactive > 0
            ? [{ label: 'Desactivados', value: 'inactive', count: collection.counts.inactive }]
            : []),
    ]

    return (
        <>
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <Toolbar
                    filters={filters}
                    activeFilter={collection.filter}
                    onFilterChange={collection.setFilter}
                    search={collection.search}
                    onSearchChange={collection.setSearch}
                    searchPlaceholder="Buscar usuario…"
                    filteredCount={collection.total}
                    totalCount={collection.counts[collection.filter]}
                />
                <UserTable
                    users={collection.items}
                    loading={collection.loading}
                    totalCount={collection.counts.all}
                    onToggleActive={collection.toggleActive}
                    onEdit={collection.openEdit}
                    onDelete={collection.deleteItem}
                />
            </div>

            <Pagination
                className="mt-4"
                page={collection.page}
                totalPages={collection.totalPages}
                onPageChange={collection.setPage}
            />

            {collection.formMode === 'create' && (
                <AdminFormModal title="Nuevo usuario" onClose={collection.closeForm}>
                    <UserForm onSubmit={collection.saveItem} onCancel={collection.closeForm} />
                </AdminFormModal>
            )}

            {collection.formMode === 'edit' && (
                <AdminFormModal title="Editar usuario" onClose={collection.closeForm}>
                    <UserForm
                        mode="edit"
                        user={collection.selectedItem}
                        onSubmit={collection.saveItem}
                        onCancel={collection.closeForm}
                    />
                </AdminFormModal>
            )}

            <ConfirmDialog {...collection.confirmProps} />
        </>
    )
}

export default UserManager
