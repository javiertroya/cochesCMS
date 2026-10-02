import Info from "./Info"
import Account from "./Account/Account"

const Top = (props) => {

    // ............................
    const data = props.info

    const renderInfo = (item) => {
        const Icon = item.icon
        return (
            <Info key={item.id} icon={Icon} text={item.text} />
        )
    }

    // ............................
    return (
        <div className="
            flex items-center justify-between
            sticky top-0 z-60
            min-h-9 gap-3 px-page py-1 sm:py-0
            bg-linear-to-r from-brand-dark to-brand-dark-deep
            text-white
        ">
            <div className="
                hidden min-w-0 items-center gap-x-5 sm:flex
            ">
                {
                    data.map(renderInfo)
                }
            </div>
            <div className="
                ml-auto flex h-full min-w-0 items-center gap-x-5
            ">
                <Account />
            </div>
        </div>
    );
}

export default Top
