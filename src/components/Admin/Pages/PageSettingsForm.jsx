import { useState } from 'react'
import { Lock } from 'lucide-react'
import { HexColorPicker, HexColorInput } from 'react-colorful'
import { NAV_ICON_OPTIONS, NAV_ICON_MAP } from '@/mocks/admin/navIcons'

const Label = ({ children }) => (
    <p className="mb-1.5 text-sm font-medium text-gray-700">{children}</p>
)

const fieldClass = "h-9 w-full rounded-lg border border-gray-200 bg-white pl-3 pr-9 text-sm text-gray-900 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary/20"

const Toggle = ({ checked, onChange, label, description }) => (
    <div
        role="button"
        tabIndex={0}
        onClick={() => onChange(!checked)}
        onKeyDown={e => e.key === ' ' && onChange(!checked)}
        className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors select-none ${
            checked
                ? 'border-brand-primary/20 bg-brand-primary/5'
                : 'border-gray-100 bg-gray-50 hover:bg-gray-100'
        }`}
    >
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            className={`relative mt-0.5 inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${
                checked ? 'bg-brand-primary' : 'bg-gray-300'
            }`}
        >
            <span
                className={`absolute left-0.5 top-0.5 size-4 rounded-full bg-white shadow-sm transition-transform ${
                    checked ? 'translate-x-4' : 'translate-x-0'
                }`}
            />
        </button>
        <div className="min-w-0">
            <p className={`text-sm font-semibold leading-tight ${checked ? 'text-brand-primary' : 'text-gray-700'}`}>
                {label}
            </p>
            {description && (
                <p className="mt-0.5 text-xs text-gray-400">{description}</p>
            )}
        </div>
    </div>
)

const getChildPart = (fullSlug, parentSlug) => {
    if (parentSlug && fullSlug.startsWith(parentSlug + '/')) {
        return fullSlug.slice(parentSlug.length + 1)
    }
    return fullSlug
}

const BRAND_PRIMARY = '#1A4D8D'

const PageSettingsForm = ({ draft, cmsPages, selectedId, onDraftChange }) => {
    const [showColorPicker, setShowColorPicker] = useState(false)

    const navValue = !draft.nav_visible
        ? 'hidden'
        : draft.nav_parent_slug
            ? `child:${draft.nav_parent_slug}`
            : 'root'

    const handleNavChange = (value) => {
        if (value === 'hidden') {
            onDraftChange('nav_visible', false)
            onDraftChange('nav_parent_slug', '')
            if (draft.nav_parent_slug) {
                onDraftChange('slug', getChildPart(draft.slug, draft.nav_parent_slug))
            }
        } else if (value === 'root') {
            onDraftChange('nav_visible', true)
            onDraftChange('nav_parent_slug', '')
            if (draft.nav_parent_slug) {
                onDraftChange('slug', getChildPart(draft.slug, draft.nav_parent_slug))
            }
        } else {
            const newParent = value.replace('child:', '')
            const childPart = getChildPart(draft.slug, draft.nav_parent_slug)
            onDraftChange('nav_visible', true)
            onDraftChange('nav_parent_slug', newParent)
            onDraftChange('slug', `${newParent}/${childPart}`)
        }
    }

    const CurrentNavIcon = draft.nav_icon ? NAV_ICON_MAP[draft.nav_icon] : null
    const parentOptions = (cmsPages ?? []).filter(
        p => p.id !== selectedId && p.nav_visible && !p.nav_parent_slug,
    )
    const hasParent = !!draft.nav_parent_slug
    const childSlug = getChildPart(draft.slug, draft.nav_parent_slug)

    return (
        <div className="space-y-5 p-5">

            <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
                <div>
                    <Label>Título</Label>
                    <input
                        value={draft.title}
                        onChange={e => onDraftChange('title', e.target.value)}
                        placeholder="Nombre visible de la página"
                        className={fieldClass}
                    />
                </div>

                <div>
                    <Label>
                        Slug{' '}
                        <span className="font-normal text-gray-400">(URL pública)</span>
                    </Label>
                    {hasParent ? (
                        <div>
                            <div className="flex overflow-hidden rounded-lg border border-gray-200 bg-white focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary/20">
                                <span className="flex select-none items-center gap-1.5 border-r border-gray-200 bg-gray-100 px-3 py-2 font-mono text-sm text-gray-500 whitespace-nowrap">
                                    <Lock size={11} className="shrink-0 text-gray-400" />
                                    /{draft.nav_parent_slug}/
                                </span>
                                <input
                                    value={childSlug}
                                    onChange={e =>
                                        onDraftChange('slug', `${draft.nav_parent_slug}/${e.target.value}`)
                                    }
                                    placeholder="mi-pagina"
                                    className="h-9 min-w-0 flex-1 bg-transparent px-3 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none"
                                />
                            </div>
                            <p className="mt-1.5 text-xs text-gray-400">
                                URL completa: <span className="font-mono text-gray-600">/{draft.slug}</span>
                            </p>
                        </div>
                    ) : (
                        <div className="flex overflow-hidden rounded-lg border border-gray-200 bg-white focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary/20">
                            <span className="select-none border-r border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-400">/</span>
                            <input
                                value={draft.slug}
                                onChange={e => onDraftChange('slug', e.target.value)}
                                placeholder="mi-pagina"
                                className="h-9 min-w-0 flex-1 bg-transparent px-3 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none"
                            />
                        </div>
                    )}
                </div>

                <div>
                    <Label>Posición en el menú</Label>
                    <select
                        value={navValue}
                        onChange={e => handleNavChange(e.target.value)}
                        className={fieldClass}
                    >
                        <option value="hidden">Oculta (no aparece en el menú)</option>
                        <option value="root">Menú principal (raíz)</option>
                        {parentOptions.map(p => (
                            <option key={p.slug} value={`child:${p.slug}`}>
                                Submenú de &ldquo;{p.title}&rdquo;
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <Label>Icono</Label>
                        <div className="flex h-9 items-center gap-2 overflow-hidden rounded-lg border border-gray-200 bg-white px-2 focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary/20">
                            {CurrentNavIcon && <CurrentNavIcon size={14} className="shrink-0 text-gray-500" />}
                            <select
                                value={draft.nav_icon ?? ''}
                                onChange={e => onDraftChange('nav_icon', e.target.value)}
                                className="h-full w-full bg-transparent pr-7 text-sm text-gray-900 focus:outline-none"
                            >
                                {NAV_ICON_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <Label>Orden</Label>
                        <input
                            type="number"
                            value={draft.nav_order}
                            onChange={e => onDraftChange('nav_order', Number(e.target.value))}
                            className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary/20"
                        />
                    </div>
                </div>

                <div className="sm:col-span-2">
                    <Label>Color del ícono de página</Label>
                    <p className="mb-2 text-xs text-gray-400">
                        Solo afecta al cuadro del ícono en la tabla del administrador.
                    </p>
                    <div className="relative inline-block">
                        <button
                            type="button"
                            onClick={() => setShowColorPicker(v => !v)}
                            className="flex h-9 items-center gap-2.5 rounded-lg border border-gray-200 bg-white px-3 text-sm transition hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-brand-primary/20"
                        >
                            <span
                                className="h-5 w-5 shrink-0 rounded-md border border-gray-100 shadow-sm"
                                style={{ backgroundColor: draft.page_color || BRAND_PRIMARY }}
                            />
                            <span className="font-mono text-xs text-gray-600">
                                {draft.page_color || BRAND_PRIMARY}
                            </span>
                        </button>
                        {showColorPicker && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowColorPicker(false)}
                                />
                                <div className="absolute left-0 bottom-full z-20 mb-1 overflow-hidden rounded-xl shadow-xl">
                                    <HexColorPicker
                                        color={draft.page_color || BRAND_PRIMARY}
                                        onChange={c => onDraftChange('page_color', c)}
                                    />
                                    <HexColorInput
                                        color={draft.page_color || BRAND_PRIMARY}
                                        onChange={c => onDraftChange('page_color', c)}
                                        prefixed
                                        className="w-full border-t border-gray-100 bg-white px-3 py-2 font-mono text-sm text-center focus:outline-none"
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div>
                <Label>Visibilidad y acceso</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                    <Toggle
                        checked={!!draft.is_published}
                        onChange={v => onDraftChange('is_published', v)}
                        label="Publicada"
                        description="Visible para todos los visitantes del sitio"
                    />
                    <Toggle
                        checked={!!draft.requires_auth}
                        onChange={v => onDraftChange('requires_auth', v)}
                        label="Requiere sesión"
                        description="Solo accesible para usuarios registrados"
                    />
                </div>
            </div>
        </div>
    )
}

export default PageSettingsForm
