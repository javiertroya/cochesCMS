import { cn } from "@/lib/utils"
import {
    Accordion,
    AccordionItem,
    AccordionPanel,
    AccordionTrigger,
} from "@/components/UI/coss/accordion"

// ............................................................
const AccordionDefault = ({ content, triggerClassName }) => {

    // ............................
    const renderItem = (item, index) => {
        const Icon = item.icon
        return (
            <AccordionItem 
                value={`item-${index}`}
                key={item.id}
            >
                <AccordionTrigger 
                    className={cn("px-4 text-base", triggerClassName)}
                >
                    <span 
                        className="
                            flex items-center gap-3
                    ">
                        <span 
                            className="
                                flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-900
                        ">
                            <Icon size={15} />
                        </span>
                        <span 
                            className="
                                font-medium text-gray-800
                        ">
                            {item.title}
                        </span>
                    </span>
                </AccordionTrigger>
                <AccordionPanel>
                    <p 
                        className="
                            pl-16 pr-4 text-gray-600 text-sm leading-relaxed
                    ">
                        {item.text}
                    </p>
                </AccordionPanel>
            </AccordionItem>
        )
    }

    // ............................
    return (
        <div
            className="
                mx-25 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden
        ">
            <Accordion>
                {
                    content.map(renderItem)
                }
            </Accordion>
        </div>
    )
}

export default AccordionDefault
