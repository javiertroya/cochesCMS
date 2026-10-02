import { FaCircleQuestion } from 'react-icons/fa6'

import AccordionDefault from '@/components/UI/Accordion'
import SectionHeading from '@/components/Cms/SectionHeading'
import PRINCIPIOS from '@/mocks/principios'
import RESPONSABILIDADES from '@/mocks/responsabilidades'

const accordionSources = {
    principios: PRINCIPIOS,
    responsabilidades: RESPONSABILIDADES,
}

const normalizeAccordionItems = (items = []) =>
    items.map((item, index) => ({
        id: item.id ?? index,
        icon: item.icon ?? FaCircleQuestion,
        title: item.title,
        text: item.text ?? item.content,
    }))

const CmsAccordion = ({ anchor, title, subtitle, source, items = [] }) => {
    const content = source ? accordionSources[source] : normalizeAccordionItems(items)

    return (
        <section id={anchor || undefined} className="py-8">
            {title && <SectionHeading subtitle={subtitle}>{title}</SectionHeading>}
            <AccordionDefault content={content} />
        </section>
    )
}

export default CmsAccordion
