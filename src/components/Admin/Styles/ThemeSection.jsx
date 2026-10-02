import { Controller } from 'react-hook-form'
import { Check, Info } from 'lucide-react'

import StylesSection from '@/components/Admin/Styles/StylesSection'

// Miniatura de cada tema (cabecera, hero y tarjeta) para elegir de un vistazo
const THEMES = [
    {
        value: 'classic',
        label: 'Clásico',
        description: 'Usa los colores y la tipografía configurados abajo.',
        preview: (
            <div className="flex h-full flex-col bg-white">
                <div className="flex h-3 items-center bg-[#0f172a] px-2"><span className="h-1 w-6 rounded-full bg-white/70" /></div>
                <div className="flex h-3 items-center gap-1.5 bg-[#1d4ed8] px-2">
                    {[0, 1, 2].map((i) => <span key={i} className="h-1 w-4 rounded-full bg-white/80" />)}
                </div>
                <div className="flex flex-1 flex-col justify-center gap-1 bg-linear-to-br from-[#0f172a] to-[#1d4ed8] px-3">
                    <span className="h-1.5 w-16 rounded-full bg-white" />
                    <span className="h-1 w-10 rounded-full bg-white/60" />
                    <span className="mt-1 h-2 w-8 rounded bg-white" />
                </div>
                <div className="flex gap-1.5 p-2">
                    <span className="h-4 flex-1 rounded-md border border-gray-200" />
                    <span className="h-4 flex-1 rounded-md border border-gray-200" />
                </div>
            </div>
        ),
    },
    {
        value: 'pro',
        label: 'Pro',
        description: 'Estética de lujo: negro, marfil y dorado, titulares con serifa.',
        preview: (
            <div className="flex h-full flex-col bg-[#f7f4ef]">
                <div className="flex h-5 items-center justify-center border-b border-[#c5a46d]/30 bg-[#0b0b0c]">
                    <span className="h-1 w-10 bg-white/90" />
                </div>
                <div className="flex h-2.5 items-center justify-center gap-2 border-b border-[#c5a46d]/30 bg-[#0b0b0c]">
                    {[0, 1, 2].map((i) => <span key={i} className="h-0.5 w-3 bg-white/70" />)}
                </div>
                <div className="flex flex-1 flex-col justify-center gap-1 bg-linear-to-r from-black to-[#2a2a2d] px-3">
                    <span className="h-px w-6 bg-[#c5a46d]" />
                    <span className="h-1.5 w-16 bg-white" />
                    <span className="mt-1 h-2 w-8 bg-[#c5a46d]" />
                </div>
                <div className="flex gap-1.5 p-2">
                    <span className="h-4 flex-1 border border-[#e8e1d5] bg-white" />
                    <span className="h-4 flex-1 border border-[#e8e1d5] bg-white" />
                </div>
            </div>
        ),
    },
]

const ThemeSection = ({ control, watch }) => {
    const theme = watch('site_theme')

    return (
        <StylesSection title="Tema del sitio" description="Aspecto general de la web pública. El panel no cambia.">
            <Controller
                name="site_theme"
                control={control}
                render={({ field }) => (
                    <div role="radiogroup" aria-label="Tema del sitio" className="grid gap-4 sm:grid-cols-2">
                        {THEMES.map((option) => {
                            const active = (field.value || 'classic') === option.value
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    role="radio"
                                    aria-checked={active}
                                    onClick={() => field.onChange(option.value)}
                                    className={`group relative overflow-hidden rounded-xl border-2 text-left transition ${
                                        active ? 'border-brand-primary ring-4 ring-brand-primary/10' : 'border-gray-100 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="h-28 border-b border-gray-100">{option.preview}</div>
                                    <div className="flex items-start justify-between gap-3 p-4">
                                        <div>
                                            <p className="font-semibold text-gray-900">{option.label}</p>
                                            <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{option.description}</p>
                                        </div>
                                        <span className={`flex size-5 shrink-0 items-center justify-center rounded-full border ${
                                            active ? 'border-brand-primary bg-brand-primary text-white' : 'border-gray-300'
                                        }`}>
                                            {active && <Check className="size-3" />}
                                        </span>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                )}
            />

            {theme === 'pro' && (
                <p className="mt-4 flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-800">
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    Con el tema Pro, los colores y la tipografía de la web los pone el tema. Tus ajustes de
                    «Colores» y «Tipografía» se conservan y vuelven a aplicarse si eliges Clásico.
                </p>
            )}
        </StylesSection>
    )
}

export default ThemeSection
