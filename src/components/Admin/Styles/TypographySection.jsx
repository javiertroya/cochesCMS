import StylesSection from '@/components/Admin/Styles/StylesSection'

const FONTS = [
    'Inter', 'Poppins', 'Roboto', 'Open Sans', 'Lato',
    'Montserrat', 'Nunito', 'DM Sans', 'Plus Jakarta Sans',
    'Source Sans Pro', 'System UI', 'Georgia', 'Arial',
]

const FONT_SIZES = ['13px', '14px', '15px', '16px', '17px', '18px', '20px']

const BORDER_RADII = [
    { value: '0px',     label: 'Sin redondeo' },
    { value: '0.25rem', label: 'Pequeño' },
    { value: '0.5rem',  label: 'Medio' },
    { value: '0.75rem', label: 'Grande' },
    { value: '1rem',    label: 'Extra grande' },
    { value: '9999px',  label: 'Píldora' },
]

const SELECT_CLASS = 'w-full h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary'
const SECTION_LABEL = 'text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-3'

const FontCard = ({ tag, font }) => (
    <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-5 space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">{tag}</p>
        <div>
            <p className="text-4xl font-bold text-gray-900 leading-none" style={{ fontFamily: font }}>AaBbCcDdEeFf</p>
            <p className="text-[11px] text-gray-300 mt-1.5 tracking-wide" style={{ fontFamily: font }}>
                ABCDEFGHIJKLMNOPQRSTUVWXYZ
            </p>
        </div>
        <div className="border-t border-gray-100 pt-3 space-y-0.5">
            <p className="text-xs font-semibold text-gray-600" style={{ fontFamily: font }}>{font}</p>
            <p className="text-xs text-gray-400 leading-relaxed" style={{ fontFamily: font }}>
                El veloz murciélago hindú comía feliz cardillo y kiwi.
            </p>
        </div>
    </div>
)

const TypographySection = ({ register, preview }) => {
    const { headingFont, bodyFont, borderRadius } = preview

    return (
        <StylesSection title="Tipografía">

            {/* Fuentes */}
            <div className="mb-6">
                <p className={SECTION_LABEL}>Fuentes</p>
                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Títulos</label>
                        <select {...register('font_family_heading')} className={SELECT_CLASS}>
                            {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Cuerpo</label>
                        <select {...register('font_family_body')} className={SELECT_CLASS}>
                            {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Ajustes */}
            <div>
                <p className={SECTION_LABEL}>Ajustes</p>
                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Tamaño base</label>
                        <select {...register('font_size_base')} className={SELECT_CLASS}>
                            {FONT_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Radio de bordes</label>
                        <select {...register('border_radius')} className={SELECT_CLASS}>
                            {BORDER_RADII.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <hr className="my-6 border-gray-100" />

            {/* Vista previa de fuentes */}
            <div className="mb-6">
                <p className={SECTION_LABEL}>Vista previa de fuentes</p>
                <div className="grid sm:grid-cols-2 gap-4">
                    <FontCard tag="Títulos" font={headingFont} />
                    <FontCard tag="Cuerpo"  font={bodyFont} />
                </div>
            </div>

            {/* Vista previa de radio de bordes */}
            <div>
                <p className={SECTION_LABEL}>Radio de bordes</p>
                <div className="flex flex-wrap items-end gap-5">
                    {BORDER_RADII.map((r) => {
                        const active = borderRadius === r.value
                        return (
                            <div key={r.value} className="flex flex-col items-center gap-2">
                                <div
                                    className={`h-11 w-11 border-2 transition-colors ${active ? 'border-brand-primary bg-brand-primary/10' : 'border-gray-200 bg-gray-50'}`}
                                    style={{ borderRadius: r.value }}
                                />
                                <span className={`text-[10px] text-center leading-tight ${active ? 'text-brand-primary font-semibold' : 'text-gray-400'}`}>
                                    {r.label}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>

        </StylesSection>
    )
}

export default TypographySection
