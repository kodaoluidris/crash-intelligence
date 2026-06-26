import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Users2, PhoneCall, Clock } from 'lucide-react'
import { api } from '@/lib/api'
import { Badge, Card, Spinner } from '@/components/ui'
import { formatDate } from '@/lib/format'
import type { CrashReport } from '@/types'

interface DashboardData {
  totals: { reports: number; victims: number; contacts_found: number; pending_lookups: number }
  reports_by_status: Record<string, number>
  victims_by_status: Record<string, number>
  recent_reports: CrashReport[]
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    api.get('/dashboard').then((res) => setData(res.data))
  }, [])

  if (!data) return <Spinner />

  const cards = [
    { label: 'Crash Reports', value: data.totals.reports, icon: FileText, color: 'bg-sky-500' },
    { label: 'Victims / Leads', value: data.totals.victims, icon: Users2, color: 'bg-indigo-500' },
    { label: 'Contacts Found', value: data.totals.contacts_found, icon: PhoneCall, color: 'bg-emerald-500' },
    { label: 'Pending Lookups', value: data.totals.pending_lookups, icon: Clock, color: 'bg-amber-500' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500">Overview of crash reports and lead enrichment.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="flex items-center gap-4 p-5">
            <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${c.color} text-white`}>
              <c.icon size={22} />
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-800">{c.value}</p>
              <p className="text-xs text-slate-500">{c.label}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">Leads by status</h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(data.victims_by_status).length === 0 && (
              <p className="text-sm text-slate-400">No leads yet.</p>
            )}
            {Object.entries(data.victims_by_status).map(([status, count]) => (
              <div key={status} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-1.5">
                <Badge status={status} />
                <span className="text-sm font-semibold text-slate-700">{count}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">Recent reports</h2>
          <div className="space-y-2">
            {data.recent_reports.length === 0 && <p className="text-sm text-slate-400">No reports uploaded yet.</p>}
            {data.recent_reports.map((r) => (
              <Link
                key={r.id}
                to={`/reports/${r.id}`}
                className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-slate-50"
              >
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    {r.crash_id ? `Crash #${r.crash_id}` : `Report #${r.id}`}
                  </p>
                  <p className="text-xs text-slate-400">
                    {[r.city, r.county].filter(Boolean).join(', ') || '—'} · {formatDate(r.crash_date)}
                  </p>
                </div>
                <Badge status={r.report_status} />
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
