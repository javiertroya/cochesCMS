import { Link } from "react-router-dom"
import { FaArrowRight } from "react-icons/fa"

// ............................................................
const ServiceCard = (props) => {

    // ............................
    const { icon: Icon, title, description, to, gradient } = props

    // ............................
    return (
        <Link
            to={to}
            className="
                group flex flex-col gap-5
                rounded-2xl border border-gray-200 bg-white p-6
                shadow-sm transition-all duration-200
                hover:-translate-y-1 hover:border-blue-100 hover:shadow-lg
            "
        >
            <div className={`
                flex h-11 w-11 items-center justify-center
                rounded-xl bg-gradient-to-br ${gradient}
                text-white shadow-sm
            `}>
                <Icon size={19} />
            </div>

            <div className="flex-1">
                <h3 className="text-sm font-bold text-gray-900">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-500">
                    {description}
                </p>
            </div>

            <span className="
                flex items-center gap-1.5
                text-xs font-semibold text-brand-primary
                transition-all duration-200
                group-hover:gap-2.5
            ">
                Explorar
                <FaArrowRight
                    size={10}
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                />
            </span>
        </Link>
    )
}

export default ServiceCard
