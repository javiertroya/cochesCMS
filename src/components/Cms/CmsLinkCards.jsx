import { Button } from "@/components/UI/coss/button"
import { FaArrowUpRightFromSquare, FaCircleQuestion } from 'react-icons/fa6'

const LinkCard = ({ id, icon: Icon, title, description, href, linkText }) => (
    <div id={id} className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-1 flex-col gap-4 p-6">
            <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-primary text-white">
                    <Icon size={18} />
                </span>
                <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            </div>
            <p className="flex-1 text-sm leading-relaxed text-gray-600">{description}</p>
            <Button
                size="sm"
                render={<a href={href} target="_blank" rel="noreferrer" />}
                className="self-start"
            >
                <FaArrowUpRightFromSquare size={11} />
                {linkText}
            </Button>
        </div>
    </div>
)

const CmsLinkCards = ({ items = [] }) => (
    <section className="grid grid-cols-1 gap-5 py-8 sm:grid-cols-2">
        {items.map((item, index) => (
            <LinkCard
                key={index}
                id={item.id}
                icon={FaCircleQuestion}
                title={item.title}
                description={item.description}
                href={item.href}
                linkText={item.linkText}
            />
        ))}
    </section>
)

export default CmsLinkCards
