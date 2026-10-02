import PageTitleCell      from './cells/PageTitleCell'
import PageOrderCell      from './cells/PageOrderCell'
import PageComponentsCell from './cells/PageComponentsCell'
import PageStatusCell     from './cells/PageStatusCell'
import PageNavCell        from './cells/PageNavCell'
import PageActionsCell    from './cells/PageActionsCell'

const PageRow = ({ page, pages, index, filteredPages, movingPage, deletingPage, onOpenEdit, onMovePage, onDeletePage }) => (
    <div className="grid gap-3 px-5 py-4 transition-colors hover:bg-gray-50/70 lg:grid-cols-[minmax(0,1fr)_8rem_8rem_8rem_10rem_8rem] lg:items-center lg:gap-4">
        <PageTitleCell      page={page} />
        <PageOrderCell      page={page} index={index} filteredPages={filteredPages} isMoving={movingPage === page.id} onMovePage={onMovePage} />
        <PageComponentsCell page={page} />
        <PageStatusCell     published={page.is_published} />
        <PageNavCell        page={page} pages={pages} />
        <PageActionsCell    page={page} isDeleting={deletingPage === page.id} onOpenEdit={onOpenEdit} onDeletePage={onDeletePage} />
    </div>
)

export default PageRow
