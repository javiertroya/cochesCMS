import { getRequestStatus } from './requestStatus'

const RequestStatusBadge = ({ status }) => {
    const meta = getRequestStatus(status)
    return (
        <span className={`inline-flex items-center gap-1.5 justify-self-start rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${meta.badge}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
            {meta.label}
        </span>
    )
}

export default RequestStatusBadge
