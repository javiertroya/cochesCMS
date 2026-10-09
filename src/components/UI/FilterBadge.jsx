import { cn } from "@/lib/utils"

const FilterBadge = ({ active = false, className, children, ...props }) => (
    <button
        type="button"
        className={cn(
            "site-filter-badge inline-flex min-h-9 items-center rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
            active
                ? "border-brand-primary bg-brand-primary text-white shadow-sm"
                : "border-slate-200 bg-white text-slate-700 hover:border-brand-primary hover:text-brand-primary",
            className,
        )}
        {...props}
    >
        {children}
    </button>
)

export default FilterBadge
