const SectionHeading = ({ children, subtitle, action }) => (
    <div className={`mb-6 ${action ? 'flex items-start justify-between gap-4' : ''}`}>
        <div>
            <h2 className="site-section-title text-2xl font-bold tracking-tight text-gray-900">{children}</h2>
            <div className="site-section-bar mt-2 h-0.5 w-12 rounded-full bg-brand-primary" />
            {subtitle && <p className="mt-3 text-sm leading-relaxed text-gray-500">{subtitle}</p>}
        </div>
        {action && <div className="mt-1 shrink-0">{action}</div>}
    </div>
)

export default SectionHeading
