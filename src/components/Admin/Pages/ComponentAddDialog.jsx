import { Puzzle } from 'lucide-react'

import {
    Dialog,
    DialogPopup,
    DialogHeader,
    DialogTitle,
    DialogPanel,
} from '@/components/UI/coss/dialog'
import ComponentInsertMenu from './ComponentInsertMenu'

const ComponentAddDialog = ({ isOpen, onClose, componentTypes, onAddComponent }) => (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
        <DialogPopup className="sm:max-w-3xl" showCloseButton>
            <DialogHeader>
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                        <Puzzle size={17} />
                    </div>
                    <DialogTitle>Añadir componente</DialogTitle>
                </div>
            </DialogHeader>

            <DialogPanel>
                <ComponentInsertMenu
                    componentTypes={componentTypes}
                    onAddComponent={onAddComponent}
                />
            </DialogPanel>
        </DialogPopup>
    </Dialog>
)

export default ComponentAddDialog
