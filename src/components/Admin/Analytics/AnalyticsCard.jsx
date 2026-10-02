const AnalyticsCard = ({ title, description, children, className = '' }) => (
    <div className={`rounded-xl border border-[#dcdfea] bg-white shadow-sm ${className}`}>
        <div className="px-5 pt-4 pb-1">
            <p className="text-sm font-semibold text-[#111827]">{title}</p>
            {description && <p className="mt-0.5 text-xs text-[#6b7280]">{description}</p>}
        </div>
        <div className="px-5 pb-5">{children}</div>
    </div>
)

export default AnalyticsCard
