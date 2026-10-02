import { Trash2 } from 'lucide-react'

import { Button } from '@/components/UI/coss/button'
import {
    Dialog,
    DialogPopup,
    DialogTitle,
    DialogDescription,
    DialogHeader,
    DialogFooter,
} from '@/components/UI/coss/dialog'

const ConfirmDialog = ({
    open,
    message,
    onConfirm,
    onCancel,
    confirmLabel = 'Eliminar',
    cancelLabel = 'Cancelar',
}) => {
    return (
        <Dialog
            open={open}
            onOpenChange={(isOpen) => { if (!isOpen) onCancel() }}
        >
            <DialogPopup
                showCloseButton={false}
                className="w-full max-w-sm"
            >
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Trash2 size={18} className="text-red-500" />
                        Confirmar eliminacion
                    </DialogTitle>
                    <DialogDescription>
                        {message}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter variant="bare" className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onCancel}>
                        {cancelLabel}
                    </Button>
                    <Button variant="destructive" onClick={onConfirm}>
                        {confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogPopup>
        </Dialog>
    )
}

export default ConfirmDialog
