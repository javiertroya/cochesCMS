import StylesSection from '@/components/Admin/Styles/StylesSection'
import { Input } from '@/components/UI/coss/input'

const NotificationsSection = ({ register }) => (
    <StylesSection title="Solicitudes">
        <div className="max-w-xl">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Correo para avisos de solicitudes</label>
            <Input type="email" placeholder="ventas@tudominio.com" {...register('notification_email')} />
            <p className="mt-1.5 text-xs leading-relaxed text-gray-400">
                Cada formulario enviado desde la web (contacto, importación…) llega a este correo, además de
                guardarse en Solicitudes. Puedes responder directamente al cliente desde el propio correo.
                No se muestra en la web.
            </p>
        </div>
    </StylesSection>
)

export default NotificationsSection
