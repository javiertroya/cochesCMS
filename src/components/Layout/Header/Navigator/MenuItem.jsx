import { useState } from 'react'
import { Link } from 'react-router-dom'

import { FaAngleDown } from "react-icons/fa"
import SubMenu from './SubMenu'
import AnimatedUnderline from '../AnimatedUnderline'

const MenuItem = (props) => {

    // .............................
    const { label, route, Icon, subItems } = props
    const [isOpen, setIsOpen] = useState(false)

    // .............................
    return (
        <li
            className="relative group/menu h-full"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            <Link
                to={route}
                aria-haspopup={subItems ? "menu" : undefined}
                aria-expanded={subItems ? isOpen : undefined}
                className="
                    site-nav-link
                    peer
                    flex items-center h-full
                    text-current
                    hover:text-accent-nav group-hover/menu:text-accent-nav
                    transition-colors duration-200
                "
            >
                { Icon && <Icon className="site-nav-icon mr-2" size={22} /> }
                { label }
                {
                    subItems && (
                        <FaAngleDown className="
                            transition-transform duration-200 group-hover/menu:rotate-180
                            ml-1
                        "/>
                    )
                }
            </Link>
            {
                subItems && <SubMenu items={subItems} />
            }
            <AnimatedUnderline 
                colorClass="bg-accent-nav"
                heightClass="h-1"
                triggerClass="group-hover/menu:w-full"
            />
        </li>
    )
}

export default MenuItem
