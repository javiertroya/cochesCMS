import { Skeleton } from "@/components/UI/coss/skeleton"

// ............................................................
const NewsGridSkeleton = () => (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((i) => (
            <div
                key={i}
                className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
            >
                <Skeleton className="aspect-[16/10] rounded-none" />
                <div className="flex flex-col gap-3 p-5">
                    <Skeleton className="h-3 w-16 rounded-full" />
                    <Skeleton className="h-4 w-3/4 rounded-full" />
                    <Skeleton className="h-3 w-full rounded-full" />
                    <Skeleton className="h-3 w-5/6 rounded-full" />
                </div>
            </div>
        ))}
    </div>
)

export default NewsGridSkeleton
