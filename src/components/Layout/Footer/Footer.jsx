import Access from "./Access/Access"
import Direct from "./Direct/Direct"
import Location from "./Location/Location"
import Contact from "./Contact/Contact"
import Bottom from "./Bottom"

const Footer = () => {

    // .............................
    return (
        <footer className="
            site-footer
            bg-footer
            text-gray-300
            px-page
        ">
            <Access />
            <div className="
                grid gap-8 py-8
                sm:grid-cols-2 sm:gap-x-8
                lg:grid-cols-3 lg:gap-x-10
            ">
                <Direct />
                <Location />
                <Contact />
            </div>
            <Bottom />
        </footer>
    )
}

export default Footer
