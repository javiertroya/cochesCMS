import { X } from "lucide-react"

import { Button } from "@/components/UI/coss/button"
import { ScrollArea } from "@/components/UI/coss/scroll-area"

const AdminFormModal = (props) => {

    // ............................
    const { title, children, onClose } = props

    // ............................
    return (
        <div className="
            fixed inset-0 z-100
            flex items-center justify-center
            bg-slate-950/70 px-4 py-8
        ">
            <div className="
                flex max-h-[calc(100vh-4rem)] w-full max-w-2xl flex-col
                rounded-2xl border border-slate-200 bg-white
                shadow-2xl shadow-slate-950/20
            ">
                <header className="
                    flex items-center justify-between gap-4
                    border-b border-slate-200 px-6 py-4
                ">
                    <h2 className="text-xl font-bold text-slate-900">
                        {title}
                    </h2>

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        aria-label="Cerrar"
                    >
                        <X />
                    </Button>
                </header>

                <ScrollArea scrollFade scrollbarGutter>
                    {children}
                </ScrollArea>
            </div>
        </div>
    )
}

export default AdminFormModal
