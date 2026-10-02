const RedirectTypeBadge = ({ statusCode }) => {
    const isPermanent = Number(statusCode) === 301
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold ${
            isPermanent ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'
        }`}>
            {statusCode}
            <span className="font-normal opacity-80">{isPermanent ? 'Permanente' : 'Temporal'}</span>
        </span>
    )
}

export default RedirectTypeBadge
