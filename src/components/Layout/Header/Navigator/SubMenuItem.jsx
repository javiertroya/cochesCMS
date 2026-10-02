import { Link } from 'react-router-dom'
import AnimatedUnderline from '../AnimatedUnderline'

const SubMenuItem = (props) => {

    // .............................
    const { label, route, Icon } = props

    // .............................
    return (
        <li role="none" className="relative h-full">
            <Link
                to={route}
                role="menuitem"
                className="
                    peer
                    flex items-center h-full
                    px-2
                    text-current
                    hover:text-accent-sub
                    transition-colors duration-200
            ">
                { Icon && <Icon className="mr-2" /> }
                { label }
            </Link>
            <AnimatedUnderline colorClass="bg-accent-sub" heightClass="h-1" />
        </li>
    )
}

export default SubMenuItem
