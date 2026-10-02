import { Plus, Users } from 'lucide-react'

import AdminPageHeader from '@/components/Admin/Layout/AdminPageHeader'
import UserManager from '@/components/Admin/Users/UserManager'
import { Button } from '@/components/UI/coss/button'
import useUserCollection from '@/hooks/admin/useUserCollection'

const AdminUsers = () => {
    const collection = useUserCollection()

    return (
        <div className="h-full overflow-y-auto py-6 lg:py-8">
            <div className="space-y-6">
                <AdminPageHeader
                    icon={Users}
                    title="Usuarios"
                    description="Gestiona los usuarios registrados en el sistema."
                >
                    <Button onClick={collection.openCreate}>
                        <Plus className="h-4 w-4" />
                        Nuevo usuario
                    </Button>
                </AdminPageHeader>

                <UserManager collection={collection} />
            </div>
        </div>
    )
}

export default AdminUsers
