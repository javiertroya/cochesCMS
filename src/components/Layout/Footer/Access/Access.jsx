import ACCESS from "../../../../mocks/access"
import AccessItem from "./AccessItem"

const Access = () => {

    // .............................
    const renderAccess = (value) => {
        return <AccessItem
            key={value.id}
            label={value.label}
            icon={value.icon}
            link={value.link}
        />
    }

    // .............................
    return (
        <div className="
            grid grid-cols-3 items-center gap-3 py-4 sm:flex sm:justify-between
            border-footer-divider border-b
            min-h-16
        ">
            {
                ACCESS.map(renderAccess)
            }
        </div>
    )
}

export default Access
