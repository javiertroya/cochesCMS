import SubMenuItem from "./SubMenuItem"

const SubMenu = (props) => {

    // .............................
    const { items } = props

    const renderSubMenuItem = (item) => {
        return <SubMenuItem
            key={item.id}
            label={item.name}
            route={item.route}
            Icon={item.icon}
        />
    }

    // .............................
    return (
        <ul role="menu" className="
            absolute top-full left-0 z-50
            min-w-max max-w-[calc(100vw-2rem)] bg-white
            text-gray-800
            rounded-md overflow-hidden
            border border-gray-200 divide-gray-200 divide-y
            shadow-md
            *:px-4 *:py-2 *:whitespace-nowrap
            opacity-0 -translate-y-1 pointer-events-none
            group-hover/menu:opacity-100 group-hover/menu:translate-y-0 group-hover/menu:pointer-events-auto
            transition-all duration-150 ease-out
        ">
            {
                items.map(renderSubMenuItem)
            }
        </ul>
    )
}

export default SubMenu
