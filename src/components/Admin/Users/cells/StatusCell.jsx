const ActiveIcon = () => (
    <span className="
        inline-flex items-center gap-1.5
        rounded-full
        px-2.5 py-1
        text-xs font-medium
        bg-emerald-50 text-emerald-600
    ">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Activo
    </span>
)

const InactiveIcon = () => (
    <span className="
        inline-flex items-center gap-1.5
        rounded-full
        px-2.5 py-1
        text-xs font-medium
        bg-gray-100 text-gray-500
    ">
        <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
        Desactivado
    </span>
)

const StatusCell = (props) => {

    const { isActive } = props

    return (
        <td className="px-5 py-3.5 align-middle">
            {
                isActive ? <ActiveIcon /> : <InactiveIcon />
            }
        </td>
    )
}

export default StatusCell
