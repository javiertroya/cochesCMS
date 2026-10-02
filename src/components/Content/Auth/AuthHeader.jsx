import { IoMdCloseCircle } from "react-icons/io";

const AuthHeader = (props) => {

    // .............................
    const { onClose, title, description } = props;

    // .............................
    return (
        <div className="
            flex items-center justify-between gap-4
            border-b border-slate-200
            px-6 py-5
        ">
            <div>
                <h2 className="
                    text-slate-900 font-bold text-2xl
                ">
                    { title }
                </h2>
                <p className="
                    text-slate-600 text-sm
                    mt-1
                ">
                    { description }
                </p>
            </div>
            <button
                type="button"
                aria-label="Cerrar"
                onClick={onClose}
                className="
                    inline-grid place-items-center
                    h-9 w-9
                    rounded-md
                    text-slate-700
                    transition hover:bg-slate-100
            ">
                <IoMdCloseCircle size={30} />
            </button>
        </div>
    )
}

export default AuthHeader