import AccountMenuItem from './AccountMenuItem'

const AccountMenu = (props) => {

    // .............................
    const { items, onOpenAuth, open = false } = props

    const renderMenuItem = (item) => {
        return <AccountMenuItem
            key={item.id}
            label={item.name}
            Icon={item.icon}
            type={item.type}
            auth={item.auth}
            onOpenAuth={onOpenAuth}
        />
    }

    // .............................
    return (
        <ul role="menu" className={`
            absolute top-full right-0 z-70
            min-w-max bg-white
            text-gray-800
            rounded-md overflow-hidden
            border border-gray-200 divide-gray-200 divide-y
            shadow-md
            *:px-4 *:py-2 *:whitespace-nowrap
            transition-all duration-150 ease-out
            group-hover/account:opacity-100 group-hover/account:translate-y-0 group-hover/account:pointer-events-auto
            ${open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-1 pointer-events-none'}
        `}>
            {
                items.map(renderMenuItem)
            }
        </ul>
    )
}

export default AccountMenu
