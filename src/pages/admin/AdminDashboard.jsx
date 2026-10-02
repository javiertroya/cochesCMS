import DashboardHeader from '@/components/Admin/Dashboard/DashboardHeader'
import DashboardStatCard from '@/components/Admin/Dashboard/DashboardStatCard'
import DashboardActivityFeed from '@/components/Admin/Dashboard/DashboardActivityFeed'
import DashboardSiteSummary from '@/components/Admin/Dashboard/DashboardSiteSummary'
import useDashboardData from '@/hooks/admin/useDashboardData'

const AdminDashboard = () => {
    const {
        stats,
        publishedPages, totalPages, publishedPct,
        totalCollections, totalItems,
        pendingUsers, loading,
        activity, loadingActivity,
    } = useDashboardData()

    return (
        <div className="h-full overflow-y-auto py-6 lg:py-8">
            <div className="space-y-5">

                <DashboardHeader />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {stats.map((s) => (
                        <DashboardStatCard key={s.id} {...s} />
                    ))}
                </div>

                <div className="grid gap-5 lg:grid-cols-5">
                    <DashboardActivityFeed
                        className="lg:col-span-3"
                        data={activity}
                        loading={loadingActivity}
                    />
                    <DashboardSiteSummary
                        className="lg:col-span-2"
                        publishedPages={publishedPages}
                        totalPages={totalPages}
                        publishedPct={publishedPct}
                        totalCollections={totalCollections}
                        totalItems={totalItems}
                        pendingUsers={pendingUsers}
                        loading={loading}
                    />
                </div>

            </div>
        </div>
    )
}

export default AdminDashboard
