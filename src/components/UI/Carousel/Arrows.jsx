import { FaChevronLeft, FaChevronRight } from "react-icons/fa"

const Arrows = (props) => {

    // ............................
    const { prev, next } = props

    // ............................
    return (
        <div className="
            flex items-center justify-between p-10
            absolute inset-0
        ">
            <button
                onClick={prev}
                className="
                    rounded-full
                    bg-white/30
                    p-2
                    text-white
                    backdrop-blur-sm
                    hover:bg-white/50
            ">
                <FaChevronLeft size={20} />
            </button>

            <button
                onClick={next}
                className="
                    rounded-full
                    bg-white/30
                    p-2
                    text-white
                    backdrop-blur-sm
                    hover:bg-white/50
            ">
                <FaChevronRight size={20} />
            </button>
        </div>
    )
}

export default Arrows