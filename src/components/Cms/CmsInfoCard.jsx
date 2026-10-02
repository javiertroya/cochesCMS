import { Info } from 'lucide-react'

const CmsInfoCard = ({ anchor, title, body }) => {
    if (!title && !body) return null

    return (
        <section id={anchor || undefined} className="mx-auto max-w-4xl py-8">
            <div className="flex gap-4 rounded-xl border border-brand-primary/15 bg-brand-light p-5 text-gray-700 shadow-sm">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-primary text-white">
                    <Info className="size-5" />
                </div>
                <div className="min-w-0 space-y-2">
                    {title && (
                        <p className="text-base font-semibold leading-7 text-gray-900">
                            {title}
                        </p>
                    )}
                    {body && (
                        <div className="space-y-3 text-base leading-8">
                            {String(body).split('\n').filter(Boolean).map((line, index) => (
                                <p key={index}>{line}</p>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}

export default CmsInfoCard
