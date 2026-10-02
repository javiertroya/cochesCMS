const Info = (props) => {

    // ............................
    const Icon = props.icon
    const iconSize = props.iconSize || 20
    const text = props.text

    // ............................
    return (
        <div className="
            flex items-center gap-x-2
        ">
            <Icon size={iconSize} />
            {text}
        </div>
    );
}

export default Info