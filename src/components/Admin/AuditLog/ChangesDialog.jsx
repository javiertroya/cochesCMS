import { Button } from '@/components/UI/coss/button'
import {
    Dialog,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogPanel,
    DialogPopup,
    DialogTitle,
} from '@/components/UI/coss/dialog'

const formatDate = (value) => new Intl.DateTimeFormat('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
}).format(new Date(value))

const ChangesDialog = ({ log, onClose }) => (
    <Dialog open={!!log} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogPopup className="max-w-xl">
            <DialogHeader>
                <DialogTitle>Cambios registrados</DialogTitle>
                <DialogDescription>
                    {log?.resource_label} · {log ? formatDate(log.created_at) : ''}
                </DialogDescription>
            </DialogHeader>
            <DialogPanel className="space-y-3">
                {log && Object.keys(log.changes ?? {}).length === 0 ? (
                    <p className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-500">
                        Esta acción no guardó detalles de cambios.
                    </p>
                ) : (
                    Object.entries(log?.changes ?? {}).map(([field, change]) => (
                        <div key={field} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{field}</p>
                            <div className="mt-2 grid gap-3 sm:grid-cols-2">
                                <div>
                                    <p className="text-[11px] font-medium text-gray-400">Antes</p>
                                    <p className="mt-1 rounded-lg bg-white px-3 py-2 font-mono text-xs text-gray-500">
                                        {String(change.before ?? 'Vacío')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[11px] font-medium text-gray-400">Después</p>
                                    <p className="mt-1 rounded-lg bg-white px-3 py-2 font-mono text-xs text-gray-800">
                                        {String(change.after ?? 'Vacío')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </DialogPanel>
            <DialogFooter>
                <Button onClick={onClose}>Cerrar</Button>
            </DialogFooter>
        </DialogPopup>
    </Dialog>
)

export default ChangesDialog
