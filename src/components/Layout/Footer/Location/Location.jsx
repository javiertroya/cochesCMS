import Map from "./Map"

const Location = () => {
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
                LOCALIZACIÓN
            </h1>
            <Map />
        </section>
    )
}

export default Location