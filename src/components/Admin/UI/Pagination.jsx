import {
    Pagination as PaginationRoot,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/UI/coss/pagination'

function buildPageRange(current, total) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
    if (current <= 4) return [1, 2, 3, 4, 5, '…end', total]
    if (current >= total - 3) return [1, '…start', total - 4, total - 3, total - 2, total - 1, total]
    return [1, '…start', current - 1, current, current + 1, '…end', total]
}

const Pagination = ({ page, totalPages, onPageChange, className }) => {
    if (totalPages <= 1) return null

    const pageRange = buildPageRange(page, totalPages)

    return (
        <PaginationRoot className={className}>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        render={<button />}
                        disabled={page <= 1}
                        onClick={() => onPageChange(page - 1)}
                    />
                </PaginationItem>

                {pageRange.map(entry =>
                    typeof entry === 'string' ? (
                        <PaginationItem key={entry}>
                            <PaginationEllipsis />
                        </PaginationItem>
                    ) : (
                        <PaginationItem key={entry}>
                            <PaginationLink
                                render={<button />}
                                isActive={entry === page}
                                onClick={() => onPageChange(entry)}
                            >
                                {entry}
                            </PaginationLink>
                        </PaginationItem>
                    )
                )}

                <PaginationItem>
                    <PaginationNext
                        render={<button />}
                        disabled={page >= totalPages}
                        onClick={() => onPageChange(page + 1)}
                    />
                </PaginationItem>
            </PaginationContent>
        </PaginationRoot>
    )
}

export default Pagination
