import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react'

const BANNER_STYLES = {
    info:    { bg: 'bg-blue-50',    border: 'border-blue-200',    text: 'text-blue-800',    icon: Info },
    success: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', icon: CheckCircle },
    warning: { bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-800',   icon: AlertTriangle },
    error:   { bg: 'bg-red-50',     border: 'border-red-200',     text: 'text-red-800',     icon: XCircle },
}

const CmsBanner = ({ variant = 'info', title, text }) => {
    const style = BANNER_STYLES[variant] ?? BANNER_STYLES.info
    const Icon = style.icon
    return (
        <section className="py-8">
            <div className={`flex gap-3 rounded-xl border px-4 py-3.5 ${style.bg} ${style.border} ${style.text}`}>
                <Icon size={18} className="mt-0.5 shrink-0" />
                <div>
                    {title && <h2 className="font-semibold leading-snug">{title}</h2>}
                    {text && <p className="mt-0.5 text-sm leading-relaxed opacity-90">{text}</p>}
                </div>
            </div>
        </section>
    )
}

export default CmsBanner
