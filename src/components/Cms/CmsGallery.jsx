import SectionHeading from '@/components/Cms/SectionHeading'

const GALLERY_COLS = { 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3', 4: 'sm:grid-cols-2 lg:grid-cols-4' }

const CmsGallery = ({ title, subtitle, columns = 3, items = [] }) => (
    <section className="py-8">
        {title && <SectionHeading subtitle={subtitle}>{title}</SectionHeading>}
        <div className={`grid grid-cols-2 gap-3 ${GALLERY_COLS[columns] ?? GALLERY_COLS[3]}`}>
            {items.map((item, i) => (
                <figure key={i} className="overflow-hidden rounded-xl">
                    {item.src
                        ? <img src={item.src} alt={item.alt || ''} className="aspect-square w-full object-cover transition duration-300 hover:scale-105" />
                        : <div className="flex aspect-square w-full items-center justify-center bg-gray-100 text-gray-400 text-xs">Sin imagen</div>
                    }
                    {item.caption && <figcaption className="mt-1.5 text-center text-xs text-gray-500">{item.caption}</figcaption>}
                </figure>
            ))}
        </div>
    </section>
)

export default CmsGallery
