import { useEffect, useState } from 'react'
import { BarChart2, Users, Eye, TrendingUp, Globe, Loader2 } from 'lucide-react'
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

import AdminPageHeader from '@/components/Admin/Layout/AdminPageHeader'
import DashboardStatCard from '@/components/Admin/Dashboard/DashboardStatCard'
import EmptyChartState from '@/components/Admin/Dashboard/EmptyChartState'
import AnalyticsCard from '@/components/Admin/Analytics/AnalyticsCard'
import AnalyticsTooltip from '@/components/Admin/Analytics/AnalyticsTooltip'
import AnalyticsRangeSelector from '@/components/Admin/Analytics/AnalyticsRangeSelector'
import { getAdminAnalyticsOverview } from '@/services/analytics_service'

const PRIMARY   = '#1A4D8D'
const TEAL      = '#0d9488'
const VIOLET    = '#8b5cf6'
const SKY       = '#0ea5e9'
const MUTED     = '#94a3b8'
const PIE_COLORS = [PRIMARY, VIOLET, SKY, MUTED]

const EMPTY_ANALYTICS = {
    configured: true,
    summary: { pageviews: 0, visitors: 0, todayPageviews: 0 },
    timeline: [],
    topPages: [],
    trafficSources: [],
}

const fmt = (v) => new Intl.NumberFormat('es-ES').format(v ?? 0)

const fmtDate = (v) => {
    if (!v) return ''
    return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short' }).format(new Date(v))
}

const computeWeekdays = (timeline) => {
    const DAYS   = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    const sums   = Array(7).fill(0)
    const counts = Array(7).fill(0)
    for (const { date, pageviews } of timeline) {
        const d = new Date(date).getDay()
        sums[d]   += pageviews
        counts[d] += 1
    }
    return [1, 2, 3, 4, 5, 6, 0].map((i) => ({
        dia:     DAYS[i],
        visitas: counts[i] ? Math.round(sums[i] / counts[i]) : 0,
    }))
}

