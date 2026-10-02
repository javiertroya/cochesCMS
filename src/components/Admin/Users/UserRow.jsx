import ActionsCell from './cells/ActionsCell'
import RoleCell    from './cells/RoleCell'
import StatusCell  from './cells/StatusCell'
import UserCell    from './cells/UserCell'

const UserRow = ({ user, isCurrentUser, onToggleActive, onEdit, onDelete }) => (
    <tr className={`group transition-colors ${!user.is_active ? 'bg-gray-50/80 hover:bg-gray-100/60' : 'hover:bg-gray-50/60'}`}>
        <UserCell   user={user} />
        <td className="px-5 py-3.5 align-middle text-sm text-gray-500">
            {user.phone || <span className="text-gray-300">—</span>}
        </td>
        <RoleCell   role={user.role} />
        <StatusCell isActive={user.is_active} />
        <ActionsCell
            user={user}
            isCurrentUser={isCurrentUser}
            onToggleActive={onToggleActive}
            onEdit={onEdit}
            onDelete={onDelete}
        />
    </tr>
)

export default UserRow
