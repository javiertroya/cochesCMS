import {
    DeleteButton,
    EditButton,
    ToggleActiveButton,
} from '@/components/Admin/UI/ActionButtons'

const ActionsCell = (props) => {

    const { user, isCurrentUser, onToggleActive, onEdit, onDelete } = props

    return (
        <td className="px-5 py-3.5 align-middle">
            <div className="flex justify-end gap-1.5">
                {!isCurrentUser && (
                    <ToggleActiveButton isActive={user.is_active} onClick={onToggleActive} />
                )}
                <EditButton onClick={onEdit} title="Editar usuario" />
                {!isCurrentUser && (
                    <DeleteButton onClick={onDelete} title="Eliminar usuario" />
                )}
            </div>
        </td>
    )
}

export default ActionsCell
