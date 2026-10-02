import SectionHeading from '@/components/Cms/SectionHeading'

const CmsCarousel = ({ title, subtitle, items = [] }) => (
    <section className="py-8">
        {title && <SectionHeading subtitle={subtitle}>{title}</SectionHeading>}
        <div className="grid gap-5 md:grid-cols-2">
            {items.map((item, index) => (
                <article key={index} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
                    {item.image && (
                        <div className="overflow-hidden">
                            <img
                                src={item.image}
                                alt={item.title || ''}
                                className="h-56 w-full object-cover transition duration-300 hover:scale-105"
                            />
                        </div>
                    )}
                    <div className="p-5">
                        {item.title && <h3 className="font-semibold text-brand-dark">{item.title}</h3>}
                        {item.text && <p className="mt-2 text-sm leading-6 text-gray-500">{item.text}</p>}
                    </div>
                </article>
            ))}
        </div>
    </section>
)

export default CmsCarousel
