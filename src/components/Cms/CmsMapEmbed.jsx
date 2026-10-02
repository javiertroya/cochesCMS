import SectionHeading from '@/components/Cms/SectionHeading'

const CmsMapEmbed = ({ src, title, subtitle, height = 400 }) => {
    if (!src) return null
    return (
        <section className="py-8">
            {title && <SectionHeading subtitle={subtitle}>{title}</SectionHeading>}
            <div className="overflow-hidden rounded-2xl shadow-sm" style={{ height: `${height}px` }}>
                <iframe
                    src={src}
                    title={title || 'Mapa'}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="h-full w-full border-0"
                />
            </div>
        </section>
    )
}

export default CmsMapEmbed
