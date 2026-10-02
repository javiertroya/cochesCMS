const Submit = (props) => {

    // .............................
    const { text } = props

    // .............................
    return (
        <button
            type="submit"
            className="
                w-full
                bg-submit
                px-4 py-2.5
                rounded-lg
                font-semibold text-white
                transition hover:bg-submit-hover
        ">
            { text }
        </button>
    )
}

export default Submit