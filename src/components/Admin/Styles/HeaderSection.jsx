import { Controller } from 'react-hook-form'

import LogoUploadField from '@/components/Admin/Styles/LogoUploadField'
import StylesSection from '@/components/Admin/Styles/StylesSection'
import { Input } from '@/components/UI/coss/input'

const HeaderSection = ({ register, control, watch }) => {
    const siteName = watch('site_name')

    return (
        <StylesSection title="Header">
            <div className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Logo del header</label>
                    <Controller
                        name="logo_url"
                        control={control}
                        render={({ field }) => (
                            <LogoUploadField
                                value={field.value}
                                onChange={field.onChange}
                                siteName={siteName}
                            />
                        )}
                    />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Teléfono del header</label>
                        <Input placeholder="+34 000 000 000" {...register('header_phone')} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email del header</label>
                        <Input type="email" placeholder="info@example.com" {...register('header_email')} />
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">WhatsApp</label>
                        <Input placeholder="+34 600 000 000" {...register('whatsapp_number')} />
                        <p className="mt-1 text-xs text-gray-500">
                            Número del botón «Me interesa» de las fichas de coches. Si lo dejas vacío se usa el teléfono del header.
                        </p>
                    </div>
                </div>
            </div>
        </StylesSection>
    )
}

export default HeaderSection