const AdminAnalytics = () => {
    const [range, setRange]         = useState('30d')
    const [analytics, setAnalytics] = useState(EMPTY_ANALYTICS)
    const [loading, setLoading]     = useState(true)

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            try {
                const data = await getAdminAnalyticsOverview(range)
                setAnalytics(data)
            } catch (error) {
                setAnalytics({
                    configured: false,
                    message: error.message || 'No se pudieron cargar las analíticas.',
                    summary: { pageviews: 0, visitors: 0, todayPageviews: 0 },
                    timeline: [],
                    topPages: [],
                    trafficSources: [],
                })
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [range])

    const weekdays    = analytics.timeline.length ? computeWeekdays(analytics.timeline) : []
    const hasTimeline = analytics.configured && analytics.timeline.length > 0
    const hasTopPages = analytics.configured && analytics.topPages.length > 0
    const hasSources  = analytics.configured && analytics.trafficSources?.length > 0
    const rangeLabel  = range === '7d' ? '7 días' : range === '30d' ? '30 días' : '90 días'

    const statCards = [
        {
            id:          'today',
            label:       'Pageviews hoy',
            value:       loading ? '—' : fmt(analytics.summary?.todayPageviews),
            icon:        Eye,
            colorBg:     'bg-indigo-50',
            colorText:   'text-indigo-600',
            colorStrong: 'bg-indigo-500',
            loading,
        },
        {
            id:          'pageviews',
            label:       `Pageviews (${rangeLabel})`,
            value:       loading ? '—' : fmt(analytics.summary?.pageviews),
            icon:        TrendingUp,
            colorBg:     'bg-violet-50',
            colorText:   'text-violet-600',
            colorStrong: 'bg-violet-500',
            loading,
        },
        {
            id:          'visitors',
            label:       'Visitantes únicos',
            value:       loading ? '—' : fmt(analytics.summary?.visitors),
            icon:        Users,
            colorBg:     'bg-teal-50',
            colorText:   'text-teal-600',
            colorStrong: 'bg-teal-500',
            loading,
        },
        {
            id:          'pages',
            label:       'Páginas distintas',
            value:       loading ? '—' : fmt(analytics.topPages?.length ?? 0),
            sub:         hasTopPages ? `Más vista: ${analytics.topPages[0]?.path}` : undefined,
            icon:        Globe,
            colorBg:     'bg-sky-50',
            colorText:   'text-sky-600',
            colorStrong: 'bg-sky-500',
            loading,
        },
    ]

    return (
        <div className="h-full overflow-y-auto py-6 lg:py-8">
            <div className="space-y-5">

                <AdminPageHeader
                    icon={BarChart2}
                    title="Analíticas"
                    description="Estadísticas de visitas y actividad del sitio web."
                >
                    <AnalyticsRangeSelector range={range} onChange={setRange} />
                </AdminPageHeader>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {statCards.map((s) => (
                        <DashboardStatCard key={s.id} {...s} />
                    ))}
                </div>

                {!analytics.configured && (
                    <div className="rounded-xl border border-dashed border-[#dcdfea] bg-[#f9fafb] px-6 py-10 text-center text-sm text-[#6b7280]">
                        {analytics.message ?? 'No se pudieron cargar las analíticas.'}
                    </div>
                )}

                {analytics.configured && (
                    <>
                        <div className="grid gap-5 lg:grid-cols-3">
                            <AnalyticsCard
                                title="Evolución de visitas"
                                description={`Tráfico diario — últimos ${rangeLabel}`}
                                className="lg:col-span-2"
                            >
                                {!hasTimeline ? (
                                    <EmptyChartState>
                                        {loading ? <Loader2 size={20} className="animate-spin text-gray-300" /> : 'No hay datos para este rango.'}
                                    </EmptyChartState>
                                ) : (
                                    <ResponsiveContainer width="100%" height={240}>
                                        <AreaChart
                                            data={analytics.timeline}
                                            margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                                        >
                                            <defs>
                                                <linearGradient id="gPv" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%"  stopColor={PRIMARY} stopOpacity={0.18} />
                                                    <stop offset="95%" stopColor={PRIMARY} stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="gVis" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%"  stopColor={TEAL} stopOpacity={0.14} />
                                                    <stop offset="95%" stopColor={TEAL} stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                            <XAxis
                                                dataKey="date"
                                                tickFormatter={fmtDate}
                                                tick={{ fontSize: 11, fill: '#94a3b8' }}
                                                tickLine={false}
                                                axisLine={false}
                                                interval="preserveStartEnd"
                                            />
                                            <YAxis
                                                tick={{ fontSize: 10, fill: '#94a3b8' }}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <Tooltip content={<AnalyticsTooltip />} labelFormatter={fmtDate} />
                                            <Area type="monotone" dataKey="pageviews" name="Pageviews" stroke={PRIMARY} strokeWidth={2} fill="url(#gPv)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                                            <Area type="monotone" dataKey="visitors" name="Visitantes" stroke={TEAL} strokeWidth={2} fill="url(#gVis)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                )}
                            </AnalyticsCard>

                            <AnalyticsCard title="Fuentes de tráfico" description="Distribución por canal">
                                {!hasSources ? (
                                    <EmptyChartState>
                                        {loading ? <Loader2 size={20} className="animate-spin text-gray-300" /> : 'Sin datos de fuentes disponibles.'}
                                    </EmptyChartState>
                                ) : (
                                    <div className="flex flex-col items-center gap-4 pt-2">
                                        <ResponsiveContainer width="100%" height={180}>
                                            <PieChart>
                                                <Pie data={analytics.trafficSources} cx="50%" cy="50%" innerRadius={50} outerRadius={78} paddingAngle={3} dataKey="visitors">
                                                    {analytics.trafficSources.map((_, i) => (
                                                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={(v) => [fmt(v), 'Visitantes']} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="w-full space-y-1.5">
                                            {analytics.trafficSources.map((s, i) => (
                                                <div key={s.source} className="flex items-center justify-between text-xs">
                                                    <span className="flex items-center gap-1.5 text-[#6b7280]">
                                                        <span className="inline-block h-2 w-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                                                        <span className="truncate max-w-30">{s.source}</span>
                                                    </span>
                                                    <span className="font-medium">{fmt(s.visitors)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </AnalyticsCard>
                        </div>

                        <div className="grid gap-5 lg:grid-cols-2">
                            <AnalyticsCard title="Visitas por día de la semana" description="Media del período seleccionado">
                                {!hasTimeline ? (
                                    <EmptyChartState>
                                        {loading ? <Loader2 size={20} className="animate-spin text-gray-300" /> : 'No hay datos para este rango.'}
                                    </EmptyChartState>
                                ) : (
                                    <ResponsiveContainer width="100%" height={200}>
                                        <BarChart data={weekdays} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                            <XAxis dataKey="dia" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                                            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                                            <Tooltip formatter={(v) => [fmt(v), 'Visitas']} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                                            <Bar dataKey="visitas" fill={PRIMARY} radius={[4, 4, 0, 0]} maxBarSize={40} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </AnalyticsCard>

                            <AnalyticsCard
                                title="Páginas más visitadas"
                                description={hasTopPages ? `Top ${Math.min(analytics.topPages.length, 5)} del período` : undefined}
                            >
                                {!hasTopPages ? (
                                    <EmptyChartState>
                                        {loading ? <Loader2 size={20} className="animate-spin text-gray-300" /> : 'No hay páginas para este rango.'}
                                    </EmptyChartState>
                                ) : (
                                    <div className="mt-3 space-y-3">
                                        {analytics.topPages.slice(0, 5).map((p, i) => {
                                            const max = analytics.topPages[0]?.pageviews || 1
                                            const pct = Math.round((p.pageviews / max) * 100)
                                            return (
                                                <div key={p.path} className="space-y-1">
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="flex min-w-0 items-center gap-2 text-[#6b7280]">
                                                            <Globe className="h-3 w-3 shrink-0" />
                                                            <span className="truncate font-mono">{p.path}</span>
                                                        </span>
                                                        <span className="ml-2 shrink-0 font-semibold text-[#374151]">{fmt(p.pageviews)}</span>
                                                    </div>
                                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#f1f5f9]">
                                                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: PIE_COLORS[i % PIE_COLORS.length] }} />
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </AnalyticsCard>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default AdminAnalytics
