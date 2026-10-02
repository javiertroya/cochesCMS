import AnimatedUnderline from '../../AnimatedUnderline'

const AccountMenuItem = (props) => {

    // .............................
    const { label, Icon, onOpenAuth, type } = props

    const handleClick = () => {
        onOpenAuth(type)
    }

    // .............................
    return (
        <li role="none" className="relative h-full">
            <button
                role="menuitem"
                type="button"
                onClick={handleClick}
                className="
                    peer
                    flex items-center h-full
                    px-2
                    cursor-pointer
                    hover:text-accent-sub
                    transition-colors duration-200
                "
            >
                { Icon && <Icon className="mr-2" /> }
                { label }
            </button>
            <AnimatedUnderline colorClass="bg-accent-sub" />
        </li>
    )
}

export default AccountMenuItem
