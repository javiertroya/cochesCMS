import { Controller } from 'react-hook-form'

import StylesSection from '@/components/Admin/Styles/StylesSection'
import FaviconUploadField from '@/components/Admin/Styles/FaviconUploadField'
import { Input } from '@/components/UI/coss/input'
import { RequiredMark } from '@/components/UI/coss/label'
import { Textarea } from '@/components/UI/coss/textarea'

const SiteInfoSection = ({ register, control, watch }) => {
    const siteName = watch('site_name')

    return (
        <StylesSection title="Información del sitio">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre del sitio <RequiredMark /></label>
                    <Input {...register('site_name')} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripción</label>
                    <Textarea rows={2} placeholder="Breve descripción del sitio, usada en metadatos y SEO." {...register('site_description')} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Ícono de la página</label>
                    <Controller
                        name="favicon_url"
                        control={control}
                        render={({ field }) => (
                            <FaviconUploadField
                                value={field.value}
                                onChange={field.onChange}
                                siteName={siteName}
                            />
                        )}
                    />
                </div>
            </div>
        </StylesSection>
    )
}

export default SiteInfoSection
