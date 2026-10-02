const ColorInput = ({ label, value = '', onChange }) => {
    const isValid = /^#[0-9A-Fa-f]{6}$/.test(value)

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
            <div className="flex items-center gap-2">
                <input
                    type="color"
                    value={isValid ? value : '#000000'}
                    onChange={(e) => onChange(e.target.value)}
                    className="h-9 w-10 rounded-lg border border-gray-200 cursor-pointer p-0.5 bg-white shrink-0"
                />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    maxLength={7}
                    placeholder="#000000"
                    className="w-28 h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm font-mono text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary"
                />
                <div
                    className="h-9 w-9 rounded-lg border border-gray-200 shrink-0"
                    style={{ backgroundColor: isValid ? value : '#f3f4f6' }}
                />
            </div>
        </div>
    )
}

export default ColorInput
