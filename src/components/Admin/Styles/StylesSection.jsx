const StylesSection = ({ title, description, children }) => (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4 bg-gray-50/60">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                {title}
            </p>
            {description && (
                <p className="text-xs text-gray-400 mt-0.5">{description}</p>
            )}
        </div>
        <div className="p-6">{children}</div>
    </div>
)

export default StylesSection
