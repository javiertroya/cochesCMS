const AdminPageHeader = ({ icon: Icon, title, description, children }) => (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white px-6 py-5 shadow-sm">
        <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                <Icon className="h-5 w-5" />
            </div>
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h1>
                <p className="mt-1 text-sm text-gray-400">{description}</p>
            </div>
        </div>
        {children}
    </div>
)

export default AdminPageHeader
