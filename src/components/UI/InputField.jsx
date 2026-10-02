import INPUT_FIELD_VARIANTS from "../../mocks/styles/inputFieldVariants";

const InputField = (props) => {

    // .............................
    const { label, name, type, variant, placeholder, autoComplete, register, error } = props;

    // .............................
    return (
        <label className="block">
            <span 
                className={INPUT_FIELD_VARIANTS[variant].span}
            >
                {label}
            </span>
            <input
                className={INPUT_FIELD_VARIANTS[variant].input}
                type={type}
                placeholder={placeholder}
                autoComplete={autoComplete}
                {
                    ...register(name, {
                        required: `Se requiere ${ label.toLowerCase() }`
                    })
                }
            />
            <span className="
                text-red-500 text-sm
            ">
                {error}
            </span>
        </label>
    );
}

export default InputField;