import { ChevronDown } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa6'
import { TbPhoneFilled } from 'react-icons/tb'

import { Menu, MenuItem, MenuPopup, MenuTrigger } from '@/components/UI/coss/menu'
import { getWhatsAppUrl } from '@/utils/collection'

const WHATSAPP_MESSAGE = 'Hola, me gustaría recibir información.'

// Teléfono de la barra superior: al pulsarlo deja elegir entre WhatsApp y llamar
const PhoneMenu = ({ phone, whatsapp }) => {
    const telHref = `tel:${phone.replace(/[^\d+]/g, '')}`
    const whatsappUrl = getWhatsAppUrl(whatsapp || phone, WHATSAPP_MESSAGE)

    // Sin número válido para WhatsApp: enlace directo para llamar
    if (!whatsappUrl) {
        return (
            <a href={telHref} className="flex items-center gap-x-2 transition hover:opacity-80">
                <TbPhoneFilled size={20} />
                {phone}
            </a>
        )
    }

    return (
        <Menu>
            <MenuTrigger className="group flex cursor-pointer items-center gap-x-2 outline-none transition hover:opacity-80 focus-visible:underline">
                <TbPhoneFilled size={20} />
                {phone}
                <ChevronDown size={14} className="opacity-70 transition-transform group-data-[popup-open]:rotate-180" />
            </MenuTrigger>
            <MenuPopup align="start" sideOffset={8} className="w-56">
                <MenuItem render={<a href={whatsappUrl} target="_blank" rel="noopener noreferrer" />} className="cursor-pointer gap-3 py-2">
                    <FaWhatsapp className="size-4.5 text-[#25D366]" />
                    <span className="flex flex-col">
                        <span className="font-medium">Enviar WhatsApp</span>
                        <span className="text-xs text-muted-foreground">Respuesta rápida por chat</span>
                    </span>
                </MenuItem>
                <MenuItem render={<a href={telHref} />} className="cursor-pointer gap-3 py-2">
                    <TbPhoneFilled className="size-4.5" />
                    <span className="flex flex-col">
                        <span className="font-medium">Llamar</span>
                        <span className="text-xs text-muted-foreground">{phone}</span>
                    </span>
                </MenuItem>
            </MenuPopup>
        </Menu>
    )
}

export default PhoneMenu
