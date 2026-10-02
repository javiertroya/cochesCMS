import { useState } from 'react'

import { Button } from '@/components/UI/coss/button'
import { Input } from '@/components/UI/coss/input'
import { ROLE_CONFIG } from '@/mocks/UserConfig'

// ............................................................................
const FIELD = ({ label, children }) => (
    <label className="block space-y-1.5">
        <span className="text-sm font-semibold text-[#374151]">{label}</span>
        {children}
    </label>
)

// ............................................................................
const UserForm = ({ mode = 'create', user, onSubmit, onCancel }) => {
    const isEdit = mode === 'edit'
    const [role, setRole] = useState(user?.role ?? 'editor')
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState(null)

    const handleSubmit = async (event) => {
        event.preventDefault()
        setError(null)
        setSubmitting(true)

        try {
            const data = Object.fromEntries(new FormData(event.target))
            data.role = role
            data.phone = data.phone || null

            if (isEdit && !data.password) {
                delete data.password
            }

            await onSubmit(data)
        } catch (err) {
            setError(err.message || `No se pudo ${isEdit ? 'actualizar' : 'crear'} el usuario.`)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
            {/* Rol */}
            <div>
                <p className="mb-2 text-sm font-semibold text-[#374151]">Rol</p>
                <div className="grid gap-2 sm:grid-cols-2">
                    {Object.entries(ROLE_CONFIG).map(([value, config]) => {
                        const Icon = config.icon
                        const selected = role === value
                        return (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setRole(value)}
                                className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
                                    selected
                                        ? 'border-brand-primary bg-brand-primary/5'
                                        : 'border-[#dcdfea] hover:bg-gray-50'
                                }`}
                            >
                                <Icon className={`mt-0.5 h-4 w-4 ${selected ? 'text-brand-primary' : 'text-gray-400'}`} />
                                <span>
                                    <span className="block text-sm font-semibold text-[#111827]">{config.label}</span>
                                    <span className="block text-xs text-[#6b7280]">{config.description}</span>
                                </span>
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <FIELD label="Nombre">
                    <Input name="name" required defaultValue={user?.name ?? ''} placeholder="Nombre completo" />
                </FIELD>
                <FIELD label="Teléfono (opcional)">
                    <Input name="phone" defaultValue={user?.phone ?? ''} placeholder="600 000 000" />
                </FIELD>
            </div>

            <FIELD label="Email">
                <Input
                    name="email"
                    type="email"
                    required
                    defaultValue={user?.email ?? ''}
                    placeholder="usuario@email.com"
                />
            </FIELD>

            <FIELD label={isEdit ? 'Nueva contraseña' : 'Contraseña'}>
                <Input
                    name="password"
                    type="password"
                    required={!isEdit}
                    minLength={8}
                    placeholder={isEdit ? 'Dejar vacío para mantener la actual' : 'Mínimo 8 caracteres'}
                />
            </FIELD>

            {error && (
                <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
            )}

            <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
                    Cancelar
                </Button>
                <Button type="submit" loading={submitting}>
                    {isEdit ? 'Guardar cambios' : 'Crear usuario'}
                </Button>
            </div>
        </form>
    )
}

export default UserForm
