import { useState } from 'react'

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
import { Input } from '@/components/UI/coss/input'
import { Switch } from '@/components/UI/coss/switch'

const emptyForm = {
    from_path: '/',
    to_path: '/',
    status_code: 301,
    is_active: true,
}

const normalizePath = (value) => {
    const trimmed = value.trim()
    if (!trimmed) return '/'
    return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}

const RedirectFormDialog = ({ open, redirect, saving, onClose, onSubmit }) => {
    const [form, setForm] = useState(redirect ?? emptyForm)

    const updateField = (field, value) => {
        setForm((current) => ({ ...current, [field]: value }))
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        onSubmit({
            ...form,
            from_path: normalizePath(form.from_path),
            to_path: normalizePath(form.to_path),
            status_code: Number(form.status_code),
        })
    }

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogPopup className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>{redirect ? 'Editar redirección' : 'Nueva redirección'}</DialogTitle>
                    <DialogDescription>
                        Define la ruta antigua, la nueva URL y si la redirección debe estar activa.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <DialogPanel className="space-y-4">
                        <label className="block space-y-1.5 text-sm font-medium text-gray-700">
                            <span>Ruta origen</span>
                            <Input
                                nativeInput
                                required
                                value={form.from_path}
                                placeholder="/pagina-antigua"
                                onChange={(event) => updateField('from_path', event.target.value)}
                            />
                        </label>
                        <label className="block space-y-1.5 text-sm font-medium text-gray-700">
                            <span>Ruta destino</span>
                            <Input
                                nativeInput
                                required
                                value={form.to_path}
                                placeholder="/pagina-nueva"
                                onChange={(event) => updateField('to_path', event.target.value)}
                            />
                        </label>
                        <label className="block space-y-1.5 text-sm font-medium text-gray-700">
                            <span>Tipo</span>
                            <select
                                value={form.status_code}
                                onChange={(event) => updateField('status_code', event.target.value)}
                                className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-3 pr-9 text-sm text-gray-700 outline-none transition-shadow focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                            >
                                <option value={301}>301 Permanente</option>
                                <option value={302}>302 Temporal</option>
                            </select>
                        </label>
                        <label className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                            <span>
                                <span className="block text-sm font-medium text-gray-800">Redirección activa</span>
                                <span className="text-xs text-gray-400">Las inactivas se mantienen como borrador.</span>
                            </span>
                            <Switch
                                checked={form.is_active}
                                onCheckedChange={(checked) => updateField('is_active', checked)}
                            />
                        </label>
                    </DialogPanel>
                    <DialogFooter>
                        <Button variant="outline" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" loading={saving}>{redirect ? 'Guardar' : 'Crear'}</Button>
                    </DialogFooter>
                </form>
            </DialogPopup>
        </Dialog>
    )
}

export default RedirectFormDialog
