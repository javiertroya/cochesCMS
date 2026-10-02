import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const fieldClass = 'h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary/20'

const PageSeoSection = ({ draft, onChange }) => {
    const [open, setOpen] = useState(false)
    const hasValues = draft.seo_title || draft.seo_description || draft.seo_og_image || draft.seo_canonical

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left transition hover:bg-gray-50"
            >
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-700">SEO</span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                        opcional
                    </span>
                    {hasValues && !open && (
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-primary" />
                    )}
                </div>
                <ChevronDown
                    size={14}
                    className={`text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                />
            </button>

            {open && (
                <div className="space-y-4 border-t border-gray-100 px-5 py-4">
                    <div>
                        <p className="mb-1.5 text-sm font-medium text-gray-700">Meta título</p>
                        <input
                            value={draft.seo_title ?? ''}
                            onChange={(e) => onChange('seo_title', e.target.value)}
                            placeholder="Título para motores de búsqueda"
                            className={fieldClass}
                        />
                    </div>
                    <div>
                        <p className="mb-1.5 text-sm font-medium text-gray-700">Meta descripción</p>
                        <textarea
                            value={draft.seo_description ?? ''}
                            onChange={(e) => onChange('seo_description', e.target.value)}
                            placeholder="Descripción para buscadores (recomendado: 150–160 caracteres)"
                            rows={2}
                            className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary/20"
                        />
                    </div>
                    <div>
                        <p className="mb-1.5 text-sm font-medium text-gray-700">OG Image URL</p>
                        <input
                            value={draft.seo_og_image ?? ''}
                            onChange={(e) => onChange('seo_og_image', e.target.value)}
                            placeholder="https://…"
                            className={fieldClass}
                        />
                    </div>
                    <div>
                        <p className="mb-1.5 text-sm font-medium text-gray-700">URL canónica</p>
                        <input
                            value={draft.seo_canonical ?? ''}
                            onChange={(e) => onChange('seo_canonical', e.target.value)}
                            placeholder="https://sitio.com/pagina"
                            className={fieldClass}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

export default PageSeoSection
