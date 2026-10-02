import { Link } from 'react-router-dom'

import { DeleteButton, EditButton, ViewButton } from '@/components/Admin/UI/ActionButtons'
import { routeFromSlug } from '@/utils/menu'

const PageActionsCell = ({ page, isDeleting, onOpenEdit, onDeletePage }) => {
    const route = routeFromSlug(page.slug)

    return (
        <div className="flex justify-start gap-1.5 lg:justify-end">
            <ViewButton title="Ver página" render={<Link to={route} />} />
            <EditButton title="Editar página" onClick={() => onOpenEdit(page)} />
            <DeleteButton title="Eliminar página" loading={isDeleting} onClick={() => onDeletePage(page.id)} />
        </div>
    )
}

export default PageActionsCell
