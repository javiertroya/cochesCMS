import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaAngleDown } from "react-icons/fa"
import { FaUserCircle } from "react-icons/fa"

import AccountMenu from "./AccountMenu"
import AnimatedUnderline from '../../AnimatedUnderline'
import ACCOUNT_MENU from '../../../../../mocks/user'
import useAuth from '@/hooks/useAuth'

const Account = () => {

    // .............................
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [dropdownOpen, setDropdownOpen] = useState(false)

    if (!user) return null

    const label = user.name || 'Mi cuenta'

    // .............................
    const MENU_ITEMS = ACCOUNT_MENU.filter(item => {
        if (item.auth !== Boolean(user)) return false
        if (item.adminOnly && !['admin', 'editor'].includes(user?.role)) return false
        return true
    })

    // .............................
    const handleMenuAction = (type) => {
        setDropdownOpen(false)
        if (type === 'logout') {
            logout()
            return
        }
        if (type === 'admin') {
            navigate('/admin')
            return
        }
    }


    return (
        <>
            <div
                className="
                    relative flex items-center
                    h-full
                    group/account
                "
                aria-haspopup="menu"
                aria-expanded={dropdownOpen}
                onMouseEnter={() => setDropdownOpen(true)}
                onMouseLeave={() => setDropdownOpen(false)}
            >
                <button
                    type="button"
                    className="flex h-full cursor-pointer items-center text-current"
                    onClick={() => setDropdownOpen((open) => !open)}
                >
                    <FaUserCircle className="mr-2" size={20} />
                    <span className="max-w-32 truncate sm:max-w-none">{label}</span>

                    <FaAngleDown className={`
                        ml-1 transition-transform duration-200 group-hover/account:rotate-180
                        ${dropdownOpen ? 'rotate-180' : ''}
                    `}/>
                </button>

                <AccountMenu
                    items={MENU_ITEMS}
                    onOpenAuth={handleMenuAction}
                    open={dropdownOpen}
                />

                <AnimatedUnderline
                    colorClass="bg-accent-nav"
                    triggerClass="group-hover/account:w-full"
                />
            </div>

        </>
    )
}

export default Account
