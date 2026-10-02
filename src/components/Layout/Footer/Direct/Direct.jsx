import DirectList from "./DirectList"
import useNavigationMenu from "../../../../hooks/useNavigationMenu"

const Direct = () => {
    const menu = useNavigationMenu()

    return (
        <section className="
            border-b border-footer-divider pb-6
            sm:border-b-0 sm:pb-0
            lg:border-r lg:pr-10
        ">
            <h1 className="
                text-footer-title text-lg
                pb-2
            ">
                ACCESOS DIRECTOS
            </h1>
            <DirectList
                items={menu}
            />
        </section>
    )
}

export default Direct