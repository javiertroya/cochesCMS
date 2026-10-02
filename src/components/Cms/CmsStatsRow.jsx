import SectionHeading from '@/components/Cms/SectionHeading'

const CmsStatsRow = ({ title, subtitle, items = [] }) => (
    <section className="py-8">
        {title && <SectionHeading subtitle={subtitle}>{title}</SectionHeading>}
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {items.map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-1 text-center">
                    <p className="text-4xl font-extrabold tracking-tight text-brand-primary">
                        {item.value}<span className="text-2xl">{item.unit}</span>
                    </p>
                    <p className="text-sm font-medium text-gray-500">{item.label}</p>
                </div>
            ))}
        </div>
    </section>
)

export default CmsStatsRow
