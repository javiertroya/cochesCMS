import { CheckCircle2 } from 'lucide-react'

import SectionHeading from '@/components/Cms/SectionHeading'

const FEATURE_COLS = { 1: '', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-2 lg:grid-cols-3' }

const CmsFeatureList = ({ title, subtitle, columns = 2, items = [] }) => (
    <section className="py-8">
        {title && <SectionHeading subtitle={subtitle}>{title}</SectionHeading>}
        <div className={`grid gap-4 ${FEATURE_COLS[columns] ?? FEATURE_COLS[2]}`}>
            {items.map((item, i) => (
                <div key={i} className="flex gap-3">
                    <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-brand-primary" />
                    <div>
                        <p className="font-semibold text-brand-dark">{item.title}</p>
                        {item.text && <p className="mt-0.5 text-sm leading-relaxed text-gray-600">{item.text}</p>}
                    </div>
                </div>
            ))}
        </div>
    </section>
)

export default CmsFeatureList
