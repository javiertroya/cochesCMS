import { Controller } from 'react-hook-form'

import ColorInput from '@/components/Admin/Styles/ColorInput'
import StylesSection from '@/components/Admin/Styles/StylesSection'

const COLOR_PRESETS = [
    { name: 'Índigo',    primary: '#6366f1', secondary: '#8b5cf6', accent: '#06b6d4', background: '#ffffff', text: '#1f2937', heading: '#111827', link: '#6366f1' },
    { name: 'Cobalto',   primary: '#2563eb', secondary: '#3b82f6', accent: '#f59e0b', background: '#ffffff', text: '#1e293b', heading: '#0f172a', link: '#2563eb' },
    { name: 'Esmeralda', primary: '#059669', secondary: '#10b981', accent: '#8b5cf6', background: '#ffffff', text: '#1f2937', heading: '#111827', link: '#059669' },
    { name: 'Coral',     primary: '#ea580c', secondary: '#f97316', accent: '#0ea5e9', background: '#ffffff', text: '#1c1917', heading: '#0c0a09', link: '#ea580c' },
    { name: 'Pizarra',   primary: '#334155', secondary: '#475569', accent: '#0ea5e9', background: '#f8fafc', text: '#1e293b', heading: '#0f172a', link: '#0ea5e9' },
    { name: 'Noche',     primary: '#818cf8', secondary: '#a78bfa', accent: '#22d3ee', background: '#0f172a', text: '#cbd5e1', heading: '#f1f5f9', link: '#818cf8' },
]

const COLOR_GROUPS = [
    {
        label: 'Marca',
        gridClass: 'sm:grid-cols-3',
        fields: [
            { name: 'primary_color',   label: 'Primario' },
            { name: 'secondary_color', label: 'Secundario' },
            { name: 'accent_color',    label: 'Acento' },
        ],
    },
    {
        label: 'Contenido',
        gridClass: 'sm:grid-cols-2 lg:grid-cols-4',
        fields: [
            { name: 'background_color', label: 'Fondo' },
            { name: 'text_color',       label: 'Texto' },
            { name: 'heading_color',    label: 'Títulos' },
            { name: 'link_color',       label: 'Enlaces' },
        ],
    },
]

const SECTION_LABEL = 'text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-3'

const ColorsSection = ({ control, applyPreset, preview }) => {
    const { primaryColor, secondaryColor, accentColor, bgColor, textColor, headingColor, linkColor, headingFont, bodyFont, borderRadius } = preview

    return (
        <StylesSection title="Colores">

            {/* Temas rápidos */}
            <div className="mb-6">
                <p className={SECTION_LABEL}>Temas rápidos</p>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {COLOR_PRESETS.map((preset) => (
                        <button
                            key={preset.name}
                            type="button"
                            onClick={() => applyPreset(preset)}
                            className="flex flex-col gap-2 rounded-xl border border-gray-200 p-3 text-left transition-all hover:border-brand-primary hover:shadow-sm cursor-pointer"
                        >
                            <span className="flex h-5 w-full overflow-hidden rounded-md">
                                <span style={{ backgroundColor: preset.primary,    flex: 1 }} />
                                <span style={{ backgroundColor: preset.secondary,  flex: 1 }} />
                                <span style={{ backgroundColor: preset.accent,     flex: 1 }} />
                            </span>
                            <span className="text-[11px] font-medium text-gray-500 leading-none">{preset.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Grupos de colores */}
            <div className="space-y-6">
                {COLOR_GROUPS.map((group) => (
                    <div key={group.label}>
                        <p className={SECTION_LABEL}>{group.label}</p>
                        <div className={`grid grid-cols-1 ${group.gridClass} gap-4`}>
                            {group.fields.map(({ name, label }) => (
                                <Controller
                                    key={name}
                                    name={name}
                                    control={control}
                                    render={({ field }) => (
                                        <ColorInput label={label} value={field.value} onChange={field.onChange} />
                                    )}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <hr className="my-6 border-gray-100" />

            {/* Vista previa */}
            <div>
                <p className={SECTION_LABEL}>Vista previa</p>
                <div
                    className="overflow-hidden rounded-xl border border-gray-200 transition-colors"
                    style={{ backgroundColor: bgColor }}
                >
                    {/* Mini nav */}
                    <div
                        className="flex items-center justify-between border-b px-4 py-2.5"
                        style={{ borderColor: `${headingColor}18`, backgroundColor: `${primaryColor}12` }}
                    >
                        <span className="text-xs font-bold" style={{ color: primaryColor, fontFamily: headingFont }}>
                            Mi sitio
                        </span>
                        <div className="flex gap-4">
                            {['Inicio', 'Blog', 'Contacto'].map((l) => (
                                <span key={l} className="text-[11px]" style={{ color: textColor, fontFamily: bodyFont }}>{l}</span>
                            ))}
                        </div>
                    </div>

                    {/* Contenido */}
                    <div className="p-5 space-y-3">
                        <p className="text-base font-bold leading-tight" style={{ color: headingColor, fontFamily: headingFont }}>
                            Título de ejemplo
                        </p>
                        <p className="text-sm leading-relaxed" style={{ color: textColor, fontFamily: bodyFont }}>
                            Este es un párrafo de ejemplo con el texto del cuerpo.{' '}
                            <a
                                href="#"
                                onClick={(e) => e.preventDefault()}
                                className="underline"
                                style={{ color: linkColor }}
                            >
                                Un enlace aquí.
                            </a>
                        </p>
                        <div className="flex flex-wrap gap-2 pt-1">
                            {[
                                { c: primaryColor,   l: 'Primario' },
                                { c: secondaryColor, l: 'Secundario' },
                                { c: accentColor,    l: 'Acento' },
                            ].map(({ c, l }) => (
                                <span
                                    key={l}
                                    className="px-3 py-1 text-xs font-medium text-white"
                                    style={{ backgroundColor: c, borderRadius }}
                                >
                                    {l}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

        </StylesSection>
    )
}

export default ColorsSection
