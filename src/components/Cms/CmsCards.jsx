import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import SectionHeading from '@/components/Cms/SectionHeading'

const CmsCards = ({ title, subtitle, items = [] }) => (
    <section className="py-8">
        {title && <SectionHeading subtitle={subtitle}>{title}</SectionHeading>}
        <div className="grid gap-5 md:grid-cols-3">
            {items.map((item, index) => (
                <article key={index} className="group flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-brand-primary/30 hover:shadow-md">
                    <h3 className="text-base font-semibold text-brand-dark">{item.title}</h3>
                    {item.text && <p className="mt-2 flex-1 text-sm leading-6 text-gray-500">{item.text}</p>}
                    {item.url && (
                        <Link to={item.url} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-primary">
                            Ver más <ArrowRight size={13} />
                        </Link>
                    )}
                </article>
            ))}
        </div>
    </section>
)

export default CmsCards
