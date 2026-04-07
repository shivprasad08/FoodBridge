import { useEffect } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import PageHeader from '../../components/PageHeader'
import useAdminData from '../../hooks/useAdminData'

const COLORS = {
  confirmed: '#16a34a',
  claimed: '#2563eb',
  picked_up: '#7c3aed',
  delivered: '#0891b2',
  cancelled: '#dc2626',
  available: '#d97706',
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

const ChartCard = ({ title, children }) => (
  <article className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
    <h3 className="mb-3 text-sm font-semibold text-gray-800">{title}</h3>
    {children}
  </article>
)

const Analytics = () => {
  const { analytics, loading, refetchAnalytics } = useAdminData()

  useEffect(() => {
    refetchAnalytics().catch(() => {})
  }, [refetchAnalytics])

  return (
    <section>
      <PageHeader title="Analytics" subtitle="Platform performance overview" />

      <div className="grid grid-cols-1 gap-4 px-4 py-4 md:px-6 md:py-6 xl:grid-cols-3">
        <ChartCard title="Listings / Day">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={analytics?.listings_by_day || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={formatDate} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip labelFormatter={formatDate} />
              <Bar dataKey="count" fill="#16a34a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Tasks by Status">
          <div className="flex justify-center">
            <PieChart width={320} height={280}>
              <Pie data={analytics?.tasks_by_status || []} dataKey="count" nameKey="status" cx="50%" cy="50%" innerRadius={55} outerRadius={95}>
                {(analytics?.tasks_by_status || []).map(entry => (
                  <Cell key={entry.status} fill={COLORS[entry.status] || '#9ca3af'} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>
        </ChartCard>

        <ChartCard title="Portions / Day">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={analytics?.portions_by_day || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={formatDate} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip labelFormatter={formatDate} />
              <Area type="monotone" dataKey="portions" stroke="#16a34a" fill="#dcfce7" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top 5 Providers">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={analytics?.top_providers || []} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={140} />
              <Tooltip />
              <Bar dataKey="portions" fill="#16a34a" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top 5 NGOs">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={analytics?.top_ngos || []} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={140} />
              <Tooltip />
              <Bar dataKey="portions" fill="#2563eb" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {loading && !analytics ? <p className="px-6 pb-6 text-sm text-gray-500">Loading analytics...</p> : null}
    </section>
  )
}

export default Analytics
