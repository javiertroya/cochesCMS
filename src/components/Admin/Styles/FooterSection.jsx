import StylesSection from '@/components/Admin/Styles/StylesSection'
import { Input } from '@/components/UI/coss/input'
import { Textarea } from '@/components/UI/coss/textarea'

const FALLBACK = `© ${new Date().getFullYear()} Todos los derechos reservados.`
const SECTION_LABEL = 'text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-3'

const FooterSection = ({ register, watch }) => {
    const copyright   = watch('footer_copyright')
    const address     = watch('footer_address')
    const mapEmbed    = watch('footer_map_embed')
    const footerBg    = watch('secondary_color') || '#223369'
    const bodyFont    = watch('font_family_body') || 'Inter'

    return (
        <StylesSection title="Footer">
            <div className="space-y-6">
                <div className="grid gap-4 lg:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Dirección del footer
                        </label>
                        <Textarea
                            rows={3}
                            placeholder={'Calle ejemplo, 1\n30203 Cartagena, Murcia'}
                            {...register('footer_address')}
                        />
                        <p className="text-xs text-gray-400 mt-1.5">
                            Puedes separar líneas con Enter.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Mapa embebido
                        </label>
                        <Textarea
                            rows={3}
                            placeholder='<iframe src="https://www.google.com/maps/embed?pb=..." ...></iframe>'
                            {...register('footer_map_embed')}
                        />
                        <p className="text-xs text-gray-400 mt-1.5">
                            Puedes pegar el iframe completo de Google Maps o solo la URL del <span className="font-mono">src</span>.
                        </p>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Texto de copyright
                    </label>
                    <Input
                        placeholder={FALLBACK}
                        {...register('footer_copyright')}
                    />
                    <p className="text-xs text-gray-400 mt-1.5">
                        Aparece en la barra inferior del footer. Si se deja vacío se usa: <span className="font-mono">{FALLBACK}</span>
                    </p>
                </div>

                <div>
                    <p className={SECTION_LABEL}>Vista previa</p>
                    <div className="overflow-hidden rounded-xl border border-gray-100">
                        {/* Contenido de página simulado */}
                        <div className="flex flex-col gap-2 bg-gray-50 px-6 py-5">
                            <div className="h-2 w-32 rounded-full bg-gray-200" />
                            <p className="max-w-md whitespace-pre-line text-xs leading-relaxed text-gray-500">
                                {address || 'Dirección pendiente de configurar'}
                            </p>
                            <div className="flex h-20 max-w-xs items-center justify-center rounded-lg bg-gray-200 text-xs text-gray-400">
                                {mapEmbed ? 'Mapa configurado' : 'Mapa pendiente'}
                            </div>
                        </div>
                        {/* Barra inferior del footer */}
                        <div
                            className="flex h-16 items-center justify-center px-6"
                            style={{
                                backgroundColor: footerBg,
                                borderTop: '1px solid #697fc5',
                                fontFamily: bodyFont,
                                color: '#d1d5db',
                                fontSize: '0.75rem',
                            }}
                        >
                            {copyright || FALLBACK}
                        </div>
                    </div>
                </div>

            </div>
        </StylesSection>
    )
}

export default FooterSection
