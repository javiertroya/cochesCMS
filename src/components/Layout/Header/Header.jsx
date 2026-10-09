import Top from './Top/Top'
import Logos from './Logos/Logos'
import Navigator from './Navigator/Navigator'

// ............................................................
import { useRef } from 'react'
import { TbMailFilled, TbPhoneFilled } from 'react-icons/tb'
import useElementOnScreen from '../../../hooks/useElementOnScreen'
import useNavigationMenu from '../../../hooks/useNavigationMenu'
import { useSiteSettings } from '@/context/SiteSettingsContext'

// ............................................................
const Header = () => {

	// .............................
	const logosRef = useRef()
	const isVisible = useElementOnScreen({ threshold: 0.1 }, logosRef)
	const menu = useNavigationMenu()
    const { settings } = useSiteSettings() ?? {}

    const info = [
        settings?.header_phone && { id: 'phone', icon: TbPhoneFilled, text: settings.header_phone, whatsapp: settings.whatsapp_number },
        settings?.header_email && { id: 'email', icon: TbMailFilled, text: settings.header_email },
    ].filter(Boolean)

	// .............................
	return (
		<>
            <Top info={info} />
			<div ref={logosRef}>
				<Logos settings={settings} />
			</div>
			<Navigator menu={menu} showLogo={!isVisible} settings={settings}/>
        </>
	);
}

export default Header
