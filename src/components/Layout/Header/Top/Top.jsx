import Info from "./Info"
import PhoneMenu from "./PhoneMenu"
import Account from "./Account/Account"

const Top = (props) => {

    // ............................
    const data = props.info

    // El teléfono se ve también en móvil (abre WhatsApp / llamar); el resto solo desde sm
    const renderInfo = (item) => {
        if (item.id === 'phone') {
            return <PhoneMenu key={item.id} phone={item.text} whatsapp={item.whatsapp} />
        }
        const Icon = item.icon
        return (
            <div key={item.id} className="hidden sm:flex">
                <Info icon={Icon} text={item.text} />
            </div>
        )
    }

    // ............................
    return (
        <div className="
            site-topbar
            flex items-center justify-between
            sticky top-0 z-60
            min-h-9 gap-3 px-page py-1 sm:py-0
            bg-linear-to-r from-brand-dark to-brand-dark-deep
            text-white
        ">
            <div className="
                flex min-w-0 items-center gap-x-5
            ">
                {
                    data.map(renderInfo)
                }
            </div>
            <div className="
                ml-auto flex h-full min-w-0 items-center gap-x-5
            ">
                <Account />
            </div>
        </div>
    );
}

export default Top
