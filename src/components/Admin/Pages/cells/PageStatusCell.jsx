const PageStatusCell = ({ published }) => (
    <span className={`inline-flex w-fit items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold ${
        published ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
    }`}>
        <span className={`h-1.5 w-1.5 rounded-full ${published ? 'bg-emerald-500' : 'bg-amber-400'}`} />
        {published ? 'Publicada' : 'Borrador'}
    </span>
)

export default PageStatusCell
