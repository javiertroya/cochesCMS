import { ExternalLink, Mail, Phone, Trash2 } from 'lucide-react'

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
import { REQUEST_STATUSES } from './requestStatus'
import { formatDateTime } from '@/utils/format'

// Campos de texto largo: se muestran a todo el ancho y respetando saltos de línea
const LONG_FIELDS = new Set(['message', 'comments', 'must_have'])

const RequestDetailDialog = ({ request, saving, onClose, onStatusChange, onDelete }) => {
    const data = request?.data ?? {}

    return (
        <Dialog open={!!request} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogPopup className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{data.name || `Solicitud #${request?.id}`}</DialogTitle>
                    <DialogDescription>
                        {request?.type_label ?? request?.type}
                        {' · '}
                        {formatDateTime(request?.created_at)}
                        {request?.source_page && <> · desde <span className="font-mono">{request.source_page}</span></>}
                    </DialogDescription>
                </DialogHeader>

                <DialogPanel className="space-y-5">
                    <div className="grid gap-3 sm:grid-cols-2">
                        {data.phone && (
                            <a
                                href={`tel:${data.phone.replace(/[^\d+]/g, '')}`}
                                className="flex min-w-0 items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm transition hover:border-brand-primary/30 hover:bg-blue-50/50"
                            >
                                <Phone className="h-4 w-4 shrink-0 text-brand-primary" />
                                <span className="truncate font-medium text-gray-900">{data.phone}</span>
                            </a>
                        )}
                        {data.email && (
                            <a
                                href={`mailto:${data.email}`}
                                className="flex min-w-0 items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm transition hover:border-brand-primary/30 hover:bg-blue-50/50"
                            >
                                <Mail className="h-4 w-4 shrink-0 text-brand-primary" />
                                <span className="truncate font-medium text-gray-900">{data.email}</span>
                            </a>
                        )}
                    </div>

                    {request?.summary?.length > 0 && (
                        <section>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Detalles</p>
                            <dl className="grid gap-x-6 gap-y-3 rounded-xl border border-gray-100 bg-white p-4 sm:grid-cols-2">
                                {request.summary.map((item) => (
                                    <div key={item.key} className={`min-w-0 ${LONG_FIELDS.has(item.key) || item.key === 'listing_url' ? 'sm:col-span-2' : ''}`}>
                                        <dt className="text-xs text-gray-400">{item.label}</dt>
                                        <dd className={`mt-0.5 text-sm text-gray-900 ${LONG_FIELDS.has(item.key) ? 'whitespace-pre-wrap leading-relaxed' : ''}`}>
                                            {item.key === 'listing_url' ? (
                                                <a
                                                    href={item.value}
                                                    target="_blank"
                                                    rel="noopener noreferrer nofollow"
                                                    className="inline-flex max-w-full items-center gap-1 font-medium text-brand-primary hover:underline"
                                                >
                                                    <span className="truncate">{item.value}</span>
                                                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                                                </a>
                                            ) : item.value}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        </section>
                    )}

                    {data.attachments?.length > 0 && (
                        <section>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                Capturas ({data.attachments.length})
                            </p>
                            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                                {data.attachments.map((attachment) => (
                                    <a
                                        key={attachment.url}
                                        href={attachment.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="aspect-square overflow-hidden rounded-xl border border-gray-100 bg-gray-50 transition hover:ring-2 hover:ring-brand-primary/40"
                                        title={attachment.name}
                                    >
                                        <img src={attachment.url} alt={attachment.name} className="h-full w-full object-cover" />
                                    </a>
                                ))}
                            </div>
                        </section>
                    )}

                    <section>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Estado</p>
                        <div className="flex flex-wrap gap-2">
                            {REQUEST_STATUSES.map((status) => {
                                const active = request?.status === status.value
                                return (
                                    <button
                                        key={status.value}
                                        type="button"
                                        disabled={saving || active}
                                        onClick={() => onStatusChange(request, status.value)}
                                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition disabled:cursor-default ${
                                            active ? status.badge : 'bg-white text-gray-500 ring-gray-200 hover:bg-gray-50'
                                        } ${saving && !active ? 'opacity-60' : ''}`}
                                    >
                                        <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                                        {status.label}
                                    </button>
                                )
                            })}
                        </div>
                    </section>
                </DialogPanel>

                <DialogFooter className="sm:justify-between">
                    <Button variant="ghost" onClick={() => onDelete(request)} className="text-red-600 hover:bg-red-50 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                        Eliminar
                    </Button>
                    <Button variant="outline" onClick={onClose}>
                        Cerrar
                    </Button>
                </DialogFooter>
            </DialogPopup>
        </Dialog>
    )
}

export default RequestDetailDialog
