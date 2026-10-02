import SiteBrand from '../SiteBrand'

const Logos = ({ settings }) => {
    return (
        <div className="hidden bg-white py-3 lg:block">
            <div className="
                flex items-center justify-start
                px-page min-h-14 lg:min-h-18
                text-black
            ">
                <SiteBrand
                    settings={settings}
                    imageClassName="h-10 lg:h-14"
                    textClassName="text-xl font-extrabold tracking-tight text-brand-primary lg:text-2xl"
                />
            </div>
        </div>
    );
}

export default Logos;
