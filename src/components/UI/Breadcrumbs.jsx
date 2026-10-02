import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { FaHome } from 'react-icons/fa'
import { TiArrowRight } from "react-icons/ti"

import useBreadcrumbs from '../../hooks/useBreadcrumbs'

// .............................................................
const BreadCrumbs = () => {

    // .............................
    const { pathname, crumbs } = useBreadcrumbs()

    // .............................
    if (pathname === "/") return null

    // .............................
    const renderCrumb = (crumb, index) => {
        const [to, label] = crumb
        return (
            <Fragment key={index}>
                <TiArrowRight 
                    size={20}
                    className="
                        text-gray-500
                "/>
                <Link
                    to={to}
                    className="
                        text-sm
                        hover:underline
                ">
                    {label}
                </Link>
            </Fragment>
        )
    }

    // .............................
    return (
        <nav className="
            site-breadcrumbs
            flex items-center gap-1.5
            min-h-10 w-full overflow-x-auto
            px-page
            text-sm font-medium
            tracking-wide
            bg-breadcrumbs
            whitespace-nowrap
            [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
        ">
            <Link to="/">
                <FaHome size={20} />
            </Link>
            {
                crumbs.map(renderCrumb)
            }
        </nav>
    )
}

export default BreadCrumbs
