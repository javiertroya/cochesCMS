import { Input } from '@/components/UI/coss/input'
import { Textarea } from '@/components/UI/coss/textarea'
import MediaField from './MediaField'

const ComponentField = ({ field, value, onChange }) => {
    if (field.type === 'textarea') {
        return (
            <Textarea
                value={value ?? ''}
                rows={field.rows ?? 4}
                className="min-h-30 resize-y"
                onChange={(e) => onChange(e.target.value)}
            />
        )
    }

    if (field.type === 'number') {
        return (
            <Input
                nativeInput
                type="number"
                value={value ?? 0}
                onChange={(e) => onChange(Number(e.target.value))}
            />
        )
    }

    if (field.type === 'checkbox') {
        return (
            <button
                type="button"
                role="switch"
                aria-checked={Boolean(value)}
                onClick={() => onChange(!value)}
                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50 ${
                    value ? 'bg-brand-primary' : 'bg-gray-200'
                }`}
            >
                <span
                    className={`pointer-events-none inline-block size-4 rounded-full bg-white shadow-sm transition-transform ${
                        value ? 'translate-x-4.5' : 'translate-x-0.5'
                    }`}
                />
            </button>
        )
    }

    if (field.type === 'select') {
        return (
            <select
                value={value ?? ''}
                onChange={(e) => onChange(e.target.value)}
                className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-3 pr-9 text-sm text-gray-900 shadow-sm transition focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            >
                {(field.options ?? []).map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        )
    }

    if (field.type === 'image') {
        return (
            <MediaField
                value={value ?? ''}
                onChange={onChange}
            />
        )
    }

    return (
        <Input
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
        />
    )
}

export default ComponentField
