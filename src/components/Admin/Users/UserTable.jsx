import { Spinner } from '@/components/UI/coss/spinner'
import useAuth from '@/hooks/useAuth'
import { EmptyNoResults, EmptyNoUsers } from './EmptyUsers'
import UserRow from './UserRow'

const UserTable = ({ users, loading, totalCount, onToggleActive, onEdit, onDelete }) => {
    const { user: currentUser } = useAuth()

    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-200 text-left text-sm">
                <thead className="border-b border-gray-100 bg-gray-50/70 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    <tr>
                        <th className="px-5 py-3 font-semibold">Usuario</th>
                        <th className="px-5 py-3 font-semibold">Teléfono</th>
                        <th className="px-5 py-3 font-semibold">Rol</th>
                        <th className="px-5 py-3 font-semibold">Estado</th>
                        <th className="px-5 py-3 text-right font-semibold">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {loading && (
                        <tr>
                            <td colSpan={5} className="py-16 text-center">
                                <Spinner className="mx-auto h-5 w-5 text-gray-300" />
                            </td>
                        </tr>
                    )}
                    {!loading && totalCount === 0 && <EmptyNoUsers />}
                    {!loading && totalCount > 0 && users.length === 0 && <EmptyNoResults />}
                    {users.map(user => (
                        <UserRow
                            key={user.id}
                            user={user}
                            isCurrentUser={currentUser?.id === user.id}
                            onToggleActive={() => onToggleActive(user)}
                            onEdit={() => onEdit(user)}
                            onDelete={() => onDelete(user)}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default UserTable
