import { HiOutlineLogout } from "react-icons/hi"
import { MdAdminPanelSettings } from "react-icons/md"

const ACCOUNT_MENU = [
    {
        id: 1,
        name: 'Panel',
        icon: MdAdminPanelSettings,
        type: 'admin',
        auth: true,
        adminOnly: true
    },
    {
        id: 2,
        name: 'Cerrar sesión',
        icon: HiOutlineLogout,
        type: 'logout',
        auth: true
    },
]

export default ACCOUNT_MENU
