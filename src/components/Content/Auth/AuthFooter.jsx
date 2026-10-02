const AuthFooter = (props) => {

    // .............................
    const { title, description, onChangeType } = props;

    // .............................
    return (
        <div className="
            border-slate-200 border-t
            px-6 py-4
            text-slate-600 text-center text-sm
        ">
            { title }
            <button
                type="button"
                onClick={onChangeType}
                className="
                    text-[#1a4d8d] font-semibold
                    ml-2
                    hover:underline
            ">
                { description }
            </button>
        </div>
    )
}

export default AuthFooter