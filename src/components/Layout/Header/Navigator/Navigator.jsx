import { useState } from "react"
import { Link } from "react-router-dom"
import { Menu, X } from "lucide-react"
import MenuItem from "./MenuItem"
import SiteBrand from "../SiteBrand"

const Navigator = (props) => {

    // .............................
    const { menu } = props
    const [mobileOpen, setMobileOpen] = useState(false)

    const renderMenuItem = (item) => {
        return <MenuItem
            key={item.id}
            label={item.name}
            route={item.route}
            Icon={item.icon}
            subItems={item.children}
        />
    }

    const renderMobileItem = (item) => {
        const Icon = item.icon

        return (
            <li key={item.id}>
                <Link
                    to={item.route}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                    {Icon && <Icon size={18} />}
                    {item.name}
                </Link>
                {item.children?.length > 0 && (
                    <ul className="ml-6 border-l border-white/15 pl-2">
                        {item.children.map((child) => {
                            const ChildIcon = child.icon
                            return (
                                <li key={child.id}>
                                    <Link
                                        to={child.route}
                                        onClick={() => setMobileOpen(false)}
                                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/85 transition hover:bg-white/10 hover:text-white"
                                    >
                                        {ChildIcon && <ChildIcon size={16} />}
                                        {child.name}
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                )}
            </li>
        )
    }

    // .............................
    return (
        <nav className="
            sticky z-40 top-9
            h-13 lg:h-15
            bg-brand-primary
            text-white lg:text-lg
        ">
            <div className="flex h-full items-center justify-between px-page lg:hidden">
                <SiteBrand
                    settings={props.settings}
                    imageClassName="h-8"
                    textClassName="text-base font-extrabold tracking-tight text-white"
                />
                <button
                    type="button"
                    aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
                    aria-expanded={mobileOpen}
                    className="inline-flex size-10 items-center justify-center rounded-lg border border-white/20 text-white transition hover:bg-white/10"
                    onClick={() => setMobileOpen((open) => !open)}
                >
                    {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>
            <div className="hidden h-full items-center px-page lg:flex">
                <div
                    className={`
                        flex shrink-0 items-center overflow-hidden transition-all duration-300
                        ${props.showLogo ? 'mr-10 max-w-xs opacity-100' : 'pointer-events-none max-w-0 opacity-0'}
                    `}
                    aria-hidden={!props.showLogo}
                >
                    <SiteBrand
                        settings={props.settings}
                        className="whitespace-nowrap"
                        imageClassName="h-8"
                        textClassName="text-base font-extrabold tracking-tight text-white"
                    />
                </div>
                <ul className="flex h-full min-w-0 items-center gap-x-8 xl:gap-x-10">
                    {
                        menu.map(renderMenuItem)
                    }
                </ul>
            </div>
            {mobileOpen && (
                <div className="absolute inset-x-0 top-full z-50 max-h-[calc(100vh-5.5rem)] overflow-y-auto border-t border-white/10 bg-brand-primary px-page py-3 shadow-xl lg:hidden">
                    <ul className="space-y-1">
                        {menu.map(renderMobileItem)}
                    </ul>
                </div>
            )}
        </nav>
    )
}

export default Navigator
