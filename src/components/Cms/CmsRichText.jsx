import SectionHeading from '@/components/Cms/SectionHeading'

const CmsRichText = ({ anchor, title, subtitle, body }) => (
    <section id={anchor || undefined} className="mx-auto max-w-4xl py-8">
        {title && <SectionHeading subtitle={subtitle}>{title}</SectionHeading>}
        {body && (
            <div className="space-y-3 text-base leading-8 text-gray-700">
                {String(body).split('\n').filter(Boolean).map((line, index) => (
                    <p key={index}>{line}</p>
                ))}
            </div>
        )}
    </section>
)

export default CmsRichText
