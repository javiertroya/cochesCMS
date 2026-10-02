import SectionHeading from '@/components/Cms/SectionHeading'

const CmsSteps = ({ title, subtitle, items = [] }) => (
    <section className="py-8">
        {title && <SectionHeading subtitle={subtitle}>{title}</SectionHeading>}
        <ol className="space-y-0">
            {items.map((item, i) => (
                <li key={i} className="flex gap-5">
                    <div className="flex flex-col items-center">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-primary text-sm font-bold text-white shadow-sm">
                            {i + 1}
                        </span>
                        {i < items.length - 1 && <div className="mt-2 w-px flex-1 bg-gray-200" />}
                    </div>
                    <div className={i < items.length - 1 ? 'pb-8' : ''}>
                        <h3 className="text-base font-semibold text-brand-dark">{item.title}</h3>
                        {item.text && <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{item.text}</p>}
                    </div>
                </li>
            ))}
        </ol>
    </section>
)

export default CmsSteps
