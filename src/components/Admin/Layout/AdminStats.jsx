const StatPill = ({ label, value }) => (
    <div className="flex items-center gap-3 rounded-xl border border-[#e5e7eb] bg-white px-4 py-3 shadow-sm">
        <p className="text-2xl font-bold text-[#111827]">{value ?? '—'}</p>
        <p className="text-sm text-[#6b7280]">{label}</p>
    </div>
)

const AdminStats = ({ totalPages, publishedPages, navPages }) => (
    <div className="grid gap-3 sm:grid-cols-3">
        <StatPill label="Páginas CMS" value={totalPages} />
        <StatPill label="Publicadas" value={publishedPages} />
        <StatPill label="En navegación" value={navPages} />
    </div>
)

export default AdminStats
