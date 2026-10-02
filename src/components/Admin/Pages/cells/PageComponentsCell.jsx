import { useNavigate } from 'react-router-dom'
import { Layers } from 'lucide-react'

const PageComponentsCell = ({ page }) => {
    const navigate = useNavigate()
    const componentCount = page.components?.length ?? 0

    return (
        <button
            type="button"
            title={`Ver componentes de ${page.title}`}
            onClick={() => navigate('/admin/components', { state: { pageId: page.id } })}
            className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:border-brand-primary/30 hover:bg-brand-primary/5 hover:text-brand-primary"
        >
            <Layers className="h-3.5 w-3.5 shrink-0" />
            {componentCount}
        </button>
    )
}

export default PageComponentsCell
