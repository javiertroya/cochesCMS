import { AlertTriangle, Palette, RotateCcw, Save } from 'lucide-react'

import AdminPageHeader from '@/components/Admin/Layout/AdminPageHeader'
import ColorsSection from '@/components/Admin/Styles/ColorsSection'
import FooterSection from '@/components/Admin/Styles/FooterSection'
import HeaderSection from '@/components/Admin/Styles/HeaderSection'
import NotificationsSection from '@/components/Admin/Styles/NotificationsSection'
import ThemeSection from '@/components/Admin/Styles/ThemeSection'
import SiteInfoSection from '@/components/Admin/Styles/SiteInfoSection'
import TypographySection from '@/components/Admin/Styles/TypographySection'
import { Button } from '@/components/UI/coss/button'

const StylesManager = ({ form }) => {
    const { saving, isDirty, register, handleSubmit, control, reset, watch, onSubmit, applyPreset, preview } = form

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="h-full overflow-y-auto">
            <div className="py-6 lg:py-8">
                <div className="space-y-5">

                    <AdminPageHeader
                        icon={Palette}
                        title="Estilos y configuración"
                        description="Define el aspecto visual y la información del sitio."
                    >
                        <div className="flex items-center gap-3">
                            {isDirty && (
                                <div className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs text-amber-600">
                                    <AlertTriangle className="h-3.5 w-3.5" />
                                    Sin guardar
                                </div>
                            )}
                            <Button type="button" variant="outline" size="sm" onClick={() => reset()}>
                                <RotateCcw className="h-4 w-4" />
                                Restablecer
                            </Button>
                            <Button type="submit" loading={saving}>
                                <Save className="h-4 w-4" />
                                Guardar cambios
                            </Button>
                        </div>
                    </AdminPageHeader>

                    <ThemeSection control={control} watch={watch} />
                    <SiteInfoSection register={register} control={control} watch={watch} />
                    <HeaderSection register={register} control={control} watch={watch} />
                    <ColorsSection control={control} applyPreset={applyPreset} preview={preview} />
                    <TypographySection register={register} preview={preview} />
                    <FooterSection register={register} watch={watch} />
                    <NotificationsSection register={register} />

                    <div className="flex justify-end pb-2">
                        <Button type="submit" loading={saving}>
                            <Save className="h-4 w-4" />
                            Guardar cambios
                        </Button>
                    </div>

                </div>
            </div>
        </form>
    )
}

export default StylesManager
