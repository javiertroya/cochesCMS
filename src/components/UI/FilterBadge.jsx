import { cn } from "@/lib/utils"

const FilterBadge = ({ active = false, className, children, ...props }) => (
    <button
        type="button"
        className={cn(
            "inline-flex min-h-9 items-center rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
            active
                ? "border-blue-700 bg-blue-700 text-white shadow-sm"
                : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700",
            className,
        )}
        {...props}
    >
        {children}
    </button>
)

export default FilterBadge
